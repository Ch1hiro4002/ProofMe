import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from '@mysten/walrus';
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      package: "0xf500a9d0f4426ddb88b09b980fbbb148052c34fc44d0d63f989c49fe2e7e4a7f",
      ResumeManager: "0x7d48dd0c71042c6414a5f345e438ad3dbd3362cf2e18e04dc7ff962915b6418f",
    }
  });

const suiClient = new SuiClient({
  url: networkConfig.testnet.url,
});

const walClient = new WalrusClient({
	network: 'testnet',
	suiClient,
  wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm'
});

export { useNetworkVariable, useNetworkVariables, networkConfig, suiClient, walClient };