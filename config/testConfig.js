
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0xe62f5d49a903925d631a06bf09df98298d59f77d",
        "0xf254bd2bdb31b6a982ab3451424ec0b0168ff036",
        "0x11c3928061092dbb72876059154e9edc702232a2",
        "0x2fe74337b9a0a6b66def5a6679e56704c3ef2fa9",
        "0x83473166a7e9a58199597181a4d17349a60791ec",
        "0xe2ca48c537b3d4203e9d0fea962f65a88fb3b77b",
        "0xc09d1ac6658e265f76e7c56eb59738ef2120cdc9",
        "0xc535d758f2af466a81c8a87891bfcd50398c08d4",
        "0x7ab7ba331e845f02d31dc311b1b446d748eb60f2",
        "0xc6ba1bd6d1d5af68821d2f861a75a3ab482b6f10"

    ];


    let owner = accounts[0];
    let firstAirline = accounts[1];

    let flightSuretyData = await FlightSuretyData.new(firstAirline, "SOUTHWEST");
    let flightSuretyApp = await FlightSuretyApp.new(flightSuretyData.address);

     
    return {
        owner: owner,
        firstAirline: firstAirline,
        weiMultiple: (new BigNumber(10)).pow(18),
        testAddresses: testAddresses,
        flightSuretyData: flightSuretyData,
        flightSuretyApp: flightSuretyApp
    }
}

module.exports = {
    Config: Config
};