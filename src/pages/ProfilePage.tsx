"use client"

import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { suiClient } from "../networkConfig"
import type { ExperienceItem, AchievementItem } from "../types/resume-types"

// Icons
const ArrowLeftIcon = () => (
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
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
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

const CheckCircleIcon = () => (
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
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
)

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.643 4.093c-.833.372-1.734.636-2.69.75a9.56 9.56 0 0 1-3.262-3.817 9.729 9.729 0 0 0 6.765 2.472c-.942-.56-1.985-.965-3.092-1.184a4.781 4.781 0 0 0-8.137 4.548c0 .362.05.71.14 1.041-3.983-.201-7.518-2.11-9.91-5.272a4.773 4.773 0 0 0-.646 2.385c0 1.648.829 3.09 2.093 3.952-.771-.025-1.499-.237-2.149-.601v.061a4.779 4.779 0 0 0 3.833 4.697c-.92.247-1.78.381-2.687.381-.173 0-.342-.01-.513-.01a4.779 4.779 0 0 0 4.463 3.311c-2.935 1.916-6.675 2.98-10.584 2.98-.693 0-1.372-.04-2.06-.116a13.636 13.636 0 0 0 24.754-14.759c.453-.764.707-1.547.887-2.333z" />
  </svg>
)

// Skeleton loader component
const ProfileSkeleton = () => (
  <div className="flex flex-col min-h-screen bg-white">
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="skeleton h-6 w-24"></div>
          <div className="flex items-center gap-2">
            <div className="skeleton h-9 w-20"></div>
            <div className="skeleton h-9 w-20"></div>
            <div className="skeleton h-9 w-20"></div>
          </div>
        </div>
      </div>
    </header>

    <main className="container py-8 flex-grow">
      <div className="max-w-4xl mx-auto">
        <div className="card mb-8">
          <div className="bg-black p-8">
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <div className="skeleton h-32 w-32 rounded-full"></div>
              <div className="w-full md:w-2/3">
                <div className="skeleton h-8 w-48 mb-2"></div>
                <div className="skeleton h-6 w-32 mb-4"></div>
                <div className="flex flex-wrap gap-2">
                  <div className="skeleton h-6 w-16"></div>
                  <div className="skeleton h-6 w-20"></div>
                  <div className="skeleton h-6 w-24"></div>
                  <div className="skeleton h-6 w-16"></div>
                </div>
              </div>
            </div>
          </div>
          <div className="card-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="skeleton h-6 w-24 mb-3"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-full mb-2"></div>
                <div className="skeleton h-4 w-3/4"></div>
              </div>
              <div>
                <div className="skeleton h-6 w-24 mb-3"></div>
                <div className="space-y-2">
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                  <div className="skeleton h-4 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="skeleton h-10 w-full mb-8"></div>
          <div className="skeleton h-6 w-32 mb-4"></div>
          <div className="space-y-6">
            <div className="skeleton h-32 w-full"></div>
            <div className="skeleton h-32 w-full"></div>
          </div>
        </div>
      </div>
    </main>

    <footer className="footer">
      <div className="container text-center">
        <p className="text-gray-400">&copy; {new Date().getFullYear()} Sui简历系统 | 黑客松MVP演示</p>
      </div>
    </footer>
  </div>
)

const ProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("ability")

  useEffect(() => {
    // Fetch resume data from blockchain
    const fetchProfile = async () => {
      try {
        setLoading(true)

        // Get the resume object from Sui
        const { data: resumeObject } = await suiClient.getObject({
          id: id || "",
          options: {
            showContent: true,
            showDisplay: true,
          },
        })

        if (resumeObject && resumeObject.content) {
          const content = resumeObject.content as any
          const fields = content.fields

          if (fields) {
            console.log("Resume fields:", fields)

            // 解析abilities数组
            let abilities: string[] = []
            if (fields.abilities && Array.isArray(fields.abilities)) {
              abilities = fields.abilities
            }

            // 解析experiences数组 - 现在是复杂对象
            let experiences: ExperienceItem[] = []
            if (fields.experiences && Array.isArray(fields.experiences)) {
              experiences = fields.experiences.map((exp: any) => {
                // 检查是否已经是正确的格式
                if (typeof exp === "object" && exp.fields) {
                  return {
                    experience: exp.fields.experience,
                    verification: exp.fields.verification,
                  }
                }
                // 兼容旧格式
                return {
                  experience: typeof exp === "string" ? exp : String(exp),
                  verification: false,
                }
              })
            }

            // 解析achievements数组 - 现在是复杂对象
            let achievements: AchievementItem[] = []
            if (fields.achievements && Array.isArray(fields.achievements)) {
              achievements = fields.achievements.map((ach: any) => {
                // 检查是否已经是正确的格式
                if (typeof ach === "object" && ach.fields) {
                  return {
                    achievement: ach.fields.achievement,
                    verification: ach.fields.verification,
                  }
                }
                // 兼容旧格式
                return {
                  achievement: typeof ach === "string" ? ach : String(ach),
                  verification: false,
                }
              })
            }

            // Format the resume data
            const resume = {
              id: resumeObject.objectId,
              owner: fields.owner,
              name: fields.name,
              date: fields.date,
              education: fields.education,
              mail: fields.mail,
              number: fields.number,
              ability: abilities,
              experiences: experiences,
              achievements: achievements,
              avatarUrl: fields.avatar || "", // 使用合约中的avatar字段
              twitterUsername: fields.twitterUsername, // 添加Twitter用户名
            }

            setProfile(resume)
          }
        }
      } catch (error) {
        console.error("获取简历数据失败:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProfile()
    }
  }, [id])

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="flex flex-col min-h-screen">
        <header className="header">
          <div className="container">
            <div className="header-content">
              <h1 className="logo">Sui简历系统</h1>
              <Link to="/" className="btn btn-outline">
                返回首页
              </Link>
            </div>
          </div>
        </header>

        <main className="container py-12 flex-grow flex items-center justify-center">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4">简历未找到</h2>
            <p className="text-gray-600 mb-6">无法找到ID为 {id} 的简历，该简历可能不存在或已被删除。</p>
            <Link to="/">
              <button className="btn btn-primary">返回首页</button>
            </Link>
          </div>
        </main>

        <footer className="footer">
          <div className="container text-center">
            <p className="text-gray-400">&copy; {new Date().getFullYear()} Sui简历系统 | 黑客松MVP演示</p>
          </div>
        </footer>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black">
              <ArrowLeftIcon />
              返回首页
            </Link>
            <div className="flex items-center gap-2">
              <a
                href={`https://explorer.sui.io/object/${profile.id}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <ExternalLinkIcon />
                在浏览器中查看
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 flex-grow">
        <div className="max-w-4xl mx-auto">
          {/* 个人资料卡 */}
          <div className="card mb-8">
            <div className="bg-black text-white p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <img
                  src={profile.avatarUrl || "/placeholder.svg?height=200&width=200"}
                  alt={profile.name}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover"
                  onError={(e) => {
                    // 如果头像加载失败，使用占位图
                    console.error("头像加载失败，使用占位图")
                    ;(e.target as HTMLImageElement).src = "/placeholder.svg?height=200&width=200"
                  }}
                />
                <div className="text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{profile.name}</h1>
                  <p className="text-xl mb-4">{profile.education}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-2">
                    {profile.ability &&
                      profile.ability.slice(0, 4).map((skill: string, index: number) => (
                        <span key={index} className="badge bg-white text-black hover:bg-gray-200">
                          {skill}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="card-content">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">出生日期</h3>
                  <p className="text-gray-600">{profile.date}</p>
                </div>
                {/* 添加Twitter信息，如果有的话 */}
                <div>
                  <h3 className="font-semibold mb-3">联系方式</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">邮箱:</span>
                      <span>{profile.mail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">电话:</span>
                      <span>{profile.number}</span>
                    </div>

                    {profile.twitterUsername && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">Twitter:</span>
                        <a
                          href={`https://twitter.com/${profile.twitterUsername.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline flex items-center gap-1"
                        >
                          <TwitterIcon className="h-4 w-4" />
                          {profile.twitterUsername}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 详细信息标签页 */}
          <div className="tabs mb-12">
            <div className="tabs-list">
              <div className={`tab ${activeTab === "ability" ? "active" : ""}`} onClick={() => setActiveTab("ability")}>
                技能
              </div>
              <div
                className={`tab ${activeTab === "experiences" ? "active" : ""}`}
                onClick={() => setActiveTab("experiences")}
              >
                工作经验
              </div>
              <div
                className={`tab ${activeTab === "achievements" ? "active" : ""}`}
                onClick={() => setActiveTab("achievements")}
              >
                荣誉成就
              </div>
            </div>

            <div className={`tab-content ${activeTab === "ability" ? "active" : ""}`}>
              <h3 className="text-xl font-bold mb-4">技能</h3>
              {profile.ability && profile.ability.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {profile.ability.map((skill: string, index: number) => (
                    <div key={index} className="card">
                      <div className="card-content">
                        <h4 className="font-medium">{skill}</h4>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">暂无技能信息</p>
                  <p className="empty-state-description">该用户尚未添加任何技能信息</p>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === "experiences" ? "active" : ""}`}>
              <h3 className="text-xl font-bold mb-4">工作经验</h3>
              {profile.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-4">
                  {profile.experiences.map((exp: ExperienceItem, index: number) => (
                    <div key={index} className="card">
                      <div className="card-content">
                        <div className="flex items-start gap-2">
                          <div className="flex-grow">
                            <p>{exp.experience}</p>
                          </div>
                          {exp.verification && (
                            <div className="flex items-center text-green-600">
                              <CheckCircleIcon />
                              <span className="ml-1 text-sm">已验证</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">暂无工作经验信息</p>
                  <p className="empty-state-description">该用户尚未添加任何工作经验</p>
                </div>
              )}
            </div>

            <div className={`tab-content ${activeTab === "achievements" ? "active" : ""}`}>
              <h3 className="text-xl font-bold mb-4">荣誉成就</h3>
              {profile.achievements && profile.achievements.length > 0 ? (
                <div className="space-y-4">
                  {profile.achievements.map((achievement: AchievementItem, index: number) => (
                    <div key={index} className="card">
                      <div className="card-content">
                        <div className="flex items-start gap-2">
                          <div className="flex-grow">
                            <p>{achievement.achievement}</p>
                          </div>
                          {achievement.verification && (
                            <div className="flex items-center text-green-600">
                              <CheckCircleIcon />
                              <span className="ml-1 text-sm">已验证</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p className="empty-state-title">暂无荣誉成就信息</p>
                  <p className="empty-state-description">该用户尚未添加任何荣誉成就</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-8">
            <h3 className="text-xl font-bold mb-4">区块链验证</h3>
            <p className="text-gray-600 mb-4">
              此简历存储在Sui区块链上，确保数据的真实性和不可篡改性。您可以通过以下对象ID验证简历数据。
            </p>
            <div className="bg-white p-4 rounded border border-gray-200 font-mono text-sm break-all">{profile.id}</div>
            <div className="mt-4 flex justify-end">
              <a
                href={`https://explorer.sui.io/object/${profile.id}?network=testnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <ExternalLinkIcon />
                在Sui浏览器中查看
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className="footer">
        <div className="container text-center">
          <p className="text-gray-400">&copy; {new Date().getFullYear()} Sui简历系统 | 黑客松MVP演示</p>
        </div>
      </footer>
    </div>
  )
}

export default ProfilePage
