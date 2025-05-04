import express from 'express';
import Dream from '../models/Dream.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware); // 所有路由需要登录验证

console.log('Dream routes initialized');

/*----- 获取当前用户所有梦想（按order排序）-----*/
router.get('/', async (req, res) => {
  try {
    console.log(`Fetching dreams for user ${req.user.id}`);
    const dreams = await Dream.find({ owner: req.user.id }).sort({ order: 1 });
    console.log(`Successfully fetched ${dreams.length} dreams for user ${req.user.id}`);
    res.json(dreams);
  } catch (err) {
    console.error('Error fetching dreams:', err);
    res.status(500).json({ message: '获取梦想列表失败' });
  }
});

/*----- 创建新梦想 -----*/
router.post('/', async (req, res) => {
  try {
    console.log(`Creating new dream for user ${req.user.id}`, req.body);
    const dream = await Dream.create({
      owner: req.user.id,
      content: req.body.content || '<p>新愿望</p>',
      position: req.body.position || { x: 0, y: 0 }
    });
    console.log(`Dream created successfully: ${dream._id}`);
    res.status(201).json(dream);
  } catch (err) {
    console.error('Error creating dream:', err);
    res.status(500).json({ message: '创建梦想失败' });
  }
});

/*----- 更新梦想（内容/位置/排序）-----*/
router.patch('/:id', async (req, res) => {
  try {
    console.log(`Updating dream ${req.params.id} for user ${req.user.id}`, req.body);
    const updated = await Dream.findOneAndUpdate(
      { _id: req.params.id, owner: req.user.id },
      {
        content: req.body.content,
        order: req.body.order,
        position: req.body.position
      },
      { new: true } // 返回更新后的文档
    );
    if (!updated) {
      console.log(`Dream not found: ${req.params.id} for user ${req.user.id}`);
      return res.status(404).json({ message: '未找到该梦想' });
    }
    console.log(`Dream updated successfully: ${updated._id}`);
    res.json(updated);
  } catch (err) {
    console.error('Error updating dream:', err);
    res.status(500).json({ message: '更新失败' });
  }
});

/*----- 删除梦想 -----*/
router.delete('/:id', async (req, res) => {
  try {
    console.log(`Deleting dream ${req.params.id} for user ${req.user.id}`);
    const deleted = await Dream.findOneAndDelete({
      _id: req.params.id,
      owner: req.user.id
    });
    if (!deleted) {
      console.log(`Dream not found for deletion: ${req.params.id} for user ${req.user.id}`);
      return res.status(404).json({ message: '未找到该梦想' });
    }
    console.log(`Dream deleted successfully: ${deleted._id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting dream:', err);
    res.status(500).json({ message: '删除失败' });
  }
});

export default router;