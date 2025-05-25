# Onchain Music Platform

A decentralized music platform that enables musicians to create non-tradeable song tokens with on-chain play tracking and engagement features on the Base blockchain.

## Getting Started with ThirdWeb and Base Blockchain

### Step 1: Set Up a ThirdWeb Account

1. **Create an Account**: 
   - Visit [ThirdWeb's website](https://thirdweb.com/) and sign up for an account
   - You'll need to connect a wallet (like MetaMask) during this process

2. **Create a New Project**:
   - From your dashboard, create a new project
   - Give it a name like "Onchain Music Platform"
   - This will generate a Client ID for your application

3. **Set Up Vault Wallet**:
   - In your ThirdWeb dashboard, navigate to "Wallets" section
   - Create a new "Vault Wallet" - this is a secure way to manage private keys
   - This will generate a Vault Admin Key and Vault Access Token

### Step 2: Configure the Base Sepolia Testnet

1. **Add Base Sepolia to Your Wallet**:
   - Open MetaMask or your preferred wallet
   - Add the Base Sepolia network:
     - Network Name: Base Sepolia Testnet
     - RPC URL: https://sepolia.base.org
     - Chain ID: 84532
     - Currency Symbol: ETH

2. **Get Test ETH**:
   - You'll need test ETH to deploy contracts and make transactions
   - Visit the [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-sepolia-faucet)
   - Enter your wallet address to receive test ETH

### Step 3: Add ThirdWeb Credentials to Your Application

1. **Set Environment Variables**:
   - Add the following environment variables to your application:
     ```
     THIRDWEB_CLIENT_ID=your_client_id_here
     THIRDWEB_VAULT_TOKEN=your_vault_access_token_here
     ```
   - These values come from your ThirdWeb dashboard

2. **Restart Your Application**:
   - Once the environment variables are set, restart your application
   - The application will automatically detect the credentials and switch to real blockchain mode

### Step 4: Test Contract Deployment

1. **Upload a Song**:
   - Use your application to upload a song
   - Fill in all the required metadata and token information

2. **Deploy the Token**:
   - Navigate to the song detail page
   - Click the "Deploy to Blockchain" button
   - Wait for the deployment to complete
   - The console logs will show real blockchain interactions

3. **Verify Deployment**:
   - After deployment, your song will show a token address
   - You can visit [Base Sepolia Explorer](https://sepolia.basescan.org/) and paste the token address to view your contract on-chain

### Step 5: Test On-Chain Play Recording

1. **Play a Song**:
   - Use the audio player to play a song that has been deployed
   - The play will be recorded on the blockchain
   - A transaction hash will be generated

2. **Verify Play Recording**:
   - The play count will increase in the UI
   - The transaction will be visible in the "Blockchain Transactions" section
   - You can click on the transaction hash to view it on BaseScan

### Step 6: Monitor Your Contracts

1. **ThirdWeb Dashboard**:
   - Visit your ThirdWeb dashboard
   - Navigate to the "Contracts" section
   - You'll see all your deployed contracts

2. **Base Blockchain Explorer**:
   - Use [Base Sepolia Explorer](https://sepolia.basescan.org/) to view detailed transaction information
   - You can monitor gas usage, transaction status, and contract interactions

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

## Best Practices for Production

1. **Gas Management**:
   - Implement proper gas estimation before transactions
   - Set appropriate gas limits to avoid transaction failures

2. **Error Handling**:
   - Add robust error handling for blockchain transactions
   - Implement retry mechanisms for failed transactions

3. **Moving to Mainnet**:
   - When ready for production, switch from Base Sepolia to Base Mainnet
   - Update the chain configuration in the ThirdWeb client
   - Ensure you have real ETH for transaction fees

## Troubleshooting

If you encounter issues with blockchain integration:

1. Verify your ThirdWeb credentials are correctly set
2. Ensure you have sufficient ETH for gas fees
3. Check for network connectivity issues
4. Review transaction logs for specific error details