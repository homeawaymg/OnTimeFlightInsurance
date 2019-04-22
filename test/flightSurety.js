
var Test = require('../config/testConfig.js');
var BigNumber = require('bignumber.js');

contract('Flight Surety Tests', async (accounts) => {

  var config;
  before('setup contract', async () => {
    config = await Test.Config(accounts);
    //console.log(config);
    await config.flightSuretyData.authorizeCaller(config.flightSuretyApp.address);
    //await config.flightSuretyData.authorizeCaller(accounts[9]);
 
  });

  /****************************************************************************************/
  /* Operations and Settings                                                              */
  /****************************************************************************************/

  it(`(multiparty) has correct initial isOperational() value`, async function () {

    // Get operating status
    let status = await config.flightSuretyData.isOperational.call();
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
          await config.flightSuretyData.setOperatingStatus(false, { from: config.testAddresses[2] });
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
          await config.flightSuretyData.setOperatingStatus(false);
      }
      catch(e) {
          console.log(e);
          accessDenied = true;
      }
      assert.equal(accessDenied, false, "Access restricted to Contract Owner");
      
  });

  it(`(multiparty) can block access to functions using requireIsOperational when operating status is false`, async function () {

      await config.flightSuretyData.setOperatingStatus(false);

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
      await config.flightSuretyData.setOperatingStatus(true);

  });

  it('(airline) cannot register an Airline using registerAirline() if it is not funded', async () => {
    
    // ARRANGE
    let newAirline = accounts[2];
    let x = false;
    // ACT
    try {
        //let x = await config.flightSuretyData.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        x = await config.flightSuretyData.registerAirline(newAirline, "United Airlines",{from: config.firstAirline});
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
        //let x = await config.flightSuretyData.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyData.fund({from: config.firstAirline,value:cashOnHand});
        await config.flightSuretyData.registerAirline(newAirline, "United Airlines",{from: config.firstAirline});
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
        //let x = await config.flightSuretyData.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyData.registerAirline(accounts[3], "Third Airline",{from: accounts[1]});
        await config.flightSuretyData.registerAirline(accounts[4], "Fourth Airline",{from: accounts[1]});
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
        //let x = await config.flightSuretyData.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyData.registerAirline(accounts[5], "Fifth Airline",{from: accounts[1]});
    }
    catch(e) {
        console.log(e);
    }

    // ASSERT
    let airlinew1 = await config.flightSuretyData.GetAirline.call(accounts[5]); 

    assert.equal(airlinew1[1], false, "5 ABLE to register fifth airline without 50% consensus - NOT OK")
    
  });


  it('(airline) should be able to vote for 5th Airline After Fundings', async () => {
    let cashOnHand =  web3.utils.toWei("10",'ether');

    // ARRANGE
    //first fund the initial 3 new airlines
    try {
        //let x = await config.flightSuretyData.registerAirline.call(newAirline, "United Airlines", {from: config.flightSuretyApp.address/*,value:cashOnHand*/});
        await config.flightSuretyData.fund({from: accounts[2],value:cashOnHand});
        await config.flightSuretyData.fund({from: accounts[3],value:cashOnHand});
        await config.flightSuretyData.fund({from: accounts[4],value:cashOnHand});
    }
    catch(e) {
        console.log(e);
    }

    // ACT

    try {
        //Register the airline in an unapproved state
        //await config.flightSuretyData.registerAirline(accounts[5], "Fifth Airline",{from: accounts[1]});

        //Cast a vote from the 3 Airlines to get the 5th airline in
        await config.flightSuretyData.voteForAirline(accounts[5],{from: config.firstAirline});
        await config.flightSuretyData.voteForAirline(accounts[5],{from: accounts[2]});
        await config.flightSuretyData.voteForAirline(accounts[5],{from: accounts[3]});
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
    await config.flightSuretyData.fund({from: accounts[5],value:cashOnHand});

    let totalFunding = await config.flightSuretyData.cashOnHand.call(); 
    totalFunding = web3.utils.fromWei(totalFunding, 'wei')
    assert.equal( totalFunding, web3.utils.toWei("50",'ether'), "Cash on hand should reflect the funding above - NOT OK")
  });
});
