import { execSync } from 'child_process';
import { PrismaClient } from '../../../packages/db/generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.TEST_DATABASE_URL,
});

export const testDb = new PrismaClient({ adapter });

beforeAll(async () => {
  execSync('npx prisma migrate deploy', {
    cwd: '../../packages/db',
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
  });
});

afterEach(async () => {
  await testDb.message.deleteMany();
  await testDb.participant.deleteMany();
  await testDb.conversation.deleteMany();
  await testDb.user.deleteMany();
});

afterAll(async () => {
  await testDb.$disconnect();
});
