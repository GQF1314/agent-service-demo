// import { createVertex } from "@ai-sdk/google-vertex";
// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import { createVertexAnthropic } from '@ai-sdk/google-vertex/anthropic';
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
import config from "config";
import { AppConfig } from "../../index";

const secretConfig = config.get<AppConfig['secret']>("secret");
if (!secretConfig) {
    throw new Error("secretConfig is not set");
}



// export const openrouterv1 = createOpenRouter({
//     apiKey: secretConfig?.LLM_API_KEY,
// });

// export const openrouter = createVertex({
  
//   project: secretConfig?.GOOGLE_VERTEX_API_PROJECT,
//   location: 'us-east5',
//   // baseURL: `https://aiplatform.googleapis.com/v1/projects/${process.env.GOOGLE_VERTEX_API_PROJECT}/locations/global/publishers/google`,
// });


// export const anthropicVertex = createVertexAnthropic({
//   project: secretConfig?.GOOGLE_VERTEX_API_PROJECT,
//   location: 'us-east5',
// });



// export const cfGoogle = createGoogleGenerativeAI({
//   baseURL: `https://gateway.ai.cloudflare.com/v1/27b8e62d8524ace6148283bfe50320ad/test/google-ai-studio/v1beta`,
//   headers:{
//     'Authorization': `Bearer V92fufRb3StqsUjhisoZdmJduzNwlW_774DBp1Dy`
//   }
// });