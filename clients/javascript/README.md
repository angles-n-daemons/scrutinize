# scrutinize-client

This is the javascript client for the [scrutinize experimentation platform](https://github.com/angles-n-daemons/scrutinize).

# Installation

To install the client, use npm:

`npm i scrutinize`

## Usage

Once installed, you can publish metrics and conduct experiments using the client API.

__Publishing Metrics__

```javascript
import ScrutinizeClient from 'scrutinize';

const scrutinize = ScrutinizeClient('https://scrutinize-location');
await scrutinize.observe(
    'wilma_rudolph',
    'purchased_coffee',
    True,
)
```

__Running an experiment__

```javascript
import ScrutinizeClient from 'scrutinize';
import canUserHaveFreeCoffee from 'my_helper_lib';

const scrutinize = ScrutinizeClient('https://scrutinize-location');
const [isExperiment, gaveFreeCoffee] = await scrutinize.call(
    'eng.give_user_free_coffee',
    'wilma_rudolph',
    False,
    lambda: canUserHaveFreeCoffee('wilma_rudolph'),
)
```
