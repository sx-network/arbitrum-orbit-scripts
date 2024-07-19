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
 const l2Wallet = new Wallet(walletPrivateKey, l2Provider);

const main = async () => {
  // await arbLog("Deposit token using Arbitrum SDK");

  const l2Network: L2Network = {
    chainID: 88153591557,
    confirmPeriodBlocks: 20,
    ethBridge: {
      inbox: "0x438d3Fb3B49C4aB9FD01791B5f297A0a415f66C0",
      bridge: "0x3986D14164B3B6EcADAb9376Efe4E905a2a32d68",
      outbox: "0x78be110441359d69cffeEa1941259C8A5292D886",
      rollup: "0x78Caf4A899A3949C6109d17a76fD5A2DB29dA2f5",
      sequencerInbox: "0xa41c89A543dF14B4d5C06dD1e7B94AEd01542E95",
    },
    tokenBridge: {
      l1CustomGateway: "",
      l1ERC20Gateway: "0x01E1bE90c617b076978b37aCA9552877a15a7006",
      l1GatewayRouter: "0xf446986e261E84aB2A55159F3Fba60F7E8AeDdAF",
      l1MultiCall: "",
      l1ProxyAdmin: "",
      l1Weth: "",
      l1WethGateway: "",
      l2CustomGateway: "",
      l2ERC20Gateway: "0xdba116E322fd5bE8072E2BdDBDA096fed501586B",
      l2GatewayRouter: "0xbFE42eF8429c5d5452E23b09910e35748eCe72CF",
      l2Multicall: "",
      l2ProxyAdmin: "",
      l2Weth: "",
      l2WethGateway: "",
    },
    partnerChainID: 421614,
    isArbitrum: true,
    blockTime: 0.25,
    partnerChainIDs: [],
    explorerUrl: "https://arb-blueberry.gelatoscout.com/",
    isCustom: true,
    name: "Blueberry",
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    nativeToken: "0xf5055e7C5Ea7b941E4ebad2F028Cb29962a3168C",
  };
  console.log("L2 Network Reached");
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
  console.log('Withdrawing:')
  const withdrawTx = await erc20Bridger.withdraw({
    amount: tokenAmount,
    destinationAddress: l2Wallet.address,
    erc20l1Address: l1Erc20Address,
    l2Signer: l2Wallet,
  })
  const withdrawRec = await withdrawTx.wait()
  console.log(`Token withdrawal initiated! 🥳 ${withdrawRec.transactionHash}`)

  
  // Wait for L1 and L2 side of transactions to be confirmed
  console.log(
    `Deposit initiated: waiting for L2 retryable (takes 10-15 minutes; current time: ${new Date().toTimeString()}) `
  );
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
