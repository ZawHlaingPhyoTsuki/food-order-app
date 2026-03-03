// prisma/seed.ts
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { faker } from "@faker-js/faker/locale/th";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seeding...");

  // 1. Create SUPER_ADMIN user
  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@platform.com" },
    update: {},
    create: {
      id: "admin-0001",
      name: "Platform Admin",
      email: "admin@platform.com",
      emailVerified: true,
      role: "SUPER_ADMIN",
      image: "https://i.pravatar.cc/150?u=admin",
    },
  });

  console.log(`Created/updated super admin: ${superAdmin.email}`);

  // 2. Create 8 restaurant owners
  const owners = [];
  for (let i = 1; i <= 8; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const email = faker.internet.email({ firstName, lastName }).toLowerCase();

    const owner = await prisma.user.create({
      data: {
        id: `owner-${i.toString().padStart(4, "0")}`, // manual ID
        name: `${firstName} ${lastName}`,
        email,
        emailVerified: true,
        role: "OWNER",
        image: `https://i.pravatar.cc/150?u=owner${i}`,
      },
    });
    owners.push(owner);
  }

  console.log(`Created ${owners.length} restaurant owners`);

  // 3. Create 8 restaurants (organizations)
  const organizations = [];
  const thaiRestaurants = [
    "ส้มตำคุณยาย",
    "ร้านข้าวมันไก่ต้นตำรับ",
    "ก๋วยเตี๋ยวเรืออยุธยา",
    "ลาบก้อยอีสานแท้",
    "ร้านหมูทอดกรอบนายเล้ง",
    "ข้าวผัดปูเจ้าดัง",
    "ติ่มซำเจ้าสัว",
    "ร้านส้มตำเจ๊ง้อ",
  ];

  for (let i = 0; i < owners.length; i++) {
    const owner = owners[i];
    const name = thaiRestaurants[i] || `ร้านอาหาร ${faker.company.name()}`;

    let slug = name
      .toLowerCase()
      .replace(/[\sก-๙]+/g, "-") // keep thai → better slugs
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    if (!slug) slug = `restaurant-${faker.string.numeric(6)}`;

    const org = await prisma.organization.create({
      data: {
        id: `org-${faker.string.uuid().slice(0, 8)}`, // or use cuid() if you import it
        name,
        slug: `${slug}-${faker.string.numeric(4)}`,
        description: faker.lorem.paragraphs(1),
        logo: `https://i.pravatar.cc/300?u=org${i}`,
        phone: `0${faker.string.numeric(9)}`, // realistic Thai mobile
        address: faker.location.streetAddress(true), // includes secondary (soi etc.)
        city: faker.helpers.arrayElement([
          "กรุงเทพมหานคร",
          "เชียงใหม่",
          "ภูเก็ต",
          "ขอนแก่น",
          "สงขลา",
          "พัทยา",
          "หาดใหญ่",
        ]),
        country: "TH",
        status: "ACTIVE",
        approvedAt: faker.date.past({ years: 1 }),
        approvedBy: superAdmin.id,
        currency: "THB",
        defaultLanguage: "th",
        ownerId: owner.id,
      },
    });

    organizations.push(org);
  }

  console.log(`Created ${organizations.length} restaurants`);

  // 4. Create tables for each restaurant (6–15 tables)
  for (const org of organizations) {
    const tableCount = faker.number.int({ min: 6, max: 15 });

    for (let t = 1; t <= tableCount; t++) {
      await prisma.table.create({
        data: {
          id: faker.string.uuid(), // or leave if @default(cuid())
          tableNumber: t <= 9 ? `0${t}` : `${t}`,
          tableToken: faker.string.uuid(),
          status: faker.helpers.arrayElement([
            "FREE",
            "OCCUPIED",
            "NEEDS_CLEANING",
          ]),
          organizationId: org.id,
        },
      });
    }
  }

  console.log("Created tables for all restaurants");

  // 5. Create menu categories & items
  const categoryNames = [
    "ส้มตำ",
    "ยำ",
    "ลาบ / ก้อย",
    "ต้ม",
    "ผัด",
    "ทอด",
    "ข้าว",
    "เส้น",
    "ของหวาน",
    "เครื่องดื่ม",
  ];

  for (const org of organizations) {
    for (const catName of categoryNames) {
      const category = await prisma.menuCategory.create({
        data: {
          id: faker.string.uuid(),
          name: catName,
          displayOrder: categoryNames.indexOf(catName),
          organizationId: org.id,
        },
      });

      const itemCount = faker.number.int({ min: 4, max: 12 });

      for (let j = 0; j < itemCount; j++) {
        const price = faker.number.int({ min: 45, max: 380 }) * 10;

        await prisma.menuItem.create({
          data: {
            id: faker.string.uuid(),
            name: `${catName} ${faker.food.dish()}`,
            description: faker.lorem.sentence({ min: 8, max: 18 }),
            price,
            image: `https://i.pravatar.cc/300?u=food${org.id?.slice(0, 8)}${j}`,
            isAvailable: faker.datatype.boolean({ probability: 0.88 }),
            isFeatured: j < 3,
            displayOrder: j,
            categoryId: category.id,
            organizationId: org.id,
          },
        });
      }
    }
  }

  console.log("Created menu categories and items");

  console.log("✅ Seeding finished successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
