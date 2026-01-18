import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script to populate database with mock data
 */
async function main() {
  console.log('🌱 Seeding database...');

  // Create users
  const user1 = await prisma.user.upsert({
    where: { email: 'ahmed.hasan@ugrad.iiuc.ac.bd' },
    update: {},
    create: {
      email: 'ahmed.hasan@ugrad.iiuc.ac.bd',
      name: 'Ahmed Hasan',
      picture: null,
      role: 'admin'
    }
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'fatima.ali@ugrad.iiuc.ac.bd' },
    update: {},
    create: {
      email: 'fatima.ali@ugrad.iiuc.ac.bd',
      name: 'Fatima Ali',
      picture: null,
      role: 'user'
    }
  });

  console.log('✅ Created users:', user1.name, user2.name);

  // Create items
  const items = [
    {
      name: 'Introduction to Computer Science - Textbook',
      category: 'Books',
      condition: 'Good',
      type: 'Donate',
      description: 'Used textbook, some highlights but in good condition. Perfect for CS101.',
      contact: '01712345678',
      ownerId: user1.id
    },
    {
      name: 'HP Laptop 15-inch',
      category: 'Laptops',
      condition: 'Excellent',
      type: 'Lend',
      description: 'Lending my laptop for semester projects. Please handle with care.',
      contact: '01712345678',
      ownerId: user1.id
    },
    {
      name: 'Calculus Notes - Complete Set',
      category: 'Notes',
      condition: 'Excellent',
      type: 'Donate',
      description: 'Comprehensive handwritten notes covering all calculus topics.',
      contact: '01787654321',
      ownerId: user2.id
    },
    {
      name: 'Scientific Calculator TI-84',
      category: 'Calculators',
      condition: 'Good',
      type: 'Lend',
      description: 'Calculator for engineering courses. Available for one semester.',
      contact: '01787654321',
      ownerId: user2.id
    },
    {
      name: 'Data Structures and Algorithms Book',
      category: 'Books',
      condition: 'Fair',
      type: 'Donate',
      description: 'Old edition but still useful for learning DSA concepts.',
      contact: '01712345678',
      ownerId: user1.id
    },
    {
      name: 'Physics Lab Manual',
      category: 'Books',
      condition: 'Excellent',
      type: 'Donate',
      description: 'Lab manual with all experiments documented. Very helpful for Physics 201.',
      contact: '01787654321',
      ownerId: user2.id
    }
  ];

  const createdItems = [];
  for (const itemData of items) {
    const item = await prisma.item.create({
      data: itemData
    });
    createdItems.push(item);
  }

  console.log(`✅ Created ${createdItems.length} items`);

  // Create requests
  const requests = [
    {
      itemId: createdItems[0].id, // Book requested by user2
      userId: user2.id,
      message: 'I need this book for my upcoming exam. Please approve.',
      status: 'Pending'
    },
    {
      itemId: createdItems[1].id, // Laptop requested by user2
      userId: user2.id,
      message: 'I need a laptop for my final project. Will return after 2 weeks.',
      status: 'Approved'
    },
    {
      itemId: createdItems[2].id, // Notes requested by user1
      userId: user1.id,
      message: 'These notes would be very helpful for my studies.',
      status: 'Pending'
    }
  ];

  for (const requestData of requests) {
    await prisma.request.create({
      data: requestData
    });
  }

  console.log(`✅ Created ${requests.length} requests`);
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
