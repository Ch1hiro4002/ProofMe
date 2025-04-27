import { useState, useEffect } from "react"
import { useCurrentWallet, useCurrentAccount } from "@mysten/dapp-kit"
import {
  checkUserHasResume,
  getUserResume,
  getAllResumes,
  createResume,
  addAbility,
  addExperience,
  addAchievement,
  type Resume,
  type ResumeBasicInfo,
} from "../services/suiService"


export function useSuiResume() {
  const { connectionStatus } = useCurrentWallet()
  const account = useCurrentAccount();
  const [loading, setLoading] = useState(true)
  const [hasResume, setHasResume] = useState(false)
  const [userResume, setUserResume] = useState<Resume | null>(null)
  const [allResumes, setAllResumes] = useState<Resume[]>([])
  const [error, setError] = useState<string | null>(null)

  // Check if user has a resume when wallet connection changes
  useEffect(() => {
    async function checkResume() {
      if (connectionStatus === 'disconnected') {
        setHasResume(false)
        setUserResume(null)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const hasResumeResult = await checkUserHasResume(account!.address)
        setHasResume(hasResumeResult)

        if (hasResumeResult) {
          const resume = await getUserResume(account!.address)
          setUserResume(resume)
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
   * Create a new resume
   * @param basicInfo Basic resume information
   * @returns Transaction result
   */
  const handleCreateResume = async (basicInfo: ResumeBasicInfo) => {
    if (connectionStatus === 'disconnected') {
      throw new Error("Wallet not connected")
    }

    try {
      setLoading(true)
      setError(null)

      const result = await createResume(basicInfo)

      // Refresh user resume data
      setHasResume(true)
      const resume = await getUserResume(account!.address)
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
    if (connectionStatus === 'disconnected' || !account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      setLoading(true)
      setError(null)

      const result = await addAbility(userResume.id, ability)

      // Refresh user resume data
      const resume = await getUserResume(account.address)
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
    if (connectionStatus === 'disconnected' || !account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      setLoading(true)
      setError(null)

      const result = await addExperience(userResume.id, experience)

      // Refresh user resume data
      const resume = await getUserResume(account.address)
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
    if (connectionStatus === 'disconnected' || !account || !userResume) {
      throw new Error("Wallet not connected or resume not found")
    }

    try {
      setLoading(true)
      setError(null)

      const result = await addAchievement(userResume.id, achievement)

      // Refresh user resume data
      const resume = await getUserResume(account.address)
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
  }
}
