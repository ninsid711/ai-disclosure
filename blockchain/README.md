# Blockchain Module

This folder contains the Solidity contract and Hardhat setup for recording AI-disclosure metadata on-chain.

For full project usage, see the root documentation: `../README.md`.

## Contents

- `contracts/Disclosure.sol`: Main smart contract.
- `scripts/deploy.js`: Deployment script.
- `hardhat.config.ts`: Hardhat config.

## Contract Summary

Contract: `Disclosure`

- `addRecord(string _hash, bool _aiUsed)`
- `getLatestRecord(string _hash)`
- `getAllRecords(string _hash)`
- `getTotalRecords()`

Record structure:

- `cid`
- `aiUsed`
- `timestamp`
- `creator`

Built-in validation:

- Empty CID/hash is rejected.
- Same wallet cannot submit the same CID/hash twice.

## Local Development

Install dependencies:

```bash
npm install
```

Start local chain:

```bash
npx hardhat node
```

Deploy in another terminal:

```bash
npx hardhat run scripts/deploy.js --network localhost
```

Copy deployed contract address and place it in `frontend/utils/contract.js`.

## Optional Console Verification

```bash
npx hardhat console --network localhost
```

```javascript
const address = "<deployed_address>";
const disclosure = await ethers.getContractAt("Disclosure", address);
await disclosure.getTotalRecords();
await disclosure.getLatestRecord("<cid>");
```

## Notes

- Contract artifacts are generated in `artifacts/`.
- If you redeploy, update the frontend contract address.

