import express from 'express';
import Dream from '../models/Dream.js';
// import authMiddleware from '../middleware/auth.js'; // 1. Temporarily comment out login auth

const router = express.Router();
// router.use(authMiddleware); // All routes require login, but comment out for testing

console.log('Dream routes initialized');

/*----- Get all dreams (sorted by order) -----*/
router.get('/', async (req, res) => {
  try {
    // console.log(`Fetching dreams for user ${req.user.id}`);
    // const dreams = await Dream.find({ owner: req.user.id }).sort({ order: 1 });  // 3. Temporarily skip owner validation for testing

    const dreams = await Dream.find().sort({ order: 1 });
    // console.log(`Successfully fetched ${dreams.length} dreams for user ${req.user.id}`);
    res.json(dreams);
  } catch (err) {
    console.error('Error fetching dreams:', err);
    res.status(500).json({ message: 'Failed to fetch dreams' });
  }
});

/*----- Create new dream -----*/
router.post('/', async (req, res) => {
  try {
    // console.log(`Creating new dream for user ${req.user.id}`, req.body);
    console.log('💡 req.user:', req.user);
    const dream = await Dream.create({
      // owner: req.user.id,  // 4. Temporarily skip owner validation for testing
      content: req.body.content || '<p>New Wish</p>',
      position: req.body.position || { x: 0, y: 0 }
    });
    console.log(`Dream created successfully: ${dream._id}`);
    res.status(201).json(dream);
  } catch (err) {
    console.error('Error creating dream:', err);
    res.status(500).json({ message: 'Failed to create dream' });
  }
});

/*----- Update dream (content/position/order) -----*/
router.patch('/:id', async (req, res) => {
  try {
    console.log('Received PATCH body:', req.body);
    // console.log(`Updating dream ${req.params.id} for user ${req.user.id}`, req.body);
    const updated = await Dream.findOneAndUpdate(
      // { _id: req.params.id, owner: req.user.id }, // 5. Temporarily skip owner validation for testing
      { _id: req.params.id },
      {
        content: req.body.content,
        order: req.body.order,
        position: req.body.position
      },
      { new: true } // Return updated document
    );
    if (!updated) {
      // console.log(`Dream not found: ${req.params.id} for user ${req.user.id}`);
      return res.status(404).json({ message: 'Dream not found' });
    }
    console.log(`Dream updated successfully: ${updated._id}`);
    res.json(updated);
  } catch (err) {
    console.error('Error updating dream:', err);
    res.status(500).json({ message: 'Update failed' });
  }
});

/*----- Delete dream -----*/
router.delete('/:id', async (req, res) => {
  try {
    // console.log(`Deleting dream ${req.params.id} for user ${req.user.id}`);
    const deleted = await Dream.findOneAndDelete({
      _id: req.params.id,
      // owner: req.user.id  // 6. Temporarily skip owner validation for testing
    });
    if (!deleted) {
      // console.log(`Dream not found for deletion: ${req.params.id} for user ${req.user.id}`);
      return res.status(404).json({ message: 'Dream not found' });
    }
    console.log(`Dream deleted successfully: ${deleted._id}`);
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting dream:', err);
    res.status(500).json({ message: 'Deletion failed' });
  }
});

export default router;
