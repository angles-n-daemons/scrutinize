# scrutinize

scrutinize was born for ease of usability within the world of experimentation. Inspired by the design of [Unleash](https://github.com/Unleash/unleash), it aims to encapsulate everything needed for an online experiment in a minimal client / server implementation.

## Quickstart

### Requirements

| Requirement   | Version       |
| ------------- | ------------- |
| docker-compose| 1.0+          |
| python        | 3.6+          |

### Running the server

After cloning the repository locally, you can start the server and database using docker compose:

```bash
cd <path>/<to>/<scrutinize>
docker-compose up
```

scrutinize should then be running on port 5001, verify this by navigating to the [Experiments Dashboard](http://localhost:5001).

### Creating metrics & experiments

Before you can use the client, you need to add some metrics and experiments. Experiments depend on metrics, so please create some metrics first by navigating to the [Metrics Dashboard](http://localhost:5001/metrics). Some example metrics might include "converted", "purchase_price", "load_time_ms" and "user_click".

Once you've completed that, navigate back to the [Experiments Dashboard](http://localhost:5001) and create an experiment with some of the metrics you just added.

### Installing the client

Now that the server is populated you are ready to begin using the client. Install a client of your choice (currently only python) into the project you want to experiment with.

```bash
pip install scrutinize-client
```

### Using the client

You can now do the following things with the client:

1. Record metric observations (used for reporting).
2. Conduct experiments inline using the client API.

Using the client, add some metric readings to your project codebase. An example is below:

```python
from scrutinize import ScrutinizeClient

class CheckoutController:
    def __init__(self, scrutinize: ScrutinizeClient, ...):
        self.scrutinize = scrutinize
    ...

    def complete_purchase(self, user_id):
        basket = self.get_basket(user_id)

        # recording a metric value for reporting
        self.scrutinize.observe(
            user_id,
            'checkout_amount',
            basket.price_total,
        )
```

You can then also conduct the experiment using the client API, see the below example code for usage.

```python
from scrutinize import ScrutinizeClient

class AdsController:
    def __init__(self, scrutinize: ScrutinizeClient, ...):
        self.scrutinize = scrutinize
    ...

    def show_ads(self, user_id):
        return self.scrutinize.call(
            'ml_eng.new_ads_model',
            user_id,
            lambda: self.ads_model.predict(user_id), # control behavior
            lambda: self.new_ads_model.predict(user_id), # experiment behavior
        )
```

### Using the reporting features

While your experiment is running, you can use the Performance feature in the [Experiments Dashboard](http://localhost:5001) to get RED metrics on your experiment, as well as the selected Evaluation Metrics you had defined.
