import NextAuth from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';

const prisma = new PrismaClient();

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("Attempting to log in with credentials:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("Login failed: Missing credentials.");
          return null;
        }

        // Find the user in the database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user) {
          console.log("User found:", user.email);
        } else {
          console.log("User not found with email:", credentials.email);
        }


       // const testPassword = 'Ayatwraikat'; // The correct plain password
       // const storedHashedPassword = '$2b$10$BuszJnDGQ88PufGB6vpLWOtGntYE0o';
       // const isPasswordCorrect1 = await compare(testPassword, storedHashedPassword);
       // console.log("Hardcoded Password Comparison:", isPasswordCorrect1); // Should be true if the hashing works


        // Compare the provided password with the stored hashed password
        const isPasswordCorrect = user && (await compare(credentials.password, user.password!));
       // console.log("Hardcoded Password Comparison:", isPasswordCorrect); // Should be true if the hashing works
        

        if (isPasswordCorrect) {
         // console.log("Password correct. Logging in user:", user.email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name ?? null,
            image: user.image ?? null, // Ensure this field is included
          };
        } else {
         // console.log("Login failed: Incorrect password for user:", credentials.email);
          return null;
        }
      },
    }),
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.image = token.image as string; // Include the image field
      }

      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.image = user.image; // Include the image field
      }
      return token;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl; // Redirect to the home page after successful login
    },
  },
});
