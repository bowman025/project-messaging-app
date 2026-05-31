import { PrismaClient } from '@project-messaging-app/db/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL,
});

export const testDb = new PrismaClient({ adapter });
