# vue-music

> 全重构版本：Vue 3.5 + Electron + NeteaseCloudMusicApi

## 技术栈

- Vue 3.5（Composition API）
- Vue Router 4
- Vuex 4
- Electron + electron-vite
- NeteaseCloudMusicApi

## 运行前准备

1. 启动 NeteaseCloudMusicApi（默认地址 `http://127.0.0.1:3000`）
2. 安装依赖

```bash
npm install
```

## 开发与构建

```bash
npm run dev      # Electron 桌面开发
npm run build    # Electron 构建
npm run start    # 预览构建结果
```

## API 说明

- 所有请求统一走 `/api/*`
- 本项目不再包含 QQ 音乐 API、JSONP、多源切换兼容逻辑
- 开发代理在 `build/dev-server.js` 中统一转发到 `NETEASE_API_BASE`

## 环境变量

生产环境变量定义在 `config/prod.env.js`：

- `NETEASE_API_BASE`：NeteaseCloudMusicApi 服务地址
