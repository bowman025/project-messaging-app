import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const alice = await db.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      username: 'alice',
      email: 'alice@example.com',
      passwordHash,
    },
  });

  const bob = await db.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      username: 'bob',
      email: 'bob@example.com',
      passwordHash,
    },
  });

  const conversation = await db.conversation.create({
    data: {
      participants: {
        create: [{ userId: alice.id }, { userId: bob.id }],
      },
    },
  });

  await db.message.create({
    data: {
      content: 'Hey Bob!',
      authorId: alice.id,
      conversationId: conversation.id,
    },
  });

  await db.message.create({
    data: {
      content: 'Hey Alice!',
      authorId: bob.id,
      conversationId: conversation.id,
    },
  });

  console.warn('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
