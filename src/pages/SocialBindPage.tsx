"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentWallet, useSignPersonalMessage, useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "react-hot-toast"
import { TwitterIcon, LinkIcon, CheckCircleIcon, XCircleIcon, LoaderIcon } from "lucide-react"

// 定义Twitter绑定状态类型
type TwitterBindingStatus = {
  isBound: boolean
  username?: string
  boundAt?: string
}

const SocialBindPage = () => {
  const navigate = useNavigate()
  const { connectionStatus } = useCurrentWallet()
  const currentAccount = useCurrentAccount()
  const { mutate: signMessage } = useSignPersonalMessage()

  const [twitterStatus, setTwitterStatus] = useState<TwitterBindingStatus>({ isBound: false })
  const [isLoading, setIsLoading] = useState(false)
  const [verificationInProgress, setVerificationInProgress] = useState(false)

  // 模拟从后端获取绑定状态
  useEffect(() => {
    if (connectionStatus === "connected" && currentAccount) {
      // 这里应该是从你的后端API获取绑定状态
      // 这里使用模拟数据
      const mockFetch = async () => {
        setIsLoading(true)
        try {
          // 模拟API调用延迟
          await new Promise((resolve) => setTimeout(resolve, 1000))

          // 模拟数据 - 实际应用中应该从后端获取
          const mockStatus: TwitterBindingStatus = {
            isBound: false,
            // 如果已绑定，这里会有username和boundAt
          }

          setTwitterStatus(mockStatus)
        } catch (error) {
          console.error("获取绑定状态失败:", error)
          toast.error("获取绑定状态失败")
        } finally {
          setIsLoading(false)
        }
      }

      mockFetch()
    }
  }, [connectionStatus, currentAccount])

  // 开始Twitter绑定流程
  const startTwitterBinding = async () => {
    if (connectionStatus !== "connected") {
      toast.error("请先连接钱包")
      return
    }

    try {
      setIsLoading(true)

      // 1. 生成一个随机的挑战字符串
      const challenge = generateRandomChallenge()

      // 2. 让用户用钱包签名这个挑战
      const messageToSign = `验证钱包所有权以绑定Twitter账户\n\n挑战码: ${challenge}\n地址: ${currentAccount?.address}\n时间戳: ${Date.now()}`

      // 使用 Promise 方式获取签名
      let signature = ""
      try {
        // 调用签名方法
        await signMessage({
          message: new TextEncoder().encode(messageToSign),
        })

        // 确保有签名结果
        if (!signature) {
          throw new Error("未能获取签名")
        }

        // 4. 准备重定向到Twitter OAuth页面
        const twitterOAuthUrl = await getTwitterOAuthUrl(currentAccount?.address || "", challenge, signature)

        // 5. 重定向到Twitter授权页面
        window.location.href = twitterOAuthUrl
      } catch (error) {
        console.error("启动Twitter绑定流程失败:", error)
        toast.error("启动绑定流程失败，请重试")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("启动Twitter绑定流程失败:", error)
      toast.error("启动绑定流程失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 解绑Twitter账户
  const unbindTwitter = async () => {
    if (!twitterStatus.isBound) return

    try {
      setIsLoading(true)

      // 调用后端API解绑账户
      // 实际实现中需要调用你的后端API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast.success("Twitter账户解绑成功")
      setTwitterStatus({ isBound: false })
    } catch (error) {
      console.error("解绑Twitter账户失败:", error)
      toast.error("解绑失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 生成随机挑战字符串
  const generateRandomChallenge = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  // 获取Twitter OAuth URL
  // 实际应用中，这个函数应该调用你的后端API
  const getTwitterOAuthUrl = async (address: string, challenge: string, signature: string): Promise<string> => {
    // 模拟API调用
    // 实际应用中，你需要调用后端API获取Twitter OAuth URL
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 这是一个模拟的URL，实际应用中应该从后端获取
    // 后端会创建一个包含state参数的OAuth URL，state参数包含钱包地址、挑战和签名
    const mockTwitterOAuthUrl = `https://your-backend.com/api/twitter/oauth?address=${address}&challenge=${challenge}&signature=${encodeURIComponent(signature)}`

    // 在实际应用中，你的后端会生成一个真实的Twitter OAuth URL
    // 用户授权后，Twitter会将用户重定向回你的应用，并带上授权码
    // 然后你的应用会用这个授权码换取访问令牌，并完成绑定过程

    // 为了演示，我们假设这个URL会将用户重定向到一个模拟的验证页面
    setVerificationInProgress(true)

    // 模拟重定向后的回调处理
    setTimeout(() => {
      // 模拟绑定成功
      setTwitterStatus({
        isBound: true,
        username: "@user123456",
        boundAt: new Date().toISOString(),
      })
      setVerificationInProgress(false)
      toast.success("Twitter账户绑定成功!")
    }, 3000)

    return mockTwitterOAuthUrl
  }

  // 如果未连接钱包，显示提示
  if (connectionStatus !== "connected") {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">绑定社交账户</h1>
            <p className="text-gray-600 mb-8">请先连接您的Sui钱包以继续操作</p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              返回首页连接钱包
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">Sui简历系统</h1>
            <button className="btn btn-outline" onClick={() => navigate("/")}>
              返回首页
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">社交账户绑定</h1>

          <div className="card mb-8">
            <div className="card-content">
              <h2 className="text-xl font-semibold mb-4">钱包信息</h2>
              <div className="p-4 bg-gray-50 rounded-lg mb-4">
                <p className="font-mono break-all">
                  <span className="font-semibold">地址: </span>
                  {currentAccount?.address}
                </p>
              </div>
              <p className="text-gray-600 mb-4">绑定社交账户可以增强您的简历可信度，并获得更多功能。</p>
            </div>
          </div>

          <div className="card mb-8">
            <div className="card-content">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <TwitterIcon className="h-6 w-6 text-[#1DA1F2]" />
                  <h2 className="text-xl font-semibold">Twitter账户</h2>
                </div>

                {twitterStatus.isBound ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="h-4 w-4 mr-1" />
                    已绑定
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    未绑定
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex justify-center py-6">
                  <LoaderIcon className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : verificationInProgress ? (
                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center">
                    <LoaderIcon className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                    <p className="text-blue-700">Twitter验证进行中，请稍候...</p>
                  </div>
                </div>
              ) : twitterStatus.isBound ? (
                <div>
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-semibold">用户名:</span>
                      <span className="text-blue-600">{twitterStatus.username}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">绑定时间:</span>
                      <span>{new Date(twitterStatus.boundAt || "").toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      className="btn btn-outline text-red-600 border-red-300 hover:bg-red-50"
                      onClick={unbindTwitter}
                      disabled={isLoading}
                    >
                      解除绑定
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-gray-600 mb-4">
                    绑定您的Twitter账户可以验证您的身份，并在简历中显示您的社交媒体信息。
                  </p>

                  <div className="flex justify-end">
                    <button
                      className="btn btn-primary flex items-center gap-2"
                      onClick={startTwitterBinding}
                      disabled={isLoading}
                    >
                      <TwitterIcon className="h-4 w-4" />
                      绑定Twitter账户
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-gray-500" />
              绑定流程说明
            </h3>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>点击"绑定Twitter账户"按钮</li>
              <li>使用钱包签名验证消息，证明您是钱包所有者</li>
              <li>授权应用访问您的Twitter账户</li>
              <li>系统将自动完成绑定过程</li>
              <li>绑定成功后，您的Twitter信息将显示在您的简历中</li>
            </ol>
          </div>
        </div>
      </main>

      <footer className="footer mt-auto">
        <div className="container">
          <div className="footer-bottom">&copy; {new Date().getFullYear()} Sui简历系统</div>
        </div>
      </footer>
    </div>
  )
}

export default SocialBindPage
