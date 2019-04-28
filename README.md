# FlightSurety

FlightSurety is an Ethereum based Distributed application that enable a Flight Delay Insurance.

## Install

This repository contains Smart Contract code in Solidity (using Truffle), tests (also using Truffle), dApp that can be used by a passenger to buy insurance (using HTML, CSS and JS) and server app which is a simulation of Oracle that report flight Delay.

To install, download or clone the repo, then:

`npm install`
`truffle compile`

## To Run the Distributed Client Client

To run truffle tests:

`truffle test ./test/flightSurety.js`
`truffle test ./test/flightSuretyApp.js`
`truffle test ./test/oracles.js`

To use the dapp:

`truffle migrate`
`npm run dapp`

To view dapp:

`http://localhost:8000`

## To Run the Server (Which also sets up the initial registration for Client to use)

`npm run server`
`truffle test ./test/oracles.js`


## To Run Monitor to watch various activities

`npm run monitor`


## Deploy

To build dapp for prod:
`npm run dapp:prod`

Deploy the contents of the ./dapp folder


## Resources

* [How does Ethereum work anyway?](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)
* [BIP39 Mnemonic Generator](https://iancoleman.io/bip39/)
* [Truffle Framework](http://truffleframework.com/)
* [Ganache Local Blockchain](http://truffleframework.com/ganache/)
* [Remix Solidity IDE](https://remix.ethereum.org/)
* [Solidity Language Reference](http://solidity.readthedocs.io/en/v0.4.24/)
* [Ethereum Blockchain Explorer](https://etherscan.io/)
* [Web3Js Reference](https://github.com/ethereum/wiki/wiki/JavaScript-API)