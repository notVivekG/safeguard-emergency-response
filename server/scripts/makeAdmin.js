import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import User from '../models/User.js';

const email = process.argv[2];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const user = await User.findOneAndUpdate(
    { email },
    { role: 'admin' },
    { new: true }
  );
  if (user) {
    console.log(`✅ ${user.email} is now an admin`);
  } else {
    console.log('❌ User not found');
  }
  process.exit(0);
});
