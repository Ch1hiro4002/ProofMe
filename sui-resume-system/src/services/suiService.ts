import { Transaction } from "@mysten/sui/transactions"
import { networkConfig, suiClient } from "../networkConfig"
import type { Resume, ResumeState } from "../types/resume-types"


const PACKAGE_ID = networkConfig.testnet.package
const MODULE_NAME = "resume"
const RESUME_MANAGER_ID = networkConfig.testnet.ResumeManager


export interface ResumeBasicInfo {
  name: string
  avatarUrl?: string
  date: string
  education: string
  mail: string
  number: string
}

/**
 * 通过事件查询获取所有简历
 */
export async function queryResumeState(): Promise<ResumeState> {
  console.log("开始通过事件查询获取所有简历")

  // 创建初始状态
  const state: ResumeState = {
    resumes: [],
  }

  try {
    // 1. 查询所有 ResumeCreated 事件
    const resumeEvents = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ResumeCreated`,
      },
      limit: 50, // 限制返回数量
    })

    console.log(`找到 ${resumeEvents.data.length} 个 ResumeCreated 事件`)

    // 2. 从事件中提取简历ID和所有者
    const resumeIds = new Map<string, string>() // Map<resumeId, owner>

    for (const event of resumeEvents.data) {
      try {
        const eventData = event.parsedJson as any
        if (eventData && eventData.resume && eventData.user) {
          resumeIds.set(eventData.resume, eventData.user)
        }
      } catch (error) {
        console.error("解析 ResumeCreated 事件失败:", error)
      }
    }

    console.log(`提取了 ${resumeIds.size} 个简历ID`)

    // 3. 获取每个简历对象的详细信息
    for (const [resumeId, owner] of resumeIds.entries()) {
      try {
        // 获取简历对象
        const { data: resumeObject } = await suiClient.getObject({
          id: resumeId,
          options: {
            showContent: true,
          },
        })

        if (resumeObject && resumeObject.content) {
          const content = resumeObject.content as any
          const fields = content.fields

          if (fields) {
            // 创建简历对象
            const resume: Resume = {
              id: resumeId,
              owner: owner,
              name: fields.name || "",
              date: fields.date || "",
              education: fields.education || "",
              mail: fields.mail || "",
              number: fields.number || "",
              ability: fields.abilities || [],
              experiences: parseExperiences(fields.experiences || []),
              achievements: parseAchievements(fields.achievements || []),
            }

            // 尝试从本地存储获取头像URL
            try {
              const storedAvatarUrl = localStorage.getItem(`resume_avatar_url_${owner}`)
              if (storedAvatarUrl) {
                resume.avatarUrl = storedAvatarUrl
              }
            } catch (e) {
              console.log("无法访问localStorage，可能是在服务器端运行")
            }

            // 添加到状态中
            state.resumes.push(resume)
          }
        }
      } catch (error) {
        console.error(`获取简历 ${resumeId} 详细信息失败:`, error)
      }
    }

    console.log(`总共获取到 ${state.resumes.length} 个简历`)
    return state
  } catch (error) {
    console.error("查询简历状态失败:", error)
    return state
  }
}

// 解析经验数组
function parseExperiences(experiences: any[]): string[] {
  if (!experiences || !Array.isArray(experiences)) {
    return []
  }
  return experiences.map((exp: any) => {
    if (typeof exp === "string") return exp
    return exp.experience || exp.toString()
  })
}

// 解析成就数组
function parseAchievements(achievements: any[]): string[] {
  if (!achievements || !Array.isArray(achievements)) {
    return []
  }
  return achievements.map((ach: any) => {
    if (typeof ach === "string") return ach
    return ach.achievement || ach.toString()
  })
}

/**
 * Check if a user has a resume
 * @param address User's wallet address
 * @returns Boolean indicating if the user has a resume
 */
export async function checkUserHasResume(address: string): Promise<boolean> {
  try {
    // 查询该用户的 ResumeCreated 事件
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ResumeCreated`,
      },
      limit: 50,
    })

    // 检查事件中是否有该用户的简历
    for (const event of events.data) {
      try {
        const eventData = event.parsedJson as any
        if (eventData && eventData.user === address) {
          return true
        }
      } catch (error) {
        console.error("解析事件失败:", error)
      }
    }

    return false
  } catch (error) {
    console.error("检查用户是否有简历失败:", error)
    throw error
  }
}

