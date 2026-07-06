import { PrismaClient, Role, PropertyType, ListingType, PropertyStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Clean database before seeding
  await prisma.savedProperty.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.property.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Create hashed passwords
  const adminPassword = await bcrypt.hash("admin123", 10);
  const agentPassword = await bcrypt.hash("agent123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      name: "Admin Peshawar Property Hub",
      email: "admin@propertyhub.pk",
      password: adminPassword,
      role: Role.ADMIN,
      phone: "091-555-1234",
    },
  });

  const agent = await prisma.user.create({
    data: {
      name: "Khyber Realtors (Pvt) Ltd",
      email: "agent@propertyhub.pk",
      password: agentPassword,
      role: Role.AGENT,
      phone: "0300-1234567",
      profileImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
    },
  });

  const buyer = await prisma.user.create({
    data: {
      name: "Husnain Khan",
      email: "buyer@propertyhub.pk",
      password: userPassword,
      role: Role.USER,
      phone: "0333-7654321",
    },
  });

  console.log("✅ Users created successfully!");

  // 2. Create Properties in Peshawar using updated fields
  const property1 = await prisma.property.create({
    data: {
      title: "1 Kanal Luxury House in DHA Peshawar",
      description: "A newly built, modern design 1 Kanal house in Sector A, DHA Peshawar. Features double unit layout, 5 master bedrooms, imported fittings, marble flooring, and a beautiful front lawn.",
      price: 65000000, // 6.5 Crore PKR
      marla: 20.0, // 1 Kanal = 20 Marla
      address: "Sector A, Phase 1",
      city: "Peshawar",
      area: "DHA Peshawar",
      propertyType: PropertyType.HOUSE,
      listingType: ListingType.SALE,
      bedrooms: 5,
      bathrooms: 6,
      status: PropertyStatus.AVAILABLE,
      imageUrls: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80"],
      videoUrl: null,
      ownerId: agent.id,
    },
  });

  const property2 = await prisma.property.create({
    data: {
      title: "5 Marla Commercial Plot in Regi Model Town",
      description: "Premium commercial plot on a 100ft road in Zone C, Regi Model Town, Peshawar. Ideal for plaza, shops, or office buildings. Immediate possession available.",
      price: 15000000, // 1.5 Crore PKR
      marla: 5.0,
      address: "Commercial Market, Zone C",
      city: "Peshawar",
      area: "Regi Model Town",
      propertyType: PropertyType.PLOT,
      listingType: ListingType.SALE,
      bedrooms: 0,
      bathrooms: 0,
      status: PropertyStatus.AVAILABLE,
      imageUrls: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80"],
      videoUrl: null,
      ownerId: agent.id,
    },
  });

  const property3 = await prisma.property.create({
    data: {
      title: "2 Bedroom Executive Apartment in Hayatabad",
      description: "Luxurious apartment on the 3rd floor of Hayatabad Heights. Features central heating/cooling, fully equipped kitchen, high-speed elevator, standby generator, and 24/7 security.",
      price: 120000, // 120,000 PKR per month
      marla: 6.0, // approx 6 Marla space
      address: "Phase 6, Hayatabad",
      city: "Peshawar",
      area: "Hayatabad",
      propertyType: PropertyType.APARTMENT,
      listingType: ListingType.RENT,
      bedrooms: 2,
      bathrooms: 2,
      status: PropertyStatus.AVAILABLE,
      imageUrls: ["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80"],
      videoUrl: null,
      ownerId: agent.id,
    },
  });

  console.log("✅ Properties seeded successfully!");

  // 3. Create Bookings/Visit Requests
  await prisma.booking.create({
    data: {
      userId: buyer.id,
      propertyId: property1.id,
      visitDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      message: "I am interested in buying this property. I would like to schedule a physical tour of the house.",
      status: "PENDING",
    },
  });

  // 4. Create Reviews
  await prisma.review.create({
    data: {
      userId: buyer.id,
      propertyId: property3.id,
      rating: 5,
      comment: "Superb apartment location and excellent facilities. The agent was extremely helpful and professional throughout the process.",
    },
  });

  console.log("✅ Bookings and reviews seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
