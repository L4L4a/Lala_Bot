const { recommendMoviesByMood } = require('../test_helpers/core');
test('recommendMoviesByMood returns array for neutral', async () => {
  const res = await recommendMoviesByMood('neutral');
  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);
});