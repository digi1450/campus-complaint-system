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
    studentId: String
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);