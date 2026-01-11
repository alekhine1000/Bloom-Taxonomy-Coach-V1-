/* =========================================  
   CONFIGURATION & STATE  
   ========================================= */
// SINGLE URL used for ALL providers (OpenAI, Vertex, Anthropic)
const API_URL = 'https://zenmux.ai/api/v1/chat/completions';
const STORAGE_KEY = 'bloomCoachConfig';

// All models treated as OpenAI-compatible payloads
const MODEL_LISTS = {
  openai: [
    { val: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Recommended)' },
    { val: 'gpt-4o', label: 'GPT-4o' },
    { val: 'gpt-4o-mini', label: 'GPT-4o-mini' },
    { val: 'deepseek-chat', label: 'DeepSeek Chat' },
    { val: 'custom', label: 'Custom Model Name...' }
  ],
  anthropic: [
    { val: 'claude-3-haiku', label: 'Claude 3 Haiku (Recommended)' },
    { val: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
    { val: 'claude-3-opus', label: 'Claude 3 Opus' },
    { val: 'custom', label: 'Custom Model Name...' }
  ],
  vertex: [
    { val: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
    { val: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { val: 'custom', label: 'Custom Model Name...' }
  ]
};

const DOM = {
  question: document.getElementById('question'),
  intendedBloom: document.getElementById('intendedBloom'),
  mode: document.getElementById('mode'),
  llmProvider: document.getElementById('llmProvider'),
  apiKey: document.getElementById('apiKey'),
  modelName: document.getElementById('modelName'),
  customModelDiv: document.getElementById('customModelDiv'),
  customModelInput: document.getElementById('customModelInput'),
  runBtn: document.getElementById('runBtn'),
  clearBtn: document.getElementById('clearBtn'),
  saveConfigBtn: document.getElementById('saveConfigBtn'),
  status: document.getElementById('status'),
  level: document.getElementById('level'),
  beforeAfter: document.getElementById('beforeAfter'),
  why: document.getElementById('why'),
  flags: document.getElementById('flags'),
  redraft: document.getElementById('redraft'),
  debugPrompt: document.getElementById('debugPrompt'),
  debugRaw: document.getElementById('debugRaw'),
  useRedraftBtn: document.getElementById('useRedraftBtn'),
  recheckBtn: document.getElementById('recheckBtn')
};

/* =========================================  
   INITIALIZATION & EVENT LISTENERS  
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
  // Reset config on load (as in your original code)
  localStorage.removeItem(STORAGE_KEY);

  // Load any saved config (if present)
  loadConfiguration();

  // Make sure the model dropdown is populated even if there's no saved config
  updateModelDropdown(DOM.llmProvider.value || 'openai');

  // --- Wire up event listeners AFTER DOM is ready ---

  DOM.llmProvider.addEventListener('change', () => {
    updateModelDropdown(DOM.llmProvider.value);
  });

  DOM.modelName.addEventListener('change', () => {
    if (DOM.modelName.value === 'custom') {
      DOM.customModelDiv.style.display = 'block';
      DOM.customModelInput.focus();
    } else {
      DOM.customModelDiv.style.display = 'none';
    }
  });

  DOM.runBtn.addEventListener('click', handleRun);
  DOM.clearBtn.addEventListener('click', clearForm);
  DOM.saveConfigBtn.addEventListener('click', saveConfiguration);

  DOM.useRedraftBtn.addEventListener('click', () => {
    DOM.question.value = DOM.redraft.textContent;
    showToast('Redraft moved to question input');
    DOM.useRedraftBtn.disabled = true;
    DOM.recheckBtn.disabled = true;
  });

  DOM.recheckBtn.addEventListener('click', () => {
    DOM.question.value = DOM.redraft.textContent;
    handleRun();
  });
});

/* =========================================  
   UI LOGIC  
   ========================================= */
function updateModelDropdown(provider) {
  const list = MODEL_LISTS[provider];
  if (!list) return;

  DOM.modelName.innerHTML = '';
  list.forEach(m => {
    const option = document.createElement('option');
    option.value = m.val;
    option.textContent = m.label;
    DOM.modelName.appendChild(option);
  });
  DOM.customModelDiv.style.display = 'none';
}

function saveConfiguration() {
  const config = {
    apiKey: DOM.apiKey.value,
    llmProvider: DOM.llmProvider.value,
    modelName: DOM.modelName.value,
    customModelInput: DOM.customModelInput.value
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  showToast('Configuration saved locally!');
}

function loadConfiguration() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const config = JSON.parse(saved);
      DOM.apiKey.value = config.apiKey || '';
      DOM.llmProvider.value = config.llmProvider || 'openai';

      // Populate models for the restored provider
      updateModelDropdown(DOM.llmProvider.value);

      const modelExists = Array.from(DOM.modelName.options)
        .some(o => o.value === config.modelName);
      DOM.modelName.value = modelExists
        ? config.modelName
        : MODEL_LISTS[DOM.llmProvider.value][0].val;

      DOM.customModelInput.value = config.customModelInput || '';

      if (DOM.modelName.value === 'custom') {
        DOM.customModelDiv.style.display = 'block';
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
  }
}

function clearForm() {
  DOM.question.value = '';
  DOM.intendedBloom.value = '';
  clearOutput();
  showToast('Form cleared');
}

function clearOutput() {
  DOM.status.className = 'status hidden';
  DOM.status.textContent = '';
  DOM.level.textContent = '—';
  DOM.beforeAfter.textContent = '';
  DOM.why.textContent = '—';
  DOM.flags.textContent = '—';
  DOM.redraft.textContent = '—';
  DOM.debugPrompt.textContent = '—';
  DOM.debugRaw.textContent = '—';
  DOM.useRedraftBtn.disabled = true;
  DOM.recheckBtn.disabled = true;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  if (type === 'error') toast.style.backgroundColor = '#ef4444';

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function setLoading(isLoading) {
  if (isLoading) {
    DOM.runBtn.disabled = true;
    DOM.runBtn.innerHTML = '<span class="spinner"></span> Processing...';
    DOM.status.className = 'status loading';
    DOM.status.textContent = 'Analyzing question...';
    DOM.useRedraftBtn.disabled = true;
    DOM.recheckBtn.disabled = true;
  } else {
    DOM.runBtn.disabled = false;
    DOM.runBtn.textContent = 'Run Analysis';
  }
}

/* =========================================  
   CORE APPLICATION LOGIC  
   ========================================= */
async function handleRun() {
  const question = DOM.question.value.trim();
  if (!question) {
    showToast("Please enter a question first.", "error");
    return;
  }

  const provider = DOM.llmProvider.value;
  const apiKey = DOM.apiKey.value.trim();

  if (!apiKey) {
    showToast("API Key is required.", "error");
    return;
  }

  setLoading(true);

  try {
    const result = await realApiCall(provider, apiKey);
    renderOutput(result);
    DOM.status.className = 'status success';
    DOM.status.textContent = 'Analysis complete.';
    DOM.useRedraftBtn.disabled = false;
    DOM.recheckBtn.disabled = false;

  } catch (error) {
    console.error(error);
    DOM.status.className = 'status error';
    DOM.status.textContent = `Error: ${error.message}`;
    showToast("Failed to process request. Check debug details.", "error");
    DOM.debugRaw.textContent += "\n\n[ERROR STACK]:\n" + error.stack;
  } finally {
    setLoading(false);
  }
}

/* =========================================  
   API HANDLING  
   ========================================= */
function getEffectiveModel() {
  const selected = DOM.modelName.value;
  if (selected === 'custom') {
    const customVal = DOM.customModelInput.value.trim();
    if (!customVal) return MODEL_LISTS[DOM.llmProvider.value][0].val;
    return customVal;
  }
  return selected;
}

function buildPromptData() {
  const question = DOM.question.value.trim();
  const intended = DOM.intendedBloom.value;
  const mode = DOM.mode.value;

  const systemPrompt = `You are an expert exam validator and pedagogical coach specializing in Bloom's Taxonomy. 
Your goal is to analyze exam questions based on user's mode. 
Return ONLY a raw JSON object (no markdown formatting) with this exact schema: 
{  
  "level": "Detected Bloom Level (e.g., Analyze)",  
  "why": "Brief explanation of why it fits this level.",  
  "flags": ["List of strings identifying issues like ambiguity, bias, or complexity mismatch"],  
  "redraft": "An improved version of the question based on the mode",  
  "beforeAfter": "Short summary of the change (e.g., 'Moved from Remember to Understand')"  
}`;

  let userPrompt = `Question: "${question}"\nMode: ${mode}`;
  if (intended) {
    userPrompt += `\nIntended Level: ${intended}`;
  }

  return { systemPrompt, userPrompt };
}

async function realApiCall(provider, apiKey) {
  const { systemPrompt, userPrompt } = buildPromptData();
  const model = getEffectiveModel();

  const url = API_URL;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  const body = {
    model: model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.3
  };

  // Debug display
  DOM.debugPrompt.textContent = `URL: ${url}\nModel: ${model}\nProvider: ${provider}`;
  DOM.debugRaw.textContent = `[SENDING PAYLOAD]:\n${JSON.stringify(body, null, 2)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  DOM.debugRaw.textContent += `\n\n[RECEIVED RESPONSE]:\n${JSON.stringify(data, null, 2)}`;

  const contentString = data.choices[0].message.content;

  const cleanString = contentString
    .replace(/```json/g, '')
    .replace(/```/g, '')
    .trim();

  return JSON.parse(cleanString);
}

function renderOutput(data) {
  DOM.level.textContent = data.level || 'Unknown';
  DOM.beforeAfter.textContent = data.beforeAfter || '';
  DOM.why.textContent = data.why || 'No explanation provided.';
  DOM.flags.textContent = Array.isArray(data.flags)
    ? data.flags.join('\n')
    : (data.flags || 'None');
  DOM.redraft.textContent = data.redraft || 'No redraft available.';
}
