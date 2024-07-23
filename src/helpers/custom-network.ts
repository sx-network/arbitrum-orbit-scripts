import { L2Network } from "@arbitrum/sdk";

export const l2NetworkTestnet: L2Network = {
    chainID: 79479957,
    confirmPeriodBlocks: 20,
    ethBridge: {
      inbox: "0x46C42Cf5127ffd6dE2d9f231173C6d81E5010726",
      bridge: "0xC703f27438898BebE682D253185149cBeaC1621c",
      outbox: "0x5B8220489827Be74CeD6b7974C3a80d3ba8dbf91",
      rollup: "0x82332BE0ef83A2b7Df91DCDCF481c393455E0D31",
      sequencerInbox: "0x9555B5F427c7B1E69C35d3DE855D4F1BffBc593B",
    },
    tokenBridge: {
      l1CustomGateway: "",
      l1ERC20Gateway: "0xa66971304463c017F4D152685B1483cc63Fd116d",
      l1GatewayRouter: "0xEb362E3C9B081baE0024b34955a132B93D05047f",
      l1MultiCall: "",
      l1ProxyAdmin: "",
      l1Weth: "",
      l1WethGateway: "",
      l2CustomGateway: "",
      l2ERC20Gateway: "0x650cD99b736173d8AB9aeF9f4b3B5DA8EE054adC",
      l2GatewayRouter: "0x015B81e0Ead225800cbb11cD95a7048F5E301771",
      l2Multicall: "",
      l2ProxyAdmin: "",
      l2Weth: "",
      l2WethGateway: "",
    },
    partnerChainID: 11155111,
    isArbitrum: true,
    blockTime: 0.25,
    partnerChainIDs: [],
    explorerUrl: "",
    isCustom: true,
    name: "SX-Testnet",
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    nativeToken: "0x9c5EB9723728123AF896089b902CB17B44Fd09e6",
  };

export const l2NetworkMainnet: L2Network = {
    chainID: 4162,
    confirmPeriodBlocks: 20,
    ethBridge: {
      inbox: "0xEa83E8907C89Bc0D9517632f0ba081972E328631",
      bridge: "0xa104C0426e95a5538e89131DbB4163d230C35f86",
      outbox: "0xB360b2f57c645E847148d7C479b7468AbF6F707d",
      rollup: "0x36c6C69A6186D4475fc5c21181CD980Bd6E5e11F",
      sequencerInbox: "0xD80a805c86C14c879420eC6acb366D04D318fC0C",
    },
    tokenBridge: {
      l1CustomGateway: "",
      l1ERC20Gateway: "0xB4968C66BECc8fb4f73b50354301c1aDb2Abaa91",
      l1GatewayRouter: "0x5F00446D785421d65B50c192D7129e3C3906438A",
      l1MultiCall: "",
      l1ProxyAdmin: "",
      l1Weth: "",
      l1WethGateway: "",
      l2CustomGateway: "",
      l2ERC20Gateway: "0x214474E5399cc4C003A990E28a4379A1f1b64eE7",
      l2GatewayRouter: "0xb77b85Bc59f7C48C21Aa32c6230CD4262Fa79f5b",
      l2Multicall: "",
      l2ProxyAdmin: "",
      l2Weth: "",
      l2WethGateway: "",
    },
    partnerChainID: 1,
    isArbitrum: true,
    blockTime: 0.25,
    partnerChainIDs: [],
    explorerUrl: "",
    isCustom: true,
    name: "SX Rollup",
    retryableLifetimeSeconds: 7 * 24 * 60 * 60,
    nitroGenesisBlock: 0,
    nitroGenesisL1Block: 0,
    depositTimeout: 900000,
    nativeToken: "0xbe9F61555F50DD6167f2772e9CF7519790d96624",
  };