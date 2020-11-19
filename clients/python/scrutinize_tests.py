import unittest
import asyncio
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, ANY

from scrutinize import ScrutinizeClient


class TestExperiment(unittest.TestCase):
    def test_call(self):
        scrutinize = ScrutinizeClient()
        scrutinize.get_experiments = AsyncMock(return_value={
            'testexp': {'percentage': 50, 'active': True},
        })

        control = MagicMock()
        variant = MagicMock()

        tests = [
            ['lisaa', control],
            ['garyoi', variant],
            ['eyjohn', control],
            ['joan', variant],
        ]

        for i, (user_id, var) in enumerate(tests):
            asyncio.run(scrutinize.call(
                'testexp',
                user_id,
                lambda: control(i),
                lambda: variant(i),
            ))

            var.assert_called_with(i)

    def test_call_exception(self):
        scrutinize = ScrutinizeClient()
        scrutinize.get_experiments = AsyncMock(return_value = {
            'testexp': {'percentage': 50, 'active': True},
        })
        scrutinize._get_variant = AsyncMock(return_value=(False, 'control'))
        scrutinize.create_treatment = AsyncMock()

        def exception_raiser():
            raise(Exception('im an error'))

        try:
            asyncio.run(scrutinize.call(
                'testexp',
                'fake_person',
                exception_raiser,
                2,
            ))
        except:
            # expect it to raise, just want to make sure treatment created
            pass

        # We only really care about the error parameter
        scrutinize.create_treatment.assert_called_with(
            'testexp',
            'fake_person',
            'control',
             ANY,
            'im an error',
        )

    def test_call_duration(self):
        scrutinize = ScrutinizeClient()
        scrutinize._get_variant = AsyncMock(return_value=(False, 'control'))
        scrutinize.create_treatment = AsyncMock()

        get_time = MagicMock(side_effect=[5, 10])
        asyncio.run(scrutinize.call(
            'testexp',
            'fake_person',
            1,
            2,
            get_time,
        ))

        # We only really care about the duration_ms parameter
        scrutinize.create_treatment.assert_called_with(
            'testexp',
            'fake_person',
            'control',
            5000,
            '',
        )

    def test_resolve_func(self):
        scrutinize = ScrutinizeClient()
        assert asyncio.run(scrutinize._resolve(lambda: 26)) == 26

    def test_resolve_async(self):
        scrutinize = ScrutinizeClient()
        async def variant():
            return 25
        assert asyncio.run(scrutinize._resolve(variant)) == 25

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
        scrutinize = ScrutinizeClient()

        for expected in tests:
            assert asyncio.run(scrutinize._resolve(expected)) == expected

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
        scrutinize = ScrutinizeClient()
        scrutinize.get_experiments = AsyncMock(return_value={
            'testexp': {'percentage': 50, 'active': True},
        })

        for user_id, expected in tests:
            treatment, _ = asyncio.run(scrutinize._get_variant('testexp', user_id))
            assert treatment == expected

    def test_get_variant_differs_with_experiment(self):
        scrutinize = ScrutinizeClient()
        scrutinize.get_experiments = AsyncMock(return_value={
            'testexp': {'percentage': 50, 'active': True},
            'otherexp': {'percentage': 50, 'active': True},
        })


        user_id = 'sally'
        assert asyncio.run(scrutinize._get_variant('testexp', user_id)) != asyncio.run(scrutinize._get_variant('otherexp', user_id))

    def test_get_variant_active_param(self):
        scrutinize = ScrutinizeClient()
        scrutinize.get_experiments = AsyncMock(return_value={
            'testexp': {'percentage': 50, 'active': True},
            'otherexp': {'percentage': 50, 'active': False},
        })

        # id lands in exp group for both experiments
        user_id='laura'
        assert asyncio.run(scrutinize._get_variant('testexp', user_id))[0]
        assert not asyncio.run(scrutinize._get_variant('otherexp', user_id))[0]


    def test_get_variant_experiment_doesnt_exist(self):
        scrutinize = ScrutinizeClient()
        scrutinize.get_experiments = AsyncMock(return_value={
            'SOME_OTHER_EXP': {'percentage': 50, 'active': True},
        })
        assert asyncio.run(scrutinize._get_variant('testexp', 'johnny')) == (False, 'control')


if __name__ == '__main__':
    unittest.main()
