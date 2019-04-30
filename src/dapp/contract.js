import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {

    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
        //this.web3 = new Web3(web3.currentProvider);  
        this.flightSuretyApp = new this.web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
        this.initialize(callback);
        this.owner = null;
        this.airlines = [];
        this.passengers = [];
        this.flights = [];
        this.flightToAirlines =[];
        this.accts=[];
    }



    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.accts = accts;
            this.owner = accts[11];

        
            let counter = 1;
            console.log(accts)
           /*
            while(this.airlines.length < 5) {
                this.flights[`AIRLINE-${counter}`] = `FLT${counter}143`;
                this.flightToAirlines[ `FLT${counter}143`]=`AIRLINE-${counter}`;
                this.airlines[`AIRLINE-${counter}`] = accts[counter++];
            }

            while(this.passengers.length < 5) {
                this.passengers.push(accts[counter++]);
            }
            */
            callback();
        });
    }

    isOperational(callback) {
       let self = this;
       self.flightSuretyApp.methods
            .isOperational()
            .call({ from: self.owner}, callback);
    }

    setOperationalStatus(status, callback) {
        let self = this;
        self.flightSuretyApp.methods.setOperatingStatus(status).send({ from: self.owner}, callback);;
     }
 

    fetchFlightStatus(flight, callback) {
        let self = this;
        let  flightData = flight.split("|");
        console.log(flightData);

        self.flightSuretyApp.methods
            .fetchFlightStatus(this.accts[1], flightData[0], flightData[1])
            .send({ from: self.owner, gas: 471230, gasPrice: 100000 }, (error, result) => {
                callback(error, result);
            });
        
    }

    purchaseInsurance(flight,amount, callback) {
        let self = this;
        
        let  flightData = flight.split("|");
        let cashOnHand =  this.web3.utils.toWei(amount,'ether');
        console.log(flightData);
        self.flightSuretyApp.methods
        .buy(this.accts[1], flightData[0], flightData[1])
        .send({ from: self.owner,value:cashOnHand, gas: 471230, gasPrice: 100000 }, (error,result) => {
            callback(error, result);
        });

    } 

    creditInsurance(callback) {
        let self = this;
        self.flightSuretyApp.methods
        .creditInsurees()
        .send({from: self.owner}, (error, result) => {
            callback(error, result);
        });
    }

    requestPayout(callback) {
        let self = this;
        self.flightSuretyApp.methods
        .pay()
        .send({from: self.owner}, (error, result) => {
            callback(error, result);
        });

    }
    getWalletAddress(callback) {
        callback(this.owner);

    }


}