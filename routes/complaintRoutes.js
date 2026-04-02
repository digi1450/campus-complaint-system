const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');

// Create complaint
router.post('/complaints', async (req, res) => {
  try {
    const complaint = await Complaint.create(req.body);
    res.status(201).json(complaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after' }
    );

    res.status(200).json(updatedComplaint);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete complaint
router.delete('/complaints/:id', async (req, res) => {
  try {
    const deletedComplaint = await Complaint.findByIdAndDelete(req.params.id);
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

// Search complaints
router.get('/complaints/search/:keyword', async (req, res) => {
  try {
    const keyword = req.params.keyword;
    const complaints = await Complaint.find({
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } },
        { category: { $regex: keyword, $options: 'i' } }
      ]
    });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;