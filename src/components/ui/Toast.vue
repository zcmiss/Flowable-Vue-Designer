<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';

const toasts = ref([]);
let idCounter = 0;

const add = (message, type = 'info', duration = 3000) => {
  const id = idCounter++;
  toasts.value.push({ id, message, type });
  
  if (duration > 0) {
    setTimeout(() => {
      remove(id);
    }, duration);
  }
};

const remove = (id) => {
  toasts.value = toasts.value.filter(t => t.id !== id);
};

defineExpose({ add });
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id" 
        class="toast-item"
        :class="toast.type"
      >
        <span>{{ toast.message }}</span>
        <button class="close-btn" @click="remove(toast.id)">
          <X :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none; /* Allow clicking through container */
}

.toast-item {
  pointer-events: auto;
  min-width: 250px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.95);
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  font-family: var(--font-sans);
  color: var(--color-ink);
  border-left: 4px solid var(--color-ink);
  border: 1px solid var(--color-border);
}

.toast-item.info { border-left-color: var(--color-brand); }
.toast-item.success { border-left-color: #22c55e; }
.toast-item.error { border-left-color: #ef4444; }
.toast-item.warning { border-left-color: var(--color-accent); }

.close-btn {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  opacity: 0.6;
  display: flex;
  align-items: center;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.close-btn:hover {
  opacity: 1;
  transform: translateY(-1px);
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
