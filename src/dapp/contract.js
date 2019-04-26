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
    }



    initialize(callback) {
        this.web3.eth.getAccounts((error, accts) => {
            this.owner = accts[0];
            let counter = 1;
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

    PurchaseInsurance(flight) {
        let cashOnHand =  web3.utils.toWei("1",'ether');
        config.flightSuretyApp.buy(flightToAirlines[flight], flight, 111222333).send({from: accounts[9],value:cashOnHand}).catch(e=> console.log(e));
    }


}