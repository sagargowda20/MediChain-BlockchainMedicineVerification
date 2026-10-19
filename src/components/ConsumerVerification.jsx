import { useState } from "react";
import { ethers } from "ethers";
import { useBlockchain } from "../context/BlockchainContext";
import QRScanner from "./QRScanner";

function ConsumerVerification() {
  const { contract } = useBlockchain();

  const [qrHash, setQrHash] = useState("");
  const [medicine, setMedicine] = useState(null);
  const [status, setStatus] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  // Supply-chain history
  const [supplyChain, setSupplyChain] = useState([]);
  const [loadingSupplyChain, setLoadingSupplyChain] = useState(false);

  // ==================================================
  // VERIFY MEDICINE
  // ==================================================

  const verifyMedicine = async (hashInput = qrHash) => {
    try {
      if (!contract) {
        setStatus("Please connect MetaMask first.");
        return;
      }

      const hash = hashInput.trim();

      if (!hash) {
        setStatus("Please enter or scan a QR code.");
        return;
      }

      setChecking(true);
      setMedicine(null);
      setSupplyChain([]);
      setStatus("Checking blockchain...");

      console.log("Checking QR Hash:", hash);
      console.log("Contract:", contract.target);

      // READ-ONLY blockchain call.
      // No transaction and no gas required.
      const result = await contract.getMedicine.staticCall(hash);

      console.log("Blockchain medicine:", result);

      console.log("Scan count:", result[8]);
      console.log("Exists:", result[9]);

      // ==================================================
      // INVALID MEDICINE
      // ==================================================

      if (!Boolean(result[9])) {
        setStatus("INVALID_MEDICINE");
        setChecking(false);
        return;
      }

      // ==================================================
      // MEDICINE DATA
      // ==================================================

      const expiryDate = new Date(
        Number(result[3]) * 1000
      );

      const medicineData = {
        productName: result[0],
        batchNumber: result[1],
        manufacturerName: result[2],

        expiryDate: expiryDate,

        manufacturingDate: new Date(
          Number(result[4]) * 1000
        ),

        price: Number(result[5]),

        certificateNumber: result[6],

        manufacturer: result[7],

        scanCount: Number(result[8]),

        exists: Boolean(result[9]),

        isExpired: expiryDate < new Date(),
      };

      console.log(
        "Medicine details:",
        medicineData
      );

      setMedicine(medicineData);

      if (medicineData.isExpired) {
        setStatus("EXPIRED");
      } else {
        setStatus("AUTHENTIC");
      }

      setChecking(false);

      // ==================================================
      // LOAD SUPPLY CHAIN HISTORY
      // ==================================================

      await loadSupplyChainHistory(hash);

    } catch (error) {
      console.error(
        "VERIFICATION ERROR:",
        error
      );

      setMedicine(null);
      setSupplyChain([]);
      setChecking(false);

      const errorMessage =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        "";

      if (
        errorMessage.includes(
          "Medicine not found"
        ) ||
        errorMessage.includes(
          "execution reverted"
        )
      ) {
        setStatus("INVALID_MEDICINE");
      } else {
        setStatus("ERROR");
      }
    }
  };

  // ==================================================
  // LOAD SUPPLY CHAIN HISTORY
  // ==================================================

  const loadSupplyChainHistory = async (hashInput) => {
    try {
      if (!contract) {
        console.log(
          "Contract not available."
        );
        return;
      }

      const hash = hashInput.trim();

      if (!hash) {
        return;
      }

      setLoadingSupplyChain(true);

      console.log(
        "Loading supply-chain history for:",
        hash
      );

      // READ-ONLY blockchain call.
      const result =
        await contract.getSupplyChainHistory(
          hash
        );

      console.log(
        "Supply-chain blockchain result:",
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

      console.log(
        "Supply-chain records:",
        records
      );

      setSupplyChain(records);

    } catch (error) {
      console.error(
        "SUPPLY CHAIN HISTORY ERROR:",
        error
      );

      setSupplyChain([]);

    } finally {
      setLoadingSupplyChain(false);
    }
  };

  // ==================================================
  // QR SCANNER
  // ==================================================

  const handleQRScan = async (decodedText) => {
    console.log(
      "QR Scanner result:",
      decodedText
    );

    setQrHash(decodedText);
    setScannerOpen(false);

    await verifyMedicine(decodedText);
  };

  // ==================================================
  // CLEAR RESULT
  // ==================================================

  const clearResult = () => {
    setQrHash("");
    setMedicine(null);
    setSupplyChain([]);
    setStatus("");
    setScannerOpen(false);
    setLoadingSupplyChain(false);
  };

  // ==================================================
  // FORMAT SUPPLY CHAIN DATE
  // ==================================================

  const formatSupplyChainDate = (
    timestamp
  ) => {
    if (!timestamp) {
      return "Unknown";
    }

    return new Date(
      timestamp * 1000
    ).toLocaleString();
  };

  // ==================================================
  // SUPPLY CHAIN ROLE ICON
  // ==================================================

  const getRoleIcon = (role) => {
    if (
      role?.toLowerCase() ===
      "manufacturer"
    ) {
      return "🏭";
    }

    if (
      role?.toLowerCase() ===
      "wholesaler"
    ) {
      return "📦";
    }

    if (
      role?.toLowerCase() ===
      "retailer"
    ) {
      return "🏪";
    }

    return "🚚";
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
      }}
    >

      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}

      <div
        style={{
          textAlign: "center",
          marginBottom: "30px",
        }}
      >

        <div
          style={{
            fontSize: "48px",
            marginBottom: "10px",
          }}
        >
          🛡️
        </div>

        <h2
          style={{
            fontSize: "32px",
            fontWeight: "bold",
            margin: "0",
          }}
        >
          MediChain Verification
        </h2>

        <p
          style={{
            color: "#666",
            marginTop: "8px",
          }}
        >
          Verify the authenticity of your
          medicine using blockchain technology.
        </p>

      </div>

      {/* ============================================ */}
      {/* VERIFICATION INPUT */}
      {/* ============================================ */}

      <div
        style={{
          padding: "25px",
          border: "1px solid #ddd",
          borderRadius: "12px",
          backgroundColor: "#fafafa",
        }}
      >

        <h3
          style={{
            marginTop: "0",
            marginBottom: "15px",
          }}
        >
          Verify Medicine
        </h3>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >

          <input
            type="text"
            placeholder="Enter QR Hash"
            value={qrHash}
            onChange={(e) =>
              setQrHash(e.target.value)
            }
            style={{
              flex: "1",
              minWidth: "250px",
              padding: "12px",
              border: "1px solid #ccc",
              borderRadius: "8px",
              fontSize: "15px",
            }}
          />

          <button
            onClick={() =>
              verifyMedicine()
            }
            disabled={checking}
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#2563eb",
              color: "white",
              fontWeight: "bold",
              cursor: checking
                ? "not-allowed"
                : "pointer",
              opacity: checking ? 0.7 : 1,
            }}
          >
            {checking
              ? "Checking..."
              : "Verify Medicine"}
          </button>

        </div>

        {/* SCAN BUTTON */}

        {!scannerOpen && (
          <button
            onClick={() => {
              setStatus("");
              setScannerOpen(true);
            }}
            style={{
              width: "100%",
              marginTop: "15px",
              padding: "13px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#111827",
              color: "white",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            📷 Scan Medicine QR Code
          </button>
        )}

      </div>

      {/* ============================================ */}
      {/* QR SCANNER */}
      {/* ============================================ */}

      {scannerOpen && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >

          <QRScanner
            onScan={handleQRScan}
          />

          <button
            onClick={() =>
              setScannerOpen(false)
            }
            style={{
              display: "block",
              margin: "15px auto 0",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#dc2626",
              color: "white",
              cursor: "pointer",
            }}
          >
            Close Scanner
          </button>

        </div>
      )}

      {/* ============================================ */}
      {/* CHECKING */}
      {/* ============================================ */}

      {checking && (
        <div
          style={{
            marginTop: "25px",
            padding: "20px",
            textAlign: "center",
            border: "1px solid #ddd",
            borderRadius: "12px",
          }}
        >

          <div
            style={{
              fontSize: "32px",
            }}
          >
            ⏳
          </div>

          <p>
            Checking medicine information
            on the blockchain...
          </p>

        </div>
      )}

      {/* ============================================ */}
      {/* AUTHENTIC MEDICINE */}
      {/* ============================================ */}

      {!checking &&
        status === "AUTHENTIC" &&
        medicine && (
          <div
            style={{
              marginTop: "25px",
              border: "2px solid #16a34a",
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: "#f0fdf4",
            }}
          >

            {/* STATUS HEADER */}

            <div
              style={{
                padding: "25px",
                textAlign: "center",
                backgroundColor: "#16a34a",
                color: "white",
              }}
            >

              <div
                style={{
                  fontSize: "45px",
                }}
              >
                ✅
              </div>

              <h2
                style={{
                  margin: "5px 0",
                  fontSize: "26px",
                }}
              >
                AUTHENTIC MEDICINE
              </h2>

              <p
                style={{
                  margin: "5px 0 0",
                }}
              >
                This medicine is registered
                on the MediChain blockchain.
              </p>

            </div>

            {/* MEDICINE DETAILS */}

            <div
              style={{
                padding: "25px",
              }}
            >

              <h3>
                Medicine Information
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >

                <Detail
                  label="Product Name"
                  value={medicine.productName}
                />

                <Detail
                  label="Batch Number"
                  value={medicine.batchNumber}
                />

                <Detail
                  label="Manufacturer"
                  value={medicine.manufacturerName}
                />

                <Detail
                  label="Manufacturing Date"
                  value={medicine.manufacturingDate.toLocaleDateString()}
                />

                <Detail
                  label="Expiry Date"
                  value={medicine.expiryDate.toLocaleDateString()}
                />

                <Detail
                  label="Price"
                  value={`₹${medicine.price}`}
                />

                <Detail
                  label="Certificate Number"
                  value={medicine.certificateNumber}
                />

                <Detail
                  label="Scan Count"
                  value={medicine.scanCount}
                />

              </div>

              {/* BLOCKCHAIN INFORMATION */}

              <div
                style={{
                  marginTop: "20px",
                  padding: "15px",
                  backgroundColor: "white",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              >

                <strong>
                  Blockchain Manufacturer Address
                </strong>

                <p
                  style={{
                    wordBreak: "break-all",
                    fontSize: "13px",
                    color: "#555",
                  }}
                >
                  {medicine.manufacturer}
                </p>

              </div>

              {/* ====================================== */}
              {/* SUPPLY CHAIN HISTORY */}
              {/* ====================================== */}

              <div
                style={{
                  marginTop: "30px",
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
                    🚚
                  </div>

                  <h3
                    style={{
                      fontSize: "24px",
                      margin: "5px 0",
                    }}
                  >
                    Supply Chain History
                  </h3>

                  <p
                    style={{
                      color: "#666",
                      margin: "5px 0",
                    }}
                  >
                    Track the movement of this medicine
                    from manufacturer to retailer.
                  </p>

                </div>

                {/* LOADING */}

                {loadingSupplyChain && (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      border: "1px solid #ddd",
                      borderRadius: "10px",
                      backgroundColor: "white",
                    }}
                  >
                    ⏳ Loading supply-chain history...
                  </div>
                )}

                {/* NO RECORDS */}

                {!loadingSupplyChain &&
                  supplyChain.length === 0 && (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        backgroundColor: "white",
                      }}
                    >
                      No supply-chain records found.
                    </div>
                  )}

                {/* RECORDS */}

                {!loadingSupplyChain &&
                  supplyChain.length > 0 && (
                    <div>
                      {supplyChain.map(
                        (record, index) => (
                          <div
                            key={index}
                            style={{
                              position: "relative",
                              marginBottom: "15px",
                              padding: "20px",
                              border:
                                "1px solid #ddd",
                              borderRadius: "12px",
                              backgroundColor:
                                "white",
                            }}
                          >

                            <h4
                              style={{
                                marginTop: "0",
                                fontSize: "20px",
                              }}
                            >
                              {getRoleIcon(
                                record.role
                              )}{" "}
                              {index + 1}.{" "}
                              {record.role}
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
                                Date & Time:
                              </strong>{" "}
                              {formatSupplyChainDate(
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
                                Blockchain Wallet:
                              </strong>{" "}
                              {record.wallet}
                            </p>

                          </div>
                        )
                      )}
                    </div>
                  )}

              </div>

              {/* VERIFY ANOTHER */}

              <button
                onClick={clearResult}
                style={{
                  marginTop: "25px",
                  padding: "10px 20px",
                  border: "1px solid #999",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Verify Another Medicine
              </button>

            </div>

          </div>
        )}

      {/* ============================================ */}
      {/* EXPIRED MEDICINE */}
      {/* ============================================ */}

      {!checking &&
        status === "EXPIRED" &&
        medicine && (
          <div
            style={{
              marginTop: "25px",
              border: "2px solid #f59e0b",
              borderRadius: "14px",
              overflow: "hidden",
              backgroundColor: "#fffbeb",
            }}
          >

            <div
              style={{
                padding: "25px",
                textAlign: "center",
                backgroundColor: "#f59e0b",
                color: "white",
              }}
            >

              <div
                style={{
                  fontSize: "45px",
                }}
              >
                ⚠️
              </div>

              <h2
                style={{
                  margin: "5px 0",
                }}
              >
                AUTHENTIC BUT EXPIRED
              </h2>

              <p>
                This medicine is registered
                on the blockchain, but its
                expiry date has passed.
              </p>

            </div>

            <div
              style={{
                padding: "25px",
              }}
            >

              <Detail
                label="Product Name"
                value={medicine.productName}
              />

              <Detail
                label="Batch Number"
                value={medicine.batchNumber}
              />

              <Detail
                label="Manufacturer"
                value={medicine.manufacturerName}
              />

              <Detail
                label="Expiry Date"
                value={medicine.expiryDate.toLocaleDateString()}
              />

              <Detail
                label="Price"
                value={`₹${medicine.price}`}
              />

              <p
                style={{
                  marginTop: "20px",
                  fontWeight: "bold",
                }}
              >
                ⚠️ Do not use this medicine.
              </p>

              {/* SUPPLY CHAIN FOR EXPIRED MEDICINE */}

              <div
                style={{
                  marginTop: "30px",
                }}
              >

                <h3>
                  🚚 Supply Chain History
                </h3>

                {loadingSupplyChain && (
                  <p>
                    ⏳ Loading supply-chain history...
                  </p>
                )}

                {!loadingSupplyChain &&
                  supplyChain.length === 0 && (
                    <p>
                      No supply-chain records found.
                    </p>
                  )}

                {!loadingSupplyChain &&
                  supplyChain.length > 0 &&
                  supplyChain.map(
                    (record, index) => (
                      <div
                        key={index}
                        style={{
                          marginTop: "15px",
                          padding: "18px",
                          border:
                            "1px solid #ddd",
                          borderRadius: "10px",
                          backgroundColor: "white",
                        }}
                      >

                        <h4>
                          {getRoleIcon(
                            record.role
                          )}{" "}
                          {index + 1}.{" "}
                          {record.role}
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
                            Date & Time:
                          </strong>{" "}
                          {formatSupplyChainDate(
                            record.timestamp
                          )}
                        </p>

                      </div>
                    )
                  )}

              </div>

              <button
                onClick={clearResult}
                style={{
                  marginTop: "20px",
                  padding: "10px 20px",
                  border: "1px solid #999",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  cursor: "pointer",
                }}
              >
                Verify Another Medicine
              </button>

            </div>

          </div>
        )}

      {/* ============================================ */}
      {/* INVALID MEDICINE */}
      {/* ============================================ */}

      {!checking &&
        status === "INVALID_MEDICINE" && (
          <div
            style={{
              marginTop: "25px",
              padding: "30px",
              textAlign: "center",
              border: "2px solid #dc2626",
              borderRadius: "14px",
              backgroundColor: "#fef2f2",
            }}
          >

            <div
              style={{
                fontSize: "55px",
              }}
            >
              ❌
            </div>

            <h2
              style={{
                color: "#b91c1c",
              }}
            >
              INVALID MEDICINE
            </h2>

            <p>
              This QR code is not registered
              on the MediChain blockchain.
            </p>

            <p
              style={{
                color: "#666",
              }}
            >
              The medicine could not be
              authenticated.
            </p>

            <button
              onClick={clearResult}
              style={{
                marginTop: "15px",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: "#dc2626",
                color: "white",
                cursor: "pointer",
              }}
            >
              Try Another QR Code
            </button>

          </div>
        )}

      {/* ============================================ */}
      {/* GENERAL ERROR */}
      {/* ============================================ */}

      {!checking &&
        status === "ERROR" && (
          <div
            style={{
              marginTop: "25px",
              padding: "25px",
              textAlign: "center",
              border: "1px solid #ccc",
              borderRadius: "12px",
            }}
          >

            <h3>
              ❌ Verification Failed
            </h3>

            <p>
              Please check your connection
              and try again.
            </p>

          </div>
        )}

    </div>
  );
}

/* ================================================ */
/* REUSABLE DETAIL COMPONENT */
/* ================================================ */

function Detail({ label, value }) {
  return (
    <div
      style={{
        padding: "15px",
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        marginBottom: "10px",
      }}
    >

      <div
        style={{
          fontSize: "13px",
          color: "#6b7280",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontWeight: "600",
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>

    </div>
  );
}

export default ConsumerVerification;