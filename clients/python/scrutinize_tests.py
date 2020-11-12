import unittest
import asyncio

from unittest.mock import AsyncMock
from scrutinize import Experiment


class TestClient(unittest.TestCase):

    def test_experiments(self):
        pass

class TestExperiment(unittest.TestCase):
    def test_call(self):
        pass

    def test_call_distribution(self):
        pass

    def test_call_exception(self):
        pass

    def test_call_duration(self):
        pass

    def test_resolve_func(self):
        pass

    def test_resolve_async(self):
        pass

    def test_resolve_literal(self):
        pass

    def test_get_treatment(self):
        tests = [
            ['jane', True],
            ['tom', False],
            ['jim', False],
            ['mary', False],
            ['lonnie', True],
            ['alice', False],
            ['gerard', True],
            ['fiona', True],
            ['bernard', True],
            ['jimson', False],
            ['limson', False],
            ['fiona', True],
        ]
        client = AsyncMock()
        client.get_experiments.return_value = {
            'testexp': {'percentage': 50},
        }

        experiment = Experiment('testexp', client)

        for user_id, expected in tests:
            treatment, _ = asyncio.run(experiment._get_treatment(user_id))
            assert treatment == expected

    def test_get_treatment_differs_with_experiment(self):
        client = AsyncMock()
        client.get_experiments.return_value = {
            'testexp': {'percentage': 50},
            'otherexp': {'percentage': 50},
        }

        experiment1 = Experiment('testexp', client)
        experiment2 = Experiment('otherexp', client)

        user_id = 'sally'
        assert asyncio.run(experiment1._get_treatment(user_id)) != asyncio.run(experiment2._get_treatment(user_id))

    def test_get_treatment_experiment_doesnt_exist(self):
        client = AsyncMock()
        client.get_experiments.return_value = {
            'SOME_OTHER_EXP': {'percentage': 50},
        }
        experiment1 = Experiment('NON_EXISTENT_EXP', client)
        assert asyncio.run(experiment1._get_treatment('johnny')) == (False, 'control')


if __name__ == '__main__':
    unittest.main()
