## Testing

`python tests/test_scrutinize_client.py`

## Seeding (and verifying client integration)

`python scrutinize/seed.py`

## Publishing

Change version in setup.py then do:

```
python3 setup.py sdist bdist_wheel
python3 -m twine upload dist/*
```
