import "dotenv/config";
import { faker } from "@faker-js/faker";
import { PrismaPg } from "@prisma/adapter-pg";
import * as bcrypt from "bcryptjs";
import { Pool } from "pg";
import { type OrgStatus, PrismaClient } from "@/app/generated/prisma/client";
import { auth } from "@/lib/auth";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Thai food menu items data
const thaiCategories = [
    {
        nameEn: "Appetizers",
        nameTh: "อาหารว่าง",
        nameMm: "အစားအသောက်",
        nameSh: "ထမင်းလှော်",
    },
    {
        nameEn: "Soups",
        nameTh: "ซุป",
        nameMm: "ဟင်းချို",
        nameSh: "ဟင်းချို",
    },
    {
        nameEn: "Main Course",
        nameTh: "อาหารจานหลัก",
        nameMm: "အဓိကအစားအစာ",
        nameSh: "ထမင်းချက်",
    },
    {
        nameEn: "Noodles",
        nameTh: "ก๋วยเตี๋ยว",
        nameMm: "ခေါက်ဆွဲ",
        nameSh: "ခေါက်ဆွဲ",
    },
    {
        nameEn: "Rice Dishes",
        nameTh: "ข้าว",
        nameMm: "ထမင်း",
        nameSh: "ထမင်း",
    },
    {
        nameEn: "Salads",
        nameTh: "ยำ",
        nameMm: "သုပ်",
        nameSh: "သုပ်",
    },
    {
        nameEn: "Desserts",
        nameTh: "ของหวาน",
        nameMm: "အချိုပွဲ",
        nameSh: "အချိုပွဲ",
    },
    {
        nameEn: "Beverages",
        nameTh: "เครื่องดื่ม",
        nameMm: "အချိုရည်",
        nameSh: "အချိုရည်",
    },
];

