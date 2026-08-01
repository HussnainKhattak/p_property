const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  try {
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        title: true,
        propertyType: true,
      }
    });
    console.log("Total properties in DB:", properties.length);
    console.log("Sample properties:", JSON.stringify(properties, null, 2));
    
    // Group by propertyType
    const counts = {};
    for (const p of properties) {
      counts[p.propertyType] = (counts[p.propertyType] || 0) + 1;
    }
    console.log("Property counts by type:", counts);
  } catch (err) {
    console.error("Error checking DB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
