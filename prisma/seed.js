import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Delete all chat rooms
  await prisma.chatRoom.deleteMany({});
  console.log('Deleted all chat rooms');

  // Optionally, delete related records if necessary
  await prisma.userChatRoom.deleteMany({});
  console.log('Deleted all user-chat room relations');

  // You can also delete other related records if needed, such as messages
  await prisma.message.deleteMany({});
  console.log('Deleted all messages');

  // Seed other data if necessary
  // await prisma.user.create({
  //   data: {
  //     email: 'user@example.com',
  //     name: 'Example User',
  //     // other fields...
  //   },
  // });

  console.log('Seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
