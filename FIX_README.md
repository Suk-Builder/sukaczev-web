# Sukačev 前端 Bug 修复说明书

> 文档版本：v1.0  
> 创建时间：2025-05-17  
> 修复状态：已修复  

---

## 1. Bug 描述

### 问题概述
项目中大量页面和组件文件使用了**错误的模块导入路径**：

- **错误写法**：`import { xxx } from 'react-router'`
- **正确写法**：`import { xxx } from 'react-router-dom'`

### 为什么 `react-router` 会报错

在 React Router v7 中，`react-router` 是核心库包，主要包含以下**不依赖 DOM 环境**的模块：
- `Route`, `Routes`（路由配置）
- `createBrowserRouter`, `createHashRouter`（路由创建器）
- `RouterProvider`（路由提供器）
- 各类路由 hook：`useParams`, `useNavigate`, `useLocation`, `useSearchParams` 等

而 `react-router-dom` 是 `react-router` 的 DOM 绑定层，额外包含了：
- `Link` 组件（渲染 `<a>` 标签）
- `NavLink` 组件
- `BrowserRouter`, `HashRouter`, `MemoryRouter` 等**直接可用的 Router 组件**
- `Form`, `ScrollRestoration` 等 DOM 专用组件

**关键区别**：项目中大量使用了 `Link`、`HashRouter`、`Outlet` 等组件，这些在 `react-router` 包中**不可用**（或行为不一致），必须从 `react-router-dom` 导入。使用错误的包名会导致：
- 构建时 TypeScript 类型检查报错：`Module '"react-router"' has no exported member 'Link'`
- 运行时模块解析失败，页面白屏或路由功能异常
- `npm run build` 构建失败

### package.json 依赖说明
```json
"react-router": "^7.6.1",
"react-router-dom": "^7.15.1"
```
项目同时安装了 `react-router` 和 `react-router-dom`，但**前端页面/组件代码应统一使用 `react-router-dom`**。

---

## 2. 影响范围

### 受影响文件总数：15 个

### 页面文件（10 个）

| 序号 | 文件路径 | 导入内容 |
|------|---------|---------|
| 1 | `src/pages/HomePage.tsx` | `Link` |
| 2 | `src/pages/VideoPage.tsx` | `useParams` |
| 3 | `src/pages/LoginPage.tsx` | `useNavigate` |
| 4 | `src/pages/SearchPage.tsx` | `useSearchParams, Link` |
| 5 | `src/pages/ProfilePage.tsx` | `useNavigate` |
| 6 | `src/pages/CategoryPage.tsx` | `useParams, Link` |
| 7 | `src/pages/UploadPage.tsx` | `useNavigate` |
| 8 | `src/pages/SpacePage.tsx` | `useParams, Link` |
| 9 | `src/pages/ArticlesPage.tsx` | 无路由导入 |
| 10 | `src/pages/Home.tsx` | 无路由导入 |

### 组件文件（5 个）

| 序号 | 文件路径 | 导入内容 |
|------|---------|---------|
| 1 | `src/components/Layout.tsx` | `Outlet` |
| 2 | `src/components/Header.tsx` | `Link` |
| 3 | `src/components/Sidebar.tsx` | `Link, useLocation` |
| 4 | `src/components/VideoCard.tsx` | `useNavigate` |
| 5 | `src/App.tsx` | `Routes, Route` |

> 注：`src/main.tsx` 也导入了 `HashRouter`，属于正确用法。

---

## 3. 修复方法

### 方法一：一键 sed 替换（推荐）

在项目根目录执行以下命令，将所有 `from 'react-router'` 替换为 `from 'react-router-dom'`：

```bash
cd ~/projects/sukaczev-web

# 处理单引号导入
sed -i "s/from 'react-router'/from 'react-router-dom'/g" \
  src/pages/HomePage.tsx \
  src/pages/VideoPage.tsx \
  src/pages/LoginPage.tsx \
  src/pages/SearchPage.tsx \
  src/pages/ProfilePage.tsx \
  src/pages/CategoryPage.tsx \
  src/pages/UploadPage.tsx \
  src/pages/SpacePage.tsx \
  src/components/Layout.tsx \
  src/components/Header.tsx \
  src/components/Sidebar.tsx \
  src/components/VideoCard.tsx \
  src/App.tsx \
  src/main.tsx

# 处理双引号导入
sed -i 's/from "react-router"/from "react-router-dom"/g' \
  src/pages/HomePage.tsx \
  src/pages/VideoPage.tsx \
  src/pages/LoginPage.tsx \
  src/pages/SearchPage.tsx \
  src/pages/ProfilePage.tsx \
  src/pages/CategoryPage.tsx \
  src/pages/UploadPage.tsx \
  src/pages/SpacePage.tsx \
  src/components/Layout.tsx \
  src/components/Header.tsx \
  src/components/Sidebar.tsx \
  src/components/VideoCard.tsx \
  src/App.tsx \
  src/main.tsx
```

