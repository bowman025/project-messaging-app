import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis;

const getConnectionString = () => {
  if (process.env.NODE_ENV === 'test' && process.env.TEST_DATABASE_URL) {
    return process.env.TEST_DATABASE_URL;
  }
  return process.env.DATABASE_URL;
};

const createClient = () => {
  const adapter = new PrismaPg({
    connectionString: getConnectionString(),
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

const db =
  process.env.NODE_ENV === 'test' ? createClient() : (globalForPrisma.prisma ?? createClient());

if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = db;
}

export default db;
