<script setup>
import { ref, watch } from 'vue';
import { Save, X, Loader2, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  modelValue: Boolean,
  defaultName: {
    type: String,
    default: ''
  },
  defaultKey: {
    type: String,
    default: ''
  },
  loading: Boolean,
  error: {
    type: String,
    default: ''
  },
  isUpdate: Boolean
});

const emit = defineEmits(['update:modelValue', 'save']);

const name = ref('');
const key = ref('');
const description = ref('');
const localError = ref('');

watch(() => props.modelValue, (val) => {
  if (val) {
    name.value = props.defaultName || '';
    key.value = props.defaultKey || '';
    description.value = '';
    localError.value = '';
  }
});

function closeDialog() {
  emit('update:modelValue', false);
}

function handleSave() {
  if (!name.value.trim()) {
    localError.value = '请输入模型名称';
    return;
  }
  if (!key.value.trim()) {
    localError.value = '请输入模型 Key';
    return;
  }
  localError.value = '';
  emit('save', {
    name: name.value.trim(),
    key: key.value.trim(),
    description: description.value.trim()
  });
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="model-dialog-overlay" @click="closeDialog">
        <div class="model-dialog" @click.stop>
          <div class="dialog-header">
            <h3>
              <Save :size="20" />
              {{ isUpdate ? '更新模型' : '保存模型' }}
            </h3>
            <button class="close-btn" @click="closeDialog">
              <X :size="18" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="form-group">
              <label for="modelName">模型名称</label>
              <input
                id="modelName"
                v-model="name"
                type="text"
                placeholder="请输入模型名称"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="modelKey">模型 Key</label>
              <input
                id="modelKey"
                v-model="key"
                type="text"
                placeholder="例如: leave_request"
                :disabled="loading"
              />
            </div>

            <div class="form-group">
              <label for="modelDescription">描述（可选）</label>
              <textarea
                id="modelDescription"
                v-model="description"
                rows="3"
                placeholder="请输入模型描述"
                :disabled="loading"
              ></textarea>
            </div>

            <div v-if="localError || error" class="alert error">
              <AlertCircle :size="16" />
              {{ localError || error }}
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-secondary" @click="closeDialog" :disabled="loading">
              取消
            </button>
            <button
              class="btn btn-primary"
              @click="handleSave"
              :disabled="loading"
            >
              <Loader2 v-if="loading" class="spin" :size="16" />
              <Save v-else :size="16" />
              {{ loading ? '保存中...' : (isUpdate ? '更新' : '保存') }}
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
  max-width: 520px;
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

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #999;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

.dialog-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.alert {
  display: flex;
  align-items: center;
  gap: 8px;
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
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  background-color: #fafafa;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e8e8e8;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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
