import 'dotenv/config';
import { execSync } from 'child_process';
import db from '@project-messaging-app/db';

export const testDb = db;

beforeAll(async () => {
  execSync('npx prisma migrate deploy', {
    cwd: '../../packages/db',
    env: {
      ...process.env,
      DATABASE_URL: process.env.TEST_DATABASE_URL,
    },
    stdio: 'ignore',
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
