import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from '@mysten/walrus';
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      package: "0x9c0d70d7c9b611e757ff5f23c917c1a29ab6297aeab91dd95df7e8d5c8578faa",
      ResumeManager: "0x773e5b00f4c0c335d6d72c7c5fa7b16ae5db962fb4586e93080126c3e4b924af",
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