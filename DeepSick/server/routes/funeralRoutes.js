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

// --- FUNERAL ROOM SPECIFIC ROUTES ---

// Get a funeral room by roomId (GET /api/funerals/room/:roomId)
router.get('/room/:roomId', async(req, res) => {
    try {
        const { roomId } = req.params;
        const { password } = req.query;

        // Handle non-MongoDB ObjectId format
        let funeral;

        if (mongoose.Types.ObjectId.isValid(roomId)) {
            // If valid ObjectId, search by _id
            funeral = await Funeral.findById(roomId);
        } else {
            // If not a valid ObjectId, search by a string identifier
            funeral = await Funeral.findOne({
                stringId: roomId
            });
        }

        if (!funeral) {
            return res.status(404).json({ message: 'Funeral room not found' });
        }

        // Check password if it exists
        if (funeral.password && funeral.password !== password) {
            return res.status(403).json({ message: 'Invalid password' });
        }

        res.json(funeral);
    } catch (error) {
        console.error('Get funeral room error:', error);
        res.status(500).json({ message: 'Server error while retrieving funeral room' });
    }
});

// Create or update a funeral room (POST /api/funerals/room)
router.post('/room', async(req, res) => {
    try {
        const {
            roomId,
            password,
            deceasedName,
            funeralType,
            backgroundImage,
            deceasedImage,
            canvasItems
        } = req.body;

        let funeral;

        // Determine if we're updating or creating
        if (roomId) {
            if (mongoose.Types.ObjectId.isValid(roomId)) {
                // Try to find by MongoDB _id
                funeral = await Funeral.findById(roomId);
            } else {
                // Try to find by stringId
                funeral = await Funeral.findOne({ stringId: roomId });
            }
        }

        // Validate funeral type to ensure it's in the valid enum values
        const validSceneTypes = [
            'Church Funeral',
            'Garden Funeral',
            'Forest Funeral',
            'Seaside Funeral',
            'Starry Night Funeral',
            'Chinese Traditional Funeral',
            'church',
            'garden',
            'forest',
            'seaside',
            'starryNight',
            'chineseTraditional'
        ];

        // Set a default valid scene type
        let finalSceneType = 'Church Funeral';

        // If funeralType is provided and valid, use it
        if (funeralType && validSceneTypes.includes(funeralType)) {
            finalSceneType = funeralType;
        }

        // Map from frontend keys to enum values if needed
        const sceneTypeMapping = {
            'church': 'Church Funeral',
            'garden': 'Garden Funeral',
            'forest': 'Forest Funeral',
            'seaside': 'Seaside Funeral',
            'starryNight': 'Starry Night Funeral',
            'chineseTraditional': 'Chinese Traditional Funeral'
        };

        if (funeralType && sceneTypeMapping[funeralType]) {
            finalSceneType = sceneTypeMapping[funeralType];
        }

        if (funeral) {
            // Update existing funeral room
            funeral.password = password || funeral.password;
            funeral.deceasedName = deceasedName || funeral.deceasedName;
            funeral.sceneType = finalSceneType;
            funeral.backgroundImage = backgroundImage || funeral.backgroundImage;

            if (deceasedImage !== undefined) {
                funeral.deceasedImage = deceasedImage;
            }

            if (canvasItems !== undefined) {
                funeral.canvasItems = canvasItems;
            }
        } else {
            // Create new funeral room
            funeral = new Funeral({
                title: deceasedName || 'Funeral Room',
                sceneType: finalSceneType,
                stringId: roomId, // Store the original string ID
                organizerId: new mongoose.Types.ObjectId('000000000000000000000000'), // Default organizer ID with 'new' keyword
                password,
                deceasedName,
                backgroundImage,
                deceasedImage,
                canvasItems: canvasItems || []
            });
        }

        await funeral.save();
        res.status(201).json({
            roomId: funeral.stringId || funeral._id,
            password: funeral.password,
            deceasedName: funeral.deceasedName,
            funeralType: funeral.sceneType,
            backgroundImage: funeral.backgroundImage,
            deceasedImage: funeral.deceasedImage,
            canvasItems: funeral.canvasItems,
            createdAt: funeral.createdAt,
            updatedAt: funeral.updatedAt
        });
    } catch (error) {
        console.error('Create/update funeral room error:', error);
        res.status(500).json({ message: 'Server error while saving funeral room' });
    }
});

// Update canvas items for a funeral room (PATCH /api/funerals/room/:roomId/canvas)
router.patch('/room/:roomId/canvas', async(req, res) => {
    try {
        const { roomId } = req.params;
        const { canvasItems } = req.body;

        if (!canvasItems) {
            return res.status(400).json({ message: 'Canvas items are required' });
        }

        // Find funeral room by MongoDB _id or stringId
        let funeral;
        if (mongoose.Types.ObjectId.isValid(roomId)) {
            funeral = await Funeral.findById(roomId);
        } else {
            funeral = await Funeral.findOne({ stringId: roomId });
        }

        if (!funeral) {
            return res.status(404).json({ message: 'Funeral room not found' });
        }

        funeral.canvasItems = canvasItems;
        await funeral.save();

        res.json({
            roomId: funeral.stringId || funeral._id,
            canvasItems: funeral.canvasItems,
            updatedAt: funeral.updatedAt
        });
    } catch (error) {
        console.error('Update canvas items error:', error);
        res.status(500).json({ message: 'Server error while updating canvas items' });
    }
});

export default router;