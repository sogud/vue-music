# MuseDesk

桌面端 AI 音乐灵感工作台 — 听歌 → AI 分析 → 保存灵感 → 生成创作方向

## 技术栈

- **桌面框架**: Electron + electron-vite
- **前端**: Vue 3.5 + TypeScript + Pinia + Vue Router 4
- **样式**: CSS (日系简约/米白/大留白)
- **本地数据库**: SQLite (better-sqlite3)
- **数据校验**: zod

## 架构

```
Renderer (Vue 3.5)  ←→  Preload Bridge (window.musedesk)  ←→  Main (IPC + Services + DB)
```

- renderer 不能直接访问 Node API
- 所有外部依赖经过 main 进程 service 层封装

## 开发

```bash
npm install
npm run dev      # 启动 Electron 开发模式
```

## 构建

```bash
npm run build    # 生产构建
npm run start    # 预览构建结果
```

## 设置

开发环境默认使用 Mock 数据。可在设置页切换：

- **Agent 提供方**: Mock / Pi Agent
- **音乐提供方**: Mock / 网易云音乐

### 环境变量

- `NETEASE_API_BASE_URL` — 网易云 API 服务地址 (默认 `http://127.0.0.1:3000`)
- `PI_AGENT_API_KEY` — Pi Agent API Key
- `PI_AGENT_BASE_URL` — Pi Agent 服务地址
- `PI_AGENT_MODEL` — Pi Agent 模型名

## 项目结构

```
src/
├── main/          # Electron 主进程
│   ├── index.ts
│   ├── db.ts
│   ├── config.ts
│   ├── ipc/       # 模块化 IPC handlers
│   └── services/  # 业务服务层
│       ├── music-provider/
│       ├── agent/
│       ├── analysis/
│       ├── inspiration/
│       ├── creation/
│       └── settings/
├── preload/
│   └── index.ts   # contextBridge API
├── renderer/      # Vue 3 渲染进程
│   ├── main.ts
│   ├── App.vue
│   ├── router/
│   ├── pages/     # 5 个页面
│   ├── components/# UI 组件
│   ├── stores/    # Pinia 状态管理
│   └── styles.css
└── shared/
    └── types.ts   # 共享类型定义
```
