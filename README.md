## Prepares

1. Alchemy ethereum gateway

- An enhanced ethereum development platform.
- Where to register: `https://dashboard.alchemyapi.io/`
- Documents: `https://docs.alchemy.com/alchemy/`

2. etherscan API

- The Etherscan Ethereum Developer APIs to empower developers with direct access to Etherscan's block explorer data and services via GET/POST requests.
- Where to register: `https://etherscan.io/apis`
- Documents: `https://docs.etherscan.io/`

3. 

## Features

1. Get contact, abi and source code.

ex:
```
❯ node main.js --alchemykey $ALCHEMY_APIKEY --net $ETHNET --ethscankey $ETHSCAN_APIKEY --contract 0xe258d3343b9779306E8609806EAB6a17420e9573
```

2. Envoke contract function with parameteres.

ex:
```
❯ node main.js --alchema $RINKEBY --net $ETHNET --apikey $APIKEY --contract 0xe258d3343b9779306E8609806EAB6a17420e9573 --function name
```

3. Wait for chain event.

ex:
```
❯ node main.js --alchemykey $ALCHEMY_APIKEY --net rinkeby --newblock --txto 0x5e196dc75d5E6c6bDE6A6ffcF6C403932eB18EED
```

4. Copy contract from mainnet to testnet.

TBD

## Reference

Resources

- ethereum browser https://etherscan.io/
- node provider https://infura.io/
- mempool https://www.blocknative.com/
- another node provider https://alchemyapi.io/
- ethereum gateway https://blog.cloudflare.com/cloudflare-ethereum-gateway/

Documents

- https://ethereum.org/zh-tw/developers/docs/
- https://web3js.readthedocs.io/en/v1.2.11/index.html
- https://github.com/dappuniversity/web3_examples
- https://docs.infura.io/infura
- https://docs.etherscan.io/

