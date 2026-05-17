# Ollama AI 客户端

本地AI助手 Flutter APP，连接你电脑上的Ollama，用手机随时对话。

---

## 功能

- 连接本地Ollama服务器
- 支持多个模型切换（qwen2.5:7b/14b, deepseek-r1:7b）
- Markdown渲染 + 代码高亮
- 流式响应（打字机效果）
- 长按复制消息
- 深色/浅色主题切换
- 温度调节（0.0-2.0）
- 历史会话保存

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Flutter + Dart |
| 后端 | Ollama（本地运行） |
| 模型 | Qwen2.5 / DeepSeek-R1 |
| 存储 | SharedPreferences |

---

## 前置条件

### 电脑端（Ollama服务器）

1. 安装Ollama：https://ollama.com/download
2. 启动Ollama并允许局域网访问：
```powershell
set OLLAMA_HOST=0.0.0.0:11434
ollama serve
```
3. 下载模型：
```powershell
ollama pull qwen2.5:14b
```
4. 查看电脑IP：
```powershell
ipconfig
```

---

## 安装APP

### 方式1：直接下载APK（推荐）

从Releases下载最新APK，安装到手机。

### 方式2：自己编译

```bash
# 克隆仓库
git clone https://github.com/Suk-Builder/ollama-app-preview.git
cd ollama-app-preview

# 安装依赖
flutter pub get

# 构建APK
flutter build apk --release

# 安装到手机
flutter install
```

---

## 配置连接

1. 打开APP
2. 点击左上角 ☰ 打开设置
3. 填入Ollama服务器地址：`http://你的电脑IP:11434`
4. 选择模型
5. 返回聊天界面开始对话

---

## 文件结构

```
lib/
├── main.dart              # 入口 + 主题配置
├── models/
│   ├── message.dart       # 消息/会话模型
│   └── app_state.dart     # 全局状态管理
├── services/
│   ├── ollama_service.dart    # Ollama API封装
│   └── storage_service.dart   # 本地存储
├── screens/
│   ├── chat_screen.dart       # 聊天界面
│   └── settings_screen.dart   # 设置页面
└── widgets/
    └── chat_bubble.dart       # 聊天气泡（Markdown）
```

---

## 硬件要求

| 设备 | 最低配置 | 推荐配置 |
|------|---------|---------|
| 电脑（跑Ollama） | CPU: 4核 / RAM: 8G | GPU: RTX 3060 12G / RAM: 32G |
| 手机（跑APP） | Android 8.0 / 2G RAM | Android 10+ / 4G RAM |

---

## 作者

**ymm** / SUK_桦树工坊  
GitHub: [@Suk-Builder](https://github.com/Suk-Builder)  
B站: [SUK_白桦](https://space.bilibili.com/3632306778540781)

---

## License

MIT
