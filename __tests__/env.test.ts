describe('Environment variable loading', () => {
  test('GEMINI_API_KEY should be defined in test env', () => {
    expect(process.env.GEMINI_API_KEY).toBeDefined();
    expect(process.env.GEMINI_API_KEY).not.toEqual('');
  });
});
