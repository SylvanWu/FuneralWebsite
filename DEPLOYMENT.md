# DeepSick 部署指南

本指南将帮助您在服务器上部署DeepSick应用的前端和后端。

## 部署环境

- 服务器IP：13.239.225.209
- 前端端口：5173（开发）或 80/443（生产）
- 后端端口：5001

## 1. 准备工作

确保服务器已安装以下软件：

- Node.js (推荐v18或更高版本)
- npm 或 yarn
- MongoDB
- Git

## 2. 克隆代码库

```bash
git clone <repository_url>
cd group-project-deepsick
```

## 3. 后端部署

### 安装依赖

```bash
cd DeepSick
npm install
```

### 配置环境变量

创建`.env`文件：

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/memorial
NODE_ENV=production
JWT_SECRET=your_jwt_secret_key
```

### 启动后端服务

```bash
node server/index.js
```

建议使用PM2等进程管理工具保持服务运行：

```bash
npm install -g pm2
pm2 start server/index.js --name "deepsick-backend"
```

## 4. 前端部署

### 安装依赖

```bash
cd DeepSick
npm install
```

### 构建前端

```bash
npm run build
```

### 部署前端

使用Nginx或类似的Web服务器部署构建后的前端文件：

```bash
# 安装Nginx
sudo apt update
sudo apt install nginx

# 配置Nginx
sudo nano /etc/nginx/sites-available/deepsick

# 添加以下配置
server {
    listen 80;
    server_name 13.239.225.209;

    location / {
        root /path/to/group-project-deepsick/DeepSick/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 启用配置
sudo ln -s /etc/nginx/sites-available/deepsick /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 5. 验证部署

- 访问 http://13.239.225.209 确认前端正常访问
- 检查API是否正常工作：http://13.239.225.209:5001/api/health

## 6. 故障排除

### 前端无法连接后端

- 检查后端服务是否正常运行：`pm2 status`
- 检查防火墙是否允许5001端口：`sudo ufw status`
- 查看后端日志：`pm2 logs deepsick-backend`

### 跨域问题

- 已在代码中配置CORS允许13.239.225.209的请求
- 如仍有问题，检查浏览器控制台的错误信息

### 文件上传问题

- 确保`DeepSick/server/uploads`目录存在并有写入权限
- 检查文件上传大小限制是否合适

## 7. 维护

### 更新部署

```bash
# 拉取最新代码
git pull

# 更新后端
cd DeepSick
npm install
pm2 restart deepsick-backend

# 更新前端
npm install
npm run build
# 如果使用Nginx，前端静态文件会自动更新
```

如有任何部署问题，请联系技术支持。 