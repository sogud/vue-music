export const appConfig = {
  neteaseBaseUrl: process.env.NETEASE_API_BASE_URL ?? 'http://127.0.0.1:3000',
  neteaseSongId: process.env.NETEASE_DEFAULT_SONG_ID ?? '1901371647',
  piAgentApiKey: process.env.PI_AGENT_API_KEY ?? '',
  piAgentBaseUrl: process.env.PI_AGENT_BASE_URL ?? 'https://api.pi.ai',
  piAgentModel: process.env.PI_AGENT_MODEL ?? 'pi-coding-agent'
}
