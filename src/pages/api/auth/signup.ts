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

  try {
    // Check if a user with the provided email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("User already exists with this email:", email);
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password before saving
    const hashedPassword = await hash(password, 10);
    console.log("Sign-up Hashed Password:", hashedPassword);
    
    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    console.log("User created successfully:", user);

    // Return the created user and let the frontend handle login
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








