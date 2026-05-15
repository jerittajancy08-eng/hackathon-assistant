import mongoose from "mongoose";
const hackathonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    domain: { type: String, trim: true, default: 'General', index: true },
    tags: [{ type: String, trim: true }],
    teamSize: { type: String, default: '2-5' },
    experienceLevel: { type: String, default: 'Beginner' },
    isOnline: { type: Boolean, default: true, index: true },
    beginnerFriendly: { type: Boolean, default: false, index: true },
    location: { type: String, default: 'Online' },
    startDate: { type: Date },
    endDate: { type: Date },
    url: { type: String, trim: true },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// Create text index for searching by title and description
hackathonSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Hackathon = mongoose.model('Hackathon', hackathonSchema);
export default Hackathon;
