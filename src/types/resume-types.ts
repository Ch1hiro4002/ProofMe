// 定义简历系统的类型

export type Resume = {
  id: string
  owner: string
  name: string
  date: string
  education: string
  mail: string
  number: string
  ability: string[] | null
  experiences: ExperienceItem[] | null
  achievements: AchievementItem[] | null
  avatarUrl?: string
  twitterUsername?: string // 添加Twitter用户名字段
}

export type ExperienceItem = {
  experience: string
  verification: boolean
}

export type AchievementItem = {
  achievement: string
  verification: boolean
}

export type ResumeState = {
  resumes: Resume[]
}

// 定义事件结构
export type ResumeCreatedEvent = {
  resume: string // 简历对象ID
  user: string // 所有者地址
  name: string // 简历名称
  date: string // 出生日期
  education: string // 学历
  mail: string // 邮箱
  number: string // 电话
}

// 定义能力添加事件
export type AbilityAddedEvent = {
  resume: string
  ability: string
}

// 定义经验添加事件
export type ExperienceAddedEvent = {
  resume: string
  experience: string
  verification: boolean
}

// 定义成就添加事件
export type AchievementAddedEvent = {
  resume: string
  achievement: string
  verification: boolean
}
