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
router.use(authMiddleware('organizer'));

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
  upload.single('video'),
  async (req, res) => {
    try {
      const { uploaderName, farewellMessage } = req.body;
      const videoFilename = req.file?.filename || '';

      const newWill = await Will.create({
        owner: req.user.userId,
        uploaderName,
        farewellMessage,
        videoFilename
      });

      res.status(201).json(newWill);
    } catch (err) {
      console.error('Failed to create will', err);
      res.status(500).json({ message: 'Failed to create will', error: err });
    }
  }
);

/* ───── GET  /api/wills  Get All Wills for Current User ───── */
router.get(
  '/',
  async (req, res) => {
    console.log('GET /api/wills called, req.user:', req.user);
    try {
      const list = await Will.find({ owner: req.user.userId }).sort({ createdAt: -1 });
      res.json(list);
    } catch (err) {
      console.error('Failed to fetch wills', err);
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
        { _id: req.params.id, owner: req.user.userId },
        updateFields,
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: 'Will not found or no permission' });
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
        _id: req.params.id,
        owner: req.user.userId
      });
      if (!deleted) {
        return res.status(404).json({ message: 'Will not found or no permission' });
      }
      res.json({ ok: true });
    } catch (err) {
      console.error('Failed to delete will', err);
      res.status(500).json({ message: 'Failed to delete will', error: err });
    }
  }
);

export default router;
