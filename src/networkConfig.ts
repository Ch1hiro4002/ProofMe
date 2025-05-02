import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from '@mysten/walrus';
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      package: "0x05bd0be091095a6535056c3422d9d01d8502271d0ef1117d2e0dcd75def2c3e8",
      ResumeManager: "0x9c91a30b960b05e40172accca86d5d76947b2cc437102cce851c95641a32bf5d"
    }
  });

const suiClient = new SuiClient({
  url: networkConfig.testnet.url,
});

const walClient = new WalrusClient({
	network: 'testnet',
	suiClient,
  wasmUrl: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
});

export { useNetworkVariable, useNetworkVariables, networkConfig, suiClient, walClient };