/**
 * Get user's resume
 * @param address User's wallet address
 * @returns Resume object or null if not found
 */
export async function getUserResume(address: string): Promise<Resume | null> {
  try {
    // 查询该用户的 ResumeCreated 事件
    const events = await suiClient.queryEvents({
      query: {
        MoveEventType: `${PACKAGE_ID}::${MODULE_NAME}::ResumeCreated`,
      },
      limit: 50,
    })

    // 查找该用户的简历ID
    let resumeId = null
    for (const event of events.data) {
      try {
        const eventData = event.parsedJson as any
        if (eventData && eventData.user === address) {
          resumeId = eventData.resume
          break
        }
      } catch (error) {
        console.error("解析事件失败:", error)
      }
    }

    if (!resumeId) {
      return null
    }

    // 获取简历对象
    const { data: resumeObject } = await suiClient.getObject({
      id: resumeId,
      options: {
        showContent: true,
      },
    })

    if (!resumeObject || !resumeObject.content) {
      return null
    }

    const content = resumeObject.content as any
    const fields = content.fields

    if (!fields) {
      return null
    }

    // 创建简历对象
    const resume: Resume = {
      id: resumeId,
      owner: address,
      name: fields.name || "",
      date: fields.date || "",
      education: fields.education || "",
      mail: fields.mail || "",
      number: fields.number || "",
      ability: fields.abilities || [],
      experiences: parseExperiences(fields.experiences || []),
      achievements: parseAchievements(fields.achievements || []),
    }

    // 尝试从本地存储获取头像URL
    try {
      const storedAvatarUrl = localStorage.getItem(`resume_avatar_url_${address}`)
      if (storedAvatarUrl) {
        resume.avatarUrl = storedAvatarUrl
      }
    } catch (e) {
      console.log("无法访问localStorage，可能是在服务器端运行")
    }

    return resume
  } catch (error) {
    console.error("获取用户简历失败:", error)
    throw error
  }
}

/**
 * Create a transaction for creating a new resume
 * @param resumeInfo Basic resume information
 * @returns Transaction object
 */
export function createResumeTransaction(resumeInfo: ResumeBasicInfo): Transaction {
  const tx = new Transaction()

  // Call the create_resume function in the Move contract
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::create_resume`,
    arguments: [
      tx.object(RESUME_MANAGER_ID),
      tx.pure.string(resumeInfo.name),
      tx.pure.string(resumeInfo.date),
      tx.pure.string(resumeInfo.education),
      tx.pure.string(resumeInfo.mail),
      tx.pure.string(resumeInfo.number),
    ],
  })

  return tx
}

/**
 * Create a transaction for adding ability to resume
 * @param resumeId Resume object ID
 * @param ability Ability string
 * @returns Transaction object
 */
export function addAbilityTransaction(resumeId: string, ability: string): Transaction {
  const tx = new Transaction()

  // Call the add_ability function in the Move contract
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::add_ability`,
    arguments: [tx.object(resumeId), tx.pure.string(ability)],
  })

  return tx
}

/**
 * Create a transaction for adding experience to resume
 * @param resumeId Resume object ID
 * @param experience Experience string
 * @returns Transaction object
 */
export function addExperienceTransaction(resumeId: string, experience: string): Transaction {
  const tx = new Transaction()

  // Call the add_experience function in the Move contract
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::add_experience`,
    arguments: [tx.object(resumeId), tx.pure.string(experience)],
  })

  return tx
}

/**
 * Create a transaction for adding achievement to resume
 * @param resumeId Resume object ID
 * @param achievement Achievement string
 * @returns Transaction object
 */
export function addAchievementTransaction(resumeId: string, achievement: string): Transaction {
  const tx = new Transaction()

  // Call the add_achievement function in the Move contract
  tx.moveCall({
    target: `${PACKAGE_ID}::${MODULE_NAME}::add_achievement`,
    arguments: [tx.object(resumeId), tx.pure.string(achievement)],
  })

  return tx
}