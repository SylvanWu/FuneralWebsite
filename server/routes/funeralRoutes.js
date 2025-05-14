// Verify a funeral room password (POST /api/funerals/room/verify)
router.post('/room/verify', async(req, res) => {
    try {
        const { roomId, password } = req.body;

        console.log(`[API] Verifying password for room: ${roomId}`);

        if (!roomId || !password) {
            console.log(`[API] Missing roomId or password`);
            return res.status(400).json({ 
                message: 'Room ID and password are required',
                valid: false,
                isOrganizer: false
            });
        }

        // Find the room
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
            console.log(`[API] Room not found: ${roomId}`);
            return res.status(404).json({ 
                message: 'Funeral room not found', 
                valid: false,
                isOrganizer: false
            });
        }

        // Check if the password matches
        const isValid = funeral.password === password;
        
        // 房间密码正确即赋予organizer权限
        const isOrganizer = isValid;
        
        console.log(`[API] Room ${roomId} password verification: valid=${isValid}, isOrganizer=${isOrganizer}`);

        // 返回验证结果
        res.json({
            valid: isValid,
            isOrganizer: isOrganizer,
            message: isValid ? 'Password verification successful' : 'Invalid password'
        });
    } catch (error) {
        console.error('Password verification error:', error);
        res.status(500).json({ 
            message: 'Server error while verifying password', 
            valid: false,
            isOrganizer: false
        });
    }
}); 