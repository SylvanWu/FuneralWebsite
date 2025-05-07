import express from 'express';
import { InteractiveRecord } from '../models/InteractiveRecord.js';

const router = express.Router();

// 献花记录
router.post('/flower', async (req, res) => {
    try {
        const { username } = req.body;
        const record = new InteractiveRecord({
            type: 'flower',
            username,
            timestamp: new Date()
        });
        await record.save();
        
        // 获取献花总数
        const flowerCount = await InteractiveRecord.countDocuments({ type: 'flower' });
        
        res.json({ 
            success: true, 
            record,
            totalCount: flowerCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 点亮蜡烛记录
router.post('/candle', async (req, res) => {
    try {
        const { username } = req.body;
        const record = new InteractiveRecord({
            type: 'candle',
            username,
            timestamp: new Date()
        });
        await record.save();
        
        // 获取蜡烛总数
        const candleCount = await InteractiveRecord.countDocuments({ type: 'candle' });
        
        res.json({ 
            success: true, 
            record,
            totalCount: candleCount
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 留言记录
router.post('/message', async (req, res) => {
    try {
        const { username, content } = req.body;
        const record = new InteractiveRecord({
            type: 'message',
            username,
            content,
            timestamp: new Date()
        });
        await record.save();
        
        res.json({ 
            success: true, 
            record 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// 获取历史记录
router.get('/:type', async (req, res) => {
    try {
        const { type } = req.params;
        const records = await InteractiveRecord.find({ type })
            .sort({ timestamp: -1 })
            .limit(100);
            
        const totalCount = await InteractiveRecord.countDocuments({ type });
        
        res.json({ 
            success: true, 
            records,
            totalCount 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

export default router; 