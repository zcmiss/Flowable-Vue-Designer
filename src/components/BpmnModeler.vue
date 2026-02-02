<script setup>
import { onMounted, onBeforeUnmount, ref, shallowRef } from 'vue';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule
} from 'bpmn-js-properties-panel';
import flowableModdleDescriptor from '../assets/flowable.json';
import FlowablePropertiesProvider from './properties-panel/provider';
import customTranslate from '../utils/bpmn-translate/customTranslate';
import translations from '../utils/bpmn-translate/zh';
import Toast from './ui/Toast.vue';
import FormDataEditor from './properties-panel/FormDataEditor.vue';

import { 
  FolderOpen, 
  FileCode, 
  FileImage, 
  Undo2, 
  Redo2, 
  ZoomIn, 
  ZoomOut, 
  Maximize,
  Settings,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-vue-next';

import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-codes.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import '@bpmn-io/properties-panel/assets/properties-panel.css';

const container = ref(null);
const propertiesPanelContainer = ref(null);
const modeler = shallowRef(null);
const fileInput = ref(null);
const toast = ref(null);
const isPropertiesPanelOpen = ref(true);
const isFormDataPanelOpen = ref(false);
const selectedElement = ref(null);
let paletteObserver = null;
let selectionChangeListener = null;
let elementChangeListener = null;

const defaultXml = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" 
             xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
             xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
             xmlns:omgdc="http://www.omg.org/spec/DD/20100524/DC" 
             xmlns:omgdi="http://www.omg.org/spec/DD/20100524/DI" 
             xmlns:flowable="http://flowable.org/bpmn" 
             targetNamespace="http://www.flowable.org/processdef">
  <process id="process_1" name="Default Process" isExecutable="true">
    <startEvent id="startEvent1" />
    <userTask id="userTask1" name="Approve Task" flowable:assignee="kermit" />
  </process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_process_1">
    <bpmndi:BPMNPlane id="BPMNPlane_process_1" bpmnElement="process_1">
      <bpmndi:BPMNShape id="BPMNShape_startEvent1" bpmnElement="startEvent1">
        <omgdc:Bounds x="100" y="100" width="30" height="30" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_userTask1" bpmnElement="userTask1">
        <omgdc:Bounds x="180" y="75" width="100" height="80" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</definitions>`;

// Custom Translate Module
const customTranslateModule = {
  translate: [ 'value', customTranslate ]
};

onMounted(() => {
  modeler.value = new BpmnModeler({
    container: container.value,
    propertiesPanel: {
      parent: propertiesPanelContainer.value
    },
    additionalModules: [
      BpmnPropertiesPanelModule,
      BpmnPropertiesProviderModule,
      customTranslateModule,
      {
        __init__: [ 'flowablePropertiesProvider' ],
        flowablePropertiesProvider: [ 'type', FlowablePropertiesProvider ]
      }
    ],
    moddleExtensions: {
      flowable: flowableModdleDescriptor
    },
    keyboard: {
      bindTo: window
    }
  });

  createDiagram(defaultXml);

  // Start observing the palette for changes to ensure tooltips are translated
  startPaletteObserver();

  // Listen for selection changes
  selectionChangeListener = (e) => {
    try {
      const selection = e.newSelection;
      if (selection && selection.length === 1) {
        const element = selection[0];
        if (!element || !element.businessObject) {
          selectedElement.value = null;
          isFormDataPanelOpen.value = false;
          return;
        }
        const businessObject = element.businessObject;
        // Check if element is UserTask or StartEvent with formKey
        const hasFormKey = businessObject.formKey && businessObject.formKey.trim() !== '';
        if ((businessObject.$type === 'bpmn:UserTask' || businessObject.$type === 'bpmn:StartEvent') && hasFormKey) {
          selectedElement.value = element;
          isFormDataPanelOpen.value = true;
        } else {
          selectedElement.value = element;
          isFormDataPanelOpen.value = false;
        }
      } else {
        selectedElement.value = null;
        isFormDataPanelOpen.value = false;
      }
    } catch (err) {
      console.error('Error in selection change handler:', err);
      selectedElement.value = null;
      isFormDataPanelOpen.value = false;
    }
  };
  modeler.value.on('selection.changed', selectionChangeListener);

  // Listen for element changes to toggle form data panel when formKey changes
  elementChangeListener = (e) => {
    const element = e.element;
    if (selectedElement.value && element && element.id === selectedElement.value.id) {
      const businessObject = element.businessObject;
      if (businessObject) {
        const isFormElement = businessObject.$type === 'bpmn:UserTask' || businessObject.$type === 'bpmn:StartEvent';
        if (!isFormElement) return;

        const hasFormKey = businessObject.formKey && businessObject.formKey.trim() !== '';
        if (hasFormKey && !isFormDataPanelOpen.value) {
          isFormDataPanelOpen.value = true;
        } else if (!hasFormKey && isFormDataPanelOpen.value) {
          isFormDataPanelOpen.value = false;
        }
      }
    }
  };
  modeler.value.on('element.changed', elementChangeListener);
});

onBeforeUnmount(() => {
  if (paletteObserver) {
    paletteObserver.disconnect();
  }
  if (modeler.value) {
    if (selectionChangeListener) {
      modeler.value.off('selection.changed', selectionChangeListener);
    }
    if (elementChangeListener) {
      modeler.value.off('element.changed', elementChangeListener);
    }
  }
});

function startPaletteObserver() {
  // Wait for the palette to exist in the DOM
  const checkPalette = setInterval(() => {
    const palette = container.value?.querySelector('.djs-palette');
    if (palette) {
      clearInterval(checkPalette);
      
      // Apply initial translation
      updatePaletteTooltips(palette);

      // Observe for future changes (e.g. if palette is redrawn)
      paletteObserver = new MutationObserver(() => {
        updatePaletteTooltips(palette);
      });
      
      paletteObserver.observe(palette, { childList: true, subtree: true });
    }
  }, 100);
}

function updatePaletteTooltips(palette) {
  const mapping = {
    'create.start-event': 'Create start event',
    'create.intermediate-event': 'Create intermediate/boundary event',
    'create.end-event': 'Create end event',
    'create.exclusive-gateway': 'Create gateway',
    'create.task': 'Create task',
    'create.data-object': 'Create data object reference',
    'create.data-store': 'Create data store reference',
    'create.subprocess-expanded': 'Create expanded sub-process',
    'create.participant-expanded': 'Create pool/participant',
    'create.group': 'Create group',
    'hand-tool': 'Activate hand tool',
    'lasso-tool': 'Activate lasso tool',
    'space-tool': 'Activate create/remove space tool',
    'global-connect-tool': 'Activate global connect tool'
  };

  const entries = palette.querySelectorAll('.entry');
  entries.forEach(entry => {
    const action = entry.getAttribute('data-action');
    if (action && mapping[action]) {
      const translationKey = mapping[action];
      const translated = findTranslation(translationKey);

      // Remove default title tooltip to prevent browser default tooltip
      entry.removeAttribute('title');

      // Check if tooltip already exists
      let tooltipEl = entry.querySelector('.entry-tooltip');
      let tooltipArrowEl = entry.querySelector('.entry-tooltip-arrow');

      // Create tooltip elements if they don't exist and we have a translation
      if (translated) {
        if (!tooltipEl) {
          tooltipEl = document.createElement('span');
          tooltipEl.className = 'entry-tooltip';
          entry.appendChild(tooltipEl);
        }
        if (!tooltipArrowEl) {
          tooltipArrowEl = document.createElement('span');
          tooltipArrowEl.className = 'entry-tooltip-arrow';
          entry.appendChild(tooltipArrowEl);
        }
        // Update tooltip text
        if (tooltipEl.textContent !== translated) {
          tooltipEl.textContent = translated;
        }
      }
    }
  });
}

function findTranslation(key) {
  if (translations[key]) return translations[key];
  const lowerKey = key.toLowerCase();
  const match = Object.keys(translations).find(k => k.toLowerCase() === lowerKey);
  return match ? translations[match] : null;
}

async function createDiagram(xml) {
  try {
    await modeler.value.importXML(xml);
    modeler.value.get('canvas').zoom('fit-viewport'); 
  } catch (err) {
    console.error('could not import BPMN 2.0 diagram', err);
    toast.value?.add('无法导入 BPMN 图表', 'error');
  }
}

function triggerFileInput() {
  fileInput.value.click();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    createDiagram(e.target.result);
    toast.value?.add('文件导入成功', 'success');
  };
  reader.onerror = () => {
    toast.value?.add('文件读取失败', 'error');
  };
  reader.readAsText(file);
  event.target.value = ''; // Reset input
}

async function exportDiagram() {
  try {
    const { xml } = await modeler.value.saveXML({ format: true });
    downloadFile(xml, 'diagram.bpmn', 'application/xml');
    toast.value?.add('XML 导出成功', 'success');
  } catch (err) {
    console.error('could not save BPMN 2.0 diagram', err);
    toast.value?.add('XML 导出失败', 'error');
  }
}

async function exportSvg() {
  try {
    const { svg } = await modeler.value.saveSVG();
    downloadFile(svg, 'diagram.svg', 'image/svg+xml');
    toast.value?.add('SVG 导出成功', 'success');
  } catch (err) {
    console.error('could not save SVG', err);
    toast.value?.add('SVG 导出失败', 'error');
  }
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Editor Actions
function handleUndo() {
  modeler.value.get('commandStack').undo();
}

function handleRedo() {
  modeler.value.get('commandStack').redo();
}

function handleZoomIn() {
  modeler.value.get('zoomScroll').stepZoom(1);
}

function handleZoomOut() {
  modeler.value.get('zoomScroll').stepZoom(-1);
}

function handleZoomReset() {
  modeler.value.get('canvas').zoom('fit-viewport');
}

function togglePropertiesPanel() {
  isPropertiesPanelOpen.value = !isPropertiesPanelOpen.value;
}

function updateFormData(fields) {
  try {
    if (!selectedElement.value || !modeler.value) return;

    const element = selectedElement.value;
    const businessObject = element.businessObject;
    if (!businessObject) return;

    let extensionElements = businessObject.extensionElements;
    const bpmnFactory = modeler.value.get('bpmnFactory');
    const modeling = modeler.value.get('modeling');

    if (!bpmnFactory || !modeling) return;

    // Create extensionElements if not exists
    if (!extensionElements) {
      extensionElements = bpmnFactory.create('bpmn:ExtensionElements');
      businessObject.extensionElements = extensionElements;
    }

    if (!extensionElements.values) {
      extensionElements.values = [];
    }

    // Remove existing formData
    extensionElements.values = extensionElements.values.filter(
      ext => ext.$type !== 'flowable:FormData'
    );

    // Create new formData if there are fields
    if (fields && fields.length > 0) {
      const formData = bpmnFactory.create('flowable:FormData');
      formData.fields = fields.map(fieldData => {
        const field = bpmnFactory.create('flowable:FormField');
        field.id = fieldData.id || '';
        field.name = fieldData.name || '';
        field.type = fieldData.type || 'string';
        field.label = fieldData.label || '';
        field.defaultValue = fieldData.defaultValue || '';
        return field;
      });
      extensionElements.values.push(formData);
    }

    modeling.updateProperties(element, {
      extensionElements: extensionElements
    });
  } catch (err) {
    console.error('Error updating form data:', err);
  }
}
</script>

<template>
  <div class="bpmn-app">
    <Toast ref="toast" />
    <header class="toolbar">
      <div class="brand">
        <!-- Optional: Add Logo here -->
        <span class="brand-text">Flowable Designer</span>
      </div>

      <div class="separator"></div>

      <div class="actions">
        <button class="btn" @click="triggerFileInput" title="Open BPMN File">
          <FolderOpen :size="18" />
          <span>打开</span>
        </button>
        <input 
          type="file" 
          ref="fileInput" 
          @change="handleFileUpload" 
          accept=".bpmn,.xml" 
          style="display: none" 
        />
        
        <div class="separator-vertical"></div>

        <button class="btn" @click="exportDiagram" title="Download BPMN XML">
          <FileCode :size="18" />
          <span>XML</span>
        </button>
        <button class="btn" @click="exportSvg" title="Download SVG Image">
          <FileImage :size="18" />
          <span>SVG</span>
        </button>

        <div class="separator-vertical"></div>

        <button class="btn icon-only" @click="handleUndo" title="撤销 (Ctrl+Z)">
          <Undo2 :size="18" />
        </button>
        <button class="btn icon-only" @click="handleRedo" title="重做 (Ctrl+Y)">
          <Redo2 :size="18" />
        </button>

        <div class="separator-vertical"></div>

        <button class="btn icon-only" @click="handleZoomIn" title="放大 (Ctrl+)">
          <ZoomIn :size="18" />
        </button>
        <button class="btn icon-only" @click="handleZoomOut" title="缩小 (Ctrl-)">
          <ZoomOut :size="18" />
        </button>
        <button class="btn icon-only" @click="handleZoomReset" title="适应屏幕">
          <Maximize :size="18" />
        </button>

        <div class="separator-vertical"></div>
        
        <button
          class="btn icon-only"
          :class="{ active: isPropertiesPanelOpen }"
          @click="togglePropertiesPanel"
          title="切换属性面板"
        >
          <PanelRightClose v-if="isPropertiesPanelOpen" :size="18" />
          <PanelRightOpen v-else :size="18" />
        </button>
      </div>
    </header>

    <div class="workspace">
      <div ref="container" class="canvas"></div>

      <Transition name="slide">
        <div v-show="isPropertiesPanelOpen" class="properties-sidebar">
          <div class="properties-header">
            <span>属性面板</span>
            <button class="close-btn" @click="togglePropertiesPanel">
              <Settings :size="14" />
            </button>
          </div>
          <div ref="propertiesPanelContainer" class="properties-panel-content"></div>
        </div>
      </Transition>

      <!-- Form Data Panel - only shows when formKey has value -->
      <Transition name="slide">
        <div v-show="isFormDataPanelOpen && selectedElement && selectedElement.businessObject &&
                     selectedElement.businessObject.formKey" class="formdata-sidebar">
          <div class="formdata-header">
            <span>表单数据配置</span>
            <button class="close-btn" @click="isFormDataPanelOpen = false">
              <Settings :size="14" />
            </button>
          </div>
          <div class="formdata-panel-content" v-if="selectedElement && selectedElement.businessObject">
            <FormDataEditor
              :element="selectedElement"
              id="formData"
              label="表单字段"
              @update="updateFormData"
            />
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.bpmn-app {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.toolbar {
  height: 54px; /* Slightly taller */
  background-color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  z-index: 10;
}

.brand-text {
  font-weight: 700;
  font-size: 18px;
  color: #2c3e50;
  letter-spacing: -0.5px;
}

.separator {
  flex: 1;
}

.actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.separator-vertical {
  width: 1px;
  height: 24px;
  background-color: #eee;
  margin: 0 10px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background-color: transparent;
  color: #555;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn:hover {
  background-color: #f3f4f6;
  color: #111;
}

.btn:active {
  background-color: #e5e7eb;
  transform: translateY(1px);
}

.btn.icon-only {
  padding: 8px;
}

.btn.active {
  background-color: #e6f7ff;
  color: #1890ff;
  border-color: #bae7ff;
}

.workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  position: relative;
}

.canvas {
  flex: 1;
  background-color: #f8f9fa;
  position: relative;
  /* Grid pattern */
  background-image: 
    linear-gradient(#e5e7eb 1px, transparent 1px),
    linear-gradient(90deg, #e5e7eb 1px, transparent 1px);
  background-size: 20px 20px;
}

.properties-sidebar {
  width: 320px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0,0,0,0.03);
  z-index: 5;
}

.properties-header {
  height: 48px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-weight: 600;
  font-size: 14px;
  background-color: #fafafa;
  color: #555;
}

.properties-panel-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

/* Ensure the properties panel internal structure fits the height */
:deep(.bio-properties-panel-container) {
  height: 100%;
  overflow-y: auto;
}

/* Form Data Sidebar */
.formdata-sidebar {
  width: 320px;
  background-color: #fff;
  border-left: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.03);
  z-index: 5;
}

.formdata-header {
  height: 48px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  font-weight: 600;
  font-size: 14px;
  background-color: #e6f7ff;
  color: #1890ff;
}

.formdata-panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  opacity: 0.5;
  padding: 4px;
}
.close-btn:hover { opacity: 1; }

/* Slide Transition for Sidebar - use width transition for flex items */
.slide-enter-active,
.slide-leave-active {
  transition: width 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  width: 0 !important;
  opacity: 0;
  overflow: hidden;
}

/* --- Palette Fixes --- */
:deep(.djs-palette) {
  left: 20px;
  top: 20px;
  background: #ffffff;
  border: 1px solid #e0e0e0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 4px;
  width: 52px; /* Fixed width for single column */
  padding: 6px 0; /* Vertical padding */
}

/* Force entries to be vertical column */
:deep(.djs-palette-entries),
:deep(.djs-palette .group) {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

:deep(.djs-palette .entry) {
  width: 40px;
  height: 40px;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 2px 0;
  border-radius: 4px;
  float: none !important; /* Override default float */
}

:deep(.djs-palette .entry:hover) {
  background-color: #e6f7ff;
  color: #1890ff;
}

/* Clean up separators */
:deep(.djs-palette .separator) {
  width: 80%;
  height: 1px;
  background-color: #eee;
  margin: 4px 0;
  border: none;
  float: none;
}

/* Custom tooltip for palette entries - use separate element to avoid ::before conflict with icons */
:deep(.djs-palette .entry) {
  position: relative;
}

:deep(.djs-palette .entry .entry-tooltip) {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.8);
  color: #fff;
  font-size: 12px;
  white-space: nowrap;
  border-radius: 4px;
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* Tooltip arrow - use separate element */
:deep(.djs-palette .entry .entry-tooltip-arrow) {
  position: absolute;
  left: calc(100% + 4px);
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border: 4px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
  pointer-events: none;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
  z-index: 1000;
}

/* Show tooltip on hover */
:deep(.djs-palette .entry:hover .entry-tooltip),
:deep(.djs-palette .entry:hover .entry-tooltip-arrow) {
  opacity: 1;
  visibility: visible;
}
</style>