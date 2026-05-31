import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL,
});

const db = new PrismaClient({ adapter });

export default db;
