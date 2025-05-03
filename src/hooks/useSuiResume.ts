"use client"

/**
 * Custom hook for interacting with the Sui resume contract
 *
 * This hook provides a React-friendly way to interact with the resume contract
 * using the Sui dApp Kit hooks.
 */

import { useState, useEffect } from "react"
import { useCurrentWallet, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import {
  checkUserHasResume,
  getUserResume,
  getAllResumes,
  createResumeTransaction,
  addAbilityTransaction,
  addExperienceTransaction,
  addAchievementTransaction,
  type Resume,
  type ResumeBasicInfo,
} from "../services/suiService"

// 用于在本地存储中保存头像URL的键
const AVATAR_URL_STORAGE_PREFIX = "resume_avatar_url_"

export function useSuiResume() {
  const { connectionStatus } = useCurrentWallet()
  const account = useCurrentAccount()
  // 使用 useSignAndExecuteTransaction hook
  const { mutate: signAndExecute } = useSignAndExecuteTransaction()

  const [loading, setLoading] = useState(true)
  const [hasResume, setHasResume] = useState(false)
  const [userResume, setUserResume] = useState<Resume | null>(null)
  const [allResumes, setAllResumes] = useState<Resume[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if user has a resume when wallet connection changes
  useEffect(() => {
    async function checkResume() {
      if (connectionStatus === "disconnected" || !account) {
        setHasResume(false)
        setUserResume(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const hasResumeResult = await checkUserHasResume(account.address)
        setHasResume(hasResumeResult)

        if (hasResumeResult) {
          const resume = await getUserResume(account.address)

          // 如果有简历，尝试从本地存储获取头像URL
          if (resume) {
            const storedAvatarUrl = localStorage.getItem(`${AVATAR_URL_STORAGE_PREFIX}${account.address}`)
            if (storedAvatarUrl) {
              resume.avatarUrl = storedAvatarUrl
            }
            setUserResume(resume)
          }
        }
      } catch (err) {
        console.error("Error checking resume:", err)
        setError("Failed to check if you have a resume")
      } finally {
        setLoading(false)
      }
    }

    checkResume()
  }, [connectionStatus, account])

  // Load all resumes
  useEffect(() => {
    async function loadAllResumes() {
      try {
        setLoading(true)
        const resumes = await getAllResumes()

        // 尝试为每个简历从本地存储加载头像URL
        for (const resume of resumes) {
          const storedAvatarUrl = localStorage.getItem(`${AVATAR_URL_STORAGE_PREFIX}${resume.owner}`)
          if (storedAvatarUrl) {
            resume.avatarUrl = storedAvatarUrl
          }
        }

        setAllResumes(resumes)
      } catch (err) {
        console.error("Error loading all resumes:", err)
        setError("Failed to load resumes")
      } finally {
        setLoading(false)
      }
    }

    loadAllResumes()
  }, [])

  /**
   * 保存头像URL到本地存储
   * @param address 用户地址
   * @param avatarUrl 头像URL
   */
  const saveAvatarUrlToLocalStorage = (address: string, avatarUrl: string) => {
    try {
      localStorage.setItem(`${AVATAR_URL_STORAGE_PREFIX}${address}`, avatarUrl)
    } catch (error) {
      console.error("Error saving avatar URL to local storage:", error)
    }
  }

  /**
   * Create a new resume
   * @param basicInfo Basic resume information
   * @returns Transaction result
   */
  const handleCreateResume = async (basicInfo: ResumeBasicInfo) => {
    if (connectionStatus === "disconnected" || !account) {
      throw new Error("Wallet not connected")
    }

    try {
      setLoading(true)
      setError(null)

      // 保存头像URL到本地存储（如果有）
      if (basicInfo.avatarUrl) {
        saveAvatarUrlToLocalStorage(account.address, basicInfo.avatarUrl)
      }

      // 创建不包含avatarUrl的交易
      const transaction = createResumeTransaction(basicInfo)

      // 使用 hook 签名并执行交易
      const result = await signAndExecute(
        {
          transaction,
        },
        {
          onSuccess: () => {
            console.log("Resume created successfully!")
          },
          onError: (error) => {
            console.error("Error creating resume:", error)
          },
        },
      )

      // Refresh user resume data
      setHasResume(true)
      const resume = await getUserResume(account.address)

      // 将头像URL添加到获取的简历数据中
      if (resume && basicInfo.avatarUrl) {
        resume.avatarUrl = basicInfo.avatarUrl
      }

      setUserResume(resume)

      return result
    } catch (err) {
      console.error("Error creating resume:", err)
      setError("Failed to create resume")
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add ability to resume
   * @param ability Ability string
   * @returns Transaction result
   */
  const handleAddAbility = async (ability: string) => {
    if (connectionStatus === "disconnected" || !account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      setLoading(true)
      setError(null)

      // 创建交易
      const transaction = addAbilityTransaction(userResume.id, ability)

      // 使用 hook 签名并执行交易
      const result = await signAndExecute(
        {
          transaction,
        },
        {
          onSuccess: () => {
            console.log("Ability added successfully!")
          },
          onError: (error) => {
            console.error("Error adding ability:", error)
          },
        },
      )

      // Refresh user resume data
      const resume = await getUserResume(account.address)

      // 保留头像URL
      if (resume && userResume.avatarUrl) {
        resume.avatarUrl = userResume.avatarUrl
      }

      setUserResume(resume)

      return result
    } catch (err) {
      console.error("Error adding ability:", err)
      setError("Failed to add ability")
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add experience to resume
   * @param experience Experience string
   * @returns Transaction result
   */
  const handleAddExperience = async (experience: string) => {
    if (connectionStatus === "disconnected" || !account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      setLoading(true)
      setError(null)

      // 创建交易
      const transaction = addExperienceTransaction(userResume.id, experience)

      // 使用 hook 签名并执行交易
      const result = await signAndExecute(
        {
          transaction,
        },
        {
          onSuccess: () => {
            console.log("Experience added successfully!")
          },
          onError: (error) => {
            console.error("Error adding experience:", error)
          },
        },
      )

      // Refresh user resume data
      const resume = await getUserResume(account.address)

      // 保留头像URL
      if (resume && userResume.avatarUrl) {
        resume.avatarUrl = userResume.avatarUrl
      }

      setUserResume(resume)

      return result
    } catch (err) {
      console.error("Error adding experience:", err)
      setError("Failed to add experience")
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Add achievement to resume
   * @param achievement Achievement string
   * @returns Transaction result
   */
  const handleAddAchievement = async (achievement: string) => {
    if (connectionStatus === "disconnected" || !account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      setLoading(true)
      setError(null)

      // 创建交易
      const transaction = addAchievementTransaction(userResume.id, achievement)

      // 使用 hook 签名并执行交易
      const result = await signAndExecute(
        {
          transaction,
        },
        {
          onSuccess: () => {
            console.log("Achievement added successfully!")
          },
          onError: (error) => {
            console.error("Error adding achievement:", error)
          },
        },
      )

      // Refresh user resume data
      const resume = await getUserResume(account.address)

      // 保留头像URL
      if (resume && userResume.avatarUrl) {
        resume.avatarUrl = userResume.avatarUrl
      }

      setUserResume(resume)

      return result
    } catch (err) {
      console.error("Error adding achievement:", err)
      setError("Failed to add achievement")
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * 更新头像URL
   * @param avatarUrl 新的头像URL
   */
  const updateAvatarUrl = async (avatarUrl: string) => {
    if (!account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      // 保存到本地存储
      saveAvatarUrlToLocalStorage(account.address, avatarUrl)

      // 更新当前简历对象
      setUserResume({
        ...userResume,
        avatarUrl,
      })

      return true
    } catch (err) {
      console.error("Error updating avatar URL:", err)
      throw err
    }
  }

  return {
    loading,
    hasResume,
    userResume,
    allResumes,
    error,
    createResume: handleCreateResume,
    addAbility: handleAddAbility,
    addExperience: handleAddExperience,
    addAchievement: handleAddAchievement,
    updateAvatarUrl, // 新增方法用于更新头像URL
  }
}
