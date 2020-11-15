import aiohttp
import asyncio
import hashlib
import time

from abc import ABC, abstractmethod
from typing import Callable


class Client(ABC):
    @abstractmethod
    async def load_experiment(self, name: str) -> any:
        pass

    @abstractmethod
    async def get_experiments(self):
        pass

    @abstractmethod
    async def create_experiment(self, name: str, percentage: int):
        await self.post('/experiment', json={'name': name, 'percentage': percentage})

    @abstractmethod
    async def create_treatment(
        self,
        experiment_name: str,
        user_id: str,
        treatment: bool,
        error: Exception,
    ):
        pass

    @abstractmethod
    async def record_observation(
        self,
        experiment_name: str,
        user_id: str,
        metric: str,
        value: float,
    ):
        pass


class Experiment:
    def __init__(
        self,
        name: str,
        client: Client,
    ):
        self.name = name
        self.client = client

    async def call(
        self,
        user_id: str,
        control: Callable,
        experiment: Callable,
        get_time: Callable=time.time,
    ):
        is_experiment, variant_str = await self._get_variant(user_id)
        variant = experiment if is_experiment else control
        start_time = get_time()
        err = None
        try:
            return await self._resolve(variant)
        except Exception as e:
            err = e
            raise e
        finally:
            duration_ms = (get_time() - start_time) * 1000
            await self.client.create_treatment(
                self.name,
                user_id,
                variant_str,
                duration_ms,
                '' if err is None else str(err),
            )

    async def observe(
        self,
        user_id: str,
        metric: str,
        value: float,
        created_time: str=None,
    ):
        await self.client.record_observation(self.name, user_id, metric, value, created_time)

    async def _get_variant(self, user_id: str):
        variant_operand = (self.name + user_id).encode('utf-8')
        experiments = await self.client.get_experiments()
        experiment_config = experiments.get(self.name, None)
        is_experiment = False

        if experiment_config is None:
            print('Experiment.call: experiment not found, only control will be run')
        else:
            # convert id to a number between 0 and 99
            id_int = int(hashlib.md5(variant_operand).hexdigest(), 16) % 100
            is_experiment = id_int < experiment_config['percentage']

        return is_experiment, 'experiment' if is_experiment else 'control'

    @staticmethod
    async def _resolve(
        variant: any
    ) -> any:
        if callable(variant):
            if asyncio.iscoroutinefunction(variant):
                return await variant()
            else:
                return variant()
        return variant

class ScrutinizeClient(Client):
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

    async def load_experiment(self, name: str) -> Experiment:
        experiment = (await self.get_experiments()).get(name, None)
        if experiment == None:
            print('ScrutinizeClient.load_experiment: experiment not found, only control will be run')
        return Experiment(name, self)

    async def get_experiments(self):
        now = int(time.time())
        if now - self.experiments_pull_time > self.experiments_ttl:
            experiments = await self.get('/experiment')
            for experiment in experiments:
                self.experiments[experiment['name']] = experiment
            self.experiments_pull_time = now
        return self.experiments

    async def create_experiment(self, name: str, percentage: int):
        await self.post('/experiment', json={'name': name, 'percentage': percentage})

    async def create_treatment(
        self,
        experiment_name: str,
        user_id: str,
        variant: str,
        duration_ms: float,
        error: Exception,
    ):
        err_str = '' if error is None else str(error)
        await self.post('/treatment', {
            'experiment_name': experiment_name,
            'user_id': user_id,
            'variant': variant,
            'error': err_str,
            'duration_ms': duration_ms,
        })

    async def record_observation(
        self,
        experiment_name: str,
        user_id: str,
        metric: str,
        value: float,
        created_time: str=None,
    ):
        await self.post('/measurement', {
            'experiment_name': experiment_name,
            'user_id': user_id,
            'metric_name': metric,
            'value': value,
            'created_time': created_time,
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
