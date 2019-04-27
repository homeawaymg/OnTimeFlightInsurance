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
console.log(config.url);
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
        console.log(e);
      }
      // ACT
      accts = await web3.eth.getAccounts();
      console.log(accts);

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

async function registerAirlineAndFlightsForTESTING() {
  // ARRANGE 
  accts = await web3.eth.getAccounts(); 
  let cashOnHand =  web3.utils.toWei("15",'ether');
  await flightSuretyData.methods.authorizeCaller(config.appAddress).send({from:accts[0],"gas": 471230, "gasPrice": 100000 }).then(`Done Authorizing Caller ${config.appAddress}`).catch(`ERROR Authorizing Caller ${config.appAddress}`);
  await flightSuretyApp.methods.fund().send({from:accts[0],value:cashOnHand,"gas": 471230, "gasPrice": 100000  }).then(console.log("success1")).catch(e => console.log(`funding accts[0] - ${e}`));
  await flightSuretyApp.methods.registerAirline(accts[1], "AIRLINE NUMBER 1").send({from:accts[0],"gas": 471230, "gasPrice": 100000 }).then(console.log("success2")).catch(e => console.log(`Registering AAIRLINE NUMBER 1 - ${e}`));
  await flightSuretyApp.methods.fund().send({from:accts[1],value:cashOnHand,"gas": 471230, "gasPrice": 100000  }).then(console.log("success3")).catch(e => console.log(`funding accts[1] - ${e}`));
  await flightSuretyApp.methods.registerFlight(accts[1], "WN1243", 111222333).send({from:accts[6],"gas": 471230, "gasPrice": 100000 }).then(console.log(`success4 - ${accts[1]}, "WN1243", 111222333`)).catch(e => console.log(`Registering Flight WN1243 - ${e}`));
  await flightSuretyApp.methods.registerFlight(accts[1], "WN2243", 444555666).send({from:accts[6],"gas": 471230, "gasPrice": 100000 }).then(console.log("success5")).catch(e => console.log(`Registering Flight WN2243 - ${e}`));
  await flightSuretyApp.methods.registerFlight(accts[1], "WN3243", 777888999).send({from:accts[6],"gas": 471230, "gasPrice": 100000 }).then(console.log("success6")).catch(e => console.log(`Registering Flight WN3243 - ${e}`));
} 




registrationHelper();
registerAirlineAndFlightsForTESTING();




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
      
      console.log(` OracleReport - ${airline}, ${flight}, ${timestamp}, ${status}`);
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
        let airline = event.returnValues.airline; 
        let flight = event.returnValues.flight;
        let timestamp = event.returnValues.timestamp; 
        let found = false;
        console.log(`OUT ${airline} - ${flight} - ${timestamp}`)

        for (var [acct, value] of oracles) {
          console.log(acct + ' = ' + value);
          for (var i = 0; i < value.length; i++) {
            console.log(`SENT                        ${value[i]}, "${airline}", ${flight}, ${timestamp}, ${STATUS_CODE_LATE_AIRLINE}`);
            flightSuretyApp.methods.submitOracleResponse(value[i], airline, flight, timestamp, STATUS_CODE_LATE_AIRLINE).call({ from: acct })
              .then(console.log(`Good ${acct} ${value[i]}`))
              .catch(function(e) {
              console.log(`${e.message} Error ${acct} ${i}`);
              });
          }
        }
      }

    //console.log(event)
});


const app = express();
app.get('/api', (req, res) => {
    res.send({
      message: 'An API for use with your Dapp!'
    })
})

export default app;