const menuItemsData = {
    Appetizers: [
        {
            nameEn: "Spring Rolls",
            nameTh: "ปอเปี๊ยะทอด",
            nameMm: "ကော်ပြန်း",
            nameSh: "ကော်ပြန်း",
            price: 60,
        },
        {
            nameEn: "Chicken Satay",
            nameTh: "ไก่สะเต๊ะ",
            nameMm: "ကြက်သား Satay",
            nameSh: "ကြက်သား Satay",
            price: 80,
        },
        {
            nameEn: "Fish Cakes",
            nameTh: "ทอดมันปลา",
            nameMm: "ငါးကြော်",
            nameSh: "ငါးကြော်",
            price: 70,
        },
        {
            nameEn: "Fried Wontons",
            nameTh: "เกี๊ยวทอด",
            nameMm: "ကော်ဖြူကြော်",
            nameSh: "ကော်ဖြူကြော်",
            price: 65,
        },
    ],
    Soups: [
        {
            nameEn: "Tom Yum Goong",
            nameTh: "ต้มยำกุ้ง",
            nameMm: "Tom Yum ပုစွန်",
            nameSh: "Tom Yum ပုစွန်",
            price: 180,
        },
        {
            nameEn: "Tom Kha Gai",
            nameTh: "ต้มข่าไก่",
            nameMm: "Tom Kha ကြက်သား",
            nameSh: "Tom Kha ကြက်သား",
            price: 160,
        },
        {
            nameEn: "Clear Soup",
            nameTh: "แกงจืด",
            nameMm: "ရေချို",
            nameSh: "ရေချို",
            price: 80,
        },
    ],
    "Main Course": [
        {
            nameEn: "Massaman Curry",
            nameTh: "แกงมัสมั่น",
            nameMm: "Massaman ဟင်း",
            nameSh: "Massaman ဟင်း",
            price: 180,
        },
        {
            nameEn: "Green Curry",
            nameTh: "แกงเขียวหวาน",
            nameMm: "အစိမ်းရောင် Curry",
            nameSh: "အစိမ်းရောင် Curry",
            price: 170,
        },
        {
            nameEn: "Panang Curry",
            nameTh: "พะแนง",
            nameMm: "Panang ဟင်း",
            nameSh: "Panang ဟင်း",
            price: 180,
        },
        {
            nameEn: "Red Curry",
            nameTh: "แกงเผ็ด",
            nameMm: "အနီရောင် Curry",
            nameSh: "အနီရောင် Curry",
            price: 170,
        },
        {
            nameEn: "Stir-Fried Basil",
            nameTh: "ผัดกะเพรา",
            nameMm: "ပန်းပွင့် ကြော်",
            nameSh: "ပန်းပွင့် ကြော်",
            price: 120,
        },
        {
            nameEn: "Stir-Fried Cashew Nuts",
            nameTh: "ผัดเม็ดมะม่วง",
            nameMm: "သီဟိုဠ် ကြော်",
            nameSh: "သီဟိုဠ် ကြော်",
            price: 140,
        },
    ],
    Noodles: [
        {
            nameEn: "Pad Thai",
            nameTh: "ผัดไทย",
            nameMm: "Pad Thai",
            nameSh: "Pad Thai",
            price: 120,
        },
        {
            nameEn: "Pad See Ew",
            nameTh: "ผัดซีอิ๊ว",
            nameMm: "Pad See Ew",
            nameSh: "Pad See Ew",
            price: 110,
        },
        {
            nameEn: "Drunken Noodles",
            nameTh: "ผัดขี้เมา",
            nameMm: "ယစ်မူး ခေါက်ဆွဲ",
            nameSh: "ယစ်မူး ခေါက်ဆွဲ",
            price: 120,
        },
        {
            nameEn: "Boat Noodles",
            nameTh: "ก๋วยเตี๋ยวเรือ",
            nameMm: "လှေခေါက်ဆွဲ",
            nameSh: "လှေခေါက်ဆွဲ",
            price: 80,
        },
    ],
    "Rice Dishes": [
        {
            nameEn: "Fried Rice",
            nameTh: "ข้าวผัด",
            nameMm: "ထမင်းကြော်",
            nameSh: "ထမင်းကြော်",
            price: 90,
        },
        {
            nameEn: "Pineapple Fried Rice",
            nameTh: "ข้าวผัดสับปะรด",
            nameMm: "နာနတ်သီး ထမင်းကြော်",
            nameSh: "နာနတ်သီး ထမင်းကြော်",
            price: 140,
        },
        {
            nameEn: "Chicken Rice",
            nameTh: "ข้าวมันไก่",
            nameMm: "ကြက်သား ထမင်း",
            nameSh: "ကြက်သား ထမင်း",
            price: 80,
        },
    ],
    Salads: [
        {
            nameEn: "Som Tum",
            nameTh: "ส้มตำ",
            nameMm: "သုပ်ချဉ်",
            nameSh: "သုပ်ချဉ်",
            price: 80,
        },
        {
            nameEn: "Larb",
            nameTh: "ลาบ",
            nameMm: "Larb",
            nameSh: "Larb",
            price: 100,
        },
        {
            nameEn: "Yum Woon Sen",
            nameTh: "ยำวุ้นเส้น",
            nameMm: "ဖန်စီသုပ်",
            nameSh: "ဖန်စီသုပ်",
            price: 90,
        },
    ],
    Desserts: [
        {
            nameEn: "Mango Sticky Rice",
            nameTh: "ข้าวเหนียวมะม่วง",
            nameMm: "သရက်သီး စပ်းထမင်း",
            nameSh: "သရက်သီး စပ်းထမင်း",
            price: 80,
        },
        {
            nameEn: "Thai Custard",
            nameTh: "สังขยา",
            nameMm: "ထိုင်း Custard",
            nameSh: "ထိုင်း Custard",
            price: 60,
        },
        {
            nameEn: "Coconut Ice Cream",
            nameTh: "ไอศกรีมกะทิ",
            nameMm: "အုန်းနို့ ရေခဲမုန့်",
            nameSh: "အုန်းနို့ ရေခဲမုန့်",
            price: 50,
        },
    ],
    Beverages: [
        {
            nameEn: "Thai Iced Tea",
            nameTh: "ชาเย็น",
            nameMm: "ထိုင်း လက်ဖက်ရည်အေး",
            nameSh: "ထိုင်း လက်ဖက်ရည်အေး",
            price: 40,
        },
        {
            nameEn: "Thai Iced Coffee",
            nameTh: "กาแฟเย็น",
            nameMm: "ထိုင်း ကော်ဖီအေး",
            nameSh: "ထိုင်း ကော်ဖီအေး",
            price: 45,
        },
        {
            nameEn: "Fresh Coconut Water",
            nameTh: "น้ำมะพร้าวสด",
            nameMm: "အုန်းရည်လတ်လတ်",
            nameSh: "အုန်းရည်လတ်လတ်",
            price: 50,
        },
        {
            nameEn: "Lime Juice",
            nameTh: "น้ำมะนาว",
            nameMm: "သံပုရာရည်",
            nameSh: "သံပုရာရည်",
            price: 35,
        },
    ],
};

