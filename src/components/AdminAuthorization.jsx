import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";

function AdminAuthorization() {
  const { contract, account } = useBlockchain();

  const [walletAddress, setWalletAddress] = useState("");
  const [role, setRole] = useState("Wholesaler");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const authorizeWallet = async () => {
    try {
      if (!contract) {
        setStatus("Please connect MetaMask first.");
        return;
      }

      if (!walletAddress.trim()) {
        setStatus("Please enter a wallet address.");
        return;
      }

      if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
        setStatus("❌ Invalid Ethereum wallet address.");
        return;
      }

      setLoading(true);
      setStatus("Please confirm the authorization in MetaMask...");

      let transaction;

      if (role === "Manufacturer") {
        transaction =
          await contract.authorizeManufacturer(
            walletAddress.trim()
          );
      }

      if (role === "Wholesaler") {
        transaction =
          await contract.authorizeWholesaler(
            walletAddress.trim()
          );
      }

      if (role === "Retailer") {
        transaction =
          await contract.authorizeRetailer(
            walletAddress.trim()
          );
      }

      setStatus(
        "Transaction submitted. Waiting for confirmation..."
      );

      await transaction.wait();

      setStatus(
        `✅ ${role} wallet authorized successfully!`
      );

      setWalletAddress("");

    } catch (error) {
      console.error(
        "AUTHORIZATION ERROR:",
        error
      );

      const message =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "";

      if (
        message.includes("Only owner")
      ) {
        setStatus(
          "❌ Only the contract owner can authorize wallets."
        );
      } else if (
        message.includes("user rejected") ||
        message.includes("ACTION_REJECTED")
      ) {
        setStatus(
          "⚠️ Authorization cancelled in MetaMask."
        );
      } else {
        setStatus(
          "❌ Authorization failed. Check the browser console."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "30px auto",
        padding: "25px",
        border: "1px solid #ddd",
        borderRadius: "12px",
        backgroundColor: "#fafafa",
      }}
    >

      <div
        style={{
          textAlign: "center",
          marginBottom: "20px",
        }}
      >

        <div
          style={{
            fontSize: "40px",
          }}
        >
          🔐
        </div>

        <h2
          style={{
            fontSize: "26px",
            fontWeight: "bold",
            margin: "5px 0",
          }}
        >
          Supply-Chain Authorization
        </h2>

        <p
          style={{
            color: "#666",
            margin: "5px 0",
          }}
        >
          Authorize wallets to participate in the
          medicine supply chain.
        </p>

      </div>

      {/* CURRENT WALLET */}

      <div
        style={{
          padding: "15px",
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >

        <p
          style={{
            margin: "0 0 5px",
            fontSize: "13px",
            color: "#666",
          }}
        >
          Connected Wallet
        </p>

        <p
          style={{
            margin: "0",
            fontWeight: "600",
            wordBreak: "break-all",
          }}
        >
          {account || "Not connected"}
        </p>

      </div>

      {/* WALLET ADDRESS */}

      <label
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: "7px",
        }}
      >
        Wallet Address
      </label>

      <input
        type="text"
        placeholder="0x..."
        value={walletAddress}
        onChange={(e) =>
          setWalletAddress(e.target.value)
        }
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxSizing: "border-box",
          marginBottom: "15px",
        }}
      />

      {/* ROLE */}

      <label
        style={{
          display: "block",
          fontWeight: "600",
          marginBottom: "7px",
        }}
      >
        Role
      </label>

      <select
        value={role}
        onChange={(e) =>
          setRole(e.target.value)
        }
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          boxSizing: "border-box",
          marginBottom: "15px",
        }}
      >

        <option value="Wholesaler">
          📦 Wholesaler
        </option>

        <option value="Retailer">
          🏪 Retailer
        </option>

        <option value="Manufacturer">
          🏭 Manufacturer
        </option>

      </select>

      {/* AUTHORIZE BUTTON */}

      <button
        onClick={authorizeWallet}
        disabled={loading}
        style={{
          width: "100%",
          padding: "13px",
          border: "none",
          borderRadius: "8px",
          backgroundColor: "#16a34a",
          color: "white",
          fontWeight: "bold",
          cursor: loading
            ? "not-allowed"
            : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading
          ? "Authorizing..."
          : "🔐 Authorize Wallet"}
      </button>

      {/* STATUS */}

      {status && (
        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            fontWeight: "500",
          }}
        >
          {status}
        </p>
      )}

    </div>
  );
}

export default AdminAuthorization;