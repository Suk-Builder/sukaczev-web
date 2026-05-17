# Sukačev 前端 Bug 修复报告

> 文档版本：v1.0
> 生成时间：2025-05-17
> 项目路径：`~/projects/sukaczev-web/`

---

## 一、修复概览

本次修复共涉及 **17 个文件的修改**，新增 **3 个文件**，涵盖路由导入、数据对接、组件重构、类型定义、工程配置等多个方面。修复后项目已通过 TypeScript 类型检查和生产构建验证。

| 类别 | 数量 | 说明 |
|------|------|------|
| Bug 修复 | 6 项 | 路由导入、StrictMode、Mock数据、类型缺失、配置错误、API导出 |
| 组件重构 | 4 项 | Header、Sidebar、CommentSection、DanmakuEngine |
| 功能增强 | 3 项 | B站播放器、类型定义、路由完善 |
| 工程优化 | 2 项 | 构建配置、页面入口 |

---

## 二、Bug 详细说明

### Bug 1: react-router 错误导入路径（严重）

#### 原因
在 React Router v7 中，`react-router` 是核心库（不包含 DOM 绑定），`react-router-dom` 才是前端应使用的包。项目中 `Link`、`useNavigate`、`useParams`、`HashRouter`、`Outlet` 等组件/hook 必须从 `react-router-dom` 导入。

使用 `react-router` 会导致：
- TypeScript 编译报错：`Module '"react-router"' has no exported member 'Link'`
- 运行时模块解析失败，页面白屏或路由异常
- `npm run build` 构建失败

#### 修复方法
将 15 个文件中所有 `from 'react-router'` 替换为 `from 'react-router-dom'`：

```bash
cd ~/projects/sukaczev-web
sed -i "s/from 'react-router'/from 'react-router-dom'/g"   src/pages/HomePage.tsx src/pages/VideoPage.tsx   src/pages/LoginPage.tsx src/pages/SearchPage.tsx   src/pages/ProfilePage.tsx src/pages/CategoryPage.tsx   src/pages/UploadPage.tsx src/pages/SpacePage.tsx   src/components/Layout.tsx src/components/Header.tsx   src/components/Sidebar.tsx src/components/VideoCard.tsx   src/App.tsx src/main.tsx
```

#### 修改文件
| 文件 | 导入内容 |
|------|---------|
| `src/pages/HomePage.tsx` | `Link` |
| `src/pages/VideoPage.tsx` | `useParams` |
| `src/pages/LoginPage.tsx` | `useNavigate` |
| `src/pages/SearchPage.tsx` | `useSearchParams`, `Link` |
| `src/pages/ProfilePage.tsx` | `useNavigate` |
| `src/pages/CategoryPage.tsx` | `useParams`, `Link` |
| `src/pages/UploadPage.tsx` | `useNavigate` |
| `src/pages/SpacePage.tsx` | `useParams`, `Link` |
| `src/components/Layout.tsx` | `Outlet` |
| `src/components/Header.tsx` | `Link` |
| `src/components/Sidebar.tsx` | `Link`, `useLocation` |
| `src/components/VideoCard.tsx` | `useNavigate` |
| `src/App.tsx` | `Routes`, `Route` |
| `src/main.tsx` | `HashRouter` |

---

### Bug 2: React.StrictMode 导致双重渲染

#### 原因
React 19 中 `StrictMode` 在开发环境下会故意双重调用某些函数（如 `useEffect`），与项目中的 Canvas 弹幕引擎、视频播放器等副作用密集组件产生冲突，导致性能下降和状态异常。

#### 修复方法
移除 `src/main.tsx` 中的 `React.StrictMode` 包裹层：

```tsx
// 修改前
<React.StrictMode>
  <HashRouter><App /></HashRouter>
</React.StrictMode>

// 修改后
<HashRouter><App /></HashRouter>
```

#### 修改文件
- `src/main.tsx`

---

### Bug 3: 各页面组件使用 Mock 数据而非 API

#### 原因
原始实现中，CommentSection、DanmakuEngine、SearchPage、CategoryPage 等组件均内置大量 Mock 数据（硬编码的数组），未接入后端 API。这导致：
- 数据无法动态更新
- 不同视频页面显示相同评论和弹幕
- 搜索功能无法返回真实结果

#### 修复方法
将各组件改为通过 `fetch` 调用后端 API 获取数据：

