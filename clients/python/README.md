# scrutinize-client

This is the client for the [scrutinize experimentation platform](https://github.com/angles-n-daemons/scrutinize).

# Installation

To install the project, use pip:

`pip install scrutinize-client`

## Usage

Once installed, you can publish metrics and conduct experiments using the client API.

__Publishing Metrics__

```python
from scrutinize import ScrutinizeClient

scrutinize = ScrutinizeClient('https://scrutinize-location')
await scrutinize.observe(
    user_id='wilma_rudolph',
    metric='purchased_coffee',
    value=True,
)
```

__Running an experiment__

```python
from scrutinize import ScrutinizeClient
from my_library import can_user_have_free_coffee

scrutinize = ScrutinizeClient('https://scrutinize-location')
give_free_coffee = await scrutinize.call(
    experiment='eng.give_user_free_coffee',
    user_id='wilma_rudolph',
    control=False,
    experiment=lambda: can_user_have_free_coffee('wilma_rudolph'),
)
```
