const Web3 = require('web3');
const {createAlchemyWeb3} = require("@alch/alchemy-web3")
const commandLineArgs = require('command-line-args');
const commandLineUsage = require('command-line-usage');
const axios = require('axios');

etherscan_rinkeby_api_base = 'https://api-rinkeby.etherscan.io/';
etherscan_mainnet_api_base = 'https://api.etherscan.io/';

const optionDefinitions = [
  {name: 'alchema', type: String, description: 'use enhanced alchema web3.js with alchema http apikey.'},
  {name: 'rpc', type: String, description: 'use custom rpc as ethereum gateway.'},
  {name: 'net', type: String, description: 'mainnet or testnet network name.'},
  {name: 'apikey', type: String, description: 'apikey of etherscan'},
  {name: 'contract', type: String},
  {name: 'function', type: String},
  {name: 'param', type: String, multiple: true},
  {name: 'subscribe', type: String, multiple: true, description: 'subscribe type'},
  {name: 'pendings'},
  {name: 'help', type: Boolean},
];

const optionSections = [
  {header: 'eth tools', content: 'A eth cli tool to interact with chain directly.'},
  {header: 'options', optionList: optionDefinitions},
];

const main = async () => {
  const options = commandLineArgs(optionDefinitions);

  if (!Object.keys(options).length | options.help) {
    console.log(commandLineUsage(optionSections));
    return;
  }

  let web3;
  if (options.alchema) {
    web3 = new createAlchemyWeb3(options.alchema);
  } else {
    web3 = new Web3(options.rpc || 'https://cloudflare-eth.com');
  }

  let etherscan_api_base;
  switch (options.net) {
    case 'rinkeby':
      etherscan_api_base = etherscan_rinkeby_api_base;
      break;
    default:
      etherscan_api_base = etherscan_mainnet_api_base;
      break;
  }

  if (options.subscribe) {
    const subscription = web3.eth.subscribe(options.subscribe);

    async function wait_on_data(sub) {
      function on_data(sub) {
        return new Promise(resolve => {
          sub.on('data', (header) => {
            console.log(sub);
            resolve(header);
          });
        });
      }
      return await on_data(sub);
    }

    const data = await wait_on_data(subscription);
    console.log(data);
  }

  if (options.contract) {
    const contract_address = options.contract;
    const apikey = options.apikey;
    const request_getabi = `${etherscan_api_base}/api?module=contract&action=getabi&address=${contract_address}&apikey=${apikey}`;
    const response = await axios.get(request_getabi);
    const json_abi = JSON.parse(response.data.result);
    const contract = new web3.eth.Contract(json_abi, contract_address);

    if (options.function) {
      const function_name = options.function;

      if (options.param) {
        const value = await contract.methods[function_name].apply(contract, options.param).call();
        console.log(value);
      } else {
        const value = await contract.methods[function_name]().call();
        console.log(value);
      }
    } else {
      console.log(contract);
    }
  }

  if (options.pendings) {
    web3.eth.subscribe('pendingTransactions')
      .on('data', (tx) => console.log(`tx=${tx}`))
      .on('error', (err) => console.log(err));
  }
}

main();
