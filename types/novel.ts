export interface NovelGenerationRequest {
  bossName: string;
  storyTitle: string;
  scenario: string;
  character?: CharacterProfile;
}

export interface NovelGenerationResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CharacterProfile {
  id?: string;
  name: string;
  personality: string;
  identity: string;
  background: string;
  level: number;
  experiencePoints: number;
  creationCount: number;
  specialTraits: string[];
  lastUsed?: Date;
}

export interface NovelScenario {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  prompt: string;
}

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface DeepSeekAPIRequest {
  model: string;
  messages: DeepSeekMessage[];
  max_tokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface DeepSeekAPIResponse {
  id: string;
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
    finish_reason: string;
    index: number;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
} 