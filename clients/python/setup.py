from setuptools import setup

with open("README.md", "r") as fh:
    long_description = fh.read()

setup(
    name='scrutinize',
    version='0.0.6',
    description='the lightweight experimentation platform',
    long_description=long_description,
    long_description_content_type="text/markdown",
    url='http://github.com/angles-n-daemons/scrutinize',
    author='brian dillmann',
    author_email='dillmann.brian@gmail.com',
    license='MIT',
    packages=['scrutinize'],
    install_requires=[
        'aiohttp',
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    zip_safe=False,
)
