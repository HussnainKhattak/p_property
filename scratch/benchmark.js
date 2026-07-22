const { getFeaturedProperties, getLatestProperties, getHomepageStats, getPopularAreas } = require('../lib/data');

async function benchmark() {
  console.log("=== BENCHMARK START ===");
  
  const start1 = Date.now();
  await Promise.all([
    getFeaturedProperties(),
    getLatestProperties(4),
    getPopularAreas(),
    getHomepageStats()
  ]);
  const duration1 = Date.now() - start1;
  console.log(`Initial / Cold Cache Fetch: ${duration1}ms`);

  const start2 = Date.now();
  await Promise.all([
    getFeaturedProperties(),
    getLatestProperties(4),
    getPopularAreas(),
    getHomepageStats()
  ]);
  const duration2 = Date.now() - start2;
  console.log(`Cached / Warm Fetch: ${duration2}ms`);
  
  console.log("=== BENCHMARK COMPLETE ===");
}

benchmark();
