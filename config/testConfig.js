
var FlightSuretyApp = artifacts.require("FlightSuretyApp");
var FlightSuretyData = artifacts.require("FlightSuretyData");
var BigNumber = require('bignumber.js');

var Config = async function(accounts) {
    
    // These test addresses are useful when you need to add
    // multiple users in test scripts
    let testAddresses = [
        "0xf254bd2bdb31b6a982ab3451424ec0b0168ff036",
        "0xe62f5d49a903925d631a06bf09df98298d59f77d",
        "0x11c3928061092dbb72876059154e9edc702232a2",
        "0x2fe74337b9a0a6b66def5a6679e56704c3ef2fa9",
        "0x83473166a7e9a58199597181a4d17349a60791ec",
        "0xe2ca48c537b3d4203e9d0fea962f65a88fb3b77b",
        "0xc09d1ac6658e265f76e7c56eb59738ef2120cdc9",
        "0xc535d758f2af466a81c8a87891bfcd50398c08d4",
        "0x7ab7ba331e845f02d31dc311b1b446d748eb60f2",
        "0xc6ba1bd6d1d5af68821d2f861a75a3ab482b6f10",
        "0x0bfdae333dcd1e56234dd172b1c05005d5911ab6",
        "0xb8186a1ccd891113ec5c89617e492d3e97b4a903",
        "0x7d5da47b35dff4eab685bf55348a2a6218f7921d",
        "0x36116e775f4b7fd20f8f8383bcf8a1bcd4951579",
        "0x270ff3467fe5112d13dcc11a81103b0313757299",
        "0x83aa74f7d31195e33ec09b589cb3b83be4bc4643",
        "0xcd407d986b6a35fa0497d91d563e732f8da05ca1",
        "0x58f0413215c58eadd98e9b20a3b024fc22ae4cad",
        "0x750cb40a8d2b04436e8e39a4d8f73bb9925c40fe",
        "0x41ecf83dfce7a7e0c40a3020d7b9330abe1f96bc"
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