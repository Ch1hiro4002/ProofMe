// src/config/walrusConfig.ts

// 使用自定义的网络类型
export type SuiNetworkType = 'mainnet' | 'testnet' | 'devnet';

/**
 * Walrus网络聚合器URL配置
 */
export const WALRUS_AGGREGATOR_URLS: Record<string, string> = {
  mainnet: 'https://walrus.globalstake.io/v1/blobs/by-object-id/',
  testnet: 'https://aggregator.walrus-testnet.walrus.space/v1/blobs/by-object-id/',
};

/**
 * Walrus服务配置
 */
export const WALRUS_CONFIG = {
  /**
   * 请求重试次数
   */
  MAX_RETRIES: 3,
  
  /**
   * 重试间隔时间（毫秒）
   */
  RETRY_DELAY: 1000,
  
  /**
   * 请求超时时间（毫秒）
   */
  REQUEST_TIMEOUT: 60_000,
  
  /**
   * Walrus WASM CDN URL - 这是关键配置，解决WebAssembly加载问题
   */
  WASM_URL: 'https://unpkg.com/@mysten/walrus-wasm@latest/web/walrus_wasm_bg.wasm',
  
  /**
   * 默认存储时长（天）
   */
  DEFAULT_LEASE_DAYS: 30,
  
  /**
   * Walrus环境 - 可以是 'mainnet', 'testnet', 或 'devnet'
   */
  ENVIRONMENT: 'testnet' as SuiNetworkType
};

/**
 * 根据网络环境获取Walrus聚合器URL
 * @param network 网络环境
 * @returns 聚合器URL
 */
export function getWalrusAggregatorUrl(network: string): string {
  return WALRUS_AGGREGATOR_URLS[network] || WALRUS_AGGREGATOR_URLS['testnet'];
}

/**
 * 将Sui网络类型映射到Walrus支持的网络类型
 * @param network Sui网络类型
 * @returns Walrus支持的网络类型字符串
 */
export function mapToWalrusNetwork(network: SuiNetworkType): string {
  // Walrus只支持testnet和mainnet
  if (network === 'devnet') {
    return 'testnet';
  }
  return network;
}