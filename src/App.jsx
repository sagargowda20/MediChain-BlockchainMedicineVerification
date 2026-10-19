import { useState } from "react";
import ConsumerVerification from "./components/ConsumerVerification";
import { useBlockchain } from "./context/BlockchainContext";
import ManufacturerForm from "./components/ManufacturerForm";
import SupplyChainTracker from "./components/SupplyChainTracker";
import AdminAuthorization from "./components/AdminAuthorization";

function App() {
  const { account, connectWallet } = useBlockchain();

  const [mode, setMode] = useState("consumer");

  // ==================================================
  // CONSUMER MODE
  // ==================================================

  if (mode === "consumer") {
    return (
      <div className="min-h-screen bg-gray-100">

        <header className="bg-blue-600 text-white p-5">

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold">
                MediChain
              </h1>

              <p className="text-sm mt-1">
                Blockchain Medicine Verification
              </p>
            </div>

            <button
              onClick={() => setMode("manufacturer")}
              className="px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold"
            >
              🏭 Manufacturer Portal
            </button>

          </div>

        </header>

        <main className="max-w-6xl mx-auto p-4">

          <div className="mb-6 bg-white rounded-xl shadow-sm p-5">

            <h2 className="text-xl font-bold text-gray-800">
              👤 Consumer Verification
            </h2>

            <p className="text-gray-600 mt-1">
              Scan the medicine QR code to verify authenticity
              and view its complete supply-chain history.
            </p>

          </div>

          <ConsumerVerification />

        </main>

      </div>
    );
  }

  // ==================================================
  // MANUFACTURER MODE
  // ==================================================

  if (mode === "manufacturer") {

    // ================================================
    // WALLET NOT CONNECTED
    // ================================================

    if (!account) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">

          <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md w-full">

            <div className="text-5xl mb-4">
              🏭
            </div>

            <h1 className="text-3xl font-bold text-blue-600 mb-3">
              MediChain
            </h1>

            <h2 className="text-xl font-semibold mb-3">
              Manufacturer Portal
            </h2>

            <p className="text-gray-600 mb-6">
              Authorized manufacturers can register medicines
              and manage supply-chain records using blockchain.
            </p>

            <button
              onClick={connectWallet}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              🦊 Connect MetaMask
            </button>

            <button
              onClick={() => setMode("consumer")}
              className="w-full mt-3 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              ← Consumer Verification
            </button>

          </div>

        </div>
      );
    }

    // ================================================
    // MANUFACTURER PORTAL
    // ================================================

    return (
      <div className="min-h-screen bg-gray-100">

        <header className="bg-blue-600 text-white p-5">

          <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl font-bold">
                MediChain
              </h1>

              <p className="text-sm mt-1">
                Manufacturer Portal
              </p>
            </div>

            <button
              onClick={() => setMode("consumer")}
              className="px-5 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100"
            >
              👤 Consumer Verification
            </button>

          </div>

        </header>

        <main className="max-w-6xl mx-auto p-4">

          {/* ========================================== */}
          {/* CONNECTED WALLET */}
          {/* ========================================== */}

          <div className="mb-6 bg-white p-5 rounded-xl shadow-sm">

            <p className="text-sm text-gray-500">
              Connected Manufacturer Wallet
            </p>

            <p className="font-semibold break-all mt-1">
              {account}
            </p>

            <p className="text-xs text-green-600 mt-2">
              ● Wallet connected
            </p>

          </div>

          {/* ========================================== */}
          {/* AUTHORIZATION */}
          {/* ========================================== */}

          <div className="bg-white rounded-xl shadow-sm mb-8">

            <AdminAuthorization />

          </div>

          {/* ========================================== */}
          {/* MEDICINE REGISTRATION */}
          {/* ========================================== */}

          <div className="bg-white rounded-xl shadow-sm mb-8">

            <ManufacturerForm />

          </div>

          {/* ========================================== */}
          {/* SUPPLY CHAIN TRACKING */}
          {/* ========================================== */}

          <div className="bg-white rounded-xl shadow-sm">

            <SupplyChainTracker />

          </div>

        </main>

      </div>
    );
  }

  return null;
}

export default App;