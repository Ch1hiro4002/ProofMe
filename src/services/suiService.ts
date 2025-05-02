import { Transaction } from "@mysten/sui/transactions"
import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { networkConfig, suiClient } from "../networkConfig"

// Contract address and module name from the deployed Move contract
const PACKAGE_ID = networkConfig.testnet.package 
const MODULE_NAME = "resume"
const RESUME_MANAGER_ID = networkConfig.testnet.ResumeManager

// Type definitions matching the Move contract structure
export interface ResumeBasicInfo {
  name: string
  avatarUrl: string
  date: string 
  education: string
  mail: string
  number: string 
}

export interface Resume {
  id: string
  owner: string
  name: string
  avatarUrl: string
  date: string
  education: string
  mail: string
  number: string
  ability: string[] | null
  experiences: string[] | null
  achievements: string[] | null
}

/**
 * Check if a user has a resume
 * @param address User's wallet address
 * @returns Boolean indicating if the user has a resume
 */
export async function checkUserHasResume(address: string): Promise<boolean> {
  try {
    // Query owned objects of type Resume
    const { data: objects } = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAME}::Resume`,
      },
      options: {
        showContent: true,
      },
    })

    return objects.length > 0
  } catch (error) {
    console.error("Error checking if user has resume:", error)
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
    // Query owned objects of type Resume
    const { data: objects } = await suiClient.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAME}::Resume`,
      },
      options: {
        showContent: true,
        showDisplay: true,
      },
    })

    if (objects.length === 0) {
      return null
    }

    // Parse the resume data from the first found resume object
    const resumeObject = objects[0]
    const content = resumeObject.data?.content as any

    if (!content || !content.fields) {
      return null
    }

    // Extract and format the resume data based on the Move contract structure
    const resumeData: Resume = {
      id: resumeObject.data?.objectId || "",
      owner: address,
      name: content.fields.name || "",
      avatarUrl: content.fields.avatar_url || "",
      date: content.fields.date || "",
      education: content.fields.education || "",
      mail: content.fields.mail || "",
      number: content.fields.number || "",
      ability: parseOptionVector(content.fields.ability),
      experiences: parseOptionVector(content.fields.experiences),
      achievements: parseOptionVector(content.fields.achievements),
    }

    return resumeData
  } catch (error) {
    console.error("Error getting user resume:", error)
    throw error
  }
}

/**
 * Helper function to parse Option<vector<String>> from Move
 */
function parseOptionVector(field: any): string[] | null {
  if (!field || !field.fields || !field.fields.vec || !field.fields.vec.fields || !field.fields.vec.fields.contents) {
    return null
  }

  return field.fields.vec.fields.contents.map((item: any) => item)
}

/**
 * Get all resumes
 * @returns Array of all resumes
 */
export async function getAllResumes(): Promise<Resume[]> {
  try {
    // Get all objects owned by the ResumeManager
    const { data: objects } = await suiClient.getDynamicFields({
      parentId: RESUME_MANAGER_ID,
    })

    const resumes: Resume[] = []

    // Fetch each resume object
    for (const obj of objects) {
      try {
        const { data: resumeObject } = await suiClient.getObject({
          id: obj.objectId,
          options: {
            showContent: true,
            showDisplay: true,
          },
        })

        if (resumeObject && resumeObject.content) {
          const content = resumeObject.content as any
          const fields = content.fields

          if (fields) {
            const resume: Resume = {
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

            resumes.push(resume)
          }
        }
      } catch (error) {
        console.error(`Error fetching resume object ${obj.objectId}:`, error)
        // Continue with the next object
      }
    }

    return resumes
  } catch (error) {
    console.error("Error getting all resumes:", error)
    throw error
  }
}

/**
 * Create a new resume
 * @param signer Wallet signer
 * @param resumeInfo Basic resume information
 * @returns Transaction response
 */
export async function createResume(resumeInfo: ResumeBasicInfo) {
  try {
    const tx = new Transaction()

    // Call the create_resume function in the Move contract
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::create_resume`,
      arguments: [
        tx.object(RESUME_MANAGER_ID), 
        tx.pure.string(resumeInfo.name),
        tx.pure.string(resumeInfo.avatarUrl),
        tx.pure.string(resumeInfo.date),
        tx.pure.string(resumeInfo.education),
        tx.pure.string(resumeInfo.mail),
        tx.pure.string(resumeInfo.number),
      ],
    })

    // Execute the transaction
    const {mutate: signAndExecute} = useSignAndExecuteTransaction();
    const result = await signAndExecute({
      transaction: tx
    }, {
      onSuccess: () => {
        console.log("success!");
      },
      onError: (error) => {
        console.log(error);
      }
    })

    return result
  } catch (error) {
    console.error("Error creating resume:", error)
    throw error
  }
}

/**
 * Add ability to resume
 * @param signer Wallet signer
 * @param resumeId Resume object ID
 * @param ability Ability string
 * @returns Transaction response
 */
export async function addAbility(resumeId: string, ability: string) {
  try {
    const tx = new Transaction()

    // Call the add_ability function in the Move contract
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_ability`,
      arguments: [
        tx.object(resumeId), 
        tx.pure.string(ability)
      ],
    })

    // Execute the transaction
    const {mutate: signAndExecute} = useSignAndExecuteTransaction();
    const result = await signAndExecute({
      transaction: tx
    }, {
      onSuccess: () => {
        console.log("success!");
      },
      onError: (error) => {
        console.log(error);
      }
    })

    return result
  } catch (error) {
    console.error("Error adding ability:", error)
    throw error
  }
}

/**
 * Add experience to resume
 * @param signer Wallet signer
 * @param resumeId Resume object ID
 * @param experience Experience string
 * @returns Transaction response
 */
export async function addExperience(resumeId: string, experience: string) {
  try {
    const tx = new Transaction()

    // Call the add_experience function in the Move contract
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_experience`,
      arguments: [
        tx.object(resumeId), 
        tx.pure.string(experience)
      ],
    })

    // Execute the transaction
    const {mutate: signAndExecute} = useSignAndExecuteTransaction();
    const result = await signAndExecute({
      transaction: tx
    }, {
      onSuccess: () => {
        console.log("success!");
      },
      onError: (error) => {
        console.log(error);
      }
    })

    return result
  } catch (error) {
    console.error("Error adding experience:", error)
    throw error
  }
}

/**
 * Add achievement to resume
 * @param signer Wallet signer
 * @param resumeId Resume object ID
 * @param achievement Achievement string
 * @returns Transaction response
 */
export async function addAchievement(resumeId: string,achievement: string) {
  try {
    const tx = new Transaction()

    // Call the add_achievement function in the Move contract
    tx.moveCall({
      target: `${PACKAGE_ID}::${MODULE_NAME}::add_achievement`,
      arguments: [tx.object(resumeId), tx.pure.string(achievement)],
    })

    // Execute the transaction
    const {mutate: signAndExecute} = useSignAndExecuteTransaction();
    const result = await signAndExecute({
      transaction: tx
    }, {
      onSuccess: () => {
        console.log("success!");
      },
      onError: (error) => {
        console.log(error);
      }
    })

    return result
  } catch (error) {
    console.error("Error adding achievement:", error)
    throw error
  }
}
