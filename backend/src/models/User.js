import mongoose from 'mongoose';

/**
 * User Schema
 * Represents a registered user in the FokasHive application
 * Stores basic profile information and authentication data
 */
const userSchema = new mongoose.Schema({
  // User's display name (shown in rooms and chat)
  name: { type: String, required: true },
  // User's email address (used for login and must be unique)
  email: { type: String, required: true, unique: true },
  // Hashed password for authentication (never store plain text)
  password: { type: String, required: true }, // hashed
  // Account creation timestamp
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('User', userSchema);
