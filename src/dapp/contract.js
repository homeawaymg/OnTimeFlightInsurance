import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import Config from './config.json';
import Web3 from 'web3';

export default class Contract {

    constructor(network, callback) {
        let config = Config[network];
        this.web3 = new Web3(new Web3.providers.HttpProvider(config.url));
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
            this.owner = accts[0];
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
        let payload = {
            airline: self.airlines[0],
            flight: flight,
            timestamp: Math.floor(Date.now() / 1000)
        } 
        self.flightSuretyApp.methods
            .fetchFlightStatus(payload.airline, payload.flight, payload.timestamp)
            .send({ from: self.owner}, (error, result) => {
                callback(error, payload);
            });
        
    }

    purchaseInsurance(flight, callback) {
        let self = this;
        
        let  flightData = flight.split("|");
        let cashOnHand =  this.web3.utils.toWei("1",'ether');
        alert(flightData);
        self.flightSuretyApp.methods
        .buy(flightData[0], flightData[1], flightData[2])
        .send({ from: self.owner,value:cashOnHand, gas: 471230, gasPrice: 100000 }, (error,result) => {
            callback(error, result);
        });

    } 

    RegisterAirlines() {
        airlines.forEach(element => {
            self.flightSuretyApp.methods.registerAirline(airlines[element], element).send({from: self.owner}).catch(e => console.log(e));
        });
    }

    RegisterFlights() {
        flights.forEach(element => {
            self.flightSuretyApp.registerFlight(airlines[element], flights[element], 111222333).send({from: self.owner}).catch(e=> console.log(e));
        });
    }



}