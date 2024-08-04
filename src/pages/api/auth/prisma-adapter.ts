import { Adapter, AdapterUser } from 'next-auth/adapters';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

const adapter: Adapter = {
  async createUser(profile) {
    const { email, name, password } = profile;

    // Handle case where password is not provided (e.g., for Google sign-ins)
    const hashedPassword = password ? await hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: null, // Ensure this matches your expected structure
        image: null // Or set this to a default image URL if needed
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      emailVerified: user.emailVerified,
      image: user.image
    } as AdapterUser; // Cast to AdapterUser
  },
  // Implement other adapter methods here if needed
};

export default adapter;
