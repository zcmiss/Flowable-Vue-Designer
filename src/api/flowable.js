// API 基础配置
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

/**
 * 统一请求封装
 */
async function request(url, options = {}) {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(fullUrl, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    // 处理空响应
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return await response.text();
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * 流程定义部署 API
 */
export const deploymentApi = {
  /**
   * 部署流程定义
   * @param {string} name - 部署名称
   * @param {string} bpmnXml - BPMN XML 内容
   * @returns {Promise<Object>} 部署结果
   */
  async deploy(name, bpmnXml) {
    // 创建 FormData 用于文件上传
    const formData = new FormData();

    // 将 XML 内容转为 Blob 文件
    const blob = new Blob([bpmnXml], { type: 'application/xml' });
    formData.append('file', blob, `${name}.bpmn20.xml`);
    formData.append('deploymentName', name);

    const response = await fetch(`${API_BASE_URL}/flowable-api/repository/deployments`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`部署失败: ${errorText}`);
    }

    return await response.json();
  }
};

/**
 * 流程实例 API
 */
export const processApi = {
  /**
   * 启动流程实例
   * @param {string} processDefinitionKey - 流程定义 Key
   * @param {Object} options - 启动选项
   * @param {string} [options.businessKey] - 业务 Key
   * @param {Object} [options.variables] - 流程变量
   * @returns {Promise<Object>} 流程实例信息
   */
  async start(processDefinitionKey, options = {}) {
    return request(`/api/processes/${processDefinitionKey}/start`, {
      method: 'POST',
      body: {
        businessKey: options.businessKey,
        variables: options.variables
      }
    });
  }
};

/**
 * 任务 API
 */
export const taskApi = {
  /**
   * 获取任务列表
   * @param {Object} params - 查询参数
   * @param {string} [params.assignee] - 指定处理人
   * @param {string} [params.candidateUser] - 候选人
   * @returns {Promise<Array>} 任务列表
   */
  async list(params = {}) {
    const query = new URLSearchParams();
    if (params.assignee) query.append('assignee', params.assignee);
    if (params.candidateUser) query.append('candidateUser', params.candidateUser);

    const url = `/api/tasks${query.toString() ? `?${query.toString()}` : ''}`;
    return request(url);
  },

  /**
   * 完成任务
   * @param {string} taskId - 任务 ID
   * @param {Object} [variables] - 流程变量
   * @returns {Promise<void>}
   */
  async complete(taskId, variables) {
    return request(`/api/tasks/${taskId}/complete`, {
      method: 'POST',
      body: { variables }
    });
  }
};

/**
 * 模型 API
 */
export const modelApi = {
  /**
   * 新建模型
   * @param {Object} payload
   * @param {string} payload.name - 模型名称
   * @param {string} [payload.key] - 模型 Key
   * @param {string} [payload.description] - 描述
   * @param {string} payload.bpmnXml - BPMN XML
   * @returns {Promise<Object>}
   */
  async create(payload) {
    return request('/api/models', {
      method: 'POST',
      body: payload
    });
  },

  /**
   * 更新模型
   * @param {string} id - 模型 ID
   * @param {Object} payload
   * @param {string} payload.name - 模型名称
   * @param {string} [payload.key] - 模型 Key
   * @param {string} [payload.description] - 描述
   * @param {string} payload.bpmnXml - BPMN XML
   * @returns {Promise<Object>}
   */
  async update(id, payload) {
    return request(`/api/models/${id}`, {
      method: 'PUT',
      body: payload
    });
  },

  /**
   * 获取模型列表
   * @returns {Promise<Array>}
   */
  async list() {
    return request('/api/models');
  },

  /**
   * 获取模型详情
   * @param {string} id - 模型 ID
   * @returns {Promise<Object>}
   */
  async get(id) {
    return request(`/api/models/${id}`);
  },

  /**
   * 删除模型
   * @param {string} id - 模型 ID
   * @returns {Promise<void>}
   */
  async delete(id) {
    return request(`/api/models/${id}`, {
      method: 'DELETE'
    });
  }
};

export default {
  deployment: deploymentApi,
  process: processApi,
  task: taskApi,
  model: modelApi
};
