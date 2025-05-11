//from Haoran Li
//处理与遗嘱相关的路由请求，包括创建、获取、编辑和删除遗嘱。使用 multer 进行视频上传，并在处理请求前进行 JWT 鉴权。
import express from 'express';
import path    from 'path';
import Will    from '../models/Will.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import { fileURLToPath } from 'url';


const router = express.Router();

/* ───── 鉴权 ───── */
router.use(authMiddleware('organizer'));

/* ───── Multer：视频上传 ───── */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');   // ← 同一个目录

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, UPLOAD_DIR);
        },
filename(req, file, cb) {
    const ext  = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
}
});


const upload = multer({ storage });

/* ───── POST  /api/wills  创建留言 ───── */
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
            console.error('创建遗嘱失败', err);
            res.status(500).json({ message: '创建遗嘱失败', error: err });
        }
    }
);

/* ───── GET  /api/wills  列出当前用户所有留言 ───── */
router.get(
    '/',
    async (req, res) => {
        console.log('GET /api/wills called, req.user:', req.user);
        try {
            const list = await Will.find({ owner: req.user.userId }).sort({ createdAt: -1 });
            res.json(list);
        } catch (err) {
            console.error('获取遗嘱列表失败', err);
            res.status(500).json({ message: '获取遗嘱列表失败', error: err });
        }
    }
);

/* ───── PATCH  /api/wills/:id  编辑留言（文字 + 可选新视频） ───── */
router.patch(
    '/:id',
    upload.single('video'),
    async (req, res) => {
        console.log('--- PATCH /api/wills/:id ---');
        console.log('req.body:', req.body);
        console.log('req.file:', req.file);
        try {
            const updateFields = {};
            if (req.body.uploaderName)    updateFields.uploaderName    = req.body.uploaderName;
            if (req.body.farewellMessage) updateFields.farewellMessage = req.body.farewellMessage;
            if (req.file)                 updateFields.videoFilename   = req.file.filename;

            const updated = await Will.findOneAndUpdate(
                { _id: req.params.id, owner: req.user.userId },
                updateFields,
                { new: true, runValidators: true }
            );

            if (!updated) {
                return res.status(404).json({ message: '遗嘱未找到或无权限' });
            }
            res.json(updated);
        } catch (err) {
            console.error('更新遗嘱失败', err);
            res.status(500).json({ message: '更新遗嘱失败', error: err });
        }
    }
);

/* ───── DELETE  /api/wills/:id  删除留言 ───── */
router.delete(
    '/:id',
    async (req, res) => {
        try {
            const deleted = await Will.findOneAndDelete({
                _id: req.params.id,
                owner: req.user.userId
            });
            if (!deleted) {
                return res.status(404).json({ message: '遗嘱未找到或无权限' });
            }
            res.json({ ok: true });
        } catch (err) {
            console.error('删除遗嘱失败', err);
            res.status(500).json({ message: '删除遗嘱失败', error: err });
        }
    }
);

export default router;