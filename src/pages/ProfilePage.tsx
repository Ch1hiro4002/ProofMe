// ProfilePage.tsx
import { useState, useEffect } from "react"
import { Link, useParams } from "react-router-dom"
import { suiClient } from "../networkConfig"

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

// Skeleton loader component
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-white">
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

    <main className="container py-8">
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
            // Format the resume data
            const resume = {
              id: resumeObject.objectId,
              owner: fields.owner,
              name: fields.name,
              avatarUrl: fields.avatar_url,
              date: fields.date,
              education: fields.education,
              mail: fields.mail,
              number: fields.number,
              ability: parseOptionVector(fields.ability),
              experiences: parseOptionVector(fields.experiences),
              achievements: parseOptionVector(fields.achievements),
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

  // Helper function to parse Option<vector<String>> from Move
  function parseOptionVector(field: any): string[] | null {
    if (!field || !field.fields || !field.fields.vec || !field.fields.vec.fields || !field.fields.vec.fields.contents) {
      return null
    }

    return field.fields.vec.fields.contents.map((item: any) => item)
  }

  if (loading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold mb-4">简历未找到</h2>
        <p className="text-gray-600 mb-6">无法找到ID为 {id} 的简历，该简历可能不存在或已被删除。</p>
        <Link to="/">
          <button className="btn btn-primary">返回首页</button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="flex items-center gap-2 text-gray-600 hover:text-black">
              <ArrowLeftIcon />
              返回首页
            </Link>
            <div className="flex items-center gap-2">
              <a
                href={`https://explorer.sui.io/object/${profile.id}?network=devnet`}
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

      <main className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* 个人资料卡 */}
          <div className="card mb-8">
            <div className="bg-black text-white p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                <img
                  src={profile.avatarUrl || "/placeholder.svg"}
                  alt={profile.name}
                  className="h-32 w-32 rounded-full border-4 border-white"
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
                <p className="text-gray-600">暂无技能信息</p>
              )}
            </div>

            <div className={`tab-content ${activeTab === "experiences" ? "active" : ""}`}>
              <h3 className="text-xl font-bold mb-4">工作经验</h3>
              {profile.experiences && profile.experiences.length > 0 ? (
                <div className="space-y-4">
                  {profile.experiences.map((experience: string, index: number) => (
                    <div key={index} className="card">
                      <div className="card-content">
                        <p>{experience}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">暂无工作经验信息</p>
              )}
            </div>

            <div className={`tab-content ${activeTab === "achievements" ? "active" : ""}`}>
              <h3 className="text-xl font-bold mb-4">荣誉成就</h3>
              {profile.achievements && profile.achievements.length > 0 ? (
                <div className="space-y-4">
                  {profile.achievements.map((achievement: string, index: number) => (
                    <div key={index} className="card">
                      <div className="card-content">
                        <p>{achievement}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">暂无荣誉成就信息</p>
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
                href={`https://explorer.sui.io/object/${profile.id}?network=devnet`}
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
