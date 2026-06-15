import { PrismaClient } from '@prisma/client';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const currencies = [
  { code: 'USD', unit: '$' },
  { code: 'EUR', unit: '€' },
  { code: 'GBP', unit: '£' },
  { code: 'INR', unit: '₹' },
  { code: 'JPY', unit: '¥' },
  { code: 'CAD', unit: 'CA$' },
  { code: 'AUD', unit: 'A$' },
  { code: 'CHF', unit: 'CHF' },
  { code: 'CNY', unit: '¥' },
  { code: 'SEK', unit: 'kr' },
  { code: 'NZD', unit: 'NZ$' },
  { code: 'MXN', unit: 'MX$' },
  { code: 'SGD', unit: 'S$' },
  { code: 'HKD', unit: 'HK$' },
  { code: 'NOK', unit: 'kr' },
  { code: 'KRW', unit: '₩' },
  { code: 'TRY', unit: '₺' },
  { code: 'BRL', unit: 'R$' },
  { code: 'ZAR', unit: 'R' },
  { code: 'RUB', unit: '₽' },
  { code: 'PLN', unit: 'zł' },
  { code: 'THB', unit: '฿' },
  { code: 'IDR', unit: 'Rp' },
  { code: 'MYR', unit: 'RM' },
  { code: 'PHP', unit: '₱' },
  { code: 'CZK', unit: 'Kč' },
  { code: 'TWD', unit: 'NT$' },
  { code: 'AED', unit: 'د.إ' },
  { code: 'SAR', unit: '﷼' },
  { code: 'DKK', unit: 'kr' },
  { code: 'HUF', unit: 'Ft' },
  { code: 'CLP', unit: 'CLP$' },
  { code: 'ARS', unit: 'AR$' },
  { code: 'COP', unit: 'COL$' },
  { code: 'EGP', unit: 'E£' },
  { code: 'VND', unit: '₫' },
  { code: 'BTC', unit: '₿' },
];

interface CategorySeed {
  name: string;
  subcategories: string[];
}

const categories: CategorySeed[] = [
  {
    name: 'Uncategorized',
    subcategories: ['General'],
  },
  {
    name: 'Entertainment',
    subcategories: ['Games', 'Movies', 'Music', 'Sports', 'Other'],
  },
  {
    name: 'Food and Drink',
    subcategories: ['Dining out', 'Groceries', 'Liquor', 'Other'],
  },
  {
    name: 'Home',
    subcategories: [
      'Electronics',
      'Furniture',
      'Household supplies',
      'Maintenance',
      'Mortgage',
      'Pets',
      'Rent',
      'Services',
      'Other',
    ],
  },
  {
    name: 'Life',
    subcategories: [
      'Childcare',
      'Clothing',
      'Education',
      'Gifts',
      'Insurance',
      'Medical',
      'Taxes',
      'Other',
    ],
  },
  {
    name: 'Transportation',
    subcategories: [
      'Bicycle',
      'Bus/Train',
      'Car',
      'Gas/Fuel',
      'Hotel',
      'Parking',
      'Plane',
      'Taxi',
      'Other',
    ],
  },
  {
    name: 'Utilities',
    subcategories: [
      'Cleaning',
      'Electricity',
      'Heat/Gas',
      'Internet',
      'Trash',
      'TV/Phone',
      'Water',
      'Other',
    ],
  },
];

async function main() {
  console.log('Seeding currencies...');
  for (const currency of currencies) {
    await prisma.currency.upsert({
      where: { code: currency.code },
      update: { unit: currency.unit },
      create: currency,
    });
  }
  console.log(`Seeded ${currencies.length} currencies.`);

  console.log('Seeding categories...');
  let categoryCount = 0;
  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: { id: categoryCount + 1 },
      update: { name: category.name, parentId: null },
      create: { name: category.name, parentId: null },
    });
    categoryCount++;

    for (const sub of category.subcategories) {
      await prisma.category.upsert({
        where: { id: categoryCount + 1 },
        update: { name: sub, parentId: parent.id },
        create: { name: sub, parentId: parent.id },
      });
      categoryCount++;
    }
  }
  console.log(`Seeded ${categoryCount} categories.`);

  const demoPassword = 'demo-password';
  const existingUser = await prisma.user.findFirst({
    where: { email: 'demo@opensplit.dev' },
  });
  if (!existingUser) {
    const apiKey = randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(demoPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: 'demo@opensplit.dev',
        firstName: 'Demo',
        lastName: 'User',
        passwordHash,
        apiKey,
      },
    });
    console.log(`Created demo user (demo@opensplit.dev / ${demoPassword})`);
    console.log(`API key: ${apiKey}`);
    console.log(`User ID: ${user.id}`);
  } else {
    console.log(`Demo user already exists. API key: ${existingUser.apiKey}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
