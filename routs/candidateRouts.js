const express = require('express');
const router = express.Router();
const Candidate = require('../models/candidate');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

// Function to check if a user is admin
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user && user.role === 'admin';
  } catch (err) {
    console.error('Admin check failed:', err);
    return false;
  }
};

// POST: Add a candidate
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const newCandidate = new Candidate(req.body);
    const response = await newCandidate.save();

    console.log('Candidate saved successfully');
    res.status(201).json({ response });
  } catch (err) {
    console.error('Error saving candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT: Update candidate
router.put('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const response = await Candidate.findByIdAndUpdate(
      req.params.candidateId,
      req.body,
      { new: true, runValidators: true }
    );

    if (!response) return res.status(404).json({ error: 'Candidate not found' });

    console.log('Candidate updated successfully');
    res.status(200).json(response);
  } catch (err) {
    console.error('Error updating candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE: Delete candidate
router.delete('/:candidateId', jwtAuthMiddleware, async (req, res) => {
  try {
    if (!(await checkAdminRole(req.user.id)))
      return res.status(403).json({ message: 'User does not have admin role' });

    const response = await Candidate.findByIdAndDelete(req.params.candidateId);
    if (!response) return res.status(404).json({ error: 'Candidate not found' });

    console.log('Candidate deleted successfully');
    res.status(200).json(response);
  } catch (err) {
    console.error('Error deleting candidate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST: Vote for a candidate
router.post('/vote/:candidateId', jwtAuthMiddleware, async (req, res) => {
  const candidateId = req.params.candidateId;
  const userId = req.user.id;

  try {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) return res.status(404).json({ message: 'Candidate not found' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.isVoted)
      return res.status(400).json({ message: 'You have already voted' });

    if (user.role === 'admin')
      return res.status(403).json({ message: 'Admin is not allowed to vote' });

    candidate.votes.push({ user: userId });
    candidate.voteCount++;
    await candidate.save();

    user.isVoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (err) {
    console.error('Error recording vote:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET: Vote count / results
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 });

    const record = candidates.map((data) => ({
      party: data.party,
      count: data.voteCount,
    }));

    return res.status(200).json(record);
  } catch (err) {
    console.error('Error fetching vote count:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get List of all candidates with only name and party fields
router.get('/', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
