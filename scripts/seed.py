import csv
import random
from datetime import datetime, timedelta
from contextlib import closing

import psycopg2

names = ['emma', 'olivia', 'ava', 'isabella', 'sophia', 'mia', 'charlotte', 'amelia', 'evelyn', 'abigail', 'harper', 'emily', 'elizabeth', 'avery', 'sofia', 'ella', 'madison', 'scarlett', 'victoria', 'aria', 'grace', 'chloe', 'camila', 'penelope', 'riley', 'layla', 'lillian', 'nora', 'zoey', 'mila', 'aubrey', 'hannah', 'lily', 'addison', 'eleanor', 'natalie', 'luna', 'savannah', 'brooklyn', 'leah', 'zoe', 'stella', 'hazel', 'ellie', 'paisley', 'audrey', 'skylar', 'liam', 'noah', 'william', 'james', 'logan', 'benjamin', 'mason', 'elijah', 'oliver', 'jacob', 'lucas', 'michael', 'alexander', 'ethan', 'daniel', 'matthew', 'aiden', 'henry', 'joseph', 'jackson', 'samuel', 'sebastian', 'david', 'carter', 'wyatt', 'jayden', 'john', 'owen', 'dylan', 'luke', 'gabriel', 'anthony', 'isaac', 'grayson', 'jack', 'julian', 'levi', 'christopher', 'joshua', 'andrew', 'lincoln', 'mateo'] 

def generate_time_on_page(fun_checkout: bool, human_agent: bool) -> float:
    time_on_page = fake_poisson(20, 150, 10000)
    if not human_agent:
        time_on_page *= (random.random() * .3) + .7
    if not fun_checkout:
        time_on_page *= (random.random() * .2) + .8
    return time_on_page

def generate_page_load(use_cdn: bool) -> float:
    page_load = fake_poisson(40, 180, 4000)
    if use_cdn:
        page_load *= (random.random() * .6) + .4
    return page_load

def generate_csat(fun_checkout: bool, human_agent: bool) -> float:
    csat_rating = random.choices(
        [0, 1, 2, 3, 4, 5],
        weights=[.02, .02, .1, .3, .22, .36],
        k=1,
    )[0]
    if not human_agent:
        csat_rating *= (random.random() * .1) + .9
    if not fun_checkout:
        csat_rating *= (random.random() * .05) + .95
    return csat_rating

def fake_poisson(low: int, med: int, high: int) -> float:
    show_low = random.random() > .03
    show_high = random.random() > .05
    if show_low:
        return low * random.random()
    elif show_high:
        return med + (high * random.random())
    else:
        return low + (med * random.random())

def add_treatment(conn, experiment_name, user_id, treatment, current_ts):
    with closing(conn.cursor()) as cur:
        cur.execute(
            '''
            INSERT INTO Treatment(experiment_id, user_id, treatment, created_time)
            VALUES ((SELECT id from Experiment WHERE name=%s), %s, %s, %s)
            RETURNING ID
            ''',
            (experiment_name, user_id, treatment, current_ts),
        )
        tid = cur.fetchone()[0]
        conn.commit()
        return tid

def add_observation(conn, experiment_name, user_id, tid,  treatment, value, metric, current_ts):
    with closing(conn.cursor()) as cur:
        # Insert into observation table for analysis
        cur.execute(
            '''
            INSERT INTO Observation(experiment_id, metric_name, user_id, treatment_id, treatment, value, created_time)
            VALUES ((SELECT id from Experiment WHERE name=%s), %s, %s, %s, %s, %s, %s)
            ''',
            (experiment_name, metric, user_id, tid, treatment, value, current_ts),
        )
        conn.commit()

def run_seed(store):
    treatment_lookup = {name: {
        'fun_checkout': random.random() < .06,
        'human_agent': random.random() < .2,
        'use_cdn': random.random() < .03,
    } for name in names}

    current_ts = datetime.now() - timedelta(days=60)
    for i in range(60):
        print('seeding data for day ', current_ts.date())

        session_count = 150 + (random.random() * 150)
        if i % 7 < 2:
            # simulate_weekend
            session_count /= 4
        if i % 7 == 4:
            # simulate burst day
            session_count *= 1.4

        for _ in range(int(session_count)):
            name = random.choice(names)
            treatments = treatment_lookup[name]

            use_cdn = treatments['use_cdn']
            fun_checkout = treatments['fun_checkout']
            human_agent = treatments['human_agent']

            for i in range(5):
                page_load = generate_page_load(use_cdn)
                tid = add_treatment(store, 'use_cdn', name, use_cdn, current_ts)
                add_observation(store, 'use_cdn', name, tid, use_cdn, page_load, 'page_load_ms', current_ts)

            csat_rating = generate_csat(fun_checkout, human_agent)
            time_on_page = generate_time_on_page(fun_checkout, human_agent)

            if random.random() < .35:
                tid = add_treatment(store, 'human_agent', name, human_agent, current_ts)
                add_observation(store, 'human_agent', name, tid, human_agent, csat_rating, 'csat_rating', current_ts)
                add_observation(store, 'human_agent', name, tid, human_agent, time_on_page, 'time_on_page', current_ts)

            tid = add_treatment(store, 'fun_checkout', name, fun_checkout, current_ts)
            add_observation(store, 'fun_checkout', name, tid, fun_checkout, csat_rating, 'csat_rating', current_ts)
            add_observation(store, 'fun_checkout', name, tid, fun_checkout, time_on_page, 'time_on_page', current_ts)

        current_ts += timedelta(days=1)

def run_seed_from_file(conn):
    file_location = '/Users/godzilla/Downloads/ab_data.csv'
    with open(file_location, 'r') as f:
        reader = csv.DictReader(f)
        count = 0
        for row in reader:
            if count % 100 == 0:
                print('on record ', count)
            if count > 100000:
                return
            user_id = row['user_id']
            created_ts = datetime.strptime(row['timestamp'], '%Y-%m-%d %H:%M:%S.%f')
            treatment = 'experiment' if row['group'] == 'treatment' else 'control'
            converted_base = (.19 if treatment == 'experiment' else .12) + (random.random() * .04)
            converted = int(random.random() < converted_base)
            if str(created_ts.date()) > '2017-01-14':
                converted += .12
            tid = add_treatment(conn, 'landing_page', user_id, treatment, created_ts)
            add_observation(conn, 'landing_page', user_id, tid, treatment, converted, 'converted', created_ts)
            count += 1
    

if __name__ == '__main__':
    conn = psycopg2.connect(host='0.0.0.0', dbname='scrutinize', user='postgres', password='password')
    try:
        run_seed_from_file(conn)
    finally:
        conn.close()
