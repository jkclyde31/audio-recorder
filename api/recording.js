import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./public/recordings.json');

export default function handler(req, res) {
  if (req.method === 'GET') {
    // Read the JSON file and send its contents
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read the file' });
    }
  } else if (req.method === 'POST') {
    // Append new recording name to the JSON file
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const recordings = JSON.parse(data);
      recordings.push({ name });
      fs.writeFileSync(filePath, JSON.stringify(recordings, null, 2));
      res.status(201).json({ message: 'Recording added successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to write to the file' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
