import express from 'express';
import Funeral from '../models/Funeral.js';
import mongoose from 'mongoose';
import auth from '../middleware/auth.js';

const router = express.Router();

// Middleware to validate ObjectId
const validateObjectId = (req, res, next) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: 'Invalid funeral ID' });
    }
    next();
};

// Create a new funeral (POST /api/funerals)
router.post('/', auth, async(req, res) => {
    try {
        const { title, sceneType, ceremonySteps = [] } = req.body;

        // Validate required fields
        if (!title || !sceneType) {
            return res.status(400).json({ message: 'Title and scene type are required' });
        }

        // Create new funeral with the organizer ID from the authenticated user
        const funeral = new Funeral({
            title,
            sceneType,
            organizerId: req.user.id,
            ceremonySteps
        });

        // Save to database
        await funeral.save();

        res.status(201).json(funeral);
    } catch (error) {
        console.error('Create funeral error:', error);
        res.status(500).json({ message: 'Server error while creating funeral' });
    }
});

// Get a specific funeral by ID (GET /api/funerals/:id)
router.get('/:id', auth, validateObjectId, async(req, res) => {
    try {
        const funeral = await Funeral.findById(req.params.id);

        if (!funeral) {
            return res.status(404).json({ message: 'Funeral not found' });
        }

        // Check if user is authorized (either the organizer or an admin)
        if (funeral.organizerId.toString() !== req.user.id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to access this funeral' });
        }

        res.json(funeral);
    } catch (error) {
        console.error('Get funeral error:', error);
        res.status(500).json({ message: 'Server error while retrieving funeral' });
    }
});

// Get all funerals for the current user (GET /api/funerals)
router.get('/', auth, async(req, res) => {
    try {
        let query = {};

        // If not admin, only show user's own funerals
        if (req.user.role !== 'admin') {
            query.organizerId = req.user.id;
        }

        const funerals = await Funeral.find(query)
            .sort({ createdAt: -1 })
            .populate('organizerId', 'username');

        res.json(funerals);
    } catch (error) {
        console.error('Get funerals error:', error);
        res.status(500).json({ message: 'Server error while retrieving funerals' });
    }
});

// Update a funeral (PUT /api/funerals/:id)
router.put('/:id', auth, validateObjectId, async(req, res) => {
    try {
        const { title, sceneType, ceremonySteps } = req.body;
        const funeral = await Funeral.findById(req.params.id);

        if (!funeral) {
            return res.status(404).json({ message: 'Funeral not found' });
        }

        // Check if user is authorized (either the organizer or an admin)
        if (funeral.organizerId.toString() !== req.user.id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to update this funeral' });
        }

        // Update fields if provided
        if (title) funeral.title = title;
        if (sceneType) funeral.sceneType = sceneType;
        if (ceremonySteps) funeral.ceremonySteps = ceremonySteps;

        await funeral.save();
        res.json(funeral);
    } catch (error) {
        console.error('Update funeral error:', error);
        res.status(500).json({ message: 'Server error while updating funeral' });
    }
});

// Delete a funeral (DELETE /api/funerals/:id)
router.delete('/:id', auth, validateObjectId, async(req, res) => {
    try {
        const funeral = await Funeral.findById(req.params.id);

        if (!funeral) {
            return res.status(404).json({ message: 'Funeral not found' });
        }

        // Check if user is authorized (either the organizer or an admin)
        if (funeral.organizerId.toString() !== req.user.id.toString() &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this funeral' });
        }

        // Using deleteOne instead of deprecated remove()
        await Funeral.deleteOne({ _id: req.params.id });
        res.json({ message: 'Funeral deleted successfully' });
    } catch (error) {
        console.error('Delete funeral error:', error);
        res.status(500).json({ message: 'Server error while deleting funeral' });
    }
});

export default router;