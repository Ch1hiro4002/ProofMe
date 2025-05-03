import { getFullnodeUrl, SuiClient } from "@mysten/sui/client";
import { WalrusClient } from '@mysten/walrus';
import { createNetworkConfig } from "@mysten/dapp-kit";

const { networkConfig, useNetworkVariable, useNetworkVariables } =
  createNetworkConfig({
    testnet: {
      url: getFullnodeUrl("testnet"),
      package: "0x2347c0c0a38716eb4c674396770d040f9c23cedbf174956595d63ca28f72324e",
      ResumeManager: "0x2edf76cb941ee26f5194db1f9bf022f289d403a992006697f94a61dbc8e611b3"
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