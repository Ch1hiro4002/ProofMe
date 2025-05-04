# ProofMeSui简历系统

<p align="center">
  <img src="https://placeholder.svg?height=200&width=200&text=Sui简历系统" alt="Sui简历系统Logo"/>
</p>

<p align="center">
  基于Sui区块链的去中心化简历平台
</p>

## 📖 项目介绍

Sui简历系统是一个基于Sui区块链的去中心化简历平台，允许用户创建、管理和分享他们的职业简历，同时利用区块链技术确保数据的真实性和不可篡改性。用户可以添加技能、工作经验和成就，并通过社交账户绑定增强身份可信度。

### 核心特点

- **区块链存储**：简历数据存储在Sui区块链上，确保数据不可篡改
- **去中心化身份**：用户通过钱包控制自己的数据，无需中心化账户
- **社交验证**：支持绑定Twitter等社交账户，增强简历可信度
- **混合存储策略**：文本数据存储在链上，图片等大文件存储在Walrus去中心化存储
- **响应式设计**：适配各种设备尺寸，提供良好的移动端体验

## 🚀 快速开始

### 前提条件

- Node.js 16+
- npm 或 yarn
- Sui钱包（如Sui Wallet浏览器扩展）

### 安装

1. 克隆仓库

\`\`\`bash
git clone https://github.com/Ch1hiro4002/ProofMe.git
cd ProofMe
\`\`\`

2. 安装依赖

\`\`\`bash
npm install

## 📚 功能说明

### 1. 简历创建与管理

- **创建简历**：填写基本信息、上传头像
- **添加技能**：添加个人技能和专长
- **添加工作经验**：记录工作经历
- **添加成就**：记录个人成就和证书

### 2. 社交账户绑定

- **Twitter绑定**：验证Twitter账户所有权
- **身份验证**：增强简历可信度

### 3. 简历浏览与搜索

- **浏览简历**：查看平台上的简历
- **搜索功能**：按技能、姓名等搜索简历

## 💻 技术栈

- **前端框架**：React + TypeScript
- **构建工具**：Vite
- **区块链交互**：@mysten/dapp-kit, @mysten/sui
- **路由**：React Router
- **样式**：Tailwind CSS
- **存储**：Walrus去中心化存储

## 📁 项目结构

\`\`\`
sui-resume-system/
├── public/                 # 静态资源
├── src/
│   ├── components/         # React组件
│   ├── hooks/              # 自定义React Hooks
│   ├── pages/              # 页面组件
│   ├── services/           # 服务层（API交互）
│   ├── types/              # TypeScript类型定义
│   ├── App.tsx             # 应用入口组件
│   ├── main.tsx            # 应用入口文件
│   ├── index.css           # 全局样式
│   └── networkConfig.ts    # 网络配置
├── index.html              # HTML模板
├── vite.config.ts          # Vite配置
├── tsconfig.json           # TypeScript配置
├── package.json            # 项目依赖
└── README.md               # 项目说明
\`\`\`

## 🔗 智能合约

项目使用Sui Move智能合约来存储和管理简历数据。合约主要功能包括：

- 创建简历
- 添加技能
- 添加工作经验
- 添加成就
- 验证简历数据

合约代码位于 `move/` 目录下



## 📞 联系方式

- 项目维护者：Ch1hiro
- 邮箱：ch1hiro4002@gmail.com
- X：https://x.com/Ch1hiro4002
- GitHub：https://github.com/Ch1hiro4002
