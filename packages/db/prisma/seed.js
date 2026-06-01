import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const db = new PrismaClient({ adapter });

async function main() {
  await db.message.deleteMany();
  await db.participant.deleteMany();
  await db.conversation.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123', 10);

  const alice = await db.user.create({
    data: { username: 'alice', email: 'alice@example.com', passwordHash },
  });

  const bob = await db.user.create({
    data: { username: 'bob', email: 'bob@example.com', passwordHash },
  });

  const dave = await db.user.create({
    data: { username: 'dave', email: 'dave@example.com', passwordHash },
  });

  const dm = await db.conversation.create({
    data: {
      creatorId: alice.id,
      participants: {
        create: [{ userId: alice.id }, { userId: bob.id }],
      },
    },
  });

  const group = await db.conversation.create({
    data: {
      name: 'The Gang',
      isGroup: true,
      creatorId: alice.id,
      participants: {
        create: [{ userId: alice.id }, { userId: bob.id }, { userId: dave.id }],
      },
    },
  });

  await db.message.create({
    data: { content: 'Hey Bob!', authorId: alice.id, conversationId: dm.id },
  });

  await db.message.create({
    data: { content: 'Hey Alice!', authorId: bob.id, conversationId: dm.id },
  });

  await db.message.create({
    data: { content: 'Hey everyone!', authorId: alice.id, conversationId: group.id },
  });

  await db.message.create({
    data: { content: 'Hey Alice!', authorId: bob.id, conversationId: group.id },
  });

  await db.message.create({
    data: { content: 'Hey all!', authorId: dave.id, conversationId: group.id },
  });

  console.warn('Seeding complete.');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
