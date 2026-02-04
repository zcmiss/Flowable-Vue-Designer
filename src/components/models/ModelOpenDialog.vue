<script setup>
import { computed } from 'vue';
import { FolderOpen, X, Loader2, RefreshCw, Trash2 } from 'lucide-vue-next';

const props = defineProps({
  modelValue: Boolean,
  models: {
    type: Array,
    default: () => []
  },
  loading: Boolean,
  error: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'refresh', 'select', 'delete']);

const hasModels = computed(() => props.models && props.models.length > 0);

function closeDialog() {
  emit('update:modelValue', false);
}

function handleRefresh() {
  emit('refresh');
}

function handleSelect(model) {
  emit('select', model);
}

function handleDelete(model) {
  if (confirm(`确定要删除模型 "${model.name}" 吗？此操作无法撤销。`)) {
    emit('delete', model.id);
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="model-dialog-overlay" @click="closeDialog">
        <div class="model-dialog" @click.stop>
          <div class="dialog-header">
            <h3>
              <FolderOpen :size="20" />
              打开模型
            </h3>
            <div class="header-actions">
              <button class="icon-btn" @click="handleRefresh" :disabled="loading" title="刷新">
                <RefreshCw :size="16" />
              </button>
              <button class="close-btn" @click="closeDialog">
                <X :size="18" />
              </button>
            </div>
          </div>

          <div class="dialog-body">
            <div v-if="loading" class="loading">
              <Loader2 class="spin" :size="18" />
              正在加载模型...
            </div>

            <div v-else-if="error" class="alert error">
              {{ error }}
            </div>

            <div v-else-if="!hasModels" class="empty">
              暂无模型，请先保存一个模型。
            </div>

            <div v-else class="model-list">
              <div
                v-for="model in models"
                :key="model.id"
                class="model-item-wrapper"
              >
                <div class="model-item" @click="handleSelect(model)">
                  <div class="model-name">{{ model.name }}</div>
                  <div class="model-meta">
                    <span v-if="model.key">Key: {{ model.key }}</span>
                    <span v-if="model.lastUpdated">更新: {{ model.lastUpdated }}</span>
                  </div>
                </div>
                <button 
                  class="delete-btn" 
                  @click.stop="handleDelete(model)"
                  title="删除模型"
                >
                  <Trash2 :size="16" />
                </button>
              </div>
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-secondary" @click="closeDialog">
              关闭
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.model-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.model-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 640px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn,
.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #999;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover,
.icon-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dialog-body {
  padding: 16px 20px 8px;
  max-height: 60vh;
  overflow-y: auto;
}

.loading,
.empty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
  padding: 12px 0;
}

.model-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.model-item-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff;
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  transition: all 0.2s;
}

.model-item-wrapper:hover {
  border-color: #91caff;
  box-shadow: 0 4px 10px rgba(24, 144, 255, 0.08);
}

.model-item {
  flex: 1;
  padding: 12px 14px;
  text-align: left;
  cursor: pointer;
  background: none;
  border: none;
}

.delete-btn {
  padding: 8px;
  margin-right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.delete-btn:hover {
  background-color: #fff2f0;
  color: #ff4d4f;
}

.model-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.model-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.alert {
  padding: 10px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.alert.error {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #cf1322;
}

.dialog-footer {
  padding: 12px 20px 16px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  background-color: #fafafa;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e8e8e8;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
