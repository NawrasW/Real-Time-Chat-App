import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    const query = req.query.query as string | undefined;
    console.log('Received query:', query); // Log query parameter

    try {
      if (typeof query !== 'string') {
        return res.status(400).json({ error: 'Invalid query parameter' });
      }

      const users = await prisma.user.findMany({
        where: {
          OR: [
            {
              name: {
                contains: query, // Removed 'mode'
                mode: 'insensitive', // Ensure case-insensitive search
              },
            },
            {
              email: {
                contains: query, // Removed 'mode'
                mode: 'insensitive', // Ensure case-insensitive search
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        },
      });

      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);

      // Type guard to check if error is an instance of Error
      if (error instanceof Error) {
        res.status(500).json({ error: 'Error fetching users', details: error.message });
      } else {
        res.status(500).json({ error: 'Error fetching users', details: 'Unknown error' });
      }
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
