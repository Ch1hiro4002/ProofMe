"use client"

/**
 * Custom hook for interacting with the Sui resume contract
 *
 * This hook provides a React-friendly way to interact with the resume contract
 * using the Sui dApp Kit hooks.
 */

import { useState, useEffect, useCallback } from "react"
import { useCurrentWallet, useCurrentAccount, useSignAndExecuteTransaction } from "@mysten/dapp-kit"
import {
  checkUserHasResume,
  getUserResume,
  queryResumeState,
  createResumeTransaction,
  addAbilityTransaction,
  addExperienceTransaction,
  addAchievementTransaction,
  type ResumeBasicInfo,
} from "../services/suiService"
import type { Resume } from "../types/resume-types"

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

  // 使用 useCallback 包装 refreshAllResumes 函数，避免不必要的重新创建
  const refreshAllResumes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // 通过事件查询获取所有简历
      const state = await queryResumeState()
      setAllResumes(state.resumes)

      return state.resumes
    } catch (err) {
      console.error("刷新简历列表失败:", err)
      setError("刷新简历列表失败")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

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
          if (resume) {
            setUserResume(resume)
          }
        }
      } catch (err) {
        console.error("Error checking resume:", err)
      } finally {
        setLoading(false)
      }
    }

    checkResume()
  }, [connectionStatus, account])

  // Load all resumes
  useEffect(() => {
    refreshAllResumes()
  }, [refreshAllResumes])

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

      // 创建交易
      const transaction = createResumeTransaction(basicInfo)

      // 使用 hook 签名并执行交易
      const result = await signAndExecute(
        {
          transaction,
        },
        {
          onSuccess: () => {
            console.log("Resume created successfully!")
            // 创建成功后立即刷新简历列表
            setTimeout(() => refreshAllResumes(), 2000) // 延迟2秒，等待区块链确认
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
            // 添加成功后刷新简历列表
            setTimeout(() => refreshAllResumes(), 2000) // 延迟2秒，等待区块链确认
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
            // 添加成功后刷新简历列表
            setTimeout(() => refreshAllResumes(), 2000) // 延迟2秒，等待区块链确认
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
            // 添加成功后刷新简历列表
            setTimeout(() => refreshAllResumes(), 2000) // 延迟2秒，等待区块链确认
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
    updateAvatarUrl,
    refreshAllResumes,
  }
}
