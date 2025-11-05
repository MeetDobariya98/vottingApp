const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate'); // ✅ capitalized model
const User = require('../models/user'); // ✅ import User model
const { jwtAuthMiddleware, generateToken } = require('../jwt');

// ✅ Function to check if a user is admin
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
  } catch (err) {
    console.error('Admin check failed:', err);
    return false;
  }
};

// ✅ POST: Add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();

    console.log('Candidate saved successfully');
    res.status(201).json({ response });
  } catch (err) {
    console.error('Error saving candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ PUT: Update candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const candidateId = req.params.candidateId;
    const updatedData = req.body;

    const response = await Candidate.findByIdAndUpdate(candidateId, updatedData, {
      new: true,
      runValidators: true,
    });

    if (!response) return res.status(404).json({ error: 'Candidate not found' });

    console.log('Candidate updated successfully');
    res.status(200).json(response);
  } catch (err) {
    console.error('Error updating candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ DELETE: Delete candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const candidateId = req.params.candidateId;

    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) return res.status(404).json({ error: 'Candidate not found' });

    console.log('Candidate deleted successfully');
    res.status(200).json(response);
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
