# 性能测试指南

## 🎯 测试目标

验证优化后的性能改善，重点关注：
- **FCP** (First Contentful Paint) - 首次内容绘制
- **LCP** (Largest Contentful Paint) - 最大内容绘制
- **TTI** (Time to Interactive) - 可交互时间
- **TBT** (Total Blocking Time) - 总阻塞时间
- **CLS** (Cumulative Layout Shift) - 累积布局偏移

---

## 📊 方法 1：Chrome DevTools Lighthouse

### 步骤：

1. **启动开发服务器**
   ```bash
   npm run dev
   ```

2. **打开 Chrome 浏览器**
   - 访问 `http://localhost:5173`（或显示的端口）

3. **打开 DevTools**
   - 按 `F12` 或 `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)

4. **运行 Lighthouse**
   - 切换到 "Lighthouse" 标签
   - 选择 "Desktop" 或 "Mobile"
   - 勾选 "Performance"
   - 点击 "Analyze page load"

5. **查看报告**
   - 等待测试完成（约 30-60 秒）
   - 查看性能评分和 Core Web Vitals

---

## 📊 方法 2：使用生产构建测试

### 步骤：

1. **构建生产版本**
   ```bash
   npm run build
   ```

2. **预览生产构建**
   ```bash
   npm run preview
   ```

3. **运行 Lighthouse**
   - 访问预览 URL（通常是 `http://localhost:4173`）
   - 按照方法 1 的步骤 3-5 进行测试

---

## 📊 方法 3：使用 Lighthouse CLI

### 安装 Lighthouse CLI：
```bash
npm install -g lighthouse
```

### 运行测试：
```bash
# 启动预览服务器
npm run preview

# 在另一个终端运行 Lighthouse
lighthouse http://localhost:4173 \
  --output html \
  --output-path ./lighthouse-report.html \
  --preset desktop \
  --only-categories=performance
```

### 查看报告：
```bash
open lighthouse-report.html  # Mac
# 或
start lighthouse-report.html  # Windows
```

---

## 🎯 预期性能指标

### **优化前（预估）**

| 指标 | 预期值 | 评级 |
|------|--------|------|
| Performance Score | 40-60 | 🟠 Poor |
| FCP | 2-3s | 🟠 Needs Work |
| LCP | 3-4s | 🟠 Needs Work |
| TTI | 4-5s | 🔴 Poor |
| TBT | 500-1000ms | 🔴 Poor |
| CLS | <0.1 | 🟢 Good |

### **优化后（预期）**

| 指标 | 预期值 | 评级 |
|------|--------|------|
| Performance Score | **85-95** | 🟢 Good |
| FCP | **0.3-0.5s** | 🟢 Good |
| LCP | **1-1.5s** | 🟢 Good |
| TTI | **1.5-2s** | 🟢 Good |
| TBT | **50-150ms** | 🟢 Good |
| CLS | **<0.1** | 🟢 Good |

---

## 📈 关键改善点

### 1. **首屏加载速度**
- ✅ 入口 JS: 1.5 MB → 2.54 kB (-99.8%)
- ✅ 首次传输: 440 kB → 1.3 kB (-99.7%)
- ✅ 骨架屏立即显示

### 2. **资源加载策略**
- ✅ 路由级懒加载
- ✅ BPMN 编辑器异步加载
- ✅ Vendor 分离缓存

### 3. **压缩优化**
- ✅ Gzip: 230 kB (BPMN vendor)
- ✅ Brotli: 177 kB (BPMN vendor)

---

## 🔍 如何解读 Lighthouse 报告

### **Performance Score (性能评分)**
- 90-100: 🟢 Excellent
- 50-89: 🟠 Needs Improvement
- 0-49: 🔴 Poor

### **Core Web Vitals**

#### FCP (First Contentful Paint)
- 🟢 Good: <1.8s
- 🟠 Needs Work: 1.8-3s
- 🔴 Poor: >3s

#### LCP (Largest Contentful Paint)
- 🟢 Good: <2.5s
- 🟠 Needs Work: 2.5-4s
- 🔴 Poor: >4s

#### TBT (Total Blocking Time)
- 🟢 Good: <200ms
- 🟠 Needs Work: 200-600ms
- 🔴 Poor: >600ms

#### CLS (Cumulative Layout Shift)
- 🟢 Good: <0.1
- 🟠 Needs Work: 0.1-0.25
- 🔴 Poor: >0.25

---

## 📝 测试检查清单

- [ ] 启动开发/预览服务器
- [ ] 清除浏览器缓存（重要！）
- [ ] 使用隐身模式测试（避免扩展干扰）
- [ ] 测试桌面和移动端
- [ ] 记录优化前后的对比数据
- [ ] 检查 Network 面板的资源加载顺序
- [ ] 验证骨架屏是否立即显示
- [ ] 确认 BPMN 编辑器异步加载

---

## 🚀 进一步优化建议

如果 Lighthouse 评分未达到预期，可以考虑：

1. **应用 Codex 的深度优化**
   - RAF 节流高频事件
   - requestIdleCallback 延迟初始化
   - shallowRef 优化响应式
   - v-memo 优化列表渲染

2. **服务器配置**
   - 启用 HTTP/2
   - 配置 CDN
   - 启用 Brotli 压缩

3. **资源优化**
   - 字体预加载
   - 关键 CSS 内联
   - 图片懒加载

---

## 📞 需要帮助？

如果测试结果与预期不符，请提供：
- Lighthouse 报告截图
- Network 面板截图
- 具体的性能指标数值

我会帮你分析并提供进一步的优化建议。
