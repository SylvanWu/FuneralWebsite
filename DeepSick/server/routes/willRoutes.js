//from Haoran Li
import express from 'express';
import multer  from 'multer';
import path    from 'path';
import Will    from '../models/Will.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

/* ───── 鉴权 ───── */
router.use(authMiddleware);

/* ───── Multer：视频上传 ───── */
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, process.env.UPLOAD_DIR || path.join(process.cwd(), 'server', 'uploads'));
    },
    filename(req, file, cb) {
        const ext  = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

/* ───── POST  /api/wills  创建留言 ───── */
router.post('/', upload.single('video'), async (req, res) => {
    try {
        const { uploaderName, farewellMessage } = req.body;
        const videoFilename = req.file?.filename || '';

        const newWill = await Will.create({
            owner: req.user.id,
            uploaderName,
            farewellMessage,
            videoFilename
        });

        res.status(201).json(newWill);
    } catch (err) {
        console.error('创建遗嘱失败', err);
        res.status(500).json({ message: '创建遗嘱失败', error: err });
    }
});

/* ───── GET  /api/wills  列出当前用户所有留言 ───── */
router.get('/', async (req, res) => {
    try {
        const list = await Will.find({ owner: req.user.id }).sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        console.error('获取遗嘱列表失败', err);
        res.status(500).json({ message: '获取遗嘱列表失败', error: err });
    }
});

/* ───── PATCH  /api/wills/:id  编辑留言 ───── */
router.patch('/:id', async (req, res) => {
    try {
        const { uploaderName, farewellMessage } = req.body;

        const updated = await Will.findOneAndUpdate(
            { _id: req.params.id, owner: req.user.id },   // 只能改自己的
            { uploaderName, farewellMessage },
            { new: true, runValidators: true }
        );

        if (!updated) return res.status(404).json({ message: 'Not found' });
        res.json(updated);
    } catch (err) {
        console.error('更新失败', err);
        res.status(500).json({ message: '更新失败', error: err });
    }
});

/* ───── DELETE  /api/wills/:id  删除留言 ───── */
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Will.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.id
        });
        if (!deleted) return res.status(404).json({ message: 'Not found' });

        res.json({ ok: true });
    } catch (err) {
        console.error('删除失败', err);
        res.status(500).json({ message: '删除失败', error: err });
    }
});

export default router;