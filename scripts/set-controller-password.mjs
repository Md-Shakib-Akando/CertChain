import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';

let mongoUri = process.env.MONGODB_URI;
if (!mongoUri && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) mongoUri = match[1].trim();
}

async function run() {
  await mongoose.connect(mongoUri);
  const hash = await bcrypt.hash('Controller@123', 10);
  const result = await mongoose.connection.db.collection('users').updateOne(
    { email: 'controller.pub@gmail.com' },
    { $set: { passwordHash: hash, role: 'controller', status: 'active', name: 'Dr. M. A. Karim (Controller)' } },
    { upsert: true }
  );
  console.log('Controller password updated:', result);
  process.exit(0);
}

run().catch(console.error);
