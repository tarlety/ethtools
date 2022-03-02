const Web3 = require('web3');
const {createAlchemyWeb3} = require("@alch/alchemy-web3")
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const axios = require('axios');

alchemy_mainnet_base = 'eth-mainnet.alchemyapi.io/v2/';
alchemy_rinkeby_base = 'eth-rinkeby.alchemyapi.io/v2/';
ethscan_rinkeby_api_base = 'https://api-rinkeby.etherscan.io/';
ethscan_mainnet_api_base = 'https://api.etherscan.io/';

const optionDefinitions = [
  {name: 'alchemykey', type: String, description: 'apikey of enhanced alchemy web3.js.'},
  {name: 'ethscankey', type: String, description: 'apikey of etherscan'},
  {name: 'rpc', type: String, description: 'custom ethereum gateway.'},
  {name: 'net', type: String, description: 'mainnet or testnet (rinkeby or etc).'},
  {name: 'contract', type: String, description: 'contract address'},
  {name: 'getabi', type: Boolean, description: 'show abi of contract'},
  {name: 'getsrc', type: Boolean, description: 'show source code of contract'},
  {name: 'function', type: String, description: 'envoke contract function'},
  {name: 'param', type: String, multiple: true, description: 'parameters of contract function'},
  {name: 'pendings', type: Boolean, description: 'listen to pendings transactions (only on specified node)'},
  {name: 'newblock', type: Boolean, description: 'listen to new blocks.'},
  {name: 'txfrom', type: String, description: 'only listen tx on from address'},
  {name: 'txto', type: String, description: 'only listen tx on from address'},
  {name: 'help', type: Boolean},
];

const optionSections = [
  {header: 'eth tools', content: 'A eth cli tool to interact with chain directly.'},
  {header: 'options', optionList: optionDefinitions},
];

const get_abi_json = async (contract_address, ethscan_api_base, apikey) => {
  const url = `${ethscan_api_base}/api?module=contract&action=getabi&address=${contract_address}&apikey=${apikey}`;
  const response = await axios.get(url);
  const resp_abi = response.data.result;
  const json_abi = JSON.parse(resp_abi);
  return json_abi;
}

const get_src_json = async (contract_address, ethscan_api_base, apikey) => {
  const url = `${ethscan_api_base}/api?module=contract&action=getsourcecode&address=${contract_address}&apikey=${apikey}`;
  const response = await axios.get(url);
  return response.data.result;
}

const main = async () => {
  const options = commandLineArgs(optionDefinitions);

  if (!Object.keys(options).length | options.help) {
    console.log(commandLineUsage(optionSections));
    return;
  }

  let alchemy_api_base;
  let ethscan_api_base;
  switch (options.net) {
    case 'rinkeby':
      alchemy_api_base = alchemy_rinkeby_base;
      ethscan_api_base = ethscan_rinkeby_api_base;
      break;
    default:
      alchemy_api_base = alchemy_mainnet_base;
      ethscan_api_base = ethscan_mainnet_api_base;
      break;
  }

  let web3;
  if (options.alchemykey) {
    web3 = new createAlchemyWeb3(`https://${alchemy_api_base}${options.alchemykey}`);
  } else {
    web3 = new Web3(options.rpc || 'https://cloudflare-eth.com');
  }

  if (options.pendings) {
    const wss = new createAlchemyWeb3(`wss://${alchemy_api_base}${options.alchemykey}`);
    const subscription = wss.eth.subscribe('pendingTransactions', (error, txhash) => {
      if (error) {
        console.log(`subscribe: error = ${error}`);
      }
      if (txhash) {
        web3.eth.getTransaction(txhash, (error, tx) => {
          if (error) {
            console.log(`tx error = ${error}`);
          }
          if (tx) {
            if ((!options.txfrom || tx.from == options.txfrom) && (!options.txto || tx.to == options.txto)) {
              console.log(tx);
            }
          }
        });
      }
    });

    subscription.unsubscribe((error, success) => {
      if (error) {
        console.log(`unsubscribe: error = ${error}`);
      }
      if (success) {
        console.log('Successfully unsubscribed!');
      }
    });
  }

  if (options.newblock) {
    const wss = new createAlchemyWeb3(`wss://${alchemy_api_base}${options.alchemykey}`);
    const subscription = wss.eth.subscribe('newBlockHeaders', (error, header) => {
      if (error) {
        console.log(`subscribe: error = ${error}`);
      }
      if (header) {
        web3.eth.getBlock(header.hash, (error, block) => {
          if (error) {
            console.log(`tx error = ${error}`);
          }
          if (block) {
            block.transactions.forEach((v, i) => {
              web3.eth.getTransaction(v).then((tx) => {
                if (tx) {
                  tx.from = (tx.from || '');
                  options.txfrom = (options.txfrom || '');
                  tx.to = (tx.to || '');
                  options.txto = (options.txto || '');
                  if ((!options.txfrom || tx.from.toLowerCase() == options.txfrom.toLowerCase()) && (!options.txto || tx.to.toLowerCase() == options.txto.toLowerCase())) {
                    console.log(tx);
                  }
                }
              })
            });
          }
        });
      }
    });

    subscription.unsubscribe((error, success) => {
      if (error) {
        console.log(`unsubscribe: error = ${error}`);
      }
      if (success) {
        console.log('Successfully unsubscribed!');
      }
    });
  }

  if (options.contract) {
    const contract_address = options.contract;
    const apikey = options.ethscankey;

    if (options.getabi) {
      const json_abi = await get_abi_json(contract_address, ethscan_api_base, apikey);
      console.log(json_abi);
    } else if (options.getsrc) {
      const json_src = await get_src_json(contract_address, ethscan_api_base, apikey);
      console.log(json_src);
    } else if (options.function) {
      const json_abi = await get_abi_json(contract_address, ethscan_api_base, apikey);
      const contract = new web3.eth.Contract(json_abi, contract_address);
      const function_name = options.function;

      if (options.param) {
        const value = await contract.methods[function_name].apply(contract, options.param).call();
        console.log(value);
      } else {
        const value = await contract.methods[function_name]().call();
        console.log(value);
      }
    } else {
      const json_abi = await get_abi_json(contract_address, ethscan_api_base, apikey);
      const contract = new web3.eth.Contract(json_abi, contract_address);
      console.log(contract);
    }
  }
}

main();
