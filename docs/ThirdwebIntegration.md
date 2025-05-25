# ThirdWeb Integration Guide for SoundToken

This document outlines how to deploy and interact with SoundToken smart contracts using ThirdWeb.

## Prerequisites

1. A ThirdWeb account with API keys
2. Base blockchain network access

## Setting Up ThirdWeb

To deploy and interact with contracts, you'll need to set up environment variables:

```
THIRDWEB_CLIENT_ID=your-client-id
THIRDWEB_SECRET_KEY=your-secret-key
```

## Contract Deployment Process

When a user uploads a new song, the following process occurs:

1. User uploads song audio and artwork
2. Backend creates a record in the database with "pending" status
3. The `deploySoundTokenContract` function is called with the song data
4. ThirdWeb SDK deploys the SoundToken contract to Base blockchain
5. Contract address is stored in the song record and status changes to "live"

## Play Recording Process

When a user plays a song, the following process occurs:

1. User clicks play on a song
2. AudioPlayer component checks if the token is deployed
3. If deployed, it calls the `recordPlay` function via ThirdWeb client
4. The backend calls `recordPlayOnContract` function
5. ThirdWeb SDK interacts with the smart contract to record the play
6. Play is stored both on-chain and in the local database

## Contract Details

The `SoundToken` contract has the following features:

1. Non-transferable ERC20 tokens (transfer functions are disabled)
2. Play tracking for each user address
3. Total play count tracking
4. Events emitted for each play

## Using ThirdWeb Dashboard

You can monitor your deployed contracts on the ThirdWeb dashboard:

1. Go to https://thirdweb.com/dashboard
2. Connect your wallet
3. Select the Base network
4. View your deployed contracts

## Testing Locally

For local testing without deploying to the blockchain:

1. The `deploySoundTokenContract` function has fallback behavior to simulate contract deployment
2. The `recordPlayOnContract` function simulates blockchain transactions
3. Real contract interaction only occurs when environment variables are properly set

## Going to Production

When ready to deploy to production:

1. Uncomment the actual ThirdWeb SDK code in the deployment and recording functions
2. Update the contract IPFS URI to point to your deployed contract
3. Ensure your ThirdWeb account has sufficient funds for contract deployment
4. Test on Base testnet before deploying to mainnet