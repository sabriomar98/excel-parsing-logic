import 'dotenv/config'

import bcrypt from "bcryptjs";
import prisma from '../lib/db';



async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@attijariwafa.com' },
    update: {},
    create: {
      email: 'admin@attijariwafa.com',
      name: 'Administrator',
      passwordHash: adminPassword,
      role: 'admin',
    },
  });

  // Create test user
  const userPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@attijariwafa.com' },
    update: {},
    create: {
      email: 'user@attijariwafa.com',
      name: 'Test User',
      passwordHash: userPassword,
      role: 'user',
    },
  });

  console.log('✓ Seeded admin:', admin.email);
  console.log('✓ Seeded user:', user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
