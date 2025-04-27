// CreateResumePage.tsx
import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { useCurrentWallet } from "@mysten/dapp-kit"
import { useSuiResume } from "../hooks/useSuiResume"

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

const TrashIcon = () => (
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
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
)

const LoadingIcon = () => (
  <svg
    className="animate-spin"
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
    <line x1="12" y1="2" x2="12" y2="6"></line>
    <line x1="12" y1="18" x2="12" y2="22"></line>
    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
    <line x1="2" y1="12" x2="6" y2="12"></line>
    <line x1="18" y1="12" x2="22" y2="12"></line>
    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
  </svg>
)

// 学历选项
const EDUCATION_OPTIONS = ["高中", "大专", "本科", "硕士", "博士", "其他"]

const CreateResumePage = () => {
  const { connectionStatus } = useCurrentWallet();
  const { loading, hasResume, userResume, error, createResume, addAbility, addExperience, addAchievement } =
    useSuiResume()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [submitting, setSubmitting] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // 基本信息表单状态
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    date: "", // birthdate
    education: "",
    mail: "", // email
    number: "", // phone
    avatarUrl: "",
  })

  // 技能表单状态
  const [abilityInput, setAbilityInput] = useState("")

  // 工作经验表单状态
  const [experienceInput, setExperienceInput] = useState("")

  // 成就表单状态
  const [achievementInput, setAchievementInput] = useState("")

  // 填充已有的简历数据
  useEffect(() => {
    if (hasResume && userResume) {
      setBasicInfo({
        name: userResume.name || "",
        date: userResume.date || "",
        education: userResume.education || "",
        mail: userResume.mail || "",
        number: userResume.number || "",
        avatarUrl: userResume.avatarUrl || "",
      })

      // 如果有头像，设置预览
      if (userResume.avatarUrl) {
        setAvatarPreview(userResume.avatarUrl)
      }
    }
  }, [hasResume, userResume])

  // 处理基本信息变更
  const handleBasicInfoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBasicInfo((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // 处理头像上传
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      showNotification("error", "请上传图片文件")
      return
    }

    // 验证文件大小 (最大2MB)
    if (file.size > 2 * 1024 * 1024) {
      showNotification("error", "图片大小不能超过2MB")
      return
    }

    setAvatarFile(file)

    // 创建预览
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // 上传头像到Walrus存储
  const uploadAvatarToWalrus = async (file: File): Promise<string> => {
    try {
      // 模拟上传到Walrus存储
      // 实际实现中，您需要调用Walrus API
      console.log("上传头像到Walrus存储:", file)

      // 模拟上传延迟
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 返回模拟的URL
      // 实际实现中，这应该是Walrus返回的URL
      return `https://walrus.storage/${Date.now()}-${file.name}`
    } catch (error) {
      console.error("上传头像失败:", error)
      throw new Error("上传头像失败，请重试")
    }
  }

  // 创建简历
  const handleCreateResume = async (e: React.FormEvent) => {
    e.preventDefault()

    if (connectionStatus === 'disconnected') {
      showNotification("error", "请先连接钱包")
      return
    }

    // 验证必填字段
    if (!basicInfo.name || !basicInfo.date || !basicInfo.education || !basicInfo.mail || !basicInfo.number) {
      showNotification("error", "请填写所有必填字段")
      return
    }

    // 验证头像
    if (!avatarFile && !avatarPreview) {
      showNotification("error", "请上传头像")
      return
    }

    try {
      setSubmitting(true)

      // 如果有新头像，上传到Walrus
      let avatarUrl = basicInfo.avatarUrl
      if (avatarFile) {
        avatarUrl = await uploadAvatarToWalrus(avatarFile)
      }

      // 调用合约创建简历
      await createResume({
        ...basicInfo,
        avatarUrl,
      })

      showNotification("success", "简历创建成功")

      // 清除头像文件
      setAvatarFile(null)
    } catch (error) {
      console.error("创建简历失败:", error)
      showNotification("error", "创建简历失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // 添加技能
  const handleAddAbility = async (e: React.FormEvent) => {
    e.preventDefault()

    if (connectionStatus === 'disconnected') {
      showNotification("error", "请先连接钱包")
      return
    }

    if (!abilityInput) {
      showNotification("error", "请输入技能")
      return
    }

    try {
      setSubmitting(true)

      // 调用合约添加技能
      await addAbility(abilityInput)

      // 重置表单
      setAbilityInput("")

      showNotification("success", "技能添加成功")
    } catch (error) {
      console.error("添加技能失败:", error)
      showNotification("error", "添加技能失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // 添加工作经验
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault()

    if (connectionStatus === 'disconnected') {
      showNotification("error", "请先连接钱包")
      return
    }

    if (!experienceInput) {
      showNotification("error", "请输入工作经验")
      return
    }

    try {
      setSubmitting(true)

      // 调用合约添加工作经验
      await addExperience(experienceInput)

      // 重置表单
      setExperienceInput("")

      showNotification("success", "工作经验添加成功")
    } catch (error) {
      console.error("添加工作经验失败:", error)
      showNotification("error", "添加工作经验失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // 添加成就
  const handleAddAchievement = async (e: React.FormEvent) => {
    e.preventDefault()

    if (connectionStatus === 'disconnected') {
      showNotification("error", "请先连接钱包")
      return
    }

    if (!achievementInput) {
      showNotification("error", "请输入成就")
      return
    }

    try {
      setSubmitting(true)

      // 调用合约添加成就
      await addAchievement(achievementInput)

      // 重置表单
      setAchievementInput("")

      showNotification("success", "成就添加成功")
    } catch (error) {
      console.error("添加成就失败:", error)
      showNotification("error", "添加成就失败，请重试")
    } finally {
      setSubmitting(false)
    }
  }

  // 显示通知
  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })

    // 3秒后自动关闭
    setTimeout(() => {
      setNotification(null)
    }, 3000)
  }

  // 如果未连接钱包，显示提示
  if (connectionStatus === 'disconnected') {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl font-bold mb-6">创建您的区块链简历</h1>
            <p className="text-gray-600 mb-8">请先连接您的Sui钱包以继续操作</p>
            <button className="btn btn-primary" onClick={() => navigate("/")}>
              返回首页连接钱包
            </button>
          </div>
        </div>
      </div>
    )
  }

  // 加载中
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <LoadingIcon />
            </div>
            <p className="text-gray-600">正在加载您的简历信息...</p>
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
        <div className="max-w-4xl mx-auto">
          {/* 通知 */}
          {notification && (
            <div
              className={`p-4 mb-6 rounded-lg ${
                notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {notification.message}
            </div>
          )}

          {/* 错误提示 */}
          {error && <div className="p-4 mb-6 rounded-lg bg-red-100 text-red-800">{error}</div>}

          <h1 className="text-2xl font-bold mb-6">{hasResume ? "编辑您的简历" : "创建您的简历"}</h1>

          {/* 基本信息表单 - 只有在没有简历时显示 */}
          {!hasResume && (
            <div className="card mb-8">
              <div className="card-content">
                <h2 className="text-xl font-semibold mb-4">基本信息</h2>

                <form onSubmit={handleCreateResume}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* 姓名 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        姓名 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={basicInfo.name}
                        onChange={handleBasicInfoChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* 出生年月日 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        出生年月日 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={basicInfo.date}
                        onChange={handleBasicInfoChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* 学历 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        学历 <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="education"
                        value={basicInfo.education}
                        onChange={handleBasicInfoChange}
                        className="w-full p-2 border rounded"
                        required
                      >
                        <option value="">请选择</option>
                        {EDUCATION_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 邮箱 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        邮箱 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="mail"
                        value={basicInfo.mail}
                        onChange={handleBasicInfoChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>

                    {/* 手机号码 */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        手机号码 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        name="number"
                        value={basicInfo.number}
                        onChange={handleBasicInfoChange}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </div>
                  </div>

                  {/* 头像上传 */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">
                      头像 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      {avatarPreview ? (
                        <div className="relative">
                          <img
                            src={avatarPreview || "/placeholder.svg"}
                            alt="头像预览"
                            className="w-24 h-24 rounded-full object-cover border"
                          />
                          <button
                            type="button"
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            onClick={() => {
                              setAvatarPreview(null)
                              setAvatarFile(null)
                              if (fileInputRef.current) {
                                fileInputRef.current.value = ""
                              }
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      ) : (
                        <div
                          className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer border"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <PlusIcon />
                        </div>
                      )}
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                        <button type="button" className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
                          {avatarPreview ? "更换头像" : "上传头像"}
                        </button>
                        <p className="text-sm text-gray-500 mt-1">支持JPG、PNG格式，大小不超过2MB</p>
                      </div>
                    </div>
                  </div>

                  {/* 提交按钮 */}
                  <div className="flex justify-end">
                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                      {submitting ? (
                        <>
                          <LoadingIcon />
                          <span>处理中...</span>
                        </>
                      ) : (
                        "创建简历"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 如果已有简历，显示额外的表单 */}
          {hasResume && userResume && (
            <>
              {/* 技能表单 */}
              <div className="card mb-8">
                <div className="card-content">
                  <h2 className="text-xl font-semibold mb-4">个人技能</h2>

                  {/* 已添加的技能 */}
                  {userResume.ability && userResume.ability.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">已添加的技能</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userResume.ability.map((skill, index) => (
                          <div key={index} className="border rounded p-4">
                            <h4 className="font-medium">{skill}</h4>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 添加新技能表单 */}
                  <form onSubmit={handleAddAbility}>
                    <h3 className="text-lg font-medium mb-3">添加新技能</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        技能描述 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={abilityInput}
                        onChange={(e) => setAbilityInput(e.target.value)}
                        className="w-full p-2 border rounded"
                        placeholder="例如：精通React开发，3年经验"
                        required
                      />
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                          <>
                            <LoadingIcon />
                            <span>处理中...</span>
                          </>
                        ) : (
                          "添加技能"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* 工作经验表单 */}
              <div className="card mb-8">
                <div className="card-content">
                  <h2 className="text-xl font-semibold mb-4">工作经验</h2>

                  {/* 已添加的工作经验 */}
                  {userResume.experiences && userResume.experiences.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">已添加的工作经验</h3>
                      <div className="space-y-4">
                        {userResume.experiences.map((exp, index) => (
                          <div key={index} className="border rounded p-4">
                            <p>{exp}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 添加新工作经验表单 */}
                  <form onSubmit={handleAddExperience}>
                    <h3 className="text-lg font-medium mb-3">添加新工作经验</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        工作经验描述 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={experienceInput}
                        onChange={(e) => setExperienceInput(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="例如：2020年1月-2022年6月，ABC科技有限公司，前端开发工程师，负责公司核心产品的前端开发"
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                          <>
                            <LoadingIcon />
                            <span>处理中...</span>
                          </>
                        ) : (
                          "添加工作经验"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* 荣誉成就表单 */}
              <div className="card mb-8">
                <div className="card-content">
                  <h2 className="text-xl font-semibold mb-4">荣誉成就</h2>

                  {/* 已添加的荣誉成就 */}
                  {userResume.achievements && userResume.achievements.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium mb-3">已添加的荣誉成就</h3>
                      <div className="space-y-4">
                        {userResume.achievements.map((achievement, index) => (
                          <div key={index} className="border rounded p-4">
                            <p>{achievement}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 添加新荣誉成就表单 */}
                  <form onSubmit={handleAddAchievement}>
                    <h3 className="text-lg font-medium mb-3">添加新荣誉成就</h3>
                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">
                        荣誉成就描述 <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        className="w-full p-2 border rounded"
                        rows={3}
                        placeholder="例如：2023年，获得Sui区块链开发者认证"
                        required
                      ></textarea>
                    </div>
                    <div className="flex justify-end">
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                          <>
                            <LoadingIcon />
                            <span>处理中...</span>
                          </>
                        ) : (
                          "添加荣誉成就"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </>
          )}
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

export default CreateResumePage
