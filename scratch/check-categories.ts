import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const cats = await db.category.findMany();
  console.log("Total categories:", cats.length);
  cats.forEach(c => console.log(" -", c.name, "|", c.title));
  const users = await db.user.findMany({ select: { email: true, role: true } });
  console.log("\nTotal users:", users.length);
  users.forEach(u => console.log(" -", u.email, "|", u.role));
  await db.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
