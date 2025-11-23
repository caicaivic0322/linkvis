# LinkVis: 链表互动可视化

一个交互式链表数据结构可视化工具，通过直观的界面帮助用户理解链表操作的底层实现原理。



## 📋 项目概述

LinkVis 是一个专注于数据结构教育的可视化工具，它提供了链表操作的实时视觉反馈，帮助学习计算机科学的学生和开发者更好地理解链表的工作原理。通过直观的界面展示，用户可以观察到每个操作如何影响链表结构和内存分配。

## ✨ 核心功能

- **丰富的链表操作**：支持头部/尾部插入、指定位置插入、头部/尾部删除、按值删除、搜索等操作
- **实时内存可视化**：展示内存块的分配和释放过程
- **代码同步显示**：每个操作对应C++实现代码，帮助理解底层逻辑
- **操作日志追踪**：记录所有执行的操作和结果
- **动画效果**：流畅的过渡动画，提升视觉体验
- **多主题支持**：提供深色、浅色、午夜蓝和温暖色等多种主题
- **响应式设计**：适配不同屏幕尺寸

## 🛠️ 技术栈

- **前端框架**：React 19
- **语言**：TypeScript
- **构建工具**：Vite
- **样式**：Tailwind CSS 4
- **AI支持**：Google GenAI (用于代码生成/解释)
- **部署**：Render.com

## 📦 安装与运行

### 前提条件

确保您的环境已安装以下工具：
- Node.js (v18或更高版本)
- npm 或 yarn

### 安装步骤

1. 克隆仓库：
```bash
git clone https://github.com/caicaivic0322/linkvis.git
cd linkvis
```

2. 安装依赖：
```bash
npm install
# 或
yarn install
```

3. 启动开发服务器：
```bash
npm run dev
# 或
yarn dev
```

4. 在浏览器中打开 http://localhost:3000 (或终端显示的端口号)

## 🚀 构建与部署

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

构建输出将位于 `dist` 目录中。

### 部署到Render.com

项目已配置 `render.yaml` 文件，支持一键部署到Render.com：

1. Fork或克隆此仓库到您的GitHub账户
2. 登录Render.com并连接您的GitHub账户
3. 从GitHub仓库创建新的Render服务
4. Render将自动检测配置并部署项目

## 💻 使用说明

### 基本操作

1. **添加节点**：使用界面控件选择插入位置（头部、尾部或指定位置），输入值并点击插入按钮
2. **删除节点**：选择删除类型（头部、尾部或按值删除），必要时输入值并确认
3. **搜索节点**：在搜索框中输入值，点击搜索按钮
4. **清空链表**：点击清空按钮重置链表

### 界面元素

- **链表可视化区域**：显示当前链表结构，每个节点显示值和指向下一个节点的指针
- **内存网格**：展示内存块的使用情况
- **代码显示区域**：展示当前操作的C++实现代码
- **操作日志**：记录所有执行的操作和结果
- **控制面板**：提供各种链表操作的控制按钮
- **主题切换**：在设置中切换应用主题

## 📁 项目结构

```
linkvis/
├── components/         # React组件
│   ├── CodeBlock.tsx      # 代码显示组件
│   ├── LinkedListNode.tsx # 链表节点可视化组件
│   └── MemoryGrid.tsx     # 内存网格可视化组件
├── services/           # 服务模块
│   └── geminiService.ts   # Google GenAI服务
├── src/                # 源代码
│   └── tailwind.css       # Tailwind CSS入口
├── App.tsx             # 主应用组件
├── constants.ts        # 常量定义（包含C++代码片段）
├── types.ts            # TypeScript类型定义
├── index.html          # HTML入口文件
├── index.tsx           # React入口文件
├── package.json        # 项目配置和依赖
├── tsconfig.json       # TypeScript配置
├── vite.config.ts      # Vite配置
├── render.yaml         # Render.com部署配置
└── README.md           # 项目文档
```

## 📊 数据结构设计

### 链表节点结构
```typescript
interface NodeData {
  id: string;         // 节点唯一标识
  value: number;      // 存储的数据值
  address: string;    // 模拟的内存地址
  nextAddress: string | null; // 指向下一节点的地址
  isHead: boolean;    // 是否为头节点
  highlighted: boolean; // 高亮状态（用于遍历动画）
  isTarget: boolean;  // 目标状态（用于搜索或删除）
  isNew: boolean;     // 新节点状态（用于插入动画）
}
```

### 内存块结构
```typescript
interface MemoryBlock {
  address: string;    // 内存地址
  occupied: boolean;  // 是否被占用
  nodeId: string | null; // 关联的节点ID
  value: number | null;  // 存储的值
}
```

## 🎨 主题系统

应用支持多种主题，可通过界面设置切换：
- **深色模式**：适合长时间使用的暗色界面
- **浅色模式**：明亮清爽的界面风格
- **午夜蓝**：深蓝色调的专业外观
- **温暖色**：舒适的暖色调设计

## 🤝 贡献指南

欢迎贡献代码或提出建议！请按照以下步骤参与：

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详情请查看 LICENSE 文件

## 📧 联系信息

如有任何问题或建议，请联系：

- GitHub: [caicaivic0322](https://github.com/caicaivic0322)

---

感谢使用 LinkVis！希望这个工具能帮助您更好地理解链表数据结构。
