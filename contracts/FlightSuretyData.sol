pragma solidity ^0.4.25;
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol"; 

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/
   
    address private contractOwner;
    //address private authorizedCaller;     
    mapping(address => bool) authorizedCallers;                              // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    uint16 private sponsoringAirlinesCount;    
    uint8 private COUNT_AFTER_VOTING_KICKSIN = 4;
    
    mapping(address => address[]) AirlineSponsors;
    
    mapping(address => Airline) airlines;

    Airline public testOut;

    struct Airline {
        bool isApproved;
        uint256 updatedTimestamp;        
        uint256 fundsPaid;
        bool exists;
        string AirlineName;
        
    }

    int public cashOnHand;
    uint MULTIPLIER = 3;
    uint DIVIDER = 3;

    struct LedgerEntry {
        address airline;
        string  flight;
        uint256  flightTimestamp;

        uint256 purchaseAmount;
        uint256 updatedTimestamp;

        uint256 credit;
        bool exists;
        bytes32 creditForKey;
        bool paid;
    }

    mapping(address => LedgerEntry) insuranceLedger;
    
    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;        
        address airline;
        bool exists;
        string flight;
        uint256 flightTimeStamp;
    }
    mapping(bytes32 => Flight) private flights;


    //    mapping(uint => Item) items;
    /********************************************************************************************/
    /*                                       EVENT DEFINITIONS                                  */
    /********************************************************************************************/


    /**
    * @dev Constructor
    *      The deploying account becomes contractOwner
    */
    constructor
                                (
                                    address firstAirline,
                                    string firstAirlineName
                                ) 
                                public
                                payable
    {
        contractOwner = msg.sender;
        registerAirlineUtil(firstAirline, firstAirlineName);
    }

    /********************************************************************************************/
    /*                                       FUNCTION MODIFIERS                                 */
    /********************************************************************************************/

    // Modifiers help avoid duplication of code. They are typically used to validate something
    // before a function is allowed to be executed.

    /**
    * @dev Modifier that requires the "operational" boolean variable to be "true"
    *      This is used on all state changing functions to pause the contract in 
    *      the event there is an issue that needs to be fixed
    */
    modifier requireIsOperational() 
    {
        require(operational, "Contract is currently not operational");
        _;  // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
    * @dev Modifier that requires the "ContractOwner" account to be the function caller
    */

    modifier requireContractOwner()
    {
        require(tx.origin == contractOwner, " Caller is not contract owner");
        _;
    }

    modifier requireAuthorizedCaller()
    {
        require(authorizedCallers[msg.sender] == true, "Caller is not Authorized Caller");
        _;
    }

    modifier requireNewAirline(address _a)
    {
        Airline memory a = airlines[_a];
        require(!a.exists, "Airline Already Exists");
        _;
    }

    modifier requireExistingAirline(address _a)
    {
        Airline memory a = airlines[_a];
        require(a.exists, "Airline Does Not Exist");
        _;
    }

    modifier requireExistingAndFundedAirline(address _a)
    {
        Airline memory a = airlines[_a];
        require(a.exists, "Airline Does Not Exist");
        require(a.fundsPaid > 0, "Airline has not provided funds!");
        _;
    }


    modifier requireLedgerEntryExists(address _a)
    {
        LedgerEntry memory a = insuranceLedger[_a];
        require(a.exists, "Insurance Never Purchased");
        _;
    }

    modifier requireLedgerEntryExistsAndNotPaid(address _a)
    {
        LedgerEntry memory a = insuranceLedger[_a];
        require(a.exists, "Insurance Never Purchased");
        require(a.paid != true, "Insurance Already Paid");
        require(a.credit > 0, "No Insurance Credit");
        _;
    }


    modifier requireFlightStatusKnown(address _a)
    {
        LedgerEntry memory a = insuranceLedger[_a];
        require(a.exists, "Insurance Never Purchased");
        _;
    }

    modifier requireCalleeIsFunded()
    {
        require(airlines[tx.origin].fundsPaid >= 10, "Calling Airlines should fund before registering others");
        _;
    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function authorizeCaller(address o) public requireContractOwner
    {
        authorizedCallers[o] = true;
        //authorizedCaller = o;
    }

    /**
    * @dev Get operating status of contract
    *
    * @return A bool that is the current operating status
    */      
    function isOperational() 
                            public 
                            view 
                            returns(bool) 
    {
        return operational;  
    }


    /**
    * @dev Sets contract operations on/off
    *
    * When operational mode is disabled, all write transactions except for this one will fail
    */    
    function setOperatingStatus
                            (
                                bool mode
                            ) 
                            external
                            requireContractOwner
                             
    {
        operational = mode;
    }

    /********************************************************************************************/
    /*                                     SMART CONTRACT FUNCTIONS                             */
    /********************************************************************************************/

   /**
    * @dev Add an airline to the registration queue
    *      Can only be called from FlightSuretyApp contract
    *
    */    
    function registerAirline
                            (   address newAirline, string memory _name)
                            public
                            requireAuthorizedCaller
                            requireNewAirline(newAirline) 
                            requireCalleeIsFunded
                            returns
        (
            bool  
        )
    {
        return registerAirlineUtil(newAirline, _name);
    }

    function registerAirlineUtil
                            (   address newAirline, string memory _name)
                            internal
                            returns
        (
            bool  
        )
    {
        bool approved;
        if (sponsoringAirlinesCount < COUNT_AFTER_VOTING_KICKSIN || AirlineSponsors[newAirline].length > sponsoringAirlinesCount / 2) 
        {
           approved = true;
        }

        Airline memory a =  Airline( 
                    approved,  //isApproved
                    now,    //uint256 updatedTimestamp;        
                    0,      //uint256 registrationFees;
                    true,       //bool exists;
                    _name        //string name
        );

        airlines[newAirline] = a;
        sponsoringAirlinesCount++;
        return (a.exists) ;
    }
    /********************************************************************
    * @dev implement a 50% consensus
    *
    *********************************************************************/   
    // 
    function voteForAirline
        (
            address sponsoredAirline
        ) 
        public 
        requireCalleeIsFunded
        returns 
        (
            bool
        )
    {
        bool isDuplicate = false;
        for(uint c=0;c<AirlineSponsors[sponsoredAirline].length; c++)
        {
            if (AirlineSponsors[sponsoredAirline][c] == tx.origin) 
            {
                isDuplicate = true;
                break;
            }
        }
        if (!isDuplicate)
        {
            AirlineSponsors[sponsoredAirline].push(tx.origin);
        }
        if (AirlineSponsors[sponsoredAirline].length > sponsoringAirlinesCount / 2) 
        {
            airlines[sponsoredAirline].isApproved = true;
        }
    }


  function registerFlight
                                (
                                    address airline,
                                    string  flight,
                                    uint256 timestamp
                                )
                                external
                                requireAuthorizedCaller
                                requireExistingAndFundedAirline(airline)
                                returns (
                                    bytes32
                                )
    {
        Flight memory f = Flight(true, STATUS_CODE_UNKNOWN, now, airline, true, flight, timestamp);
        bytes32 key = getFlightKey(airline,flight,timestamp);
        flights[key]=f;
        return key;
    }



    function GetFlight (            address airline,
                                    string  flight,
                                    uint256 timestamp) public view returns (bytes32, bool, uint8, uint256, address, bool, string, uint256 ) 
    {
        bytes32 key = getFlightKey(airline,flight,timestamp);
        Flight f = flights[key];
        return ( key, f.isRegistered, f.statusCode, f.updatedTimestamp, f.airline, f.exists, f.flight, f.flightTimeStamp) ;
    }


    function GetAirline ( address airline) public view returns (address, bool, uint256, uint256, bool, string ) 
    {
        Airline storage a  = airlines[airline];
        
        return ( airline, a.isApproved, a.updatedTimestamp, a.fundsPaid, a.exists, a.AirlineName) ;
    }
    
    
    function isAirline ( address airline) public view returns ( bool) 
    {
        Airline storage a  = airlines[airline];
        
        return ( a.exists) ;
    }

    function getBalance (address a) public view returns (uint256)
    {
        return a.balance;
    }
    

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (    address _airline, string _flight ,  uint256 _flightDeparture                        
                            )
                            external
                            payable
                            requireExistingAirline(_airline) returns (bool)
    {
        bytes32 key = getFlightKey(_airline,_flight,_flightDeparture);
        //check if the flight is insurable
        require(flights[key].exists, "Cannot buy insurance for a non-insurable flight");


        uint256 _now = now;

        LedgerEntry memory le = LedgerEntry(
            _airline,
            _flight,
            _flightDeparture,
            msg.value,
            _now,

            0,
            true,
            key,
            false
        );
        insuranceLedger[tx.origin] = le;
        cashOnHand = int(cashOnHand) + int(msg.value);
        return true;

    }
    function checkBoughtInsurance
                            (    address _airline, string _flight ,  uint256 _flightDeparture                        
                            )
                            external
                            view
                            returns
                            (
                                bool
                            )
    {
        bytes32 key = getFlightKey(_airline,_flight,_flightDeparture);
        require(insuranceLedger[tx.origin].airline == _airline, "Insurance Airline Does not match");
        require(insuranceLedger[tx.origin].exists == true, "Insurance does not exist");
        
        return insuranceLedger[tx.origin].exists;

    }


    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                    address insuree
                                )
                                external
                                
                                requireContractOwner
                                requireLedgerEntryExists(insuree)
    {
        LedgerEntry insurance = insuranceLedger[insuree];
        Flight f = flights[insurance.creditForKey];
        //require(insurance.creditForKey != key, "Insurance already Credited");
        require(f.exists, "No Insusrance Exists for crediting");
        require(f.statusCode == STATUS_CODE_LATE_AIRLINE, "Crediting Only applicable for Flight Delay");
        insurance.credit = insurance.purchaseAmount * MULTIPLIER / DIVIDER;
        insurance.updatedTimestamp = now;
    }
    
 
    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            ( 
                                address insuree
                            )
                            external
                            

                            requireContractOwner
                            requireLedgerEntryExistsAndNotPaid(insuree)


    {
        LedgerEntry insurance = insuranceLedger[insuree];
        insuree.transfer(insurance.credit);
        insurance.credit = 0;
    }

   /**
    * @dev Initial funding for the insurance. Unless there are too many delayed flights
    *      resulting in insurance payouts, the contract should be self-sustaining
    *
    */   
    function fund
                            (    
                            )
                            public
                            payable
                            requireExistingAirline(tx.origin)
                            returns (int)
    {
        airlines[tx.origin].fundsPaid += msg.value;
        cashOnHand = int(cashOnHand) + int(msg.value);
        return int(airlines[tx.origin].fundsPaid);
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

    /**
    * @dev Fallback function for funding smart contract.
    *
    */
    function() 
                            external 
                            payable 
    {
        fund();
    }

    function testFlightDelaySetup 
            (
                            address _airline,
                            string memory _flight,
                            uint256 _flightDeparture
            ) 
            public returns (uint8)
    {
        bytes32 key = getFlightKey(_airline,_flight,_flightDeparture);
        Flight f = flights[key];
        f.statusCode = STATUS_CODE_LATE_AIRLINE;
        flights[key] = f;
        return flights[key].statusCode;
    }



}

