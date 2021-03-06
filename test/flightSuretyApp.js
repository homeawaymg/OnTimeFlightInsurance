
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //console.log(config);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    //await config.flightSuretyApp.authorizeCaller(accounts[9]);
 
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyApp.isOperational.call();
    assert.equal(status, true, "Incorrect initial operating status value");

  });

  it(`(multiparty) has correct initial Airline Registered with deployment`, async function () {
    console.log(config.owner);
    console.log(config.firstAirline);
    // Get operating status
    let result = await config.flightSuretyData.isAirline.call(config.firstAirline); 

    let airlinew = await config.flightSuretyData.GetAirline.call(config.firstAirline); 

    assert.equal(result, true, "First Airline Not Registered");  
    assert.equal(airlinew[4], true, "First Airline Does Not Exist ")
    assert.equal(airlinew[5], "SOUTHWEST", "First Airline should be SOUTHWEST")
  });




  it(`(multiparty) can block access to setOperatingStatus() for non-Contract Owner account`, async function () {

      // Ensure that access is denied for non-Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyApp.setOperatingStatus(false, { from: config.testAddresses[2] });
      }
      catch(e) {
          accessDenied = true;
      }
      assert.equal(accessDenied, true, "Access not restricted to Contract Owner");
            
  });

  it(`(multiparty) can allow access to setOperatingStatus() for Contract Owner account`, async function () {

      // Ensure that access is allowed for Contract Owner account
      let accessDenied = false;
      try 
      {
          await config.flightSuretyApp.setOperatingStatus(false);
      }
      catch(e) {
          console.log(e);
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyApp.setOperatingStatus(false);

      let reverted = false;
      try 
      {
          await config.flightSurety.setTestingMode(true);
      }
      catch(e) {
          reverted = true;
      }
      assert.equal(reverted, true, "Access not blocked for requireIsOperational");      

      // Set it back for other tests to work
      await config.flightSuretyApp.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let x = false;
    // ACT
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        x = await config.flightSuretyApp.registerAirline(newAirline, "United Airlines",{from: config.firstAirline});
    }
    catch(e) {
        //console.log(e);
    }

    // ASSERT
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

    let airlinew = await config.flightSuretyData.GetAirline.call(newAirline); 

    assert.equal(result, false, "Able to register airline without Funds");  
    assert.equal(airlinew[4], false, "Able to register airline without Funds 2")
    
  });
  
  it('(airline) CAN register an Airline using registerAirline() if it is FUNDED', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let cashOnHand =  web3.utils.toWei("10",'ether');
    let x = false;
    // ACT
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        let funded = await config.flightSuretyApp.fund({from: config.firstAirline,value:cashOnHand});
        console.log(`%%%%%%%%%%%%%%%%%%%%%%%%%%  ${funded}  =  ${cashOnHand}`);
        await config.flightSuretyApp.registerAirline(newAirline, "United Airlines",{from: config.firstAirline});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let result = await config.flightSuretyData.isAirline.call(newAirline); 

    let airlinew = await config.flightSuretyData.GetAirline.call(newAirline); 

    assert.equal(result, true, "Unable to register airline even after funding 10 Ethers 1");  
    assert.equal(airlinew[4], true, "Unable to register airline even after funding 10 Ethers 2")
    
  });

