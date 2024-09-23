// src/pages/api/users/[id].ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Use a platform-specific temporary directory
const tempDir = process.env.NODE_ENV === 'production' ? '/tmp'  : path.join(process.cwd(), 'temp'); 

export const config = {
  api: {
    bodyParser: false, // Disable body parsing to handle file uploads
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  if (method === 'GET') {
    try {
      const user = await prisma.user.findUnique({ where: { id } });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else if (method === 'PUT') {
    console.log('Temporary directory path:', tempDir);
    console.log('Does the directory exist?', fs.existsSync(tempDir));

    const form = formidable({ uploadDir: tempDir, keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Form parse error' });
      }

      try {
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name ?? '';
        const password = Array.isArray(fields.password) ? fields.password[0] : fields.password ?? '';

        // Check if the user has a Google account
        const account = await prisma.account.findFirst({
          where: { userId: id, provider: 'google' },
        });

        let hashedPassword = null;
        if (password && !account) {
          const saltRounds = 10;
          hashedPassword = await bcrypt.hash(password, saltRounds);
        }

        let imagePath: string | null = null;

        // Check if an image is uploaded, else retain the existing image
        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image;
          const data = fs.readFileSync(file.filepath);

          imagePath = path.join('/uploads', file.originalFilename || 'default.jpg');
          const uploadPath = path.join(process.cwd(), 'public', imagePath);

          const directory = path.dirname(uploadPath);
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          fs.writeFileSync(uploadPath, data);
        } else {
          // If no new image is uploaded, keep the existing image path
          const existingUser = await prisma.user.findUnique({ where: { id } });
          if (existingUser?.image) {
            imagePath = existingUser.image; // Retain the current image
          }
        }

        // Update the user in the database
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name,
            password: hashedPassword || undefined, // Only set hashed password if it exists
            image: imagePath, // Update the image path, whether new or existing
          },
        });

        return res.status(200).json(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Error updating user' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
