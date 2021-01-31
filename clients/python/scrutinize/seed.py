import asyncio
import random
import time
from datetime import datetime, timedelta

from scrutinize import ScrutinizeClient

def mock_func(experiment: bool, sleep_ms: int, err_pct: float):
    def my_func():
        sleep_seconds = (random.random() * sleep_ms) / 1000
        time.sleep(sleep_seconds)
        if random.random() * 100 < err_pct:
            raise Exception('haha mang')
        return experiment

    return my_func

async def run_seed(scrutinize: ScrutinizeClient):
    current_time = datetime.now() - timedelta(days=15)

    while str(current_time.date()) < str(datetime.now().date()):
        print('seeding date: ', str(current_time.date()))

        for _ in range(100 + int(random.random() * 1000)): #00 + int(random.random() * 1500)):
            id = ''.join(random.sample('abcdefghijklmnopqrstuvwxyz', 3))
            checkout_base = random.choice([5, 20, 100])
            checkout_amount = checkout_base + (10 * random.random())
            if str(current_time.date()) > '2020-10-12':
                checkout_amount += 10

            try:
                is_experiment, _ = await scrutinize.call(
                    experiment_name='appeng.new_checkout_experience',
                    user_id=id,
                    control=mock_func(False, 20, 2),
                    experiment=mock_func(True, 45, 3),
                )
            except Exception as e:
                print(e)
                continue

            if is_experiment:
                checkout_amount += 5 + (10 * random.random())

            await scrutinize.observe(
                user_id=id,
                metric='checkout_amount',
                value=checkout_amount,
                created_time=str(current_time.date()),
            )

        current_time += timedelta(days=1)


if __name__ == '__main__':
    scrutinize = ScrutinizeClient()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(run_seed(scrutinize))

