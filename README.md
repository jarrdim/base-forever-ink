# Base Forever Book

A blockchain-powered guestbook on Base network with gasless transactions and permanent message storage.

## 🌟 Features

- **Blockchain Storage**: All messages permanently stored on Base blockchain
- **Gasless Transactions**: Zero gas fees thanks to Coinbase Paymaster integration
- **BaseName Integration**: Owned by breybrooks.base.eth
- **Wallet Connect**: Easy wallet connection with RainbowKit
- **Permanent Records**: Messages cannot be deleted - truly forever
- **Tag System**: Organize messages with categories
- **Responsive Design**: Beautiful UI that works on all devices

## 🚀 Smart Contract Deployment

Before the guestbook can write to the blockchain, you need to deploy the smart contract:

1. **Find the contract**: Check `contracts/Guestbook.sol`
2. **Deploy it**: Use Remix, Hardhat, or Foundry (see `contracts/README.md` for detailed instructions)
3. **Update the address**: Add your deployed contract address to `src/lib/contract.ts`

The contract includes:
- Message storage with sender, content, timestamp, username, and tags
- Gasless transaction support via Base paymaster
- Efficient message retrieval functions
- Permanent on-chain storage (no deletion)

## Project info

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- wagmi + viem (Web3)
- RainbowKit (Wallet connection)
- Base blockchain (Ethereum L2)



## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
