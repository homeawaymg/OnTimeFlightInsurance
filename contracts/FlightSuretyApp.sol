pragma solidity ^0.4.25;

// It's important to avoid vulnerabilities due to numeric overflow bugs
// OpenZeppelin's SafeMath library, when used correctly, protects agains such bugs
// More info: https://www.nccgroup.trust/us/about-us/newsroom-and-events/blog/2018/november/smart-contract-insecurity-bad-arithmetic/

import "../node_modules/openzeppelin-solidity/contracts/math/SafeMath.sol";

contract FlightSuretyData {
    function registerAirline(address newAirline, string name, bool approved) external returns(bool);
    function voteForAirline(address sponsoredAirline) external returns(bool);
    function registerFlight(address airline, string flight, uint256 timestamp) external returns(bytes32);
    function getBalance(address a) public view returns(uint256);
    function buy(address _airline, string _flight, uint256 _flightDeparture) external payable  returns(bool);
    function checkBoughtInsurance(address _airline, string _flight, uint256 _flightDeparture) external view returns(bool);
    function creditInsurees() external;
    function pay() external payable;
    function fund() external payable returns(int);
    function processFlightStatus(address airline, string flight, uint256 timestamp, uint8 statusCode) external;
    function getLedgerAndFlightStatus() external view returns (uint8, uint256);
    function applyInsureeCredit(uint256 credit) external returns (bool);
    function getCalleeFunds() external returns (uint256);
    function approveAirline(address sponsoredAirline) external returns (bool);
    function requireExistingAndFundedAirline(address _a) view external returns(bool, uint256);
}
/************************************************** */
/* FlightSurety Smart Contract                      */
/************************************************** */


