import 'babel-polyfill';
//import './app';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json'; 

import Config from './config.json';
import Web3 from 'web3';
import express from 'express';




let config = Config['localhost'];
console.log(config.url);
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
let accts = '';
var oracles = new Map();
let fee = 0;


flightSuretyApp.events.FlightStatusInfo({
  fromBlock: "latest"
  }, function (error, event) {
    //console.log(event);
    if (error) {
      console.log(error);
    }
    else {
      let airline = event.returnValues.airline; 
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let status = event.returnValues.status;
      console.log(` GOT FLIGHT STATUS INFO - ${airline}, ${flight}, ${timestamp}, ${status}`);
    }
  }
)

flightSuretyApp.events.OracleReport({
  fromBlock: "latest" 
  }, function (error, event) {
    //console.log(event);
    if (error) {
      console.log(error);
    }
    else {
      let airline = event.returnValues.airline; 
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp;
      let status = event.returnValues.status;
      
      console.log(`OracleReport - ${airline}, ${flight}, ${timestamp}, ${status}`);
    }
  }
)


flightSuretyApp.events.Debug({
  fromBlock: "latest" 
  }, function (error, event) {
    //console.log(event);
    if (error) {
      console.log(error);
    }
    else {
      let debugstring = event.returnValues.debugstring; 

      
      console.log(` DEBUG - ${debugstring}`);
    }
  }
)


flightSuretyApp.events.OracleRequest({
    fromBlock: "latest"
    }, function (error, event) {
      //console.log(event);
      if (error) {
        console.log(error);
      }
      else {

        let index = event.returnValues.index; 
        let airline = event.returnValues.airline; 
        let flight = event.returnValues.flight;
        let timestamp = event.returnValues.timestamp; 
        let found = false;
        console.log(`OracleRequest ======= ${index} - ${airline} - ${flight} - ${timestamp}`)
      }

    //console.log(event)
});

console.log("Actively Watching for EVENTS %%%%%%%%%%%%");



const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


