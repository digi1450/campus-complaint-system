const mongoose = require('mongoose');

const UpdateSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true,
    trim: true
  },
  updatedBy: {
    type: String,
    default: 'Staff',
    trim: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const ComplaintSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Facility', 'Equipment', 'Network', 'Cleanliness', 'Other'],
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  urgency: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High']
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Resolved'],
    default: 'Pending'
  },
  reportedBy: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    studentId: {
      type: String,
      required: true,
      trim: true
    },
    contact: {
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      phone: {
        type: String,
        trim: true
      }
    }
  },
  tags: {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  attachments: {
    type: [{
      type: String,
      trim: true
    }],
    default: []
  },
  updates: {
    type: [UpdateSchema],
    default: []
  },
  extraDetails: {
    location: {
      building: {
        type: String,
        trim: true
      },
      room: {
        type: String,
        trim: true
      }
    },
    device: {
      type: {
        type: String,
        trim: true
      }
    },
    facility: {
      issueArea: {
        type: String,
        trim: true
      },
      maintenanceNeeded: {
        type: String,
        trim: true
      }
    },
    equipment: {
      equipmentName: {
        type: String,
        trim: true
      },
      serialNumber: {
        type: String,
        trim: true
      }
    },
    network: {
      connectionType: {
        type: String,
        trim: true
      },
      networkName: {
        type: String,
        trim: true
      }
    },
    cleanliness: {
      issueType: {
        type: String,
        trim: true
      },
      affectedArea: {
        type: String,
        trim: true
      }
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { minimize: false });

module.exports = mongoose.model('Complaint', ComplaintSchema);
