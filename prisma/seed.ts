import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean database before seeding
  console.log("Cleaning database...");
  await prisma.savedProperty.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // 1. Create Users
  console.log("Seeding users...");
  await prisma.user.create({
    data: {
      name: "Admin Peshawar Property Hub",
      email: "admin@propertyhub.pk",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "091-555-1234",
    },
  });

  await prisma.user.create({
    data: {
      name: "Khyber Realtors (Pvt) Ltd",
      email: "agent@propertyhub.pk",
      password: agentPassword,
      role: Role.AGENT,
      phone: "0300-1234567",
      profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    },
  });

  await prisma.user.create({
    data: {
      name: "Husnain Khan",
      email: "buyer@propertyhub.pk",
      password: userPassword,
      role: Role.USER,
      phone: "0333-7654321",
    },
  });

  // 2. Create permanent categories
  console.log("Seeding categories...");
  await prisma.category.createMany({
    data: [
      {
        name: "APARTMENT",
        title: "Find Your Perfect Apartment",
        description: "High-rise executive suites, modern flat systems, and student studio apartments.",
        image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&q=80",
      },
      {
        name: "HOUSE",
        title: "Discover Your Dream Home",
        description: "Premium double-unit villas, single family homes, and heritage bungalows.",
        image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&q=80",
      },
      {
        name: "SHOP",
        title: "Grow Your Business",
        description: "Retail markets, department showrooms, plazas, and commercial business spots.",
        image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80",
      },
      {
        name: "PLOT",
        title: "Invest In Land Opportunities",
        description: "Developed housing plots, utility files, and construction land blocks.",
        image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=600&q=80",
      },
    ],
  });

  console.log("✅ Database seeded successfully! Users & permanent categories created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
