# SoundToken Implementation Guide

This document outlines the exact steps needed to implement the blockchain functionality in our application.

## 1. ThirdWeb Setup

### Create a ThirdWeb Account
1. Go to [ThirdWeb.com](https://thirdweb.com/) and sign up for an account
2. Create a new API key from the dashboard
3. Add the Base blockchain network to your account

### Set Environment Variables
Add these to your `.env` file:
```
THIRDWEB_CLIENT_ID=your-client-id
THIRDWEB_SECRET_KEY=your-secret-key
```

## 2. Smart Contract Deployment

### Deploy SoundToken Contract
1. In ThirdWeb Dashboard, go to "Contracts" and click "Deploy"
2. Choose "Custom Contract" and upload the `SoundTokenContract.sol` file
3. Compile the contract and deploy to Base Testnet
4. Note the contract factory address for use in our application

### Update Configuration
In `server/contracts/ThirdwebDeployer.ts`, update the contract reference:
```typescript
// Change from mock mode to production mode by uncommenting the real implementation
const contractAddress = await sdk.deployer.deployContractFromUri(
  "ipfs://QmYourContractIPFSHash", // Replace with your contract's IPFS hash
  contractArgs
);
```

## 3. Testing Play Recording

### Test on Base Testnet
1. Upload a song through the application
2. Wait for the token to be deployed (status will change to "live")
3. Play the song and check if the play is recorded on-chain
4. Verify the transaction on [Base Testnet Explorer](https://goerli.basescan.org/)

### View Tokens on OpenSea
1. Once deployed, the token will be available on OpenSea Testnet
2. Navigate to the OpenSea URL provided in the song details
3. Connect your wallet to view the token

## 4. Moving to Production

### Deploy to Base Mainnet
1. Update the network in `ThirdwebDeployer.ts` from "base-testnet" to "base"
2. Ensure your account has ETH on Base for gas fees
3. Re-deploy your contract on Base Mainnet using the ThirdWeb dashboard

### Update Client Code
1. Update OpenSea URLs to point to the mainnet instead of testnet
2. Enable real wallet connection checks in the AudioPlayer component

## 5. Common Issues and Solutions

### Contract Deployment Failures
- Ensure you have sufficient ETH for gas fees
- Check that contract parameters are correctly formatted
- Verify contract code compiles without errors

### Play Recording Issues
- Confirm user wallet is connected to Base network
- Check that the transaction hash is being returned correctly
- Verify contract address is valid

### OpenSea Display Problems
- It may take time for OpenSea to index new tokens
- Ensure metadata is properly formatted
- Check that token contract implements required interfaces