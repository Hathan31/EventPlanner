import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    images: [{ type: String }],
    files: [{ type: String }], 
  },
  { timestamps: true }
);

const Event = mongoose.model('Event', eventSchema);
export default Event;