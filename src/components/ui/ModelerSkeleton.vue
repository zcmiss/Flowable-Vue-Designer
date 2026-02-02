<template>
  <div class="skeleton">
    <div class="skeleton-toolbar"></div>
    <div class="skeleton-body">
      <div class="skeleton-canvas"></div>
      <div class="skeleton-panel"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f4f5f7;
}

.skeleton-toolbar {
  height: 54px;
  background: linear-gradient(90deg, #f0f2f5, #e9ecf1, #f0f2f5);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.skeleton-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.skeleton-canvas {
  flex: 1;
  background: linear-gradient(90deg, #f7f8fa, #eef1f5, #f7f8fa);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

.skeleton-panel {
  width: 320px;
  border-left: 1px solid #e0e0e0;
  background: linear-gradient(90deg, #f3f4f6, #e9ecf1, #f3f4f6);
  background-size: 200% 100%;
  animation: shimmer 1.6s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
