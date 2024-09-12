// src/pages/api/chatrooms.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  switch (method) {
    // Handle GET requests to fetch chat rooms for a given user
    case 'GET':
      try {
        const { userId } = req.query;

        if (!userId || typeof userId !== 'string') {
          return res.status(400).json({ error: 'Invalid or missing userId' });
        }

        // Fetch chat rooms where the current user is involved
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
                user: true, // Include full user details
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1, // Include the last message
            },
          },
        });

        // Format chat rooms to match frontend expectations
        const formattedChatRooms = chatRooms.map(chatRoom => ({
          id: chatRoom.id,
          otherUsers: chatRoom.users.filter(userRelation => userRelation.userId !== userId).map(userRelation => userRelation.user),
          lastMessageContent: chatRoom.messages[0]?.content || 'No messages yet',
          lastMessageDate: chatRoom.messages[0]?.createdAt || '',
        }));

        return res.status(200).json(formattedChatRooms);
      } catch (error) {
        console.error('Error fetching chat rooms:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    // Handle POST requests to create or find a chat room
    case 'POST':
      try {
        const { userId1, userId2 } = req.body;

        if (!userId1 || !userId2) {
          return res.status(400).json({ error: 'Both userId1 and userId2 are required' });
        }

        // Check if a chat room already exists between the two users
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
                user: true, // Include full user details
              },
            },
            messages: {
              orderBy: {
                createdAt: 'desc',
              },
              take: 1, // Include the last message
            },
          },
        });

        // If no chat room exists, create a new one
        if (!chatRoom) {
          // Create a new chat room if not found
          chatRoom = await prisma.chatRoom.create({
            data: {
              users: {
                create: [
                  { userId: userId1 }, // Adding the first user to the chat room
                  { userId: userId2 }, // Adding the second user to the chat room
                ],
              },
              owner: {
                connect: { id: userId1 }, // Connect the owner to the first user
              },
            },
            include: {
              users: {
                include: {
                  user: true, // Include full user details
                },
              },
              messages: {
                orderBy: {
                  createdAt: 'desc',
                },
                take: 1, // Include the last message (if any)
              },
            },
          });
        }

        return res.status(200).json({ chatRoom });
      } catch (error) {
        console.error('Error creating or fetching chat room:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