### 方法二：find + sed 批量替换（更通用）

```bash
cd ~/projects/sukaczev-web

# 批量处理 src 目录下所有 .tsx 和 .ts 文件
find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i "s/from 'react-router'/from 'react-router-dom'/g" {} +

find src -type f \( -name "*.tsx" -o -name "*.ts" \) -exec \
  sed -i 's/from "react-router"/from "react-router-dom"/g' {} +
```

### 方法三：手动逐个文件修改

打开每个受影响的文件，找到导入行，将：
```typescript
import { xxx } from 'react-router'       // 错误
import { xxx } from "react-router"       // 错误（双引号）
```
改为：
```typescript
import { xxx } from 'react-router-dom'   // 正确
import { xxx } from "react-router-dom"   // 正确（双引号）
```

---

## 4. 验证方法

### 步骤 1：确认无错误导入残留
```bash
cd ~/projects/sukaczev-web
grep -rn "from 'react-router'" src/ || echo "单引号检查通过"
grep -rn 'from "react-router"' src/ || echo "双引号检查通过"
```
预期输出：两行都显示"检查通过"，无任何匹配。

### 步骤 2：确认所有路由导入都正确
```bash
grep -rn "react-router" src/ | grep "from"
```
预期输出：所有行都应显示 `from 'react-router-dom'` 或 `from "react-router-dom"`，不应出现纯 `react-router`。

### 步骤 3：TypeScript 类型检查
```bash
cd ~/projects/sukaczev-web
npx tsc --noEmit
```
预期输出：无错误，命令返回码为 0。

### 步骤 4：构建验证
```bash
cd ~/projects/sukaczev-web
npm run build
```
预期输出：构建成功，在 `dist/` 目录下生成产物文件（`index.html` 和 `assets/`）。

### 步骤 5：本地预览验证
```bash
cd ~/projects/sukaczev-web
npm run preview
```
然后在浏览器访问 `http://<服务器IP>:3000` 确认页面正常加载，路由跳转功能正常。

---

## 5. 部署方法

### 构建步骤
```bash
cd ~/projects/sukaczev-web

# 1. 安装依赖（如未安装）
npm install

# 2. 运行构建
npm run build
```

### 构建产物
构建成功后，产物位于 `~/projects/sukaczev-web/dist/` 目录：
- `dist/index.html` — 入口 HTML 文件
- `dist/assets/` — 静态资源（JS、CSS、图片等）

### 部署方式

#### 方式一：使用 Vite Preview（临时预览）
```bash
cd ~/projects/sukaczev-web
nohup npm run preview -- --host 0.0.0.0 --port 4173 > preview.log 2>&1 &
```
访问：`http://43.156.118.14:4173`

#### 方式二：使用 Nginx（生产部署）
```bash
# 将构建产物复制到 Nginx 网站目录
sudo cp -r ~/projects/sukaczev-web/dist/* /var/www/html/

# 确保 Nginx 配置支持 SPA（单页应用）路由
# 在 /etc/nginx/sites-available/default 中添加：
# location / {
#     try_files $uri $uri/ /index.html;
# }

sudo systemctl restart nginx
```

#### 方式三：使用 PM2 管理
```bash
# 安装 serve
npm install -g serve

# 使用 PM2 启动
pm2 serve ~/projects/sukaczev-web/dist 80 --spa

# 保存 PM2 配置
pm2 save
pm2 startup
```

---

## 6. 服务器信息

| 配置项 | 值 |
|--------|-----|
| **服务器 IP** | `43.156.118.14` |
| **用户名** | `ubuntu` |
| **密码** | `!Suk416520` |
| **SSH 端口** | `22` |
| **项目路径** | `~/projects/sukaczev-web/` |
| **开发预览端口** | `3000` |
| **构建产物路径** | `~/projects/sukaczev-web/dist/` |

### SSH 连接方式
```bash
ssh ubuntu@43.156.118.14
# 密码：!Suk416520
```

### Python Paramiko 连接
```python
import paramiko

ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
ssh.connect('43.156.118.14', username='ubuntu', password='!Suk416520', timeout=15)

# 执行命令
stdin, stdout, stderr = ssh.exec_command('cd ~/projects/sukaczev-web && npm run build')
print(stdout.read().decode())

ssh.close()
```

---

## 附录：相关技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^19.2.0 | UI 框架 |
| TypeScript | ~5.9.3 | 类型系统 |
| Vite | ^7.2.4 | 构建工具 |
| react-router-dom | ^7.15.1 | 路由管理 |
| Tailwind CSS | ^3.4.19 | CSS 框架 |
| Node.js | LTS | 运行环境 |

---

*本文档由技术团队维护，如有疑问请联系开发负责人。*

