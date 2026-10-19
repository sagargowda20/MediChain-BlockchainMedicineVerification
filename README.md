MediChain — Blockchain-Based Medicine Traceability and Verification

MediChain is a blockchain-based web application designed to register medicine information, verify medicine records using QR codes, and maintain supply-chain activity records.
The project uses a Solidity smart contract and a React web interface to provide a simple method of checking registered medicine details and expiry status.

 Features
- Medicine Registration: Stores medicine information through a Solidity smart contract.
- QR-Based Verification: Uses a QR identifier to retrieve the corresponding medicine record.
- Expiry Checking: Checks whether the registered medicine has expired.
- Medicine Status: Displays `AUTHENTIC`, `EXPIRED`, or `INVALID MEDICINE` based on the verification result.
- Supply-Chain Tracking: Records supply-chain information such as role, name, location, timestamp, and wallet address.
- Blockchain Integration: Connects the frontend to the smart contract using ethers.js and MetaMask.

Technology Stack
| Component | Technology |
|---|---|
| Frontend | React.js |
| Development Server and Build Tool | Vite |
| Styling | CSS |
| Smart Contract | Solidity |
| Blockchain Development Environment | Hardhat |
| Blockchain Interaction | ethers.js |
| Wallet | MetaMask |
| Medicine Identification | QR Code |
| Blockchain Network | Local Hardhat network during development |

Project Structure
```text
MediChain-BlockchainMedicineVerification/
├── blockchain/
│   ├── contracts/
│   │   └── MedicineVerification.sol
│   ├── scripts/
│   ├── test/
│   ├── hardhat.config.ts
│   ├── package.json
│   └── tsconfig.json
├── src/
├── public/
├── package.json
├── .gitignore
└── README.md
```
Note: The structure above shows the main expected files. Actual frontend files and other configuration files may vary.

 How It Works
1. Medicine details are registered through the web application and stored using the smart contract.
2. A QR identifier is associated with the registered medicine record.
3. The user scans the QR code through the verification interface.
4. The application retrieves the corresponding record from the blockchain.
5. The system checks whether the record exists and whether the medicine has expired.
6. Supply-chain activities can be recorded and retrieved for traceability.

Medicine Information
The registered medicine record includes:
- Product name
- Batch number
- Manufacturer name
- Manufacturing date
- Expiry date
- Price
- Certificate number
- QR identifier

Getting Started
Prerequisites
Install the following software:
- Node.js and npm
- Git
- MetaMask browser extension

1. Clone the Repository
```bash
git clone https://github.com/sagargowda20/MediChain-BlockchainMedicineVerification.git
cd MediChain-BlockchainMedicineVerification
```

2. Install Frontend Dependencies
```bash
npm install
```

3. Install Blockchain Dependencies
```bash
cd blockchain
npm install
```

4. Compile the Smart Contract
From the `blockchain` directory, run:
```bash
npx hardhat compile
```

5. Run the Application
The blockchain network, smart-contract deployment, contract address, and frontend configuration must be set up before verification can work.
Follow the project configuration and deployment scripts to start the local blockchain and deploy the contract. Then start the frontend using the script defined in the root `package.json`, typically:

```bash
npm run dev
```

Open the local URL shown in the terminal.
Limitations
- The current implementation is a prototype developed using a local blockchain environment.
- QR-code duplication cannot be reliably detected by the current system.
- The system verifies digital records and expiry information; it does not physically authenticate medicine composition or packaging.
- Integration with external pharmaceutical, government, hospital, and IoT systems is not currently included.

 Future Improvements
- Deployment to a suitable shared blockchain network.
- Stronger physical-product and QR-code authentication.
- Integration with external pharmaceutical systems.
- Performance and scalability evaluation.

Project Purpose
MediChain demonstrates how blockchain technology and QR-based verification can support medicine record management and traceability.

Developed as an academic major project in Computer Science and Engineering.