// Helper function to generate random table token
function generateTableToken(): string {
    return `TBL-${faker.string.alphanumeric(8).toUpperCase()}`;
}

async function main() {
    console.log("🌱 Starting seed...");

    // Clean existing data
    console.log("🧹 Cleaning existing data...");
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.menuItem.deleteMany();
    await prisma.menuCategory.deleteMany();
    await prisma.table.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();

    // Create Super Admin
    console.log("👤 Creating super admin...");

    // const admin = await prisma.user.create({
    //     data: {
    //         id: faker.string.uuid(),
    //         email: "admin@foodorder.com",
    //         name: "Super Admin",
    //         emailVerified: true,
    //         role: "SUPER_ADMIN",
    //     },
    // });

    const adminRes = await auth.api.signUpEmail({
        body: {
            email: "admin@foodorder.com",
            password: "admin123",
            name: "Super Admin",
            role: "SUPER_ADMIN",
        },
    });

    console.log("✅ Admin created:", adminRes.user.email);

    // Create Restaurant Owners and Organizations
    console.log("🏢 Creating restaurant owners and organizations...");

    const restaurantData: {
        name: string;
        slug: string;
        description: string;
        status: OrgStatus;
        city: string;
    }[] = [
        {
            name: "Som Tum Café",
            slug: "somtum-cafe",
            description: "Authentic Thai cuisine with a modern twist",
            status: "ACTIVE",
            city: "Bangkok",
        },
        {
            name: "Bangkok Street Kitchen",
            slug: "bangkok-street-kitchen",
            description: "Traditional Thai street food experience",
            status: "ACTIVE",
            city: "Bangkok",
        },
        {
            name: "Thai Fusion Restaurant",
            slug: "thai-fusion",
            description: "Where tradition meets innovation",
            status: "PENDING",
            city: "Chiang Mai",
        },
        {
            name: "Royal Thai Cuisine",
            slug: "royal-thai",
            description: "Fine dining Thai restaurant",
            status: "ACTIVE",
            city: "Phuket",
        },
        {
            name: "Spicy Noodle House",
            slug: "spicy-noodle",
            description: "Best noodles in town",
            status: "PENDING",
            city: "Pattaya",
        },
    ];

    const organizations = [];

    for (const resto of restaurantData) {
        const ownerPassword = await bcrypt.hash("owner123", 10);
        const ownerId = faker.string.uuid();

        const owner = await prisma.user.create({
            data: {
                id: ownerId,
                email: faker.internet.email().toLowerCase(),
                name: faker.person.fullName(),
                emailVerified: true,
                role: "OWNER",
            },
        });

        await prisma.account.create({
            data: {
                id: faker.string.uuid(),
                userId: owner.id,
                accountId: owner.id,
                providerId: "credential",
                password: ownerPassword,
            },
        });

        const organization = await prisma.organization.create({
            data: {
                name: resto.name,
                slug: resto.slug,
                description: resto.description,
                phone: faker.phone.number({ style: "international" }),
                address: faker.location.streetAddress(),
                city: resto.city,
                country: "TH",
                currency: "THB",
                defaultLanguage: "th",
                status: resto.status,
                ownerId: owner.id,
                approvedAt: resto.status === "ACTIVE" ? new Date() : null,
                approvedBy: resto.status === "ACTIVE" ? adminRes.user.id : null,
            },
        });

        organizations.push(organization);
        console.log(
            `✅ Created: ${organization.name} (${organization.status})`,
        );
    }

    // Create Tables, Menu, and Orders for ACTIVE restaurants
    for (const org of organizations.filter((o) => o.status === "ACTIVE")) {
        console.log(`\n🪑 Creating tables for ${org.name}...`);

        // Create 10-15 tables
        const tableCount = faker.number.int({ min: 10, max: 15 });
        const tables = [];

        for (let i = 1; i <= tableCount; i++) {
            const table = await prisma.table.create({
                data: {
                    tableNumber: i.toString(),
                    tableToken: generateTableToken(),
                    organizationId: org.id,
                    status: faker.helpers.arrayElement([
                        "FREE",
                        "FREE",
                        "FREE",
                        "OCCUPIED",
                        "NEEDS_CLEANING",
                    ]),
                },
            });
            tables.push(table);
        }
        console.log(`✅ Created ${tableCount} tables`);

        // Create Menu Categories and Items
        console.log(`📋 Creating menu for ${org.name}...`);

        let displayOrder = 0;
        for (const category of thaiCategories) {
            const menuCategory = await prisma.menuCategory.create({
                data: {
                    name: category.nameEn,
                    nameEn: category.nameEn,
                    nameTh: category.nameTh,
                    nameMm: category.nameMm,
                    nameSh: category.nameSh,
                    displayOrder: displayOrder++,
                    isActive: true,
                    organizationId: org.id,
                },
            });

            // Create menu items for this category
            const itemsForCategory =
                menuItemsData[category.nameEn as keyof typeof menuItemsData] ||
                [];

            let itemDisplayOrder = 0;
            for (const item of itemsForCategory) {
                await prisma.menuItem.create({
                    data: {
                        name: item.nameEn,
                        nameEn: item.nameEn,
                        nameTh: item.nameTh,
                        nameMm: item.nameMm,
                        nameSh: item.nameSh,
                        description: faker.lorem.sentence(),
                        price: item.price,
                        isAvailable: faker.datatype.boolean(0.9), // 90% available
                        isFeatured: faker.datatype.boolean(0.2), // 20% featured
                        displayOrder: itemDisplayOrder++,
                        categoryId: menuCategory.id,
                        organizationId: org.id,
                    },
                });
            }
        }
        console.log(`✅ Created menu with ${thaiCategories.length} categories`);

        // Create Orders
        console.log(`📦 Creating orders for ${org.name}...`);

        const orderCount = faker.number.int({ min: 20, max: 40 });
        const menuItems = await prisma.menuItem.findMany({
            where: { organizationId: org.id },
        });

        for (let i = 0; i < orderCount; i++) {
            const table = faker.helpers.arrayElement(tables);
            const sessionId = faker.string.uuid();
            const orderNumber = i + 1;

            // Random order status
            const status = faker.helpers.arrayElement([
                "PENDING",
                "PREPARING",
                "READY",
                "SERVED",
                "PAID",
                "PAID",
                "PAID", // More paid orders
            ]);

            // Create order with 1-5 items
            const itemCount = faker.number.int({ min: 1, max: 5 });
            const selectedItems = faker.helpers.arrayElements(
                menuItems,
                itemCount,
            );

            let subtotal = 0;
            const orderItemsData = [];

            for (const item of selectedItems) {
                const quantity = faker.number.int({ min: 1, max: 3 });
                const totalPrice = item.price * quantity;
                subtotal += totalPrice;

                orderItemsData.push({
                    menuItemId: item.id,
                    quantity,
                    unitPrice: item.price,
                    totalPrice,
                    specialRequest: faker.datatype.boolean(0.3)
                        ? faker.helpers.arrayElement([
                              "Extra spicy",
                              "No onions",
                              "Less sugar",
                              "Extra sauce",
                              "No peanuts",
                          ])
                        : undefined,
                });
            }

            const taxAmount = Math.round(subtotal * 0.07);
            const serviceAmount = Math.round(subtotal * 0.1);
            const total = subtotal + taxAmount + serviceAmount;

            const createdAt = faker.date.recent({ days: 7 });

            await prisma.order.create({
                data: {
                    sessionId,
                    tableToken: table.tableToken,
                    tableId: table.id,
                    organizationId: org.id,
                    orderNumber,
                    status,
                    subtotal,
                    taxAmount,
                    serviceAmount,
                    total,
                    isPaid: status === "PAID",
                    paidAt:
                        status === "PAID"
                            ? faker.date.recent({ days: 7 })
                            : null,
                    paymentMethod:
                        status === "PAID"
                            ? faker.helpers.arrayElement(["cash", "card"])
                            : null,
                    notes: faker.datatype.boolean(0.2)
                        ? faker.lorem.sentence()
                        : null,
                    createdAt,
                    items: {
                        create: orderItemsData,
                    },
                },
            });
        }
        console.log(`✅ Created ${orderCount} orders`);
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📝 Login Credentials:");
    console.log("━".repeat(50));
    console.log("Super Admin:");
    console.log("  Email: admin@foodorder.com");
    console.log("  Password: admin123");
    console.log("\nRestaurant Owner (any active restaurant):");
    console.log("  Password: owner123");
    console.log("  (Check database for owner emails)");
    console.log("━".repeat(50));
}

main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
