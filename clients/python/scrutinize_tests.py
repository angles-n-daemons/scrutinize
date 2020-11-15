import unittest
import asyncio
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, ANY

from scrutinize import Experiment


class TestClient(unittest.TestCase):

    def test_experiments(self):
        pass

class TestExperiment(unittest.TestCase):
    def test_call(self):
        client = AsyncMock()
        client.get_experiments.return_value = {
            'testexp': {'percentage': 50},
        }
        experiment = Experiment('testexp', client)

        control = MagicMock()
        variant = MagicMock()

        tests = [
            ['lisaa', control],
            ['garyoi', variant],
            ['eyjohn', control],
            ['joan', variant],
        ]

        for i, (user_id, var) in enumerate(tests):
            asyncio.run(experiment.call(
                user_id,
                lambda: control(i),
                lambda: variant(i),
            ))

            var.assert_called_with(i)

    def test_call_exception(self):
        client = AsyncMock()
        client.get_experiments.return_value = {
            'testexp': {'percentage': 50},
        }
        experiment = Experiment('testexp', client)
        experiment._get_variant = AsyncMock(return_value=(False, 'control'))

        def exception_raiser():
            raise(Exception('im an error'))

        try:
            asyncio.run(experiment.call(
                'fake_person',
                exception_raiser,
                2,
            ))
        except:
            # expect it to raise, just want to make sure treatment created
            pass

        # We only really care about the duration_ms parameter
        client.create_treatment.assert_called_with(
            'testexp',
            'fake_person',
            'control',
             ANY,
            'im an error',
        )

    def test_call_duration(self):
        client = AsyncMock()
        experiment = Experiment('testexp', client)
        experiment._get_variant = AsyncMock(return_value=(False, 'control'))

        get_time = MagicMock(side_effect=[5, 10])
        asyncio.run(experiment.call(
            'fake_person',
            1,
            2,
            get_time,
        ))

        # We only really care about the duration_ms parameter
        client.create_treatment.assert_called_with(
            'testexp',
            'fake_person',
            'control',
            5000,
            '',
        )

    def test_resolve_func(self):
        experiment = Experiment('testexp', AsyncMock())
        assert asyncio.run(experiment._resolve(lambda: 26)) == 26

    def test_resolve_async(self):
        experiment = Experiment('testexp', AsyncMock())
        async def variant():
            return 25
        assert asyncio.run(experiment._resolve(variant)) == 25

    def test_resolve_literal(self):
        tests = [
            0,
            1,
            '1',
            'harry',
            False,
            Decimal(52),
            None,
        ]
        experiment = Experiment('testexp', AsyncMock())

        for expected in tests:
            assert asyncio.run(experiment._resolve(expected)) == expected

    def test_get_variant(self):
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
            treatment, _ = asyncio.run(experiment._get_variant(user_id))
            assert treatment == expected

    def test_get_variant_differs_with_experiment(self):
        client = AsyncMock()
        client.get_experiments.return_value = {
            'testexp': {'percentage': 50},
            'otherexp': {'percentage': 50},
        }

        experiment1 = Experiment('testexp', client)
        experiment2 = Experiment('otherexp', client)

        user_id = 'sally'
        assert asyncio.run(experiment1._get_variant(user_id)) != asyncio.run(experiment2._get_variant(user_id))

    def test_get_variant_experiment_doesnt_exist(self):
        client = AsyncMock()
        client.get_experiments.return_value = {
            'SOME_OTHER_EXP': {'percentage': 50},
        }
        experiment1 = Experiment('NON_EXISTENT_EXP', client)
        assert asyncio.run(experiment1._get_variant('johnny')) == (False, 'control')


if __name__ == '__main__':
    unittest.main()
