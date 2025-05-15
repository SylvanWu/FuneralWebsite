// from Haoran Li
// Handles routes related to wills, including creating, retrieving, editing, and deleting wills.
// Uses multer for video uploads and performs JWT authentication before handling requests.
import express from 'express';
import path from 'path';
import Will from '../models/Will.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import { fileURLToPath } from 'url';

const router = express.Router();

/* ───── Authentication ───── */
// router.use(authMiddleware('organizer')); // 

/* ───── Multer: Video Upload ───── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads'); // ← Shared directory

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

/* ───── POST  /api/wills  Create a Will ───── */
router.post(
  '/',
  authMiddleware(),
  upload.single('video'),
  async (req, res) => {
    try {
      const { uploaderName, farewellMessage, roomId } = req.body;
      const videoFilename = req.file?.filename || '';

      console.log('[POST] /api/wills - Request Body:', {
        uploaderName,
        farewellMessage,
        roomId,
        hasVideo: !!req.file
      });

      if (!roomId) {
        console.log('[POST] /api/wills - ERROR: roomId is missing');
        return res.status(400).json({ message: 'Room ID is required to create a will.' });
      }

      const newWill = await Will.create({
        owner: req.user.userId,
        roomId,
        uploaderName,
        farewellMessage,
        videoFilename
      });

      console.log('[POST] /api/wills - Created Will:', {
        _id: newWill._id,
        roomId: newWill.roomId,
        owner: newWill.owner
      });

      res.status(201).json(newWill);
    } catch (err) {
      console.error('Failed to create will', err);
      res.status(500).json({ message: 'Failed to create will', error: err });
    }
  }
);

/* ───── GET  /api/wills  Get All Wills for a Specific Room ───── */
router.get(
  '/',
  authMiddleware(),
  async (req, res) => {
    const { roomId } = req.query;

    if (!roomId) {
      console.log('[GET] /api/wills - ERROR: roomId query parameter is missing');
      return res.status(400).json({ message: 'Room ID is required to fetch wills.' });
    }

    console.log('[GET] /api/wills - Searching for roomId:', roomId, 'by user:', req.user?.userId);
    try {
      const list = await Will.find({ roomId }).sort({ createdAt: -1 });
      console.log(`[GET] /api/wills - Found ${list.length} wills for roomId:`, roomId);

      if (list.length === 0) {
        // 在没有记录时，检查数据库中是否有任何遗嘱记录
        const allWills = await Will.find({}).limit(5);
        console.log('[GET] /api/wills - No wills found for this room. First 5 wills in database:',
          allWills.map(w => ({ _id: w._id, roomId: w.roomId, owner: w.owner }))
        );
      }

      res.json(list);
    } catch (err) {
      console.error('Failed to fetch wills for room:', roomId, err);
      res.status(500).json({ message: 'Failed to fetch wills', error: err });
    }
  }
);

/* ───── PATCH  /api/wills/:id  Edit a Will (Text + Optional New Video) ───── */
router.patch(
  '/:id',
  upload.single('video'),
  async (req, res) => {
    console.log('--- PATCH /api/wills/:id ---');
    console.log('req.body:', req.body);
    console.log('req.file:', req.file);
    try {
      const updateFields = {};
      if (req.body.uploaderName) updateFields.uploaderName = req.body.uploaderName;
      if (req.body.farewellMessage) updateFields.farewellMessage = req.body.farewellMessage;
      if (req.file) updateFields.videoFilename = req.file.filename;

      const updated = await Will.findOneAndUpdate(
        { _id: req.params.id },
        updateFields,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Will not found' });
      }
      res.json(updated);
    } catch (err) {
      console.error('Failed to update will', err);
      res.status(500).json({ message: 'Failed to update will', error: err });
    }
  }
);

/* ───── DELETE  /api/wills/:id  Delete a Will ───── */
router.delete(
  '/:id',
  async (req, res) => {
    try {
      const deleted = await Will.findOneAndDelete({
        _id: req.params.id
      });
      if (!deleted) {
        return res.status(404).json({ message: 'Will not found' });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('Failed to delete will', err);
      res.status(500).json({ message: 'Failed to delete will', error: err });
    }
  }
);

export default router;
