#!/bin/bash

## show contract content
node main.js --alchemykey $ALCHEMY_APIKEY --ethscankey $ETHSCAN_APIKEY --net mainnet --contract 0xe258d3343b9779306E8609806EAB6a17420e9573

## show contract abi
node main.js --alchemykey $ALCHEMY_APIKEY --ethscankey $ETHSCAN_APIKEY --net mainnet --contract 0xe258d3343b9779306E8609806EAB6a17420e9573 --getabi

## show contract source code
node main.js --alchemykey $ALCHEMY_APIKEY --ethscankey $ETHSCAN_APIKEY --net mainnet --contract 0xe258d3343b9779306E8609806EAB6a17420e9573 --getsrc
