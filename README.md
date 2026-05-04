# OtoDesk

桌面端 AI 音乐工作台：网易云搜索/听歌 → Pi 分析歌曲 → 生成可编辑 `composition.json` → 转 MIDI → FluidSynth + SoundFont 渲染 WAV。

运行态不使用 mock 数据。首次打开没有用户数据时只显示 empty state 和入口。

## 安装依赖

```bash
npm install
npm run dev:all
```

常用命令：

```bash
npm run dev:all      # 推荐：同时启动网易云 API 后端和 Electron
npm run dev          # 只启动 Electron
npm run netease:api  # 只启动网易云 API 后端
npm run typecheck
npm run build
npm run start
```

## 开箱即用启动

开发时默认只需要：

```bash
npm run dev:all
```

这条命令会做两件事：

- 启动 NeteaseCloudMusicApi：`http://127.0.0.1:3000`
- 等后端可访问后启动 Electron 桌面端

所以第一次试用时不需要先去设置页配置网易云 API。打开应用后直接搜索歌曲即可。

## 启动 NeteaseCloudMusicApi

OtoDesk 默认读取：

```env
OTODESK_NETEASE_BASE_URL=http://127.0.0.1:3000
```

项目已经内置开发脚本：

```bash
npm run netease:api
```

默认会启动在 `http://localhost:3000`。先在本机启动 NeteaseCloudMusicApi，并确认这些接口可访问：

- `GET /search?keywords=...&type=1&limit=20`
- `GET /song/detail?ids=...`
- `GET /lyric?id=...`
- `GET /song/url?id=...`

也可以在应用的“设置”页修改 Base URL 并点击“测试 Netease”。

## 配置 AI 后端

OtoDesk 的 AI 后端不是一个单独的 HTTP server，而是本机 `pi` CLI。默认配置已经写好：

```env
OTODESK_PI_COMMAND=pi
OTODESK_PI_MODE=rpc
OTODESK_PI_WORKDIR=
```

正常情况下设置页保持：

- command: `pi`
- mode: `rpc`
- workdir: 空

你只需要确保终端里能运行：

```bash
which pi
pi --help
```

然后在 Pi 自己的配置里准备好模型和 API key。OtoDesk 会通过 `pi --mode rpc` 调 Pi 做结构化 JSON 输出。

OtoDesk 使用 Pi 的真实 JSONL RPC 协议：`pi --mode rpc`。每次 AI 调用都会以 `--no-session --no-tools --no-extensions --no-skills --no-prompt-templates --no-context-files` 启动独立子进程，发送 prompt，等待 `agent_end`，再读取最后一条 assistant 文本并做 JSON + zod 校验。

Pi 只用于结构化 JSON 输出：歌曲分析和 `composition.json` 生成。文件写入、MIDI 生成和音频渲染都在 Electron main 进程完成。

“测试 Pi”会先检查 RPC 协议和当前模型配置；如果有可用模型，还会做一次最小 JSON roundtrip。失败时先确认 `pi` 命令可执行、模型/API 已配置，并且 Pi 自己的状态目录有写入权限。

## 安装 FluidSynth

macOS 可用 Homebrew：

```bash
brew install fluid-synth
```

设置页配置：

```env
OTODESK_FLUIDSYNTH_PATH=fluidsynth
OTODESK_SOUNDFONT_PATH=/path/to/soundfont.sf2
```

SoundFont 必须是本机存在的 `.sf2` 文件。未配置 SoundFont 时可以生成项目和 MIDI，但不能渲染 WAV。

## 使用流程

1. 运行 `npm run dev:all`。
2. 到“听歌”输入关键词搜索，选择歌曲。
3. 如果播放 URL 可用，页面会显示 audio 控件；不可用时仍可继续 AI 分析。
4. 到“分析”点击“开始分析”，结果会保存到 SQLite。
5. 点击“保存灵感”，在“灵感库”查看并基于灵感创作。
6. 到“创作台”输入想法，生成 `composition.json`。
7. 编辑 JSON 后点击“保存 JSON”，保存前会做 zod 和业务校验。
8. 如果要渲染 WAV，再到“设置”配置 FluidSynth 和 SoundFont。
9. 点击“渲染 WAV”，系统会生成 `song.mid` 并调用 FluidSynth 渲染 `render.wav`。

## 数据和文件位置

SQLite：

```text
app.getPath('userData')/otodesk.sqlite
```

项目文件：

```text
app.getPath('userData')/projects/{projectId}/
├── composition.json
├── song.mid
├── render.wav
└── metadata.json
```

## 安全边界

`BrowserWindow` 使用：

```ts
webPreferences: {
  preload,
  contextIsolation: true,
  nodeIntegration: false,
  sandbox: false
}
```

renderer 只能通过 `window.otodesk` 调用白名单 API，不能直接访问 `fs`、`child_process`、`process.env`、数据库、Pi 或 FluidSynth。

## 常见错误

- 音乐服务未连接：确认 NeteaseCloudMusicApi 正在运行，Base URL 正确。
- 没有找到相关歌曲：搜索接口返回空结果。
- 当前歌曲暂时无法播放：网易云播放 URL 为空，但歌曲仍可用于 AI 分析。
- 未获取到歌词：AI 会基于歌名、歌手和用户备注分析。
- 请先在设置中配置 Pi：确认 `OTODESK_PI_COMMAND` 或设置页 Pi command。
- AI 返回格式不符合要求：Pi 输出不是符合 schema 的 JSON。
- Composition 校验失败：页面会展示具体错误列表。
- 未找到 FluidSynth：安装 FluidSynth 或配置可执行文件路径。
- 请先选择 .sf2 SoundFont 文件：设置页填写本机 `.sf2` 文件路径。
- 渲染失败：错误信息会展示 FluidSynth stderr 摘要。
