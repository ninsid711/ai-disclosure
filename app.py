import streamlit as st
from web3 import Web3
import requests
import json
import hashlib
from datetime import datetime

from dotenv import load_dotenv
import os
load_dotenv()

# =========================
# Blockchain Setup
# =========================
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))

CONTRACT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"

ABI =  [
    {
      "anonymous": False,
      "inputs": [
        {
          "indexed": False,
          "internalType": "string",
          "name": "contentHash",
          "type": "string"
        },
        {
          "indexed": False,
          "internalType": "bool",
          "name": "aiUsed",
          "type": "bool"
        },
        {
          "indexed": True,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": False,
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        }
      ],
      "name": "RecordAdded",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_hash",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "_aiUsed",
          "type": "bool"
        }
      ],
      "name": "addRecord",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_hash",
          "type": "string"
        }
      ],
      "name": "getAllRecords",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "aiUsed",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            }
          ],
          "internalType": "struct Disclosure.Record[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_hash",
          "type": "string"
        }
      ],
      "name": "getLatestRecord",
      "outputs": [
        {
          "components": [
            {
              "internalType": "string",
              "name": "cid",
              "type": "string"
            },
            {
              "internalType": "bool",
              "name": "aiUsed",
              "type": "bool"
            },
            {
              "internalType": "uint256",
              "name": "timestamp",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            }
          ],
          "internalType": "struct Disclosure.Record",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalRecords",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "hasSubmitted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "records",
      "outputs": [
        {
          "internalType": "string",
          "name": "cid",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "aiUsed",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "timestamp",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
    #  PASTE FULL ABI FROM Disclosure.json HERE
]

contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=ABI)

# =========================
# Pinata Config
# =========================
PINATA_API_KEY = os.getenv("PINATA_API_KEY")
PINATA_SECRET_KEY = os.getenv("PINATA_SECRET_KEY")

PINATA_URL = "https://api.pinata.cloud/pinning/pinFileToIPFS"

# =========================
# UI
# =========================
st.title("AI Content Disclosure System")

# =========================
# Upload Section
# =========================
st.header("Upload Content")

file = st.file_uploader("Upload Image")

ai_flag = st.selectbox("Was AI used?", ["Yes", "No"])

if file:
    st.image(file, caption="Preview", use_column_width=True)

    file_bytes = file.read()
    hash_val = hashlib.sha256(file_bytes).hexdigest()

    st.write("📌 Content Hash:", hash_val)

    if st.button("Upload to IPFS + Store on Blockchain"):
        try:
            # Upload to Pinata
            files = {"file": (file.name, file_bytes)}
            headers = {
                "pinata_api_key": PINATA_API_KEY,
                "pinata_secret_api_key": PINATA_SECRET_KEY
            }

            response = requests.post(PINATA_URL, files=files, headers=headers)

            if response.status_code != 200:
                st.error("❌ Failed to upload to IPFS")
            else:
                cid = response.json()["IpfsHash"]

                st.success(f"Uploaded to IPFS! CID: {cid}")

                # 🔗 Store CID on blockchain
                tx = contract.functions.addRecord(
                    cid,   # storing CID instead of hash
                    ai_flag == "Yes"
                ).transact({
                    'from': w3.eth.accounts[0]
                })

                st.success("Stored on blockchain!")
                st.write("Transaction:", tx.hex())

        except Exception as e:
            st.error(f"Error: {str(e)}")

# =========================
# Verify Section
# =========================
st.header("Verify Content")

cid_input = st.text_input("Enter IPFS CID")

if st.button("Check Record"):
    try:
        record = contract.functions.getLatestRecord(cid_input).call()

        st.success("Record Found")

        st.write("AI Used:", record[1])
        st.write("Creator:", record[3])

        # Convert timestamp
        readable_time = datetime.fromtimestamp(record[2]).strftime('%Y-%m-%d %H:%M:%S')
        st.write("Timestamp:", readable_time)

        # Show image
        ipfs_url = f"https://gateway.pinata.cloud/ipfs/{cid_input}"
        st.image(ipfs_url, caption="Fetched from IPFS")

    except:
        st.error("No record found")