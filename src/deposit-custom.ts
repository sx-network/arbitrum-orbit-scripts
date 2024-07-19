import { Wallet, ethers } from "ethers";
import { Provider } from "@ethersproject/abstract-provider";
import {
  Erc20Bridger,
  L1ToL2MessageStatus,
  addCustomNetwork,
  L2Network,
  addDefaultLocalNetwork,
 
} from "@arbitrum/sdk";
//import { arbLog, requireEnvVariables } from "arb-shared-dependencies";
import dotenv from "dotenv";
import { l2Network } from "./helpers/custom-network";
dotenv.config();
//requireEnvVariables(["DEVNET_PRIVKEY", "L1RPC", "L2RPC", "TOKEN_ADDRESS"]);

console.log("Environment Variables Loaded");

/**
 * Set up: instantiate L1 / L2 wallets connected to providers
 */
const walletPrivateKey: string = process.env.DEVNET_PRIVKEY as string;

//const l1Provider = new ethers.providers.JsonRpcProvider(process.env.L1RPC);
const l1Provider = new ethers.providers.JsonRpcProvider("https://arb-sepolia.g.alchemy.com/v2/1kcWqynxqbmReSnettyXbJw6l0YFhmnQ");

const l2Provider = new ethers.providers.JsonRpcProvider(process.env.L2RPC);
const l1Wallet = new Wallet(walletPrivateKey, l1Provider);
// const l2Wallet = new Wallet(walletPrivateKey, l2Provider);

const main = async () => {

  // register - needed for retryables
   addCustomNetwork({
    customL2Network: l2Network,
  });

  console.log("Custom Network Added");

  // Add the default local network configuration to the SDK
 // addDefaultLocalNetwork();

  //console.log("Default Local Network Added");

  // Set up the Erc20Bridger
  const erc20Bridger = new Erc20Bridger(l2Network);

  console.log("Erc20 Bridger Set Up");

  // We get the address of L1 Gateway for our DappToken
  const l1Erc20Address = "0x30620B64A9099Ef70C9AB5ECDB8a01D6e442Ec36"; 

  // Validate that the token address is correctly set
  if (!l1Erc20Address) {
    throw new Error("Invalid ERC20 token address.");
  }

  console.log("L1 ERC20 Address Validated");

  // Define the ERC20 contract interface
  const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];

  //Get the ERC20 contract instance
  const erc20Contract = new ethers.Contract(
    l1Erc20Address,
    ERC20_ABI,
    l1Wallet
  );


  // Get the expected L1 Gateway address
  const expectedL1GatewayAddress = await erc20Bridger.getL1GatewayAddress(
    l1Erc20Address,
    l1Provider as Provider
  );

  console.log("Expected L1 Gateway Address Retrieved: ", expectedL1GatewayAddress);

  // Check if the expectedL1GatewayAddress is valid
  if (!expectedL1GatewayAddress || expectedL1GatewayAddress === "") {
    throw new Error("Failed to get L1 Gateway address.");
  }

  // Get the initial token balance of the Bridge
  const initialBridgeTokenBalance = await erc20Contract.balanceOf(
    expectedL1GatewayAddress
  );

  // Log the initial balance
  console.log(
    `Initial Bridge Token Balance: ${initialBridgeTokenBalance.toString()}`
  );

  //Get the token decimals and compute the deposit amount
  const tokenDecimals = await erc20Contract.decimals();
  const tokenAmount = ethers.utils.parseEther("1")

  // Approve the token transfer
  console.log("Approving:");
  const approveTx = await erc20Bridger.approveToken({
    l1Signer: l1Wallet,
    erc20L1Address: l1Erc20Address,
    amount:tokenAmount.mul(10)
  });
  const approveRec = await approveTx.wait();
  const approveTx2 = await erc20Bridger.approveToken({
    l1Signer: l1Wallet,
    erc20L1Address: "0xf5055e7C5Ea7b941E4ebad2F028Cb29962a3168C",
    amount:tokenAmount.mul(10)
  });
  const approveRec2 = await approveTx2.wait();
  console.log(
    `You successfully allowed the Arbitrum Bridge to spend CGT ${approveRec2.transactionHash}`
  );

  // Deposit the token to L2
  console.log("Transferring DappToken to L2:");
  const depositTx = await erc20Bridger.deposit({
    amount: tokenAmount,
    erc20L1Address: l1Erc20Address,
    l1Signer: l1Wallet,

    l2Provider: l2Provider,
  });


  
  // Wait for L1 and L2 side of transactions to be confirmed
  console.log(
    `Deposit initiated: waiting for L2 retryable (takes 10-15 minutes; current time: ${new Date().toTimeString()}) `
  );
  const depositRec = await depositTx.wait();
  const l2Result = await depositRec.waitForL2(l2Provider);

  // Check if the L1 to L2 message was successful
  l2Result.complete
    ? console.log(
        `L2 message successful: status: ${L1ToL2MessageStatus[l2Result.status]}`
      )
    : console.log(
        `L2 message failed: status ${L1ToL2MessageStatus[l2Result.status]}`
      );

  // Get the final token balance of the Bridge
  const finalBridgeTokenBalance = await erc20Contract.balanceOf(
    expectedL1GatewayAddress
  );

  console.log(
    `Final Bridge Token Balance: ${finalBridgeTokenBalance.toString()}`
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});