# scrutinize
a lightweight experimentation framework with a focus on ease of use and analysis

## Overview

_scrutinize_ is an experimentation platform designed for ease of use and analysis.

This document will just walk you through setup of the scrutinize server, and creation of a single ab test.

## Quickstart

### Server

Install any version of node you can.
Also get docker pls.
Also install go (whoops almost forgot that guy)

1. Clone the repo
2. Start postgres (DONT USE THIS PASSWORD IN ANY ACTUAL INSTANCE)
```
docker run -it -p 5432:5432 -e POSTGRES_PASSWORD=password postgres
```
3. Add the scrutinize database:
```
psql-h 0.0.0.0 -p 5432 -U postgres
<password>

CREATE DATABASE scrutinize
```
4. Migrate the database to the most recent schema
```
go get -u github.com/pressly/goose/cmd/goose
goose -dir db postgres "user=postgres dbname=scrutinize password=<password> sslmode=disable" up
```
5. Start the web server
```
cd web
npm i && npm start
```
6. Start the api server
```
cd server
npm i && npm start
```

### Experiment

TODO: Add instructions on how to add experiment to the database

Below is example code of how one would use scrutinize. The example given uses a hypothetical ecommerce "Suggest Addons" experiment where the feature
in question recommends a additional purchases to the user. The metric being tracked is the "Checkout Amount" or the total price of the user's end purchase (if applicable).

```py
from scrutinize import ScrutinizeClient, Experiment

scrutinize = ScrutinizeClient('localhost:5001')
experiment = scrutinize.load_experiment('suggest_addons')

class BasketController:
  def __init__(self, experiment: Experiment):
    self.experiment = experiment
    
  async def get_basket(self, user_id: str):
    basket = self.populate_basket()

    basket.addons = self.experiment.call(
      user_id,
      lambda: self.get_checkout_items(user_id),
      lambda: [],
    )
    
    return basket
```

