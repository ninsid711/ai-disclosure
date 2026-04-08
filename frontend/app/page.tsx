"use client";

import { useState } from "react";
import { uploadToPinata } from "../utils/pinata";
import { getContract } from "../utils/contract";

export default function Home() {
  const [file, setFile] = useState(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [cid, setCid] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Upload a file");

    // Upload to Pinata
    const uploadedCID = await uploadToPinata(file);
    setCid(uploadedCID);

    // Connect wallet
    await window.ethereum.request({ method: "eth_requestAccounts" });

    const contract = await getContract();

    // Store on blockchain
    const tx = await contract.addRecord(uploadedCID, aiUsed);
    await tx.wait();

    alert("Stored on blockchain!");
  };

  const handleVerify = async () => {
    const contract = await getContract();
    const record = await contract.getLatestRecord(cid);
    setResult(record);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>AI Disclosure System</h1>

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />

      <br /><br />

      <label>
        <input
          type="checkbox"
          checked={aiUsed}
          onChange={(e) => setAiUsed(e.target.checked)}
        />
        AI Used
      </label>

      <br /><br />

      <button onClick={handleUpload}>Upload + Store</button>

      <hr />

      <h3>Verify</h3>

      <input
        value={cid}
        onChange={(e) => setCid(e.target.value)}
        placeholder="Enter CID"
      />

      <br /><br />

      <button onClick={handleVerify}>Verify</button>

      {result && (
        <div>
          <p><b>AI Used:</b> {result.aiUsed ? "Yes" : "No"}</p>
          <p><b>Creator:</b> {result.creator}</p>
          <img src={`https://gateway.pinata.cloud/ipfs/${cid}`}/>
        </div>
      )}
    </div>
  );
}