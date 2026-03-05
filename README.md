# 私董会时间协调工具

一个简单的多人时间协调网站，类似 Doodle，用于帮助私董会成员找到共同可用的时间。

## 功能

- 密码保护登录
- 未来 7 天的时间选择（3小时为一个时段）
- 每人选择自己可用的时间段并提交
- 查看所有人的时间汇总，颜色标注匹配程度
- 显示缺席人员名单
- 支持修改已提交的时间

## 本地运行

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 初始化数据库
npx prisma migrate dev

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000，使用密码「佛心」登录。

## 部署方案

### 方案一：Railway（推荐，最简单）

[Railway](https://railway.app) 提供免费层，支持持久化存储。

1. 注册 Railway 账号
2. 点击 "New Project" → "Deploy from GitHub Repo"
3. 选择本仓库
4. 添加环境变量：
   - `DATABASE_URL`: `file:/app/data/prod.db`
   - `AUTH_PASSWORD`: `佛心`
5. 添加 Volume，挂载到 `/app/data`
6. 部署完成后会自动生成域名

### 方案二：Render（免费）

[Render](https://render.com) 提供免费 Web Service。

1. 注册 Render 账号
2. 新建 Web Service → 连接 GitHub 仓库
3. 选择 Docker 环境
4. 添加环境变量（同上）
5. 添加 Disk，挂载到 `/app/data`
6. 部署

### 方案三：Vercel + Turso（免费，推荐用于生产）

适合需要更好性能和可靠性的场景。

1. 注册 [Turso](https://turso.tech) 账号（免费）
2. 创建数据库：`turso db create time-arranger`
3. 获取连接 URL：`turso db show time-arranger --url`
4. 获取 token：`turso db tokens create time-arranger`
5. 修改 `prisma/schema.prisma` 的 provider 为 `"libsql"`
6. 安装 adapter：`npm install @prisma/adapter-libsql @libsql/client`
7. 在 Vercel 部署，设置环境变量：
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `AUTH_PASSWORD`: `佛心`

### 方案四：Fly.io（免费层）

1. 安装 flyctl
2. `fly launch`
3. `fly volumes create data --size 1`
4. 部署

## 技术栈

- Next.js 14 (React)
- Prisma (ORM)
- SQLite (数据库)
- Tailwind CSS (样式)
- TypeScript
