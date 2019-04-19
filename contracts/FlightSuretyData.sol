pragma solidity ^0.4.25;
import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    using SafeMath for uint256;

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    address private contractOwner;
    address private authorizedCaller;                                   // Account used to deploy contract
    bool private operational = true;                                    // Blocks all state changes throughout the contract if false
    
    uint private registrationCost = 5 ether;
    mapping(address => Airline) airlines;

    struct Airline {
        bool isApproved;
        uint256 updatedTimestamp;        
        uint256 registrationFees;
        bool exists;
        string AirlineName;
    }

    uint256 public cashOnHand;

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
                                ) 
                                public 
    {
        contractOwner = msg.sender;
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
        require(msg.sender == contractOwner, " Caller is not contract owner");
        _;
    }

    modifier requireAuthorizedCaller()
    {
        require(msg.sender == authorizedCaller, "Caller is not Authorized Caller");
        _;
    }

    modifier requireNewAirline(address aa)
    {
        Airline memory a = airlines[aa];
        require(!a.exists, "Airline Already Exists");
        _;
    }
    modifier requireFunding()
    {
        require(msg.value >= registrationCost, "Need Atleast 5 Ethers to Register");
        _;
    }
 
    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function authorizeCaller(address o) public requireContractOwner
    {
        authorizedCaller = o;
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
                            (   address newAirline, string _name)
                            public
                            //pure
                            payable
                            requireAuthorizedCaller
                            requireNewAirline(newAirline) 
                            requireFunding
                            returns
        (
            address, bool, uint256, uint256, bool, string
        )
    {
        Airline memory a;
        a =  Airline(
                    
                    false,  //isApproved
                    now,    //uint256 updatedTimestamp;        
                    msg.value,      //uint256 registrationFees;
                    true,       //bool exists;
                    _name        //string name
        );

        airlines[newAirline] = a;
        Airline b = airlines[newAirline];
        cashOnHand += msg.value;
        return ( newAirline, b.isApproved, b.updatedTimestamp, b.registrationFees, b.exists, b.AirlineName) ;
        

    }

    function isAirline ( address airline) public returns (address, bool, uint256, uint256, bool, string memory) 
    {
        Airline a ;
        a = airlines[airline];
        return ( airline, a.isApproved, a.updatedTimestamp, a.registrationFees, a.exists, a.AirlineName) ;
    }

    function getBalance (address a) public returns (uint256)
    {
        return a.balance;
    }
    

   /**
    * @dev Buy insurance for a flight
    *
    */   
    function buy
                            (                             
                            )
                            external
                            payable
    {

    }

    /**
     *  @dev Credits payouts to insurees
    */
    function creditInsurees
                                (
                                )
                                external
                                pure
    {
    }
    

    /**
     *  @dev Transfers eligible payout funds to insuree
     *
    */
    function pay
                            ( 
                            )
                            external
                            pure
    {
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
    {
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


}

