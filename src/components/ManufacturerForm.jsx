import { useState } from "react";
import qrcode from "qrcode-generator";
import { useBlockchain } from "../context/BlockchainContext";

function ManufacturerForm() {
  const { contract } = useBlockchain();

  const [formData, setFormData] = useState({
    productName: "",
    batchNumber: "",
    manufacturerName: "",
    expiryDate: "",
    manufacturingDate: "",
    price: "",
    certificateNumber: "",
  });

  const [status, setStatus] = useState("");
  const [qrHash, setQrHash] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function registerMedicine() {
    if (!contract) {
      setStatus("Please connect MetaMask first.");
      return;
    }

    // Basic validation
    if (
      !formData.productName ||
      !formData.batchNumber ||
      !formData.manufacturerName ||
      !formData.expiryDate ||
      !formData.manufacturingDate ||
      !formData.price ||
      !formData.certificateNumber
    ) {
      setStatus("Please fill in all medicine details.");
      return;
    }

    try {
      setStatus("Waiting for MetaMask...");

      // Generate unique QR hash
      const generatedQrHash =
        formData.batchNumber + "-" + Date.now();

      const expiryTimestamp = Math.floor(
        new Date(formData.expiryDate).getTime() / 1000
      );

      const manufacturingTimestamp = Math.floor(
        new Date(formData.manufacturingDate).getTime() / 1000
      );

      const price = Number(formData.price);

      // Register medicine on blockchain
      const transaction = await contract.registerMedicine(
        generatedQrHash,
        formData.productName,
        formData.batchNumber,
        formData.manufacturerName,
        expiryTimestamp,
        manufacturingTimestamp,
        price,
        formData.certificateNumber
      );

      setStatus(
        "Transaction submitted. Waiting for blockchain confirmation..."
      );

      await transaction.wait();

      // Generate QR code containing the exact blockchain QR hash
      const qr = qrcode(0, "M");
      qr.addData(generatedQrHash);
      qr.make();

      const generatedQrDataUrl = qr.createDataURL(8, 4);

      // Save QR information to React state
      setQrHash(generatedQrHash);
      setQrDataUrl(generatedQrDataUrl);

      setStatus(
        `Medicine registered successfully! QR Hash: ${generatedQrHash}`
      );

    } catch (error) {
      console.error("Registration error:", error);
      setStatus(
        "Transaction failed. Check MetaMask and the browser console."
      );
    }
  }

  function downloadQRCode() {
    if (!qrDataUrl || !qrHash) {
      return;
    }

    const link = document.createElement("a");

    link.href = qrDataUrl;
    link.download = `${qrHash}-QR.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function printQRCode() {
    if (!qrDataUrl || !qrHash) {
      return;
    }

    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups in your browser to print the QR code.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>MediChain QR Code</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 40px;
            }

            h1 {
              margin-bottom: 10px;
            }

            img {
              width: 300px;
              height: 300px;
              margin: 20px auto;
            }

            .hash {
              font-size: 16px;
              word-break: break-all;
              margin-top: 15px;
            }

            .medicine {
              margin-top: 20px;
              font-size: 18px;
              font-weight: bold;
            }

            @media print {
              button {
                display: none;
              }
            }
          </style>
        </head>

        <body>
          <h1>MediChain</h1>

          <div class="medicine">
            ${formData.productName}
          </div>

          <img src="${qrDataUrl}" alt="Medicine QR Code" />

          <div class="hash">
            QR Hash: ${qrHash}
          </div>

          <br />

          <button onclick="window.print()">
            Print QR Code
          </button>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.onload = function () {
      printWindow.focus();
      printWindow.print();
    };
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6">
        Register Medicine
      </h2>

      <div className="space-y-4">

        <input
          name="productName"
          placeholder="Product Name"
          value={formData.productName}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="batchNumber"
          placeholder="Batch Number"
          value={formData.batchNumber}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="manufacturerName"
          placeholder="Manufacturer Name"
          value={formData.manufacturerName}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <label className="block">
          Manufacturing Date

          <input
            type="date"
            name="manufacturingDate"
            value={formData.manufacturingDate}
            onChange={handleChange}
            className="w-full border p-3 rounded mt-1"
          />
        </label>

        <label className="block">
          Expiry Date

          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            className="w-full border p-3 rounded mt-1"
          />
        </label>

        <input
          type="number"
          name="price"
          placeholder="Price"
          value={formData.price}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <input
          name="certificateNumber"
          placeholder="Certificate Number"
          value={formData.certificateNumber}
          onChange={handleChange}
          className="w-full border p-3 rounded"
        />

        <button
          onClick={registerMedicine}
          className="w-full bg-blue-600 text-white py-3 rounded font-semibold"
        >
          Register Medicine
        </button>

        {status && (
          <p className="mt-4 text-sm break-words">
            {status}
          </p>
        )}

        {/* QR CODE SECTION */}
        {qrDataUrl && qrHash && (
          <div className="mt-8 p-6 border rounded-lg text-center">

            <h3 className="text-2xl font-bold mb-4">
              Medicine QR Code
            </h3>

            <p className="text-sm mb-4">
              Scan this QR code to verify the medicine.
            </p>

            <div className="flex justify-center mb-4">
              <img
                src={qrDataUrl}
                alt="Medicine QR Code"
                className="w-64 h-64 border p-2 bg-white"
              />
            </div>

            <p className="text-sm break-all mb-5">
              <strong>QR Hash:</strong> {qrHash}
            </p>

            <div className="flex gap-3 justify-center flex-wrap">

              <button
                onClick={downloadQRCode}
                className="bg-green-600 text-white px-5 py-3 rounded font-semibold"
              >
                Download QR
              </button>

              <button
                onClick={printQRCode}
                className="bg-gray-700 text-white px-5 py-3 rounded font-semibold"
              >
                Print QR
              </button>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default ManufacturerForm;