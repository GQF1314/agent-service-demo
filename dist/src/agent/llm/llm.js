"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { createVertex } from "@ai-sdk/google-vertex";
// import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// import { createVertexAnthropic } from '@ai-sdk/google-vertex/anthropic';
// import { createGoogleGenerativeAI } from "@ai-sdk/google";
const config_1 = __importDefault(require("config"));
const secretConfig = config_1.default.get("secret");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGxtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2FnZW50L2xsbS9sbG0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx3REFBd0Q7QUFDeEQsa0VBQWtFO0FBQ2xFLDJFQUEyRTtBQUMzRSw2REFBNkQ7QUFDN0Qsb0RBQTRCO0FBRzVCLE1BQU0sWUFBWSxHQUFHLGdCQUFNLENBQUMsR0FBRyxDQUFzQixRQUFRLENBQUMsQ0FBQztBQUMvRCxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7SUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFJRCxpREFBaUQ7QUFDakQseUNBQXlDO0FBQ3pDLE1BQU07QUFFTiwyQ0FBMkM7QUFFM0Msc0RBQXNEO0FBQ3RELDBCQUEwQjtBQUMxQiw2SUFBNkk7QUFDN0ksTUFBTTtBQUdOLHlEQUF5RDtBQUN6RCxzREFBc0Q7QUFDdEQsMEJBQTBCO0FBQzFCLE1BQU07QUFJTixxREFBcUQ7QUFDckQsbUhBQW1IO0FBQ25ILGNBQWM7QUFDZCx5RUFBeUU7QUFDekUsTUFBTTtBQUNOLE1BQU0iLCJzb3VyY2VzQ29udGVudCI6WyIvLyBpbXBvcnQgeyBjcmVhdGVWZXJ0ZXggfSBmcm9tIFwiQGFpLXNkay9nb29nbGUtdmVydGV4XCI7XG4vLyBpbXBvcnQgeyBjcmVhdGVPcGVuUm91dGVyIH0gZnJvbSBcIkBvcGVucm91dGVyL2FpLXNkay1wcm92aWRlclwiO1xuLy8gaW1wb3J0IHsgY3JlYXRlVmVydGV4QW50aHJvcGljIH0gZnJvbSAnQGFpLXNkay9nb29nbGUtdmVydGV4L2FudGhyb3BpYyc7XG4vLyBpbXBvcnQgeyBjcmVhdGVHb29nbGVHZW5lcmF0aXZlQUkgfSBmcm9tIFwiQGFpLXNkay9nb29nbGVcIjtcbmltcG9ydCBjb25maWcgZnJvbSBcImNvbmZpZ1wiO1xuaW1wb3J0IHsgQXBwQ29uZmlnIH0gZnJvbSBcIi4uLy4uL2luZGV4XCI7XG5cbmNvbnN0IHNlY3JldENvbmZpZyA9IGNvbmZpZy5nZXQ8QXBwQ29uZmlnWydzZWNyZXQnXT4oXCJzZWNyZXRcIik7XG5pZiAoIXNlY3JldENvbmZpZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcInNlY3JldENvbmZpZyBpcyBub3Qgc2V0XCIpO1xufVxuXG5cblxuLy8gZXhwb3J0IGNvbnN0IG9wZW5yb3V0ZXJ2MSA9IGNyZWF0ZU9wZW5Sb3V0ZXIoe1xuLy8gICAgIGFwaUtleTogc2VjcmV0Q29uZmlnPy5MTE1fQVBJX0tFWSxcbi8vIH0pO1xuXG4vLyBleHBvcnQgY29uc3Qgb3BlbnJvdXRlciA9IGNyZWF0ZVZlcnRleCh7XG4gIFxuLy8gICBwcm9qZWN0OiBzZWNyZXRDb25maWc/LkdPT0dMRV9WRVJURVhfQVBJX1BST0pFQ1QsXG4vLyAgIGxvY2F0aW9uOiAndXMtZWFzdDUnLFxuLy8gICAvLyBiYXNlVVJMOiBgaHR0cHM6Ly9haXBsYXRmb3JtLmdvb2dsZWFwaXMuY29tL3YxL3Byb2plY3RzLyR7cHJvY2Vzcy5lbnYuR09PR0xFX1ZFUlRFWF9BUElfUFJPSkVDVH0vbG9jYXRpb25zL2dsb2JhbC9wdWJsaXNoZXJzL2dvb2dsZWAsXG4vLyB9KTtcblxuXG4vLyBleHBvcnQgY29uc3QgYW50aHJvcGljVmVydGV4ID0gY3JlYXRlVmVydGV4QW50aHJvcGljKHtcbi8vICAgcHJvamVjdDogc2VjcmV0Q29uZmlnPy5HT09HTEVfVkVSVEVYX0FQSV9QUk9KRUNULFxuLy8gICBsb2NhdGlvbjogJ3VzLWVhc3Q1Jyxcbi8vIH0pO1xuXG5cblxuLy8gZXhwb3J0IGNvbnN0IGNmR29vZ2xlID0gY3JlYXRlR29vZ2xlR2VuZXJhdGl2ZUFJKHtcbi8vICAgYmFzZVVSTDogYGh0dHBzOi8vZ2F0ZXdheS5haS5jbG91ZGZsYXJlLmNvbS92MS8yN2I4ZTYyZDg1MjRhY2U2MTQ4MjgzYmZlNTAzMjBhZC90ZXN0L2dvb2dsZS1haS1zdHVkaW8vdjFiZXRhYCxcbi8vICAgaGVhZGVyczp7XG4vLyAgICAgJ0F1dGhvcml6YXRpb24nOiBgQmVhcmVyIFY5MmZ1ZlJiM1N0cXNVamhpc29aZG1KZHV6TndsV183NzREQnAxRHlgXG4vLyAgIH1cbi8vIH0pOyJdfQ==