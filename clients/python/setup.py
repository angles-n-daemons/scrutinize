from setuptools import setup

setup(
    name='scrutinize',
    version='0.1',
    description='the lightweight experimentation platform',
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
