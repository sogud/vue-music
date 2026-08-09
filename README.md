# oto

Web-first AI 电子音乐工作台：当前先侧重无人声、无歌词的电子音乐草稿。本地 server 保管 API key 和文件能力，浏览器 Web UI 负责 Pattern 编写、生成可编辑 `composition.json`，再由 server 转 MIDI 并用 FluidSynth + SoundFont 渲染 WAV。

运行态不使用 mock 数据。首次打开没有用户数据时只显示 empty state 和入口。

## 安装依赖

```bash
npm install
npm run dev:web
```

常用命令：

```bash
npm run dev:web       # 推荐：启动本地 oto server 和浏览器 Web UI
npm run server        # 只启动本地 API server: http://127.0.0.1:39273
npm run web           # 只启动 Vite Web UI: http://127.0.0.1:39275
npm run dev:all      # 推荐：同时启动网易云 API 后端和 Electron
npm run dev          # 只启动 Electron
npm run netease:api  # 只启动网易云 API 后端
npm run typecheck
npm run build
npm run build:web
npm run start
```

## Web 启动

现在默认开发形态是 server + Web：

```bash
npm run dev:web
```

这条命令会启动：

- oto server：`http://127.0.0.1:39273`
- Vite Web UI：`http://127.0.0.1:39275`

Web UI 会通过 `/api/*` 调用本地 server。API key、SQLite、项目文件、FluidSynth、SoundFont 都只在 server 侧使用，浏览器不会直接访问。

Composer Pattern 视图：

```text
http://127.0.0.1:39275/#/composer?tab=pattern
```

这个视图使用 oto 自己的轻量 DSL 和 WebAudio 播放器，不依赖 Strudel。AI 只生成受控 DSL，不执行任意 JavaScript。默认方向是 instrumental electronic：鼓、贝斯、lead、pad/chords，不做人声和歌词。

如果需要网易云搜索/听歌，另开一个终端启动：

```bash
npm run netease:api
```

## Electron 启动

开发时默认只需要：

```bash
npm run dev:all
```

这条命令会做两件事：

- 启动 NeteaseCloudMusicApi：`http://127.0.0.1:39271`
- 等后端可访问后启动 Electron 桌面端

所以第一次试用时不需要先去设置页配置网易云 API。打开应用后直接搜索歌曲即可。

## 启动 NeteaseCloudMusicApi

oto 默认读取：

```env
OTODESK_NETEASE_BASE_URL=http://127.0.0.1:39271
```

项目已经内置开发脚本：

```bash
npm run netease:api
```

默认会启动在 `http://localhost:39271`。先在本机启动 NeteaseCloudMusicApi，并确认这些接口可访问：

- `GET /search?keywords=...&type=1&limit=20`
- `GET /song/detail?ids=...`
- `GET /lyric?id=...`
- `GET /song/url?id=...`

也可以在应用的“设置”页修改 Base URL 并点击“测试 Netease”。

## 配置 AI 后端

oto 的 AI 后端不是一个单独的 HTTP server。应用内置 AI SDK，用户安装后只需要在“设置 → AI Backend”填：

- Provider
- Model
- API Key
- Endpoint，可选

然后点击“保存并测试”。不需要启动额外 AI 后端，也不需要进入命令行配置。

默认配置：

```env
OTODESK_AI_PROVIDER=openai
OTODESK_AI_MODEL=gpt-4o-mini
OTODESK_AI_API_KEY=
OTODESK_AI_BASE_URL=
```

常用填写方式：

- OpenAI：`provider = openai`，`model = gpt-4o-mini`，Endpoint 留空。
- Gemini：`provider = google`，`model = gemini-2.5-flash`，Endpoint 留空。
- Anthropic：`provider = anthropic`，`model = claude-sonnet-4-5`，Endpoint 留空。
- DeepSeek：`provider = deepseek`，`model = deepseek-chat`，Endpoint 留空。
- OpenRouter：`provider = openrouter`，`model = openai/gpt-4o-mini`，Endpoint 留空。
- LM Studio / Ollama / 代理网关：`provider = local`，填模型名，Endpoint 例如 `http://localhost:1234/v1`。

设置页不会把已保存的 API key 回显出来。API key 只保存在本机 SQLite 设置表里，renderer 不能直接读取。