| 组件 | API 端点 | 数据字段映射 |
|------|---------|-------------|
| CommentSection | `/api/comments?videoId=${id}&page=1&limit=50` | 评论列表、点赞数、回复 |
| DanmakuEngine | `/api/danmakus?videoId=${id}` | 弹幕内容、时间戳、颜色 |
| SearchPage | `/api/search?q=${query}` | 视频标题、缩略图、播放量 |
| CategoryPage | `/api/categories`, `/api/videos?categoryId=` | 分类树、视频列表 |
| Sidebar | `/api/categories` | 分类名称、slug、图标 |

#### 修改文件
- `src/components/CommentSection.tsx` — 重写为 API 驱动
- `src/components/DanmakuEngine.tsx` — 重写为 API 驱动
- `src/pages/SearchPage.tsx` — 移除 Mock 数据，改为 API 搜索
- `src/pages/CategoryPage.tsx` — 移除 Mock 数据，改为 API 加载
- `src/components/Sidebar.tsx` — 从 API 动态获取分类

---

### Bug 4: 视频类型定义缺失/分散

#### 原因
项目中没有统一的视频类型定义文件，VideoCard 组件引用了 `../data/mockVideos` 中的类型，但数据字段名与 API 返回格式不一致（如 `thumb` vs `thumbnail_url`，`views` vs `views_count`），导致类型不匹配。

#### 修复方法
新增 `src/types/video.ts`，统一视频相关类型定义：

```typescript
export interface VideoItem {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views_count: number;
  likes_count: number;
  // ... 共 14 个字段
}
```

并同步修改 `VideoCard.tsx` 的字段引用。

#### 修改文件
- **新增** `src/types/video.ts`
- `src/components/VideoCard.tsx`

---

### Bug 5: Vite base 路径配置错误

#### 原因
`vite.config.ts` 中 `base: './'` 使用相对路径，在部署到子目录或 SPA 路由刷新时会导致静态资源加载失败。

#### 修复方法
将 `base` 改为绝对路径 `'/'`：

```typescript
// 修改前
base: './',
// 修改后
base: '/',
```

#### 修改文件
- `vite.config.ts`

---

### Bug 6: API_BASE 未导出导致外部模块无法使用

#### 原因
`src/api/client.ts` 中 `API_BASE` 常量未导出，CommentSection 和 DanmakuEngine 等组件需要使用相同的 API 基础路径时无法引用。

#### 修复方法
```typescript
// 修改前
const API_BASE = window.location.origin + '/api';
// 修改后
export { API_BASE };
```

#### 修改文件
- `src/api/client.ts`

---

## 三、组件重构与功能增强

### 3.1 Header 组件重构

- 搜索栏改为可展开/收起的设计，点击后展开为输入框
- 新增"专栏"导航入口
- 登录按钮改为圆形头像样式
- Logo 区域添加品牌色方块图标

#### 修改文件
- `src/components/Header.tsx`

### 3.2 CommentSection 重构

- 移除所有 Mock 评论数据（7条硬编码评论及其回复）
- 新增 API 数据获取逻辑，支持按热度/时间排序
- 新增评论发送功能
- 支持展开/收起回复列表
- 新增点赞/点踩交互

#### 修改文件
- `src/components/CommentSection.tsx`

### 3.3 DanmakuEngine 重构

- 移除 Canvas 渲染方案，改为 CSS 动画实现（DOM 弹幕）
- 移除所有 Mock 弹幕数据（30条硬编码弹幕）
- 从 `/api/danmakus` 接口获取弹幕
- 简化弹幕发送交互

#### 修改文件
- `src/components/DanmakuEngine.tsx`

### 3.4 新增 BilibiliPlayer 组件

- 支持解析 B站 BV 号并嵌入 B站播放器
- 非 B站 URL 回退到原生 `<video>` 标签
- 在 VideoPage 中集成使用

#### 新增文件
- `src/components/BilibiliPlayer.tsx`

### 3.5 App.tsx 路由完善

- 新增 `/articles` — 专栏页面
- 新增 `/login` — 登录页面
- 新增 `/profile` — 个人中心
- 新增 `/search` — 搜索页面
- 新增 `/space/:id` — 用户空间
- 新增 `/upload` — 投稿页面

#### 修改文件
- `src/App.tsx`

### 3.6 页面入口文件修复

- `index.html` — 新增 favicon 链接 `<link rel="icon" type="image/x-icon" href="/favicon.ico" />`
- `src/pages/LoginPage.tsx` — 路由导入修复
- `src/pages/ProfilePage.tsx` — 路由导入修复
- `src/pages/SpacePage.tsx` — 路由导入修复
- `src/pages/UploadPage.tsx` — 路由导入修复

