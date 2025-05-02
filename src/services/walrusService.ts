import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { walClient } from "../networkConfig";


// 从助记词创建密钥对
// 注意：在生产环境中，应该使用更安全的方式存储和获取助记词
const privateKey = import.meta.env.VITE_WAL_PRIVATE_KEY;
let keypair: Ed25519Keypair;

const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

try {
  keypair = Ed25519Keypair.fromSecretKey(privateKey);
  console.log("Keypair address:", keypair.toSuiAddress());
} catch (error) {
  console.error("初始化密钥对失败:", error);
}


export async function uploadFileToWalrus(file: File, deletable = false, epochs = 3): Promise<string> {
  try {
    if (!keypair) {
      throw new Error("密钥对未初始化");
    }

    // 将文件转换为 ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const fileData = new Uint8Array(arrayBuffer);

    console.log("开始上传文件到 Walrus，文件大小:", fileData.length, "字节");

    // 获取存储成本估算（可选）
    const { storageCost, writeCost } = await walClient.storageCost(fileData.length, epochs);
    console.log("存储成本:", storageCost.toString(), "写入成本:", writeCost.toString());

    // 上传到 Walrus
    const { blobId } = await walClient.writeBlob({
      blob: fileData,
      deletable,
      epochs,
      signer: keypair,
      owner: keypair.toSuiAddress(), 
    });

    console.log("上传成功，Blob ID:", blobId);

    // 返回可访问文件的 URL
    return `${AGGREGATOR}/v1/blobs/${blobId}`;
  } catch (error) {
    console.error("上传文件到 Walrus 失败:", error);
    
    // 更详细的错误信息
    if (error instanceof Error) {
      console.error("错误详情:", error.message);
      if (error.stack) {
        console.error("错误堆栈:", error.stack);
      }
    }
    
    throw error;
  }
}

/**
 * 从 Walrus 存储读取文件
 * @param blobId 要读取的 blob ID
 * @returns blob 数据
 */
export async function readFileFromWalrus(blobId: string): Promise<Uint8Array> {
  try {
    const blob = await walClient.readBlob({ blobId });
    return blob;
  } catch (error) {
    console.error("从 Walrus 读取文件失败:", error);
    throw error;
  }
}