import type { NextApiRequest, NextApiResponse } from 'next';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY; // Replace with your Giphy API key

if (!GIPHY_API_KEY) {
  throw new Error('Missing GIPHY_API_KEY environment variable');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (typeof query !== 'string') {
    return res.status(400).json({ error: 'Invalid query parameter' });
  }

  try {
    const response = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${query}&limit=10`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data.data); // Return GIFs data
  } catch (error) {
    console.error('Error fetching GIFs:', error);
    res.status(500).json({ error: 'Error fetching GIFs' });
  }
}
