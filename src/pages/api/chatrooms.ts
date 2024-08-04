import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { userId } = req.query;

    if (typeof userId !== 'string') {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    try {
      const chatRooms = await prisma.userChatRoom.findMany({
        where: { userId },
        include: {
          chatRoom: {
            include: {
              users: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      });

      const formattedChatRooms = chatRooms.map(userChatRoom => {
        const chatRoom = userChatRoom.chatRoom;
        const userNames = chatRoom.users.map(uc => uc.user.name).join(', ');
        return {
          ...chatRoom,
          userNames,
        };
      });

      res.status(200).json(formattedChatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: 'Error fetching chat rooms' });
    }
  } else if (req.method === 'POST') {
    const { userId1, userId2 } = req.body;

    if (!userId1 || !userId2) {
      return res.status(400).json({ error: 'Missing user IDs' });
    }

    try {
      // Ensure to find a chat room with both users
      let chatRoom = await prisma.chatRoom.findFirst({
        where: {
          users: {
            every: {
              userId: {
                in: [userId1, userId2],
              },
            },
          },
        },
        include: { users: true },
      });

      if (!chatRoom) {
        chatRoom = await prisma.chatRoom.create({
          data: {
            users: {
              create: [
                { userId: userId1 },
                { userId: userId2 },
              ],
            },
            name: `${userId1} and ${userId2}`,
            ownerId: userId1,
          },
          include: { users: true },
        });
      }

      res.status(200).json({ chatRoom });
    } catch (error) {
      console.error('Error creating or fetching chat room:', error);
      res.status(500).json({ error: 'Error creating or fetching chat room' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
