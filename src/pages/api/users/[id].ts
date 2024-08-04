import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parsing to handle file uploads
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
      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (method === 'PUT') {
    const form = formidable({});

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Form parse error:', err);
        return res.status(500).json({ error: 'Form parse error' });
      }

      try {
        const name = Array.isArray(fields.name) ? fields.name[0] : fields.name ?? '';
        const password = Array.isArray(fields.password) ? fields.password[0] : fields.password ?? '';
        let imagePath: string | null = null;

        if (files.image) {
          const file = Array.isArray(files.image) ? files.image[0] : files.image;
          console.log('File received:', file);
          const data = fs.readFileSync(file.filepath);

          imagePath = path.join('/uploads', file.originalFilename || 'default.jpg');
          const uploadPath = path.join(process.cwd(), 'public', imagePath);

          // Create the directory if it doesn't exist
          const directory = path.dirname(uploadPath);
          if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
          }

          console.log('Saving file to:', uploadPath);
          fs.writeFileSync(uploadPath, data);
        }

        console.log('Updating user with ID:', id);
        const updatedUser = await prisma.user.update({
          where: { id },
          data: {
            name,
            password,
            image: imagePath,
          },
        });

        console.log('User updated successfully:', updatedUser);
        res.status(200).json(updatedUser);
      } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Error updating user' });
      }
    });
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
