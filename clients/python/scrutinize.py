import aiohttp
import asyncio
import datetime
import hashlib
import time

from abc import ABC, abstractmethod
from typing import Callable, Optional


class ScrutinizeClient:
    def __init__(
        self,
        api_url: str='http://localhost:5001',
        experiments_ttl: int=300,
    ):
        self.base_url = f'{api_url}/api/v1'
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
        """
        Primary entry point for an experiment. Behaves as follows:

        1. Given a user_id and experiment, determines whether the user should
           get the control or experiment behavior.
        2. Attempts to resolve the control or variant - can be functional
           or a literal value.
        3. After resolution is complete or has failed, records the treatment
           event to the scrutinize server.

        :param experiment_name: name of experiment associated with the call
        :param user_id: identifying of the user who originated this request
        :param control: function or literal value representing the control behavior
        :param experiment: function or literal value representing the experiment behavior
        :param get_time: method for getting the current time (overriden in testing)
        :return: whether the user was in the experiment group
        :return: either the control or experiment resolved value
        """
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
        """
        Determines whether the user is in the experiment group.

        :param experiment_name: name of experiment associated with the call
        :param user_id: identifying of the user who originated this request
        :return: whether the user was in the experiment group
        :return: a string representing the variant assignment
        """
        variant_operand = (experiment_name + user_id).encode('utf-8')
        experiments = await self.get_experiments()
        experiment_config = experiments.get(experiment_name, None)
        is_experiment = False

        if experiment_config is None:
            print('ScrutinizeClient._get_variant: experiment not found, only control will be run')
        elif experiment_config.get('active', False):
            # convert id to a number between 0 and 99
            id_int = int(hashlib.md5(variant_operand).hexdigest(), 16) % 100
            is_experiment = id_int < experiment_config['percentage']

        return is_experiment, 'experiment' if is_experiment else 'control'

    @staticmethod
    async def _resolve(
        variant: any
    ) -> any:
        """
        Resolves an experiment behavior to a value.

        :param variant: a function or literal value representing the variant behavior
        :return: the resolved variant value
        """
        if callable(variant):
            if asyncio.iscoroutinefunction(variant):
                return await variant()
            else:
                return variant()
        return variant

    async def get_experiments(self):
        """
        Returns the experiment configuration stored in the server.
        Has simple caching behavior.

        :return: a dictionary representing all experiment configurations
        """
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
        error: Optional[Exception],
    ):
        """
        Publishes a treatment event to the server.

        :param experiment_name: name of experiment associated with the call
        :param user_id: identifying of the user who originated this request
        :param variant: string representation of the variant assignment
        :param duration_ms: duration in ms that value resolution took
        :param error: exception raised during resolution if any
        """
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
        """
        Publishes a metric measurement event for a given user.

        :param user_id: identifying of the user who originated this request
        :param metric: name of the metric being observed
        :param value: numeric representation of the value measured
        :param created_time: optional timestamp for the measurement
        """
        if not created_time:
            created_time = datetime.datetime.now().isoformat()
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
        """
        Helper for making HTTP GET requests
        """
        async with aiohttp.ClientSession() as session:
            async with session.get(f'{self.base_url}{path}') as r:
                return await r.json()

    async def post(
        self,
        path: str,
        data: any,
    ):
        """
        Helper for making HTTP POST requests
        """
        async with aiohttp.ClientSession() as session:
            async with session.post(f'{self.base_url}{path}', json=data) as r:
                return await r.json()

    async def alive(self):
        """
        Determines whether the client can communicate with the server.

        :return: bool if client <-> server communication is possible
        """
        try:
            return (await self.get('/alive')).get('status', None) == 'ok'
        except:
            return False