contract FlightSuretyApp {
    using SafeMath
    for uint256; // Allow SafeMath functions to be called for all uint256 types (similar to "prototype" in Javascript)

    /********************************************************************************************/
    /*                                       DATA VARIABLES                                     */
    /********************************************************************************************/

    // Flight status codees
    uint8 private constant STATUS_CODE_UNKNOWN = 0;
    uint8 private constant STATUS_CODE_ON_TIME = 10;
    uint8 private constant STATUS_CODE_LATE_AIRLINE = 20;
    uint8 private constant STATUS_CODE_LATE_WEATHER = 30;
    uint8 private constant STATUS_CODE_LATE_TECHNICAL = 40;
    uint8 private constant STATUS_CODE_LATE_OTHER = 50;
    uint private registrationCost = 5 ether;
    address private contractOwner; // Account used to deploy contract
    FlightSuretyData fsd;
    bool private operational = true;
    
    uint MULTIPLIER = 3;
    uint DIVIDER = 2;
    struct Flight {
        bool isRegistered;
        uint8 statusCode;
        uint256 updatedTimestamp;
        address airline;
    }
    mapping(bytes32 => Flight) private flights;


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
    modifier requireIsOperational() {
        // Modify to call data contract's status
        require(operational, "Contract is currently not operational");
        _; // All modifiers require an "_" which indicates where the function body will be added
    }

    /**
     * @dev Modifier that requires the "ContractOwner" account to be the function caller
     */
    modifier requireContractOwner() {
        require(msg.sender == contractOwner, "Caller is not contract owner");
        _;
    }

    /********************************************************************************************/
    /*                                       CONSTRUCTOR                                        */
    /********************************************************************************************/

    /**
     * @dev Contract constructor
     *
     */
    constructor
        (
            address flightSuretyData
        )
    public
    payable {
        contractOwner = msg.sender;
        fsd = FlightSuretyData(flightSuretyData);

    }

    /********************************************************************************************/
    /*                                       UTILITY FUNCTIONS                                  */
    /********************************************************************************************/

    function isOperational()
    public

    returns(bool) {
        return operational; // Modify to call data contract's status
    }


    /**
     * @dev Sets contract operations on/off
     *
     * When operational mode is disabled, all write transactions except for this one will fail
     */
    function setOperatingStatus(
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

    // modifier requireFunding() 
    // {
    //     require(msg.value >= registrationCost, "Need Atleast 5 Ethers to Register");
    //     _;
    // }
    /**
     * @dev Add an airline to the registration queue
     * 
     */
    /**
     * @dev Add an airline to the registration queue
     *      Can only be called from FlightSuretyApp contract
     *
     */

    /*       Airline Business Logic                                                   */
    uint8 private COUNT_AFTER_VOTING_KICKSIN = 4;
    uint16 private  sponsoringAirlinesCount = 1;
    mapping(address => address[]) private AirlineSponsors ;
    mapping(address => bool) private airlines;



    modifier requireNewAirline(address _a) {
        bool a = airlines[_a];
        require(!a, "Airline Already Exists");
        _;
    }

    modifier requireCalleeIsFunded() {
        require(fsd.getCalleeFunds() >= 10, "Calling Airlines should fund before registering others");
        _;
    }


    function registerAirline(address newAirline, string memory _name)
        public
        requireIsOperational
        requireNewAirline(newAirline)
        requireCalleeIsFunded
        returns
        (
            bool
        ) {
            return registerAirlineUtil(newAirline, _name);
        }


    function registerAirlineUtil(address newAirline, string memory _name)
    internal
    returns
        (
            bool
        ) {
            bool approved = false;
            if (sponsoringAirlinesCount < COUNT_AFTER_VOTING_KICKSIN ) {
                sponsoringAirlinesCount++;
                approved = true;
            }

             airlines[newAirline] = fsd.registerAirline(newAirline, _name, approved);
             return  airlines[newAirline];
        }
    /********************************************************************
     * @dev implement a 50% consensus
     *
     *********************************************************************/
    // 
    function voteForAirline(
        address sponsoredAirline
    )
    public
    requireCalleeIsFunded
    requireIsOperational
    returns
        (
            bool
        ) {
            bool isDuplicate = false;
            for (uint c = 0; c < AirlineSponsors[sponsoredAirline].length; c++) {
                if (AirlineSponsors[sponsoredAirline][c] == tx.origin) {
                    isDuplicate = true;
                    break;
                }
            }
            if (!isDuplicate) {
                AirlineSponsors[sponsoredAirline].push(tx.origin);
            }
            if (AirlineSponsors[sponsoredAirline].length > sponsoringAirlinesCount / 2) {
                fsd.approveAirline(sponsoredAirline);
            }
        }




    function fund()
    public
    requireIsOperational
    payable
    returns(int) {
        return fsd.fund.value(msg.value)();
    }


    /**
     * @dev Register a future flight for insuring.
     *
     */
    function registerFlight(
        address airline,
        string flight,
        uint256 timestamp
    )
    external
    requireIsOperational
    returns(bytes32)

    {

        bool exists;
        uint256 fundsPaid;
        (exists, fundsPaid) = fsd.requireExistingAndFundedAirline(airline);
        require(exists, "Airline does not exist");
        require(fundsPaid >= 10 ether, "Airline has not paid adequate funds, should pay a minimum of 10 Ethers" );

        return fsd.registerFlight(airline, flight, timestamp);
    }

    function getBalance(address a) public view returns(uint256) {
        return fsd.getBalance(a);
    }

    modifier requirePaymentUnderLimit() {
        require(msg.value <= 1 ether, "Insurance cannot exceed 1 Ether!");
        _;
    }

    function buy(address _airline, string _flight, uint256 _flightDeparture) external requireIsOperational requirePaymentUnderLimit payable returns(string) {
        //return fsd.buy(_airline, _flight, _flightDeparture);
        fsd.buy.value(msg.value)(_airline, _flight, _flightDeparture);
        return "Purchased Insurance";
    }

    function checkBoughtInsurance(address _airline, string _flight, uint256 _flightDeparture) external view returns(bool) {
        return fsd.checkBoughtInsurance(_airline, _flight, _flightDeparture);
    }

    // function creditInsurees() external  requireIsOperational returns(string){
    //     fsd.creditInsurees();
    //     return( "Insurance Credited, ready for payout");
    // }

    function creditInsurees(
    )
        external
        requireIsOperational
        returns (
            string
        )

    {
        uint8 statusCode;
        uint256 purchaseAmount;

        (statusCode, purchaseAmount) = fsd.getLedgerAndFlightStatus();
        require(statusCode == STATUS_CODE_LATE_AIRLINE, "Crediting Only applicable for Flight Delay");

        fsd.applyInsureeCredit(purchaseAmount * MULTIPLIER / DIVIDER);
        return( "Insurance Credited, ready for payout");

    }




    function pay() external requireIsOperational returns(string){
        fsd.pay();
        return( "Payment Sent to your Wallet, Enjoy!");
    }

    /**
     * @dev Called after oracle has updated flight status
     *
     */
    function processFlightStatus(
        address airline,
        string memory flight,
        uint256 timestamp,
        uint8 statusCode
    )
    internal
    {
        fsd.processFlightStatus(airline, flight, timestamp, statusCode);
        emit Debug("Processed Flight Status");

    }


    // Generate a request for oracles to fetch flight information
    function fetchFlightStatus(
        address airline,
        string flight,
        uint256 timestamp
    )

    external {
        uint8 index = getRandomIndex(msg.sender);

        // Generate a unique key for storing the request
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        oracleResponses[key] = ResponseInfo({
            requester: msg.sender,
            isOpen: true
        });

        emit OracleRequest(index, airline, flight, timestamp);
    }


    // region ORACLE MANAGEMENT

    // Incremented to add pseudo-randomness at various points
    uint8 private nonce = 0;

    // Fee to be paid when registering oracle
    uint256 public constant REGISTRATION_FEE = 1 ether;

    // Number of oracles that must respond for valid status
    uint256 private constant MIN_RESPONSES = 3;


    struct Oracle {
        bool isRegistered;
        uint8[3] indexes;
    }

    // Track all registered oracles
    mapping(address => Oracle) private oracles;

    // Model for responses from oracles
    struct ResponseInfo {
        address requester; // Account that requested status
        bool isOpen; // If open, oracle responses are accepted
        mapping(uint8 => address[]) responses; // Mapping key is the status code reported
        // This lets us group responses and identify
        // the response that majority of the oracles
    }

    // Track all oracle responses
    // Key = hash(index, flight, timestamp)
    mapping(bytes32 => ResponseInfo) private oracleResponses;

    // Event fired each time an oracle submits a response
    event FlightStatusInfo(address airline, string flight, uint256 timestamp, uint8 status);

    event OracleReport(address airline, string flight, uint256 timestamp, uint8 status);

    // Event fired when flight status request is submitted
    // Oracles track this and if they have a matching index
    // they fetch data and submit a response
    event OracleRequest(uint8 index, address airline, string flight, uint256 timestamp);
    event Debug(string debugstring);


    // Register an oracle with the contract
    function registerOracle()
    external
    payable {
        // Require registration fee
        require(msg.value >= REGISTRATION_FEE, "Registration fee is required");

        uint8[3] memory indexes = generateIndexes(msg.sender);

        oracles[msg.sender] = Oracle({
            isRegistered: true,
            indexes: indexes
        });
    }

    function getMyIndexes()
    view
    external
    returns(uint8[3]) {
        require(oracles[msg.sender].isRegistered, "Not registered as an oracle");

        return oracles[msg.sender].indexes;
    }


    // Called by oracle when a response is available to an outstanding request
    // For the response to be accepted, there must be a pending request that is open
    // and matches one of the three Indexes randomly assigned to the oracle at the
    // time of registration (i.e. uninvited oracles are not welcome)
    function submitOracleResponse(
        uint8 index,
        address airline,
        string flight, 
        uint256 timestamp,
        uint8 statusCode
    )
    external {
        emit Debug("Starting");
        emit OracleReport(airline, flight, timestamp, statusCode);
        
        //require((oracles[msg.sender].indexes[0] == index) || (oracles[msg.sender].indexes[1] == index) || (oracles[msg.sender].indexes[2] == index), "Index does not match oracle request");
        bytes32 key = keccak256(abi.encodePacked(index, airline, flight, timestamp));
        emit Debug("GOT PAST CONDITION - Index does not match oracle request");

        require(oracleResponses[key].isOpen, "Oracle Response is not OPEN");
        emit Debug("GOT PAST CONDITION - Oracle Response is not OPEN");

        oracleResponses[key].responses[statusCode].push(msg.sender);
        emit Debug("GOT PAST PUSH - oracleResponses[key].responses[statusCode].push(msg.sender);");
        // Information isn't considered verified until at least MIN_RESPONSES
        // oracles respond with the *** same *** information
        emit OracleReport(airline, flight, timestamp, statusCode);
        if (oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES) {
            emit Debug("INSIDE IF CONDITION - oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES;");
            emit FlightStatusInfo(airline, flight, timestamp, statusCode);

            // Handle flight status as appropriate
            processFlightStatus(airline, flight, timestamp, statusCode);
        }
        emit Debug("OUTSIDE IF CONDITION - oracleResponses[key].responses[statusCode].length >= MIN_RESPONSES;");
    }


    function getFlightKey(
        address airline,
        string flight,
        uint256 timestamp
    )
    pure
    internal
    returns(bytes32) {
        return keccak256(abi.encodePacked(airline, flight, timestamp));
    }

    // Returns array of three non-duplicating integers from 0-9
    function generateIndexes(
        address account
    )
    internal
    returns(uint8[3]) {
        uint8[3] memory indexes;
        indexes[0] = getRandomIndex(account);

        indexes[1] = indexes[0];
        while (indexes[1] == indexes[0]) {
            indexes[1] = getRandomIndex(account);
        }

        indexes[2] = indexes[1];
        while ((indexes[2] == indexes[0]) || (indexes[2] == indexes[1])) {
            indexes[2] = getRandomIndex(account);
        }

        return indexes;
    }

    // Returns array of three non-duplicating integers from 0-9
    function getRandomIndex(
        address account
    )
    internal
    returns(uint8) {
        uint8 maxValue = 10;

        // Pseudo random number...the incrementing nonce adds variation
        uint8 random = uint8(uint256(keccak256(abi.encodePacked(blockhash(block.number - nonce++), account))) % maxValue);

        if (nonce > 250) {
            nonce = 0; // Can only fetch blockhashes for last 256 blocks so we adapt
        }

        return random;
    }

    // endregion

}