# MuseDesk Stage 1 目录结构

```text
src/
  main/
    index.ts
    config.ts
    db.ts
    ipc.ts
    mock-data.ts
    services/
      agent.ts
      mock-agent.ts
      netease-adapter.ts
      pi-agent.ts
  preload/
    index.ts
  renderer/
    main.ts
    App.vue
    styles.css
    env.d.ts
    stores/
      music.ts
    components/
      CurrentSongCard.vue
      AssistantPanel.vue
      MiniPlayer.vue
    types/
      window.d.ts
  shared/
    types.ts
```

## 分步实现映射
1. 类型定义：`src/shared/types.ts`
2. SQLite 初始化：`src/main/db.ts`
3. IPC handlers：`src/main/ipc.ts`
4. preload API：`src/preload/index.ts`
5. Pinia stores：`src/renderer/stores/music.ts`
6. Vue 页面和组件：`src/renderer/App.vue` + `src/renderer/components/*`
7. 集成 Pi Agent SDK（当前为 API/SDK 适配层）：`src/main/services/pi-agent.ts`
