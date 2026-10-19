import { useState } from "react";
import { useBlockchain } from "../context/BlockchainContext";

function SupplyChainTracker() {
  const { contract } = useBlockchain();

  const [qrHash, setQrHash] = useState("");
  const [role, setRole] = useState("Wholesaler");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [history, setHistory] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  // ==================================================
  // ADD SUPPLY CHAIN RECORD
  // ==================================================

  const addRecord = async () => {
    try {
      if (!contract) {
        setStatus("Please connect MetaMask first.");
        return;
      }

      if (!qrHash.trim()) {
        setStatus("Please enter the medicine QR hash.");
        return;
      }

      if (!name.trim()) {
        setStatus("Please enter the name.");
        return;
      }

      setLoading(true);
      setStatus(
        "Please confirm the transaction in MetaMask..."
      );

      const transaction =
        await contract.addSupplyChainRecord(
          qrHash.trim(),
          role,
          name.trim(),
          location.trim()
        );

      setStatus(
        "Transaction submitted. Waiting for confirmation..."
      );

      await transaction.wait();

      setStatus(
        "✅ Supply-chain record added successfully!"
      );

      // Automatically reload history
      await loadHistory(qrHash);

    } catch (error) {
      console.error(
        "SUPPLY CHAIN ERROR:",
        error
      );

      const message =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "";

      if (
        message.includes(
          "Medicine not found"
        )
      ) {
        setStatus(
          "❌ Medicine not found. Check the QR hash."
        );
      } else if (
        message.includes(
          "user rejected"
        ) ||
        message.includes(
          "ACTION_REJECTED"
        )
      ) {
        setStatus(
          "⚠️ Transaction cancelled in MetaMask."
        );
      } else {
        setStatus(
          "❌ Failed to add supply-chain record."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOAD SUPPLY CHAIN HISTORY
  // ==================================================

  const loadHistory = async (
    hashInput = qrHash
  ) => {
    try {
      if (!contract) {
        setStatus(
          "Please connect MetaMask first."
        );
        return;
      }

      const hash = hashInput.trim();

      if (!hash) {
        setStatus(
          "Please enter the medicine QR hash."
        );
        return;
      }

      setLoading(true);
      setStatus(
        "Loading supply-chain history..."
      );

      const result =
        await contract.getSupplyChainHistory(
          hash
        );

      console.log(
        "Supply chain history:",
        result
      );

      const records = result.map(
        (record) => ({
          role: record[0],
          name: record[1],
          location: record[2],
          timestamp: Number(record[3]),
          wallet: record[4],
        })
      );

      setHistory(records);

      if (records.length === 0) {
        setStatus(
          "No supply-chain records found."
        );
      } else {
        setStatus(
          `✅ ${records.length} supply-chain record(s) found.`
        );
      }

    } catch (error) {
      console.error(
        "HISTORY ERROR:",
        error
      );

      const message =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "";

      if (
        message.includes(
          "Medicine not found"
        )
      ) {
        setStatus(
          "❌ Medicine not found."
        );
      } else {
        setStatus(
          "❌ Could not load supply-chain history."
        );
      }

      setHistory([]);

    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // DATE FORMATTER
  // ==================================================

  const formatDate = (timestamp) => {
    if (!timestamp) {
      return "Unknown";
    }

    return new Date(
      timestamp * 1000
    ).toLocaleString();
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >

        <div
          style={{
            fontSize: "45px",
          }}
        >
          📦
        </div>

        <h2
          style={{
            fontSize: "30px",
            fontWeight: "bold",
          }}
        >
          Supply Chain Tracking
        </h2>

        <p
          style={{
            color: "#666",
          }}
        >
          Track the movement of medicine
          through the supply chain.
        </p>

      </div>

      {/* ADD RECORD */}

      <div
        style={{
          padding: "25px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
        }}
      >

        <h3>
          Add Supply-Chain Movement
        </h3>

        <input
          type="text"
          placeholder="Medicine QR Hash"
          value={qrHash}
          onChange={(e) =>
            setQrHash(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        />

        <select
          value={role}
          onChange={(e) =>
            setRole(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >

          <option value="Wholesaler">
            Wholesaler
          </option>

          <option value="Retailer">
            Retailer
          </option>

        </select>

        <input
          type="text"
          placeholder="Wholesaler / Retailer Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        />

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) =>
            setLocation(e.target.value)
          }
          style={{
            width: "100%",
            padding: "12px",
            marginTop: "12px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            boxSizing: "border-box",
          }}
        />

        <button
          onClick={addRecord}
          disabled={loading}
          style={{
            width: "100%",
            marginTop: "15px",
            padding: "13px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: loading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {loading
            ? "Processing..."
            : "Add Supply-Chain Record"}
        </button>

      </div>

      {/* LOAD HISTORY */}

      <button
        onClick={() =>
          loadHistory()
        }
        disabled={loading}
        style={{
          width: "100%",
          marginTop: "15px",
          padding: "13px",
          border: "1px solid #2563eb",
          borderRadius: "8px",
          backgroundColor: "white",
          color: "#2563eb",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        🔍 View Supply-Chain History
      </button>

      {/* STATUS */}

      {status && (
        <p
          style={{
            marginTop: "15px",
            textAlign: "center",
            fontSize: "16px",
          }}
        >
          {status}
        </p>
      )}

      {/* HISTORY */}

      {history.length > 0 && (
        <div
          style={{
            marginTop: "30px",
          }}
        >

          <h3>
            Supply-Chain History
          </h3>

          {history.map(
            (record, index) => (
              <div
                key={index}
                style={{
                  marginTop: "15px",
                  padding: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  backgroundColor: "white",
                }}
              >

                <h4>
                  {index + 1}. {record.role}
                </h4>

                <p>
                  <strong>
                    Name:
                  </strong>{" "}
                  {record.name}
                </p>

                <p>
                  <strong>
                    Location:
                  </strong>{" "}
                  {record.location ||
                    "Not provided"}
                </p>

                <p>
                  <strong>
                    Date:
                  </strong>{" "}
                  {formatDate(
                    record.timestamp
                  )}
                </p>

                <p
                  style={{
                    fontSize: "12px",
                    wordBreak:
                      "break-all",
                    color: "#666",
                  }}
                >
                  <strong>
                    Wallet:
                  </strong>{" "}
                  {record.wallet}
                </p>

              </div>
            )
          )}

        </div>
      )}

    </div>
  );
}

export default SupplyChainTracker;