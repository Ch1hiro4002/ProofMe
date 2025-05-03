// src/services/walrusService.ts
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { walClient } from "../networkConfig";

// 从助记词创建密钥对
const privateKey = import.meta.env.VITE_WAL_PRIVATE_KEY;
let keypair: Ed25519Keypair;

const AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

try {
  keypair = Ed25519Keypair.fromSecretKey(privateKey);
  console.log("Keypair address:", keypair.toSuiAddress());
} catch (error) {
  console.error("初始化密钥对失败:", error);
}

/**
 * 上传文件到Walrus存储
 * 如果上传成功但确认失败，仍然返回URL
 */
export async function uploadFileToWalrus(file: File, deletable = false, epochs = 3): Promise<string> {
  let blobId: string | null = null;
  
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
    const result = await walClient.writeBlob({
      blob: fileData,
      deletable,
      epochs,
      signer: keypair,
      owner: keypair.toSuiAddress(), 
    });

    blobId = result.blobId;
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
      
      // 关键改进：如果已经获取到blobId，即使后续确认失败，仍然返回URL
      if (blobId && error.message.includes("NotEnoughBlobConfirmationsError")) {
        console.log("虽然确认失败，但文件已上传。尝试使用blobId构建URL:", blobId);
        return `${AGGREGATOR}/v1/blobs/${blobId}`;
      }
    }
    
    // 如果完全失败，则使用Data URL作为备用方案
    console.log("使用Data URL作为备用方案");
    return createDataUrl(file);
  }
}

/**
 * 创建文件的Data URL作为备用方案
 */
async function createDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl);
    };
    reader.readAsDataURL(file);
  });
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