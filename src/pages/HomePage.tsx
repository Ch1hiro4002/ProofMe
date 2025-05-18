"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCurrentWallet } from "@mysten/dapp-kit"
import { ConnectButton } from "@mysten/dapp-kit"
import { useSuiResume } from "../hooks/useSuiResume"
import { SocialBindButton } from "../components/SocialBindButton"
import "@mysten/dapp-kit/dist/index.css"
import "@radix-ui/themes/styles.css"

// Icons
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
)

const ExternalLinkIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
)

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
)

const SkeletonCard = () => (
  <div className="card">
    <div className="card-content">
      <div className="flex items-center gap-4 mb-4">
        <div className="skeleton h-16 w-16 rounded-full"></div>
        <div className="space-y-2">
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-3 w-32"></div>
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3 w-full"></div>
        <div className="skeleton h-3 w-3/4"></div>
      </div>
      <div className="flex flex-wrap gap-1 mt-4">
        <div className="skeleton h-6 w-16 rounded-full"></div>
        <div className="skeleton h-6 w-20 rounded-full"></div>
        <div className="skeleton h-6 w-12 rounded-full"></div>
      </div>
    </div>
    <div className="card-footer">
      <div className="skeleton h-9 w-full"></div>
    </div>
  </div>
)

const HomePage = () => {
  const { connectionStatus } = useCurrentWallet()
  const { loading, allResumes, hasResume, refreshAllResumes } = useSuiResume()
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [refreshing, setRefreshing] = useState(false)

  // Filter resumes based on search term
  const filteredResumes = allResumes.filter(
    (resume) =>
      resume.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resume.ability && resume.ability.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  // Handle create resume button click
  const handleCreateResume = () => {
    if (connectionStatus === "connected") {
      navigate("/create")
    } else if (connectionStatus === "disconnected") {
      alert("请先连接钱包")
    }
  }

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshAllResumes()
    setRefreshing(false)
  }

  // 自动刷新简历列表
  useEffect(() => {
    // 每60秒自动刷新一次
    const intervalId = setInterval(() => {
      refreshAllResumes()
    }, 60000)

    return () => clearInterval(intervalId)
  }, [refreshAllResumes])

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <h1 className="logo">ProofMe</h1>
            <div className="flex items-center gap-4">
              <button className="btn btn-outline" onClick={handleCreateResume}>
                <PlusIcon />
                <span>{hasResume ? "编辑简历" : "创建简历"}</span>
              </button>

              {/* 钱包链接按钮 */}
              <ConnectButton className="btn btn-primary" />

              {/* 添加社交绑定按钮 */}
              {connectionStatus === "connected" && <SocialBindButton className="btn btn-primary" />}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 flex-grow">
        <section className="mb-12">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">基于Sui区块链的去中心化简历系统</h2>
            <p className="text-gray-600 mb-6">在区块链上安全存储您的职业档案，完全由您控制，永久保存且防篡改</p>
            <div className="flex max-w-md mx-auto">
              <div className="relative flex-1">
                <div className="absolute left-2 top-2 text-gray-500"></div>
                <input
                  type="search"
                  placeholder="搜索技能、职位或姓名..."
                  className="w-full p-4 pl-8 border rounded"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="btn btn-primary ml-2">搜索</button>
            </div>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">发现人才</h3>
            <div className="flex items-center gap-4">
              <button
                className="btn btn-outline btn-sm flex items-center gap-1"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshIcon />
                <span>{refreshing ? "刷新中..." : "刷新"}</span>
              </button>
              <span className="text-sm text-gray-500">{filteredResumes.length} 个简历</span>
            </div>
          </div>

          {loading ? (
            <div className="resume-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : (
            <div className="resume-grid">
              {filteredResumes.length > 0 ? (
                filteredResumes.map((resume) => (
                  <div key={resume.id} className="resume-card flex flex-col">
                    <div className="resume-card-header">
                      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                        <img
                          src={resume.avatarUrl || "/placeholder.svg?height=64&width=64"}
                          alt={resume.name}
                          className="avatar avatar-medium"
                          onError={(e) => {
                            console.error("头像加载失败，使用占位图")
                            ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=64&width=64"
                          }}
                        />
                        <div className="text-center md:text-left">
                          <h4 className="font-bold text-lg">{resume.name}</h4>
                          <p>{resume.education}</p>
                        </div>
                      </div>
                    </div>
                    <div className="resume-card-body flex-grow">
                      <div className="mb-4">
                        <p className="text-sm">
                          <span className="font-medium">邮箱：</span>
                          {resume.mail}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">电话：</span>
                          {resume.number}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {resume.ability &&
                          resume.ability.map((skill, index) => (
                            <span key={index} className="badge badge-outline">
                              {skill}
                            </span>
                          ))}
                      </div>
                    </div>
                    <div className="resume-card-footer mt-auto">
                      <Link to={`/profile/${resume.id}`} className="w-full">
                        <button className="btn btn-outline w-full">
                          查看简历
                          <ExternalLinkIcon />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full empty-state">
                  <p className="empty-state-title">暂无简历数据</p>
                  <p className="empty-state-description">点击右上角"创建简历"按钮开始创建您的第一份简历</p>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="footer mt-auto">
        <div className="container">
          <div className="footer-content">
            <div>
              <h3>Sui简历系统</h3>
              <p className="text-gray-400">基于Sui区块链构建的去中心化简历平台</p>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">链接</h4>
              <ul>
                <li>
                  <a href="#">关于我们</a>
                </li>
                <li>
                  <a href="#">使用指南</a>
                </li>
                <li>
                  <a href="#">隐私政策</a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold mb-4">资源</h4>
              <ul>
                <li>
                  <a
                    href="https://sui.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Sui官网
                    <ExternalLinkIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.sui.io/references"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Sui开发文档
                    <ExternalLinkIcon />
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/Ch1hiro4002/ProofMe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    项目源码
                    <ExternalLinkIcon />
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">&copy; {new Date().getFullYear()} Sui简历系统</div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
