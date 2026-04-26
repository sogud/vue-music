import { OpenAIAgentClient } from '../agent/openai-agent-client'
import { PiAgentClient } from '../agent/pi-agent-client'
import { appConfig } from '../../config'
import type { AgentClient } from '../agent/agent-client'

export function getAgentClient(): AgentClient {
  if (appConfig.agentProvider === 'pi' && appConfig.piAgentApiKey) {
    return new PiAgentClient()
  }
  return new OpenAIAgentClient()
}
