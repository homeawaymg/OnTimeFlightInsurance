import 'babel-polyfill';
//import './app';
import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json'; 

import Config from './config.json';
import Web3 from 'web3';
import express from 'express';

const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const TEST_ORACLES_COUNT = 10;


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);
let accts = '';
var oracles = new Map();
let fee = 0;
async function registrationHelper() {
      // ARRANGE
      
      try {
        fee = await flightSuretyApp.methods.REGISTRATION_FEE().call();
      } catch (e) {
        console.log(e.reason);
      }
      // ACT
      accts = await web3.eth.getAccounts();
      console.log(accts);
      //for(let a=1; a<TEST_ORACLES_COUNT; a++) {      
      //  await flightSuretyApp.registerOracle({ from: accounts[a], value: fee });
      //  let result = await config.flightSuretyApp.getMyIndexes.call({from: accounts[a]});
      //  console.log(`Oracle Registered: ${result[0]}, ${result[1]}, ${result[2]}`);
      //}

      accts.forEach(async acct => {
        try { 
        let r = await flightSuretyApp.methods.registerOracle().send({
            "from": acct,
            "value": fee,
            "gas": 471230,
            "gasPrice": 100000
        }); 
        let result = await flightSuretyApp.methods.getMyIndexes().call({from: acct});
        //console.log(result);
        oracles.set(acct,result);
        console.log(`Oracle ${acct} registered: ${oracles.get(acct)[0]}, ${oracles.get(acct)[1]}, ${oracles.get(acct)[2]}`);
      } catch (e) 
      {
        //console.log(e.message); 
      }
    });
} 
 
registrationHelper();



async function SubmitOracleResponse(index, airline, flight, timestamp, status, acct) {
  await flightSuretyApp.methods.submitOracleResponse().call(index, airline, flight, timestamp, status, { from: acct });
}



flightSuretyApp.events.OracleRequest({
    fromBlock: 0
    }, function (error, event) {
      console.log(event);
      if (error) {
        console.log(error);
      }
    
      let airline = event.returnValues.airline; 
      let flight = event.returnValues.flight;
      let timestamp = event.returnValues.timestamp; 
      let found = false;

      for (var [acct, value] of oracles) {
        console.log(acct + ' = ' + value);
        for(let idx=0;idx<3;idx++) {
          try {
            // Submit a response...it will only be accepted if there is an Index match
            SubmitOracleResponse(value[idx], airline, flight, timestamp, STATUS_CODE_ON_TIME,acct);
          }
          catch(e) {
            // Enable this when debugging
            console.log("----------------------------------------------------------------");
            console.log('\nError', idx, value[idx].toNumber(), flight, timestamp);
            console.log(e.reason);
            console.log("----------------------------------------------------------------");
          }
      }
      }

 

    console.log(event)
});


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


