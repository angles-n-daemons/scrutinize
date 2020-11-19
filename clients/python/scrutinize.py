import aiohttp
import asyncio
import hashlib
import time

from abc import ABC, abstractmethod
from typing import Callable


class ScrutinizeClient:
    def __init__(
        self,
        host: str='localhost:5001',
        protocol: str='http',
        experiments_ttl: int=300,
    ):
        self.base_url = f'{protocol}://{host}/api/v1'
        self.experiments = None
        self.experiments_ttl = experiments_ttl
        self.experiments_pull_time = 0

    async def call(
        self,
        experiment_name: str,
        user_id: str,
        control: Callable,
        experiment: Callable,
        get_time: Callable=time.time,
    ):
        is_experiment, variant_str = await self._get_variant(experiment_name, user_id)
        variant = experiment if is_experiment else control
        start_time = get_time()
        err = None
        try:
            return is_experiment, await self._resolve(variant)
        except Exception as e:
            err = e
            raise e
        finally:
            duration_ms = (get_time() - start_time) * 1000
            await self.create_treatment(
                experiment_name,
                user_id,
                variant_str,
                duration_ms,
                '' if err is None else str(err),
            )

    async def _get_variant(self, experiment_name: str, user_id: str):
        variant_operand = (experiment_name + user_id).encode('utf-8')
        experiments = await self.get_experiments()
        experiment_config = experiments.get(experiment_name, None)
        is_experiment = False

        if experiment_config is None:
            print('Experiment.call: experiment not found, only control will be run')
        elif experiment_config.get('active', False):
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

    async def get_experiments(self):
        now = int(time.time())
        should_pull = self.experiments is None or (now - self.experiments_pull_time > self.experiments_ttl)
        if should_pull:
            experiments = await self.get('/experiment')

            if self.experiments is None:
                self.experiments = {}
            for experiment in experiments:
                self.experiments[experiment['name']] = experiment

            self.experiments_pull_time = now
        return self.experiments

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

    async def observe(
        self,
        user_id: str,
        metric: str,
        value: float,
        created_time: str=None,
    ):
        await self.post('/measurement', {
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
        try:
            return bool(await self.get('/alive'))
        except:
            return False
