const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  title: String,
  category: String,
  description: String,
  location: String,
  urgency: String,
  status: {
    type: String,
    default: 'Pending'
  },
  reportedBy: {
    name: String,
    studentId: String,
    contact: {
      email: String,
      phone: String
    }
  },
  tags: [String],
  attachments: [String],
  updates: [
    {
      message: String,
      updatedBy: String,
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  extraDetails: {
    building: String,
    room: String,
    deviceType: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);