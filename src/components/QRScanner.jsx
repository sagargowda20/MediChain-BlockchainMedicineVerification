import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

function QRScanner({ onScan }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);

  const startScanner = async () => {
    if (scanning || starting) {
      return;
    }

    setError("");
    setStarting(true);

    try {
      const scanner = new Html5Qrcode("qr-reader");

      scannerRef.current = scanner;

      await scanner.start(
        {
          facingMode: "environment",
        },
        {
          fps: 10,

          qrbox: {
            width: 250,
            height: 250,
          },
        },

        async (decodedText) => {
          console.log(
            "QR code scanned:",
            decodedText
          );

          // Stop scanner immediately after
          // successful scan.
          try {
            await scanner.stop();
            scanner.clear();

            scannerRef.current = null;

            setScanning(false);
          } catch (stopError) {
            console.error(
              "Scanner stop error:",
              stopError
            );
          }

          // Send QR result to parent component.
          onScan(decodedText);
        },

        () => {
          // Normal QR scanning attempts
          // generate temporary decode errors.
          // We intentionally do not display them.
        }
      );

      setScanning(true);
    } catch (err) {
      console.error(
        "QR scanner start error:",
        err
      );

      setScanning(false);

      if (
        err?.name ===
        "NotAllowedError"
      ) {
        setError(
          "⚠️ Camera permission was denied. Please allow camera access and try again."
        );
      } else if (
        err?.name ===
        "NotFoundError"
      ) {
        setError(
          "⚠️ No camera was found on this device."
        );
      } else if (
        err?.name ===
        "NotReadableError"
      ) {
        setError(
          "⚠️ Camera is already being used by another application."
        );
      } else {
        setError(
          "⚠️ Unable to start the QR scanner. Please try again."
        );
      }
    } finally {
      setStarting(false);
    }
  };

  const stopScanner = async () => {
    if (!scannerRef.current) {
      setScanning(false);
      return;
    }

    try {
      await scannerRef.current.stop();

      scannerRef.current.clear();

      scannerRef.current = null;

      setScanning(false);
    } catch (err) {
      console.error(
        "Error stopping scanner:",
        err
      );

      scannerRef.current = null;

      setScanning(false);
    }
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => {
            scannerRef.current?.clear();
          })
          .catch(() => {});

        scannerRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        marginTop: "20px",
        textAlign: "center",
      }}
    >

      {/* Scanner */}

      <div
        id="qr-reader"
        style={{
          width: "100%",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      />

      {/* Starting */}

      {starting && (
        <div
          style={{
            marginTop: "15px",
            padding: "12px",
            borderRadius: "8px",
            backgroundColor: "#f3f4f6",
          }}
        >
          ⏳ Starting camera...
        </div>
      )}

      {/* Error */}

      {error && (
        <div
          style={{
            marginTop: "15px",
            padding: "15px",
            borderRadius: "8px",
            backgroundColor: "#fef2f2",
            border: "1px solid #fca5a5",
            color: "#b91c1c",
          }}
        >
          {error}
        </div>
      )}

      {/* Start */}

      {!scanning && !starting && (
        <button
          onClick={startScanner}
          style={{
            marginTop: "15px",
            padding: "12px 25px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#2563eb",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          📷 Start QR Scanner
        </button>
      )}

      {/* Stop */}

      {scanning && (
        <button
          onClick={stopScanner}
          style={{
            marginTop: "15px",
            padding: "12px 25px",
            border: "none",
            borderRadius: "8px",
            backgroundColor: "#dc2626",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Stop Scanner
        </button>
      )}

    </div>
  );
}

export default QRScanner;