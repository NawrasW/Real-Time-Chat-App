import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name, password } = req.body;

  console.log("Incoming request:", { email, name, password });

  if (!email || !password || !name) {
    console.log("Missing fields in request body");
    return res.status(400).json({ message: 'Missing fields' });
  }

  const hashedPassword = await hash(password, 10);

  try {
    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log("User created successfully:", user);

    // Instead of attempting to sign in, just return the created user and let the frontend handle login
    return res.status(201).json({ message: 'User created successfully', user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during user creation:", error.message);
      return res.status(500).json({ message: 'Error during user creation', error: error.message });
    } else {
      console.error("Unknown error during user creation:", error);
      return res.status(500).json({ message: 'Unknown error during user creation' });
    }
  }
}
