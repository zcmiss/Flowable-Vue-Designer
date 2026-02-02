<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  element: Object,
  id: String,
  label: String
});

const emit = defineEmits(['update']);

// Field types supported by Flowable
const fieldTypes = [
  { value: 'string', label: '字符串 (String)' },
  { value: 'integer', label: '整数 (Integer)' },
  { value: 'long', label: '长整数 (Long)' },
  { value: 'boolean', label: '布尔值 (Boolean)' },
  { value: 'date', label: '日期 (Date)' },
  { value: 'enum', label: '枚举 (Enum)' },
  { value: 'double', label: '双精度 (Double)' }
];

// Parse fields from element
const fields = computed(() => {
  if (!props.element || !props.element.businessObject) {
    return [];
  }
  const businessObject = props.element.businessObject;
  const extensionElements = businessObject.extensionElements;

  if (!extensionElements || !extensionElements.values) {
    return [];
  }

  const formData = extensionElements.values.find(
    ext => ext.$type === 'flowable:FormData'
  );

  if (!formData || !formData.fields) {
    return [];
  }

  return formData.fields.map((field, index) => ({
    index,
    id: field.id || '',
    name: field.name || '',
    type: field.type || 'string',
    label: field.label || '',
    defaultValue: field.defaultValue || ''
  }));
});

const isEditing = ref(false);
const editingField = ref(null);
const editingIndex = ref(-1);

function addField() {
  isEditing.value = true;
  editingIndex.value = -1;
  editingField.value = {
    id: '',
    name: '',
    type: 'string',
    label: '',
    defaultValue: ''
  };
}

function editField(index) {
  const field = fields.value[index];
  if (field) {
    isEditing.value = true;
    editingIndex.value = index;
    editingField.value = { ...field };
  }
}

function saveField() {
  if (!editingField.value.id || !editingField.value.name) {
    alert('字段ID和名称不能为空');
    return;
  }

  const currentFields = fields.value.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    label: f.label,
    defaultValue: f.defaultValue
  }));

  if (editingIndex.value >= 0) {
    // Update existing field
    currentFields[editingIndex.value] = { ...editingField.value };
  } else {
    // Add new field
    currentFields.push({ ...editingField.value });
  }

  emit('update', currentFields);
  cancelEdit();
}

function deleteField(index) {
  if (!confirm('确定要删除这个字段吗？')) {
    return;
  }

  const currentFields = fields.value.map(f => ({
    id: f.id,
    name: f.name,
    type: f.type,
    label: f.label,
    defaultValue: f.defaultValue
  }));

  currentFields.splice(index, 1);
  emit('update', currentFields);
}

function cancelEdit() {
  isEditing.value = false;
  editingField.value = null;
  editingIndex.value = -1;
}

function getTypeLabel(type) {
  const typeObj = fieldTypes.find(t => t.value === type);
  return typeObj ? typeObj.label : type;
}
</script>

<template>
  <div class="form-data-editor">
    <div class="form-data-header">
      <span class="form-data-label">{{ label }}</span>
      <button class="add-btn" @click="addField" v-if="!isEditing">
        <span>+ 添加字段</span>
      </button>
    </div>

    <!-- Field List -->
    <div v-if="!isEditing" class="field-list">
      <div v-if="fields.length === 0" class="empty-state">
        暂无表单字段
      </div>
      <div
        v-for="(field, index) in fields"
        :key="field.id"
        class="field-item"
      >
        <div class="field-info">
          <div class="field-name">{{ field.name }}</div>
          <div class="field-meta">
            <span class="field-id">{{ field.id }}</span>
            <span class="field-type">{{ getTypeLabel(field.type) }}</span>
          </div>
        </div>
        <div class="field-actions">
          <button class="action-btn edit" @click="editField(index)" title="编辑">
            ✎
          </button>
          <button class="action-btn delete" @click="deleteField(index)" title="删除">
            ✕
          </button>
        </div>
      </div>
    </div>

    <!-- Field Edit Form -->
    <div v-else class="field-edit-form">
      <div class="form-row">
        <label>字段ID <span class="required">*</span></label>
        <input
          v-model="editingField.id"
          type="text"
          placeholder="如: username"
        />
      </div>

      <div class="form-row">
        <label>字段名称 <span class="required">*</span></label>
        <input
          v-model="editingField.name"
          type="text"
          placeholder="如: 用户名"
        />
      </div>

      <div class="form-row">
        <label>字段类型</label>
        <select v-model="editingField.type">
          <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
            {{ type.label }}
          </option>
        </select>
      </div>

      <div class="form-row">
        <label>显示标签</label>
        <input
          v-model="editingField.label"
          type="text"
          placeholder="如: 请输入用户名"
        />
      </div>

      <div class="form-row">
        <label>默认值</label>
        <input
          v-model="editingField.defaultValue"
          type="text"
          placeholder="默认值"
        />
      </div>

      <div class="form-actions">
        <button class="btn-primary" @click="saveField">保存</button>
        <button class="btn-secondary" @click="cancelEdit">取消</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-data-editor {
  padding: 8px 0;
}

.form-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.form-data-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text, #374151);
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.add-btn:hover {
  background: #40a9ff;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 13px;
  background: #f5f5f5;
  border-radius: 4px;
}

.field-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #f8f9fa;
  border: 1px solid #e8e8e8;
  border-radius: 6px;
  transition: all 0.2s;
}

.field-item:hover {
  background: #f0f0f0;
  border-color: #d9d9d9;
}

.field-info {
  flex: 1;
  min-width: 0;
}

.field-name {
  font-size: 13px;
  font-weight: 500;
  color: #262626;
  margin-bottom: 4px;
}

.field-meta {
  display: flex;
  gap: 8px;
  font-size: 11px;
}

.field-id {
  color: #595959;
  font-family: monospace;
  background: #e6e6e6;
  padding: 1px 6px;
  border-radius: 3px;
}

.field-type {
  color: #1890ff;
  background: #e6f7ff;
  padding: 1px 6px;
  border-radius: 3px;
}

.field-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.action-btn.edit {
  background: #f6ffed;
  color: #52c41a;
}

.action-btn.edit:hover {
  background: #d9f7be;
}

.action-btn.delete {
  background: #fff2e8;
  color: #fa541c;
}

.action-btn.delete:hover {
  background: #ffd8bf;
}

/* Field Edit Form */
.field-edit-form {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
}

.form-row {
  margin-bottom: 12px;
}

.form-row label {
  display: block;
  font-size: 12px;
  color: #595959;
  margin-bottom: 4px;
}

.form-row label .required {
  color: #ff4d4f;
}

.form-row input,
.form-row select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 13px;
  background: white;
  transition: border-color 0.2s;
}

.form-row input:focus,
.form-row select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #e8e8e8;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 6px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #1890ff;
  color: white;
  border: none;
}

.btn-primary:hover {
  background: #40a9ff;
}

.btn-secondary {
  background: white;
  color: #595959;
  border: 1px solid #d9d9d9;
}

.btn-secondary:hover {
  color: #1890ff;
  border-color: #1890ff;
}
</style>
