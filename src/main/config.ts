export const appConfig = {
  agentProvider: (process.env.MUSEDESK_AGENT_PROVIDER ?? 'openai') as 'openai' | 'pi',
  musicProvider: (process.env.MUSEDESK_MUSIC_PROVIDER ?? 'netease') as 'netease',
  neteaseBaseUrl: process.env.MUSEDESK_NETEASE_API_BASE_URL ?? 'http://127.0.0.1:3000',
  openaiBaseUrl: process.env.MUSEDESK_OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  openaiApiKey: process.env.MUSEDESK_OPENAI_API_KEY ?? '',
  openaiModel: process.env.MUSEDESK_OPENAI_MODEL ?? 'gpt-4.1-mini',
  piAgentApiKey: process.env.MUSEDESK_PI_API_KEY ?? '',
  piAgentBaseUrl: process.env.MUSEDESK_PI_BASE_URL ?? '',
  piAgentModel: process.env.MUSEDESK_PI_MODEL ?? ''
}
