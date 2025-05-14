// Generate token
const token = jwt.sign(
    { userId: user._id, userType: userType },
    JWT_SECRET,
    { expiresIn: '24h' }
);

// 添加调试日志，显示token内容
console.log('Generated token for:', {
    userId: user._id,
    userType: userType,
    username: user.username
});

res.json({
    user: {
        _id: user._id,
        username: user.username,
        nickname: user.nickname,
        userType: userType,
        phone: user.phone,
        email: user.email,
        address: user.address,
        avatar: user.avatar
    },
    token
}); 