//Check If we are able to register upto 4 Airlilnes without voting, but not 5
it('(airline) able to register upto 4 Airlilnes without voting', async () => {
    
    // ARRANGE
    // ACT
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyApp.registerAirline(accounts[3], "Third Airline",{from: accounts[1]});
        await config.flightSuretyApp.registerAirline(accounts[4], "Fourth Airline",{from: accounts[1]});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let airlinew1 = await config.flightSuretyData.GetAirline.call(accounts[3]); 
    let airlinew2 = await config.flightSuretyData.GetAirline.call(accounts[4]); 

    //assert.equal(airlinew1[1], true, "3 Unable to register third airline even after funding 10 Ethers 2 - NOT APPROVED")
    assert.equal(airlinew1[1], true, "4 Unable to register fourth airline even after funding 10 Ethers 2 - NOT APPROVED")
    assert.equal(airlinew1[4], true, "3 Unable to register third airline even after funding 10 Ethers 2")
    assert.equal(airlinew2[4], true, "4 Unable to register fourth airline even after funding 10 Ethers 2")
    
  });

  
  //Check to see if registering fifth airline fails
  it('(airline) should not be able to register 5th Airline without 50% consensus', async () => {
    
    // ARRANGE
    // ACT
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyApp.registerAirline(accounts[5], "Fifth Airline",{from: accounts[1]});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let airlinew1 = await config.flightSuretyData.GetAirline.call(accounts[5]); 
    console.log(airlinew1);

    assert.equal(airlinew1[1], false, "5 ABLE to register fifth airline without 50% consensus - NOT OK")
    
  });

  it('(airline) should not be able to register 6th Airline without 50% consensus', async () => {
    
    // ARRANGE
    // ACT
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyApp.registerAirline(accounts[6], "Sixth Airline",{from: accounts[1]});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let airlinew1 = await config.flightSuretyData.GetAirline.call(accounts[6]); 
    console.log(airlinew1);
    assert.equal(airlinew1[1], false, "6 ABLE to register sixth airline without 50% consensus - NOT OK")
    
  });



  it('(airline) should be able to vote for 5th Airline After Fundings', async () => {
    let cashOnHand =  web3.utils.toWei("10",'ether');

    // ARRANGE
    //first fund the initial 3 new airlines
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyApp.fund({from: accounts[2],value:cashOnHand});
        await config.flightSuretyApp.fund({from: accounts[3],value:cashOnHand});
        await config.flightSuretyApp.fund({from: accounts[4],value:cashOnHand});
    }
    catch(e) {
        console.log(e);
    }

    // ACT

    try {
        //Register the airline in an unapproved state
        //await config.flightSuretyApp.registerAirline(accounts[5], "Fifth Airline",{from: accounts[1]});

        //Cast a vote from the 3 Airlines to get the 5th airline in
        await config.flightSuretyApp.voteForAirline(accounts[5],{from: config.firstAirline});
        await config.flightSuretyApp.voteForAirline(accounts[5],{from: accounts[2]});
        await config.flightSuretyApp.voteForAirline(accounts[5],{from: accounts[3]});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let airlinew1 = await config.flightSuretyData.GetAirline.call(accounts[5]); 
    assert.equal(airlinew1[1], true, "5 UNABLE to register fifth airline WITH 50% consensus - NOT OK")
  });

  it('(airline) total Funding should be', async () => {
    let cashOnHand =  web3.utils.toWei("10",'ether');
    //fund the 5th Airline as well
    await config.flightSuretyApp.fund({from: accounts[5],value:cashOnHand});

    let totalFunding = await config.flightSuretyData.cashOnHand.call(); 
    totalFunding = web3.utils.fromWei(totalFunding, 'wei')
    assert.equal( totalFunding, web3.utils.toWei("50",'ether'), "Cash on hand should reflect the funding above - NOT OK")
  });


  
 it('(airline) should be able to register a flight that is eligible for Insurance Purchase', async () => {
 
    // ACT
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        let x = await config.flightSuretyApp.registerFlight(accounts[1], "WN7172", 111222333, {from: accounts[1]});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let insurableFlight = await config.flightSuretyData.GetFlight.call(accounts[1], "WN7172", 111222333,{from: accounts[1]}); 

    assert.equal(insurableFlight[1], true, "UNABLE to register an insurable Flight")
    
  });

  it('(Traveler) should be able to purchase insurance on a registered flight', async () => {
    // ARRANGE
        //     function buy
        //     (    address _airline,string _flight ,  uint256 _flightDeparture                        
        //     )
        //     external
        //     payable
        //     requireExistingAirline(_airline) returns (bool)
        // {


    // ACT
    let cashOnHand =  web3.utils.toWei("1",'ether');
    var status = false;
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        status = await config.flightSuretyApp.buy(accounts[1], "WN7172", 111222333, {from: accounts[9],value:cashOnHand});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let result = await config.flightSuretyData.checkBoughtInsurance.call(accounts[1], "WN7172", 111222333, {from: accounts[9]});
    assert.equal(result, true, "UNABLE to purchase on an insurable Flight")
    
  });




 

  it('(Traveler) should be credited if insurance payout is applicable', async () => {
    // ARRANGE
    // ACT
    let cashOnHand =  web3.utils.toWei("1",'ether');
    var status = false;
    try {
        //let x = await config.flightSuretyApp.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        status = await config.flightSuretyApp.buy(accounts[1], "WN7172", 111222333, {from: accounts[9],value:cashOnHand});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let result = await config.flightSuretyData.checkBoughtInsurance.call(accounts[1], "WN7172", 111222333, {from: accounts[9]});
    assert.equal(result, true, "UNABLE to purchase on an insurable Flight")
  });


});
