// Simple secrets checker used by developers and CI-local checks.
// Exits with code 1 if any required env var is missing or looks like a placeholder.
const required = [
  'GEMINI_API_KEY',
  // CI-only Android keystore pieces (may be provided as GH Secrets instead of local env)
  'ANDROID_KEYSTORE_BASE64',
  'KEYSTORE_PASSWORD',
  'KEY_ALIAS',
  'KEY_PASSWORD'
];

const placeholderRe = /replace|your[_ -]?key|changeme|xxx|<.+>/i;

const missing = [];
for (const name of required) {
  const v = process.env[name];
  if (!v || v.trim() === '' || placeholderRe.test(v)) missing.push(name);
}

if (missing.length) {
  console.error('Missing or placeholder secrets detected:', missing.join(', '));
  console.error('If running locally, create a private .env.local (do NOT commit).');
  console.error('In CI, ensure these are defined as repository secrets.');
  process.exit(1);
}

console.log('All required secrets appear to be present.');
process.exit(0);
