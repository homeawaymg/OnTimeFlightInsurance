pragma solidity >=0.4.0 <0.6.0;
import "remix_tests.sol"; // this import is automatically injected by Remix.
import "localhost/contracts/FlightSuretyData.sol";
// file name has to end with '_test.sol'
contract testFlightSuretyData {
    FlightSuretyData flightSuretyData;
    Airline testOut;
    struct Airline {
        bool isApproved;
        uint256 updatedTimestamp;        
        uint256 registrationFees;
        bool exists;
        string AirlineName;
    }
    function beforeAll() public {
        // here should instantiate tested contract
        //Assert.equal(uint(4), uint(3), "error in before all function");
        flightSuretyData = new FlightSuretyData();
        bool x = flightSuretyData.registerAirline(0xdd870fa1b7c4700f2bd7f44238821c26f7392148, "United Airlines");
    }

  function checkIfIsAirline1() public {
    // use 'Assert' to test the contract
    //Assert.equal(x, true, "Unable to Register Airlines");
    Assert.equal(flightSuretyData.isAirline(0xdd870fa1b7c4700f2bd7f44238821c26f7392148), true,  "Unable to retrev regstred Airline");
  }


    function getFlightKey
                        (
                            address airline,
                            string memory flight,
                            uint256 timestamp
                        )
                        pure
                        internal
                        returns(bytes32) 
    {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }


  function checkIfAirlineWasRegistered2() public {
    // use the return value (true or false) to test the contract
    //flightSuretyData.isAirline(0xdd870fa1b7c4700f2bd7f44238821c26f7392148);
    address a;
    bool b;
    uint256 c;
    uint256 d; 
    bool e; 
    string memory f;
    (a,b,c,d,e,f) = flightSuretyData.GetAirline(0xdd870fa1b7c4700f2bd7f44238821c26f7392148);
    Assert.equal(f, "United Airlines", "Unable to retrev regstred Airline");    
  }
  
  function checkIfRegisterFlightWorks() public {
      bytes32 a = flightSuretyData.registerFlight(0xdd870fa1b7c4700f2bd7f44238821c26f7392148, "FLIGHT7172", now + 2 days);
      bytes32 b = getFlightKey(0xdd870fa1b7c4700f2bd7f44238821c26f7392148, "FLIGHT7172", now + 2 days);
      Assert.equal(a,b, "unable to RegisterFlight");
  }

}

/*
contract test_2 {
 
  function beforeAll() public {
    // here should instantiate tested contract
    Assert.equal(uint(4), uint(3), "error in before all function");
  }

  function check1() public {
    // use 'Assert' to test the contract
    Assert.equal(uint(2), uint(1), "error message");
    Assert.equal(uint(2), uint(2), "error message");
  }

  function check2() public view returns (bool) {
    // use the return value (true or false) to test the contract
    return true;
  }
}
*/