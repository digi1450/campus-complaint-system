const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

function getErrorStatus(error) {
  return error.name === 'ValidationError' ? 400 : 500;
}

// Create complaint
router.post('/complaints', async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json(complaint);
  } catch (error) {
    res.status(getErrorStatus(error)).json({ error: error.message });
  }
});

// Read all complaints
router.get('/complaints', async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update complaint
router.put('/complaints/:id', async (req, res) => {
  try {
    const { updateEntry, ...complaintData } = req.body;
    const updateQuery = { $set: complaintData };

    if (updateEntry?.message) {
      updateQuery.$push = {
        updates: {
          message: updateEntry.message,
          updatedBy: updateEntry.updatedBy || 'Staff'
        }
      };
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      {
        returnDocument: 'after',
        runValidators: true
      }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(getErrorStatus(error)).json({ error: error.message });
  }
});

// Delete complaint
router.delete('/complaints/:id', async (req, res) => {
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!deletedComplaint) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    res.status(200).json(deletedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporting summary by status
router.get('/reports/status-summary', async (req, res) => {
  try {
    const summary = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: 1 }
        }
      }
    ]);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporting summary by tag usage
router.get('/reports/tag-summary', async (req, res) => {
  try {
    const summary = await Complaint.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1, _id: 1 } }
    ]);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporting summary by category
router.get('/reports/category-summary', async (req, res) => {
  try {
    const summary = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1, _id: 1 } }
    ]);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reporting summary by urgency
router.get('/reports/urgency-summary', async (req, res) => {
  try {
    const summary = await Complaint.aggregate([
      {
        $group: {
          _id: '$urgency',
          total: { $sum: 1 }
        }
      },
      { $sort: { total: -1, _id: 1 } }
    ]);
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search complaints
router.get('/complaints/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const searchRegex = new RegExp(keyword, 'i');
    const complaints = await Complaint.find({
      $or: [
        { title: searchRegex },
        { location: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { status: searchRegex },
        { 'extraDetails.location.building': searchRegex },
        { 'extraDetails.location.room': searchRegex },
        { 'extraDetails.device.type': searchRegex },
        { 'extraDetails.facility.issueArea': searchRegex },
        { 'extraDetails.equipment.equipmentName': searchRegex },
        { 'extraDetails.network.networkName': searchRegex },
        { 'extraDetails.cleanliness.issueType': searchRegex },
        { 'reportedBy.name': searchRegex },
        { 'reportedBy.studentId': searchRegex },
        { 'reportedBy.contact.email': searchRegex },
        { 'reportedBy.contact.phone': searchRegex },
        { tags: { $elemMatch: { $regex: searchRegex } } },
        { attachments: { $elemMatch: { $regex: searchRegex } } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
