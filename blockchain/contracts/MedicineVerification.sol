// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MedicineVerification {

    // ==================================================
    // MEDICINE STRUCTURE
    // ==================================================

    struct Medicine {
        string productName;
        string batchNumber;
        string manufacturerName;
        uint256 expiryDate;
        uint256 manufacturingDate;
        uint256 price;
        string certificateNumber;
        address manufacturer;
        uint256 scanCount;
        bool exists;
    }

    // ==================================================
    // SUPPLY CHAIN STRUCTURE
    // ==================================================

    struct SupplyChainRecord {
        string role;
        string name;
        string location;
        uint256 timestamp;
        address wallet;
    }

    // ==================================================
    // STORAGE
    // ==================================================

    mapping(string => Medicine) public medicines;

    // Manufacturer authorization
    mapping(address => bool) public authorizedManufacturers;

    // Supply-chain participant authorization
    mapping(address => bool) public authorizedWholesalers;
    mapping(address => bool) public authorizedRetailers;

    mapping(string => SupplyChainRecord[]) private supplyChainHistory;

    address public owner;

    // ==================================================
    // EVENTS
    // ==================================================

    event MedicineRegistered(
        string indexed qrHash,
        string productName,
        string manufacturerName
    );

    event MedicineScanned(
        string indexed qrHash,
        uint256 scanCount
    );

    event ManufacturerAuthorized(
        address indexed manufacturer
    );

    event WholesalerAuthorized(
        address indexed wholesaler
    );

    event RetailerAuthorized(
        address indexed retailer
    );

    event SupplyChainRecordAdded(
        string indexed qrHash,
        string role,
        string name,
        string location,
        uint256 timestamp,
        address wallet
    );

    // ==================================================
    // MODIFIERS
    // ==================================================

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Only owner can perform this action"
        );
        _;
    }

    modifier onlyAuthorizedManufacturer() {
        require(
            authorizedManufacturers[msg.sender],
            "Only authorized manufacturers can register medicines"
        );
        _;
    }

    modifier onlyAuthorizedSupplyChainParticipant() {
        require(
            authorizedManufacturers[msg.sender] ||
            authorizedWholesalers[msg.sender] ||
            authorizedRetailers[msg.sender],
            "Only authorized supply-chain participants can add records"
        );
        _;
    }

    // ==================================================
    // CONSTRUCTOR
    // ==================================================

    constructor() {
        owner = msg.sender;

        // Deployer is automatically the first manufacturer
        authorizedManufacturers[msg.sender] = true;
    }

    // ==================================================
    // AUTHORIZE MANUFACTURER
    // ==================================================

    function authorizeManufacturer(
        address _manufacturer
    )
        public
        onlyOwner
    {
        require(
            _manufacturer != address(0),
            "Invalid manufacturer address"
        );

        authorizedManufacturers[_manufacturer] = true;

        emit ManufacturerAuthorized(
            _manufacturer
        );
    }

    // ==================================================
    // AUTHORIZE WHOLESALER
    // ==================================================

    function authorizeWholesaler(
        address _wholesaler
    )
        public
        onlyOwner
    {
        require(
            _wholesaler != address(0),
            "Invalid wholesaler address"
        );

        authorizedWholesalers[_wholesaler] = true;

        emit WholesalerAuthorized(
            _wholesaler
        );
    }

    // ==================================================
    // AUTHORIZE RETAILER
    // ==================================================

    function authorizeRetailer(
        address _retailer
    )
        public
        onlyOwner
    {
        require(
            _retailer != address(0),
            "Invalid retailer address"
        );

        authorizedRetailers[_retailer] = true;

        emit RetailerAuthorized(
            _retailer
        );
    }

    // ==================================================
    // REGISTER MEDICINE
    // ==================================================

    function registerMedicine(
        string memory _qrHash,
        string memory _productName,
        string memory _batchNumber,
        string memory _manufacturerName,
        uint256 _expiryDate,
        uint256 _manufacturingDate,
        uint256 _price,
        string memory _certificateNumber
    )
        public
        onlyAuthorizedManufacturer
    {
        require(
            bytes(_qrHash).length > 0,
            "QR hash cannot be empty"
        );

        require(
            !medicines[_qrHash].exists,
            "Medicine with this QR code already exists"
        );

        medicines[_qrHash] = Medicine({
            productName: _productName,
            batchNumber: _batchNumber,
            manufacturerName: _manufacturerName,
            expiryDate: _expiryDate,
            manufacturingDate: _manufacturingDate,
            price: _price,
            certificateNumber: _certificateNumber,
            manufacturer: msg.sender,
            scanCount: 0,
            exists: true
        });

        // Automatically create manufacturer entry
        supplyChainHistory[_qrHash].push(
            SupplyChainRecord({
                role: "Manufacturer",
                name: _manufacturerName,
                location: "Manufacturing Facility",
                timestamp: block.timestamp,
                wallet: msg.sender
            })
        );

        emit MedicineRegistered(
            _qrHash,
            _productName,
            _manufacturerName
        );

        emit SupplyChainRecordAdded(
            _qrHash,
            "Manufacturer",
            _manufacturerName,
            "Manufacturing Facility",
            block.timestamp,
            msg.sender
        );
    }

    // ==================================================
    // VERIFY MEDICINE
    // ==================================================

    function verifyMedicine(
        string memory _qrHash
    )
        public
        returns (Medicine memory)
    {
        require(
            medicines[_qrHash].exists,
            "Medicine not found"
        );

        medicines[_qrHash].scanCount++;

        emit MedicineScanned(
            _qrHash,
            medicines[_qrHash].scanCount
        );

        return medicines[_qrHash];
    }

    // ==================================================
    // GET MEDICINE
    // ==================================================

    function getMedicine(
        string memory _qrHash
    )
        public
        view
        returns (Medicine memory)
    {
        require(
            medicines[_qrHash].exists,
            "Medicine not found"
        );

        return medicines[_qrHash];
    }

    // ==================================================
    // GET SCAN COUNT
    // ==================================================

    function getScanCount(
        string memory _qrHash
    )
        public
        view
        returns (uint256)
    {
        require(
            medicines[_qrHash].exists,
            "Medicine not found"
        );

        return medicines[_qrHash].scanCount;
    }

    // ==================================================
    // ADD SUPPLY CHAIN RECORD
    // ==================================================

    function addSupplyChainRecord(
        string memory _qrHash,
        string memory _role,
        string memory _name,
        string memory _location
    )
        public
        onlyAuthorizedSupplyChainParticipant
    {
        require(
            medicines[_qrHash].exists,
            "Medicine not found"
        );

        require(
            bytes(_role).length > 0,
            "Role cannot be empty"
        );

        require(
            bytes(_name).length > 0,
            "Name cannot be empty"
        );

        // Ensure the caller's authorized role matches
        // the role being recorded.

        if (
            keccak256(bytes(_role)) ==
            keccak256(bytes("Manufacturer"))
        ) {
            require(
                authorizedManufacturers[msg.sender],
                "Wallet is not an authorized manufacturer"
            );
        }
        else if (
            keccak256(bytes(_role)) ==
            keccak256(bytes("Wholesaler"))
        ) {
            require(
                authorizedWholesalers[msg.sender],
                "Wallet is not an authorized wholesaler"
            );
        }
        else if (
            keccak256(bytes(_role)) ==
            keccak256(bytes("Retailer"))
        ) {
            require(
                authorizedRetailers[msg.sender],
                "Wallet is not an authorized retailer"
            );
        }
        else {
            revert(
                "Invalid supply-chain role"
            );
        }

        supplyChainHistory[_qrHash].push(
            SupplyChainRecord({
                role: _role,
                name: _name,
                location: _location,
                timestamp: block.timestamp,
                wallet: msg.sender
            })
        );

        emit SupplyChainRecordAdded(
            _qrHash,
            _role,
            _name,
            _location,
            block.timestamp,
            msg.sender
        );
    }

    // ==================================================
    // GET SUPPLY CHAIN HISTORY
    // ==================================================

    function getSupplyChainHistory(
        string memory _qrHash
    )
        public
        view
        returns (SupplyChainRecord[] memory)
    {
        require(
            medicines[_qrHash].exists,
            "Medicine not found"
        );

        return supplyChainHistory[_qrHash];
    }

    // ==================================================
    // GET SUPPLY CHAIN RECORD COUNT
    // ==================================================

    function getSupplyChainRecordCount(
        string memory _qrHash
    )
        public
        view
        returns (uint256)
    {
        require(
            medicines[_qrHash].exists,
            "Medicine not found"
        );

        return supplyChainHistory[_qrHash].length;
    }
}