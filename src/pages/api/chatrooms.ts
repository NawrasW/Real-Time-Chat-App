import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    case 'GET':
      try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ error: 'Invalid or missing userId' });
        }

        const chatRooms = await prisma.chatRoom.findMany({
          where: {
            users: {
              some: {
                userId,
              },
            },
          },
          include: {
            users: {
              include: {
                user: true,
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
        });

        const formattedChatRooms = chatRooms.map(chatRoom => ({
          id: chatRoom.id,
          otherUsers: chatRoom.users.filter(userRelation => userRelation.userId !== userId).map(userRelation => userRelation.user),
          lastMessageContent: chatRoom.messages[0]?.content || 'No messages yet',
          lastMessageDate: chatRoom.messages[0]?.createdAt || null,
        }));

        return res.status(200).json(formattedChatRooms);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    case 'POST':
      try {
        const { userId1, userId2 } = req.body;

        if (!userId1 || !userId2) {
          return res.status(400).json({ error: 'Both userId1 and userId2 are required' });
        }

        let chatRoom = await prisma.chatRoom.findFirst({
          where: {
            AND: [
              { users: { some: { userId: userId1 } } },
              { users: { some: { userId: userId2 } } },
            ],
          },
          include: {
            users: {
              include: {
                user: true,
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1,
            },
          },
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
              owner: {
                connect: { id: userId1 },
              },
            },
            include: {
              users: {
                include: {
                  user: true,
                },
              },
              messages: {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1,
              },
            },
          });

          const formattedChatRoom = {
            id: chatRoom.id,
            otherUsers: chatRoom.users.filter(userRelation => userRelation.userId !== userId1).map(userRelation => userRelation.user),
            lastMessageContent: chatRoom.messages[0]?.content || 'No messages yet',
            lastMessageDate: chatRoom.messages[0]?.createdAt || null,
          };

          return res.status(200).json({ chatRoom: formattedChatRoom });
        }

        const formattedExistingChatRoom = {
          id: chatRoom.id,
          otherUsers: chatRoom.users.filter(userRelation => userRelation.userId !== userId1).map(userRelation => userRelation.user),
          lastMessageContent: chatRoom.messages[0]?.content || 'No messages yet',
          lastMessageDate: chatRoom.messages[0]?.createdAt || null,
        };

        return res.status(200).json({ chatRoom: formattedExistingChatRoom });
      } catch (error) {
        console.error('Error creating or fetching chat room:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}