// Env polyfills or setup for Next.js tests
require("dotenv").config({ path: ".env.test", override: true });

// Node.js Web APIs polyfills
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Simplified fetch polyfill for testing
global.fetch = jest.fn();

// Mock NextResponse for API route testing
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => {
      const response = {
        json: async () => data,
        headers: new Map(),
        status: init?.status || 200,
      };
      response.headers.set = jest.fn();
      return response;
    }),
  },
  NextRequest: jest.fn(),
}));

// Mock Google GenAI
jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: () => '안전한 테스트 응답입니다.',
        },
      }),
    })),
  })),
}));
global.Request = jest.fn();
global.Response = jest.fn();
global.Headers = jest.fn();
