import aiohttp
import asyncio
import hashlib
import time

from typing import Callable

class ScrutinizeClient:
    def __init__(
        self,
        host: str='localhost:5001',
        protocol: str='http',
        experiments_ttl: int=300,
    ):
        self.base_url = f'{protocol}://{host}/api/v1'
        self.experiments = {}
        self.experiments_ttl = experiments_ttl
        self.experiments_pull_time = 0

        # verify configuration
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self.alive())

    async def load_experiment(self, name: str) -> Experiment:
        experiment = self.get_experiments().get(name, None)
        if experiment == None:
            print('ScrutinizeClient.load_experiment: experiment not found, only control will be run')
        return Experiment(name, self)

    async def get_experiments(self):
        now = int(time.time())
        if now - self.experiment_pull_time > self.experiment_ttl:
            experiments = await self.get('/experiment')
            for experiment in experiments:
                self.experiments[experiment['name']] = experiment
            self.experiment_pull_time = now
        return self.experiments

    async def create_experiment(self, name: str, percentage: int):
        await self.post('/experiment', json={'name': name, 'percentage': percentage})

    async def create_treatment(
        self,
        experiment_name: str,
        user_id: str,
        treatment: bool,
        error: Exception,
    ):
        errStr = '' if error is None else str(error)
        await self.post('/treatment', {
            'experiment_name': experiment_name,
            'user_id': user_id,
            'treatment': treatment,
            'error': errStr,
        })

    async def record_observation(
        self,
        experiment_name: str,
        user_id: str,
        metric: str,
        value: float,
    ):
        await self.post('/observation', {
            'experiment_name': experiment_name,
            'user_id': user_id,
            'metric': metric,
            'value': value,
        })

    async def get(
        self,
        path: str,
    ):
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{self.base_url}{path}') as r:
                return await r.json()

    async def post(
        self,
        path: str,
        data: any,
    ):
        async with aiohttp.ClientSession() as session:
            async with session.post(f'{self.base_url}{path}', json=data) as r:
                return await r.json()

    async def alive(self):
        return bool(await self.get('/alive'))


class Experiment:
    def __init__(
        self,
        name: str,
        client: ScrutinizeClient,
    ):
        self.name = name
        self.percentage = percentage
        self.client = client

    def call(
        self,
        user_id: str,
        control: Callable,
        experiment: Callable,
    ):
        id_int = int(hashlib.md5(user_id.encode('utf-8')).hexdigest(), 16) % 100
        treatment = id_int < self.percentage
        err = None
        try:
            # convert id to a number between 0 and 99
            id_int = int(hashlib.md5(user_id).hexdigest(), 16) % 100
            if id_int > self.percentage:
                control()
            else:
                experiment()
        except Exception as e:
            err = e
            raise e
        finally:
            self.client.create_treatment(self.name, user_id, treatment, error)
            

    def observe(
        self,
        user_id: str,
        metric: str,
        value: float,
    ):
        self.client.record_observation(self.name, user_id, metric, value)
