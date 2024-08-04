import { DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    email: string;
    name: string | null;
    password?: string;
    image?: string | null;
  }
  export interface CustomUser extends DefaultUser {
    id: string;
    email: string;
    name: string | null;
    image?: string | null;  // Optional field for user image
  }
  interface Session {
    user: User;
  }

  interface JWT {
    sub: string;
  }
}
