const { db } = require('../lib/db');

async function testUserFlow() {
  console.log("Testing user.findUnique() query...");
  try {
    const testUser = await db.user.findFirst();
    console.log("User query successful:", testUser ? `User found (ID: ${testUser.id}, Email: ${testUser.email})` : "No users in DB yet");
  } catch (err) {
    console.error("User query failed:", err);
  } finally {
    await db.$disconnect();
  }
}

testUserFlow();
