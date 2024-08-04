// src/pages/api/messages.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { chatRoomId } = req.query;

    if (typeof chatRoomId !== 'string') {
      return res.status(400).json({ error: 'Invalid chat room ID' });
    }

    try {
      const messages = await prisma.message.findMany({
        where: { chatRoomId },
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true, // Include the user's image
            },
          },
        },
      });

      const formattedMessages = messages.map(message => ({
        id: message.id,
        content: message.content,
        userId: message.userId,
        createdAt: message.createdAt,
        userImage: message.user.image, // Include the user's image in the response
      }));

      res.status(200).json(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Error fetching messages' });
    }
  } else if (req.method === 'POST') {
    const { content, userId, chatRoomId } = req.body;

    try {
      const message = await prisma.message.create({
        data: {
          content,
          userId,
          chatRoomId,
        },
      });

      res.status(201).json(message);
    } catch (error) {
      console.error('Error creating message:', error);
      res.status(500).json({ error: 'Error creating message' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
