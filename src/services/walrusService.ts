/**
 * Walrus Storage Service
 *
 * This service provides functions to interact with Walrus decentralized storage
 * for storing and retrieving files like avatar images.
 */

// 定义Walrus服务的URL
const PUBLISHER_URL = "https://publisher.walrus-testnet.walrus.space/v1/blobs"
const AGGREGATOR_URL = "https://aggregator.walrus-testnet.walrus.space/v1/blobs"

/**
 * Upload a file to Walrus storage with fallback to Data URL
 * @param file File to upload
 * @param deletable Whether the file can be deleted
 * @param epochs Number of epochs to store the file
 * @returns URL of the uploaded file or Data URL as fallback
 */
export async function uploadFileToWalrus(file: File, deletable = false, epochs = 1): Promise<string> {
  try {
    console.log(`开始上传文件到 Walrus，文件类型: ${file.type}, 文件大小: ${file.size} 字节`)

    // 将文件转换为ArrayBuffer，然后转为Uint8Array
    const arrayBuffer = await file.arrayBuffer()
    const blob = new Uint8Array(arrayBuffer)

    // 构建查询参数
    const queryParams = new URLSearchParams({
      epochs: epochs.toString(),
      deletable: deletable.toString(),
    })

    // 使用fetch API直接上传到Walrus
    console.log(`正在上传到: ${PUBLISHER_URL}?${queryParams.toString()}`)

    const response = await fetch(`${PUBLISHER_URL}?${queryParams.toString()}`, {
      method: "PUT",
      body: blob,
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "无法获取错误详情")
      console.error(`上传失败，状态码: ${response.status}, 错误: ${errorText}`)
      throw new Error(`上传失败，状态码: ${response.status}`)
    }

    const data = await response.json()
    console.log("上传成功，返回数据:", data)

    // 从响应中获取blobId
    const blobId = data.newlyCreated?.blobObject?.blobId
    if (!blobId) {
      throw new Error("未能从响应中获取blobId")
    }

    // 构建可访问的URL
    const blobUrl = `${AGGREGATOR_URL}/${blobId}`
    console.log("创建的Blob URL:", blobUrl)

    return blobUrl
  } catch (error: any) {
    console.error("上传文件到 Walrus 失败:", error)

    // 记录详细错误信息以便调试
    if (error.message) {
      console.error("错误详情:", error.message)
    }
    if (error.stack) {
      console.error("错误堆栈:", error.stack)
    }

    // 使用 Data URL 作为备用方案
    console.log("使用Data URL作为备用方案")
    return convertToDataURL(file)
  }
}

/**
 * Convert a file to a Data URL
 * @param file File to convert
 * @returns Data URL
 */
async function convertToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Read a file from Walrus storage
 * @param blobId ID of the blob to read
 * @returns The blob data as a response
 */
export async function readFileFromWalrus(blobId: string): Promise<Response> {
  try {
    const response = await fetch(`${AGGREGATOR_URL}/${blobId}`)

    if (!response.ok) {
      throw new Error(`读取文件失败，状态码: ${response.status}`)
    }

    return response
  } catch (error) {
    console.error("从Walrus读取文件失败:", error)
    throw error
  }
}

/**
 * 从完整URL中提取blobId
 * @param url 完整的Walrus URL
 * @returns blobId
 */
export function extractBlobIdFromUrl(url: string): string | null {
  if (!url) return null

  try {
    // 尝试从URL中提取blobId
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split("/")
    return pathParts[pathParts.length - 1] || null
  } catch (error) {
    console.error("从URL提取blobId失败:", error)
    return null
  }
}

/**
 * 检查URL是否是有效的Walrus URL
 * @param url 要检查的URL
 * @returns 是否是有效的Walrus URL
 */
export function isWalrusUrl(url: string): boolean {
  if (!url) return false

  try {
    const urlObj = new URL(url)
    return urlObj.hostname.includes("walrus")
  } catch (error) {
    return false
  }
}
