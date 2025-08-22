// Env polyfills or setup for Next.js tests
require("dotenv").config({ path: ".env.test", override: true });

// Node.js Web APIs polyfills
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Simplified fetch polyfill for testing
global.fetch = jest.fn();
global.Request = jest.fn();
global.Response = jest.fn();
global.Headers = jest.fn();
