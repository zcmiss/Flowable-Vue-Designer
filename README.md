# Flowable Vue Designer

基于 Vue 3 + Vite + bpmn-js 的 Flowable 流程设计器，提供可视化的 BPMN 2.0 流程建模能力。

> 一款简洁高效的 Flowable 流程建模工具，支持流程设计、属性配置、表单数据编辑等功能。

![Vue 3](https://img.shields.io/badge/Vue-3.5.27-4FC08D?logo=vue.js)
![Vite](https://img.shields.io/badge/Vite-7.3.1-646CFF?logo=vite)
![BPMN](https://img.shields.io/badge/BPMN-2.0-FF5722)

## 功能特性

- 🎨 **可视化建模** - 基于 bpmn-js 的拖拽式流程设计器
- 📋 **属性面板** - 完整的流程元素属性配置
- 🌐 **中文支持** - 内置 bpmn-js 汉化
- ⚡ **高性能** - 代码分割、Gzip/Brotli 压缩、懒加载优化
- 📦 **模块化架构** - 组件化设计，易于扩展

## 技术栈

- **前端框架**: Vue 3 (Composition API)
- **构建工具**: Vite 7
- **路由管理**: Vue Router 4
- **BPMN 引擎**: bpmn-js 18.x
- **属性面板**: bpmn-js-properties-panel
- **图标库**: Lucide Vue

## 项目结构

```
flowable-vue-designer/
├── src/
│   ├── components/
│   │   ├── BpmnModeler.vue          # BPMN 建模器主组件
│   │   ├── properties-panel/        # 属性面板相关
│   │   │   ├── FormDataEditor.vue   # 表单数据编辑器
│   │   │   └── provider.js          # 属性面板配置提供者
│   │   └── ui/                      # UI 组件
│   │       ├── LoadingSpinner.vue
│   │       ├── ModelerSkeleton.vue
│   │       └── Toast.vue
│   ├── views/
│   │   └── DesignerView.vue         # 设计器页面
│   ├── router/
│   │   └── index.js                 # 路由配置
│   ├── utils/
│   │   ├── bpmn-translate/          # BPMN 汉化
│   │   │   ├── customTranslate.js
│   │   │   └── zh.js
│   │   └── performance.js           # 性能工具
│   ├── assets/
│   │   ├── flowable.json            # Flowable 扩展配置
│   │   └── *.css                    # 样式文件
│   ├── App.vue
│   └── main.js
├── vite.config.js                   # Vite 配置（含性能优化）
└── package.json
```

## 快速开始

### 环境要求

- Node.js: ^20.19.0 || >=22.12.0
- npm >= 10

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 生产构建

```bash
# 标准构建
npm run build

# 构建并分析包大小
npm run build:analyze
```

### 预览生产构建

```bash
npm run preview
```

## 开发指南

### IDE 推荐

- [VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) 插件

### 浏览器调试工具

- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

## 性能优化

本项目已配置多项性能优化策略：

- **代码分割**: 按功能模块分包（vue-vendor、bpmn-vendor、icons、vendor）
- **压缩优化**: Gzip + Brotli 双压缩
- **Tree Shaking**: Terser 压缩，移除 console/debugger
- **依赖预构建**: 优化 bpmn-js 等大型依赖的加载

## 参考文档

- [Vite 配置参考](https://vite.dev/config/)
- [bpmn-js 文档](https://bpmn.io/toolkit/bpmn-js/)
- [Vue 3 文档](https://cn.vuejs.org/)

## 许可证

[MIT](LICENSE)
# Flowable-Vue-Designer
