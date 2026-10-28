import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Read .env.local to get MONGODB_URI
let mongoUri = process.env.MONGODB_URI;
if (!mongoUri && fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf-8');
  const match = content.match(/MONGODB_URI=(.+)/);
  if (match) mongoUri = match[1].trim();
}

if (!mongoUri) {
  console.error('❌ MONGODB_URI not found in environment or .env.local');
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL || 'admin@pub.edu.bd';
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
const adminName = process.env.ADMIN_NAME || 'System Super Administrator';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    const db = mongoose.connection.db;

    const usersCollection = db.collection('users');
    const existing = await usersCollection.findOne({ email: adminEmail.toLowerCase() });

    const passwordHash = await bcrypt.hash(adminPassword, 10);

    if (existing) {
      console.log(`ℹ️ Admin user ${adminEmail} already exists. Updating role to admin & status to active...`);
      await usersCollection.updateOne(
        { _id: existing._id },
        {
          $set: {
            role: 'admin',
            status: 'active',
            passwordHash,
            updatedAt: new Date(),
          },
        }
      );
      console.log(`✅ Super Admin account updated: ${adminEmail} (password: ${adminPassword})`);
    } else {
      console.log(`Creating new Super Admin account: ${adminEmail}...`);
      await usersCollection.insertOne({
        name: adminName,
        email: adminEmail.toLowerCase(),
        passwordHash,
        role: 'admin',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`✅ Super Admin created successfully: ${adminEmail} (password: ${adminPassword})`);
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding Super Admin:', err);
    process.exit(1);
  }
}

seedAdmin();
