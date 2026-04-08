# Frontend Module

This folder contains the Next.js app used to:

- Upload images to Pinata IPFS.
- Mark images as AI-generated or original.
- Submit the disclosure to the blockchain.
- Verify a CID and preview the image.

For complete project documentation, see `../README.md`.

## Key Files

- `app/page.tsx`: Main UI and upload/verify actions.
- `utils/pinata.js`: Upload helper (`pinFileToIPFS`).
- `utils/contract.js`: Ethers contract connection and ABI.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment in `.env.local`:

```env
NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key
NEXT_PUBLIC_PINATA_SECRET_KEY=your_pinata_secret_key
```

3. Set deployed contract address in `utils/contract.js` (`CONTRACT_ADDRESS`).

4. Start dev server:

```bash
npm run dev
```

Open http://localhost:3000.

## User Interaction Flow

### Upload and Disclose

1. Select an image file.
2. Choose disclosure flag using `AI Used` checkbox.
3. Click `Upload + Store`.
4. Approve MetaMask connection and transaction.
5. On success, CID is pinned to IPFS and record is stored on-chain.

### Verify

1. Paste a CID in `Verify` input.
2. Click `Verify`.
3. App fetches latest on-chain record and displays:
   - AI Used status
   - Creator address
   - Image preview from Pinata gateway

## Requirements

- MetaMask installed and connected to local Hardhat network (chain id 31337).
- Blockchain node running and contract deployed.
- Contract address in this frontend matches latest deployment.

## Important Security Note

Current upload flow uses browser-exposed Pinata credentials (`NEXT_PUBLIC_*`). This is suitable for local demo but not production.

Production recommendation:

- Move Pinata upload to a secure backend API.
- Keep secret keys server-side only.