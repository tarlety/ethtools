const Web3 = require('web3');
const {createAlchemyWeb3} = require("@alch/alchemy-web3")
const commandLineArgs = require('command-line-args');
const request = require('request');

const optionDefinitions = [
  {name: 'provider', alias: 'p', type: String},
  {name: 'rpc', type: String},
  {name: 'pendings', type: Boolean},
  {name: 'contract', type: String},
  {name: 'apikey', type: String},
  {name: 'function', type: String},
];

const options = commandLineArgs(optionDefinitions);

var web3;
switch (options.provider) {
  case 'alchemy':
    web3 = new createAlchemyWeb3(options.rpc);
    break;
  default:
    web3 = new Web3(options.rpc || 'https://cloudflare-eth.com');
    break;
}

if (options.contract) {
  const contract_address = options.contract;
  const apikey = options.apikey;
  const req = `https://api.etherscan.io/api?module=contract&action=getabi&address=${contract_address}&apikey=${apikey}`;
  console.log(req);

  request(req, (err, resp, result) => {
    abi = JSON.parse(JSON.parse(result)['result']);
    const contract = new web3.eth.Contract(abi, contract_address);
    console.log(contract);
    console.log(contract.methods);
    contract.methods.name().call().then(console.log).catch((error) => {console.error(`error is ${error}`)});
  });
}

if (options.pendings) {
  web3.eth.subscribe('pendingTransactions')
    .on('data', (tx) => console.log(`tx=${tx}`))
    .on('error', (err) => console.log(err));
}