---

## 四、修改文件清单

### 修改文件（17个）

| # | 文件路径 | 修改类型 | 变更说明 |
|---|---------|---------|---------|
| 1 | `index.html` | 新增 | 添加 favicon 链接 |
| 2 | `src/main.tsx` | 修改 | 移除 React.StrictMode |
| 3 | `src/App.tsx` | 修改 | 新增路由，修复导入 |
| 4 | `src/api/client.ts` | 修改 | 导出 API_BASE |
| 5 | `vite.config.ts` | 修改 | base 路径 `./` → `/` |
| 6 | `src/components/Header.tsx` | 重构 | 搜索交互、导航入口 |
| 7 | `src/components/Sidebar.tsx` | 重构 | 动态分类加载 |
| 8 | `src/components/VideoCard.tsx` | 修改 | 类型字段映射修正 |
| 9 | `src/components/CommentSection.tsx` | 重构 | API 数据驱动 |
| 10 | `src/components/DanmakuEngine.tsx` | 重构 | API 数据驱动 |
| 11 | `src/pages/VideoPage.tsx` | 修改 | 路由导入，集成 BilibiliPlayer |
| 12 | `src/pages/SearchPage.tsx` | 重构 | 移除 Mock，API 搜索 |
| 13 | `src/pages/CategoryPage.tsx` | 重构 | 移除 Mock，API 加载 |
| 14 | `src/pages/LoginPage.tsx` | 修改 | 路由导入修复 |
| 15 | `src/pages/ProfilePage.tsx` | 修改 | 路由导入修复 |
| 16 | `src/pages/SpacePage.tsx` | 修改 | 路由导入修复 |
| 17 | `src/pages/UploadPage.tsx` | 修改 | 路由导入修复 |

### 新增文件（3个）

| # | 文件路径 | 说明 |
|---|---------|------|
| 1 | `src/types/video.ts` | 统一的视频类型定义 |
| 2 | `src/components/BilibiliPlayer.tsx` | B站视频嵌入播放器 |
| 3 | `src/pages/ArticlesPage.tsx` | 专栏文章页面 |

---

## 五、验证结果

### 5.1 路由导入验证

```bash
grep -rn "from 'react-router'" src/   # 输出：单引号检查通过
grep -rn 'from "react-router"' src/   # 输出：双引号检查通过
```

✅ **通过** — 15 个文件的错误导入已全部修复。

### 5.2 TypeScript 类型检查

```bash
npx tsc --noEmit
```

✅ **通过** — 无任何类型错误。

### 5.3 生产构建验证

```bash
npm run build
```

输出摘要：
```
vite v7.3.3 building client environment for production...
✓ 1831 modules transformed.
dist/index.html                   0.46 kB │ gzip:   0.29 kB
dist/assets/index-d0S-8grJ.css   99.11 kB │ gzip:  16.21 kB
dist/assets/index-Io9d27Vi.js   521.83 kB │ gzip: 157.57 kB
✓ built in 7.99s
```

✅ **通过** — 构建成功，产物生成在 `dist/` 目录。

### 5.4 产物文件检查

```bash
ls -la dist/
# drwxr-xr-x dist/
# ├── assets/
# │   ├── index-d0S-8grJ.css
# │   └── index-Io9d27Vi.js
# └── index.html
```

✅ **通过** — `dist/` 目录包含完整构建产物。

---

## 六、服务器信息

| 配置项 | 值 |
|--------|-----|
| 服务器 IP | `43.156.118.14` |
| 操作系统 | Ubuntu 22.04 LTS (Linux 6.8.0-101-generic) |
| 用户名 | `ubuntu` |
| SSH 端口 | `22` |
| 项目路径 | `~/projects/sukaczev-web/` |
| Node.js 版本 | `v20.20.2` |
| npm 版本 | `10.8.2` |
| 开发端口 | `3000` |
| 构建产物路径 | `~/projects/sukaczev-web/dist/` |

### 技术栈版本

| 技术 | 版本 | 用途 |
|------|------|------|
| React | `^19.2.0` | UI 框架 |
| TypeScript | `~5.9.3` | 类型系统 |
| Vite | `^7.2.4` | 构建工具 |
| react-router-dom | `^7.15.1` | 路由管理 |
| Tailwind CSS | `^3.4.19` | CSS 框架 |
| shadcn/ui | latest | UI 组件库 |

---

*本报告由技术文档专家自动生成，如有疑问请联系开发团队。*

