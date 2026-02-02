#!/bin/bash

# 性能测试脚本
# 用于对比优化前后的性能指标

echo "🚀 Flowable BPMN 编辑器性能测试"
echo "================================"
echo ""

# 检查是否安装了必要的工具
if ! command -v lighthouse &> /dev/null; then
    echo "⚠️  Lighthouse CLI 未安装"
    echo "请运行: npm install -g lighthouse"
    echo ""
    exit 1
fi

# 构建生产版本
echo "📦 构建生产版本..."
npm run build > /dev/null 2>&1

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

echo "✅ 构建完成"
echo ""

# 启动预览服务器
echo "🌐 启动预览服务器..."
npm run preview > /dev/null 2>&1 &
PREVIEW_PID=$!

# 等待服务器启动
sleep 3

# 检查服务器是否启动成功
if ! curl -s http://localhost:4173 > /dev/null; then
    echo "❌ 预览服务器启动失败"
    kill $PREVIEW_PID 2>/dev/null
    exit 1
fi

echo "✅ 服务器已启动 (PID: $PREVIEW_PID)"
echo ""

# 运行 Lighthouse 测试
echo "🔍 运行 Lighthouse 性能测试..."
echo "   测试 URL: http://localhost:4173"
echo "   模式: Desktop"
echo ""

lighthouse http://localhost:4173 \
  --output html \
  --output json \
  --output-path ./lighthouse-report \
  --preset desktop \
  --only-categories=performance \
  --quiet

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Lighthouse 测试完成"
    echo ""

    # 提取关键指标
    if [ -f "lighthouse-report.json" ]; then
        echo "📊 性能指标摘要："
        echo "================================"

        # 使用 node 解析 JSON
        node -e "
        const fs = require('fs');
        const report = JSON.parse(fs.readFileSync('lighthouse-report.json', 'utf8'));
        const audits = report.audits;

        console.log('Performance Score: ' + Math.round(report.categories.performance.score * 100));
        console.log('');
        console.log('Core Web Vitals:');
        console.log('  FCP (First Contentful Paint): ' + audits['first-contentful-paint'].displayValue);
        console.log('  LCP (Largest Contentful Paint): ' + audits['largest-contentful-paint'].displayValue);
        console.log('  TBT (Total Blocking Time): ' + audits['total-blocking-time'].displayValue);
        console.log('  CLS (Cumulative Layout Shift): ' + audits['cumulative-layout-shift'].displayValue);
        console.log('');
        console.log('Other Metrics:');
        console.log('  Speed Index: ' + audits['speed-index'].displayValue);
        console.log('  Time to Interactive: ' + audits['interactive'].displayValue);
        "

        echo ""
        echo "📄 详细报告已生成："
        echo "   HTML: lighthouse-report.html"
        echo "   JSON: lighthouse-report.json"
        echo ""
        echo "💡 在浏览器中打开 lighthouse-report.html 查看完整报告"
    fi
else
    echo "❌ Lighthouse 测试失败"
fi

# 清理：停止预览服务器
echo ""
echo "🧹 清理..."
kill $PREVIEW_PID 2>/dev/null
echo "✅ 预览服务器已停止"

echo ""
echo "🎉 测试完成！"
