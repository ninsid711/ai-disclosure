"use client";

import { useState, useEffect } from "react";
import { uploadToPinata } from "../utils/pinata";
import { getContract } from "../utils/contract";
import "./page.css"; 

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [cid, setCid] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (window.ethereum?.selectedAddress) setWalletConnected(true);
  }, []);

  const handleUpload = async () => {
    if (!file) return alert("Select a file first");
    try {
      setLoading(true);
      const uploadedCID = await uploadToPinata(file);
      setCid(uploadedCID);

      if (!window.ethereum) throw new Error("No Wallet Found");
      await window.ethereum.request({ method: "eth_requestAccounts" });
      
      const contract = await getContract();
      const tx = await contract.addRecord(uploadedCID, aiUsed);
      
      await tx.wait();
      setWalletConnected(true);
      alert("Success: Content anchored to Blockchain.");
    } catch (err) {
      console.error(err);
      alert("Upload failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!cid) return alert("Enter a CID");
    try {
      setLoading(true);
      const contract = await getContract();
      const record = await contract.getLatestRecord(cid);
      setResult(record);
    } catch {
      alert("No record found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="appContainer">
      <div className="glowEffect"></div>
      
      <header className="header">
        <div className="brand">
          <div className="logoDot"></div>
          <span className="eyebrow">Web3 Provenance</span>
        </div>
        <div className={`connectionBadge ${walletConnected ? 'active' : ''}`}>
          {walletConnected ? "Wallet Connected" : "Wallet Disconnected"}
        </div>
      </header>

      <section className="hero">
        <h1>Authenticity <span className="gradientText">Engine</span></h1>
        <p>Immutable media disclosure powered by IPFS and Ethereum.</p>
      </section>

      <div className="grid">
        <div className="glassCard">
          <div className="cardTop">
            <span className="stepNumber">01</span>
            <h3>Register Asset</h3>
          </div>
          
          <label className="dropZone">
            <input 
              type="file" 
              hidden 
              onChange={(e) => setFile(e.target.files?.[0] || null)} 
            />
            <div className="dropZoneContent">
              <p className="fileStatus">{file ? `Selected: ${file.name}` : "Click to select media"}</p>
              <span className="fileSubtext">Supports Images & Video</span>
            </div>
          </label>

          <div className="checkboxRow">
            <label className="toggle">
              <input 
                type="checkbox" 
                checked={aiUsed} 
                onChange={() => setAiUsed(!aiUsed)} 
              />
              <span className="slider"></span>
            </label>
            <span>Mark as AI-Generated</span>
          </div>

          <button onClick={handleUpload} className="primaryBtn" disabled={loading}>
            {loading ? "Processing..." : "Sign & Upload"}
          </button>
        </div>

        <div className="glassCard">
          <div className="cardTop">
            <span className="stepNumber">02</span>
            <h3>Verify Content</h3>
          </div>

          <input
            className="darkInput"
            value={cid}
            onChange={(e) => setCid(e.target.value)}
            placeholder="Paste Content Hash (CID)..."
          />

          <button onClick={handleVerify} className="secondaryBtn" disabled={loading}>
            Check Ledger
          </button>

          {result && (
            <div className="resultsArea">
              <div className="resultRow">
                <span>Origin:</span>
                <span className={result.aiUsed ? "aiTag" : "humanTag"}>
                  {result.aiUsed ? "Synthetic (AI)" : "Human Original"}
                </span>
              </div>
              <div className="resultRow">
                <span>Signer:</span>
                <code className="address">{result.creator.slice(0,6)}...{result.creator.slice(-4)}</code>
              </div>
              <img 
                src={`https://gateway.pinata.cloud/ipfs/${cid}`} 
                alt="Preview" 
                className="resultPreview"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}