AI SDK 在 oto 中只用于结构化 JSON 输出：歌曲分析、Pattern DSL 和 `composition.json` 生成。AI 不直接读写文件、不执行命令、不调用渲染工具。文件写入、MIDI 生成和音频渲染都在 server/main 侧完成，并通过 zod 做输入输出校验。

“保存并测试”会做一次最小 JSON roundtrip。失败时先确认 Provider、Model、API Key 和 Endpoint 正确。

## 内置音频渲染

FluidSynth 和 SoundFont 只对“渲染 WAV”是强依赖。搜索、听歌、AI 分析、生成 `composition.json`、生成 MIDI 都不需要它们。

面向普通用户时，不要求用户自己安装 FluidSynth，也不要求用户选择 SoundFont。oto 默认按这个顺序找渲染工具：

1. 应用内置的 `resources/bin/{platform}-{arch}/fluidsynth`。
2. 应用内置的 `resources/soundfonts/VintageDreamsWaves-v2.sf2`。
3. 高级自定义 FluidSynth 路径，只有内置资源缺失时作为兜底。
4. 高级自定义 SoundFont 路径，只有内置资源缺失时作为兜底。

macOS 构建机如果要更新 bundled FluidSynth，可以用 Homebrew：

```bash
brew install fluid-synth
```

这只用于开发机更新 bundled binary。普通用户不需要运行这条命令。

oto 已内置一个小体积默认 SoundFont：

```text
resources/soundfonts/VintageDreamsWaves-v2.sf2
```

main 进程默认使用这份 bundled SoundFont。它适合开箱测试和快速预览。

高级环境变量可以留空：

```env
OTODESK_FLUIDSYNTH_PATH=
OTODESK_SOUNDFONT_PATH=
```

macOS Apple Silicon 版本已经内置：

```text
resources/bin/darwin-arm64/fluidsynth
resources/bin/darwin-arm64/lib/*.dylib
```

如果要在构建机上重新生成这组资源：

```bash
npm run bundle:fluidsynth:darwin
```

这个脚本会复制 `fluidsynth`、递归复制非系统 `.dylib`、把动态库路径改成相对路径，并做 ad-hoc codesign。跨平台打包时需要分别准备对应平台的 bundled binary。

## 本地数据位置

Web/server 模式默认使用：

```text
~/.oto/oto.sqlite
~/.oto/projects/
```

可以通过环境变量改位置：

```env
OTO_USER_DATA_DIR=/absolute/path/to/oto-data
```

## 使用流程

1. 运行 `npm run dev:all`。
2. 到“听歌”输入关键词搜索，选择歌曲。
3. 如果播放 URL 可用，页面会显示 audio 控件；不可用时仍可继续 AI 分析。
4. 到“分析”点击“开始分析”，结果会保存到 SQLite。
5. 点击“保存灵感”，在“灵感库”查看并基于灵感创作。
6. 到“创作台”输入想法，生成 `composition.json`。
7. 编辑 JSON 后点击“保存 JSON”，保存前会做 zod 和业务校验。
8. 点击“渲染 WAV”，系统会生成 `song.mid` 并调用内置 FluidSynth 渲染 `render.wav`。

## 数据和文件位置

SQLite：

```text
app.getPath('userData')/oto.sqlite
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

renderer 只能通过 `window.otodesk` 调用白名单 API，不能直接访问 `fs`、`child_process`、`process.env`、数据库、API key 或 FluidSynth。

## 常见错误

- 音乐服务未连接：确认 NeteaseCloudMusicApi 正在运行，Base URL 正确。
- 没有找到相关歌曲：搜索接口返回空结果。
- 当前歌曲暂时无法播放：网易云播放 URL 为空，但歌曲仍可用于 AI 分析。
- 未获取到歌词：AI 会基于歌名、歌手和用户备注分析。
- AI 未配置：到设置页填写 Provider、Model、API Key 和可选 Endpoint 后点击“保存并测试”。
- AI 返回格式不符合要求：模型输出不是符合 schema 的 JSON。
- Composition 校验失败：页面会展示具体错误列表。
- 未找到 FluidSynth：内置渲染器缺失时重新安装 oto；高级用户也可以在设置页配置自定义可执行文件路径。
- 请先选择 .sf2 SoundFont 文件：通常说明内置 SoundFont 缺失，重新安装 oto；高级用户也可以在设置页填写本机 `.sf2` 文件路径。
- 渲染失败：错误信息会展示 FluidSynth stderr 摘要。
