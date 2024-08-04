// pages/api/auth/signup.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { email, name, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const hashedPassword = await hash(password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'User already exists' });
  }
}






















// import { NextApiRequest, NextApiResponse } from 'next';
// import bcrypt from 'bcryptjs';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   const { email, password, name } = req.body;

//   if (!email || !password || !name) {
//     return res.status(400).json({ message: 'Missing fields' });
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         name,
//       },
//     });

//     return res.status(201).json(user);
//   } catch (error) {
//     return res.status(500).json({ message: 'Internal server error' });
//   }
// }
