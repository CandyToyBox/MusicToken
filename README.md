# Onchain Music Platform

A decentralized music platform that enables musicians to create non-tradeable song tokens with on-chain play tracking and engagement features on the Base blockchain.

## Getting Started with Real Blockchain Integration

To deploy real song tokens and record actual blockchain data, follow these steps:

### Prerequisites

1. **ThirdWeb Account Setup**
   - Create an account at [ThirdWeb](https://thirdweb.com/)
   - Generate a project API key
   - Create a Vault Admin Account (for secure token management)

2. **Base Sepolia Testnet**
   - This project uses Base Sepolia Testnet for development
   - You'll need some test ETH for transactions (available from faucets)

3. **Environment Configuration**
   - Set up the following environment variables:
     - `THIRDWEB_CLIENT_ID`: Your ThirdWeb project client ID
     - `THIRDWEB_VAULT_TOKEN`: Your ThirdWeb Vault Access Token

### Deploying a Real Song Token

1. **Upload a Song**
   - Use the platform to upload your song audio and artwork
   - Fill in token details (name, symbol, description)
   - Submit the form to create a pending song entry

2. **Deploy to Blockchain**
   - Navigate to your song details page
   - Click the "Deploy to Blockchain" button
   - The system will deploy a SoundToken contract to Base Sepolia Testnet
   - This creates a unique, non-transferable token representing your song

3. **Verify Deployment**
   - After deployment completes, your song status will change to "Live"
   - You can view the token address and transaction details
   - The token is viewable on BaseScan explorer

### Recording Plays On-Chain

When a user plays a song with a deployed token:

1. The play is recorded to the blockchain via the SoundToken contract
2. A transaction hash is generated and stored in the database
3. The play count increases on-chain, providing transparent metrics
4. Each play is tracked with the listener's wallet address

### Viewing Blockchain Data

The platform provides:

- Detailed blockchain analytics for each song
- Play activity timeline with transaction history
- Links to explore transactions on BaseScan
- Unique listener metrics and token statistics

## Technical Implementation

The platform uses:

- **ThirdWeb SDK**: For smart contract deployment and interaction
- **Base Blockchain**: For secure, transparent, and efficient transactions
- **ERC-721**: Standard for non-fungible tokens (with custom extensions)

### Smart Contract Details

The SoundToken contract includes:

- Non-transferable ownership (tokens cannot be traded)
- Play tracking functionality (on-chain metrics)
- Unique listeners tracking
- Transparent transaction history

## Moving to Production

When moving to a production environment:

1. Switch from Base Sepolia Testnet to Base Mainnet
2. Implement proper wallet management for gas fees
3. Set up monitoring for transaction success and failures
4. Configure alerts for contract interactions

## Troubleshooting

If you encounter issues with blockchain integration:

1. Verify your ThirdWeb credentials are correctly set
2. Ensure you have sufficient ETH for gas fees
3. Check for network connectivity issues
4. Review transaction logs for specific error details