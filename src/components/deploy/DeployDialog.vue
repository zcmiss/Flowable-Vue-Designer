<script setup>
import { ref, watch } from 'vue';
import { deploymentApi } from '../../api/flowable.js';
import { Upload, X, Loader2, CheckCircle, AlertCircle } from 'lucide-vue-next';

const props = defineProps({
  modelValue: Boolean,
  bpmnXml: {
    type: String,
    default: ''
  },
  processName: {
    type: String,
    default: 'process'
  }
});

const emit = defineEmits(['update:modelValue', 'deployed']);

const deploymentName = ref('');
const loading = ref(false);
const error = ref('');
const success = ref(false);

// 打开弹窗时初始化
watch(() => props.modelValue, (val) => {
  if (val) {
    deploymentName.value = props.processName || '流程部署';
    error.value = '';
    success.value = false;
  }
});

async function handleDeploy() {
  if (!deploymentName.value.trim()) {
    error.value = '请输入部署名称';
    return;
  }

  if (!props.bpmnXml) {
    error.value = '没有可部署的 BPMN 内容';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const result = await deploymentApi.deploy(deploymentName.value, props.bpmnXml);
    success.value = true;
    emit('deployed', result);

    // 2秒后自动关闭
    setTimeout(() => {
      closeDialog();
    }, 2000);
  } catch (err) {
    error.value = err.message || '部署失败';
  } finally {
    loading.value = false;
  }
}

function closeDialog() {
  emit('update:modelValue', false);
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="deploy-dialog-overlay" @click="closeDialog">
        <div class="deploy-dialog" @click.stop>
          <div class="dialog-header">
            <h3>
              <Upload :size="20" />
              部署流程
            </h3>
            <button class="close-btn" @click="closeDialog">
              <X :size="18" />
            </button>
          </div>

          <div class="dialog-body">
            <div class="form-group">
              <label for="deploymentName">部署名称</label>
              <input
                id="deploymentName"
                v-model="deploymentName"
                type="text"
                placeholder="请输入部署名称"
                :disabled="loading || success"
              />
            </div>

            <div v-if="error" class="alert error">
              <AlertCircle :size="16" />
              {{ error }}
            </div>

            <div v-if="success" class="alert success">
              <CheckCircle :size="16" />
              部署成功！
            </div>
          </div>

          <div class="dialog-footer">
            <button class="btn btn-secondary" @click="closeDialog" :disabled="loading">
              取消
            </button>
            <button
              class="btn btn-primary"
              @click="handleDeploy"
              :disabled="loading || success"
            >
              <Loader2 v-if="loading" class="spin" :size="16" />
              <Upload v-else :size="16" />
              {{ loading ? '部署中...' : '部署' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.deploy-dialog-overlay {
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

.deploy-dialog {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 480px;
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

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-group input:disabled {
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

.alert.success {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #389e0d;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #fff;
  border-color: #d9d9d9;
  color: #333;
}

.btn-secondary:hover:not(:disabled) {
  border-color: #1890ff;
  color: #1890ff;
}

.btn-primary {
  background-color: #1890ff;
  border-color: #1890ff;
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background-color: #40a9ff;
  border-color: #40a9ff;
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
