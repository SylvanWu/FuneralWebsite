import express from 'express';
import Dream from '../models/Dream.js';

const router = express.Router();

/*----- 获取某个房间的梦想列表 -----*/
router.get('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  try {
    const dreams = await Dream.find({ roomId }).sort({ order: 1 });
    res.json(dreams);
  } catch (err) {
    console.error('Error fetching dreams:', err);
    res.status(500).json({ message: 'Failed to fetch dreams' });
  }
});

/*----- 在某房间创建新梦想 -----*/
router.post('/:roomId', async (req, res) => {
  const { roomId } = req.params;
  const { content, position } = req.body;

  try {
    const dream = await Dream.create({
      content: content || '<p>New Wish</p>',
      position: position || { x: 0, y: 0 },
      roomId
    });
    res.status(201).json(dream);
  } catch (err) {
    console.error('Error creating dream:', err);
    res.status(500).json({ message: 'Failed to create dream' });
  }
});

/*----- 修改某个梦想 -----*/
router.patch('/:dreamId', async (req, res) => {
  const { dreamId } = req.params;
  const { content, order, position } = req.body;

  try {
    const updated = await Dream.findByIdAndUpdate(
      dreamId,
      { content, order, position },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Dream not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating dream:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

/*----- 删除梦想 -----*/
router.delete('/:dreamId', async (req, res) => {
  const { dreamId } = req.params;

  try {
    const deleted = await Dream.findByIdAndDelete(dreamId);
    if (!deleted) return res.status(404).json({ message: 'Dream not found' });
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting dream:', err);
    res.status(500).json({ message: 'Deletion failed' });
  }
});

export default router;