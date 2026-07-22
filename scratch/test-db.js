const { pingDatabase, maskDatabaseUrl, getAtlasHost } = require('../lib/db');

async function test() {
  console.log("Testing pingDatabase()...");
  console.log("Atlas Host:", getAtlasHost());
  console.log("Masked URL:", maskDatabaseUrl());
  const res = await pingDatabase();
  console.log("Ping Result:", JSON.stringify(res, null, 2));
}

test();
