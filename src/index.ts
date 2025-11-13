// Central AppConfig type for domus_agent
// Used only for typing with the `config` package in code (no runtime import).

export interface AppConfig {
    service: {
      baseUrl: string;
    };
    agent: {
      port: number;
    };
    secret: {
      PERPLEXITY_API_KEY?: string;
      LLM_FAST_MODEL?: string;
      LLM_MODEL?: string;
      LLM_MINI_MODEL?: string;
      AI_GATEWAY_API_KEY?: string;
      GOOGLE_VERTEX_API_PROJECT?: string;
      JINA_API_KEY?: string;
    };
  }
