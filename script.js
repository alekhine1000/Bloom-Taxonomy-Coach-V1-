/* =========================================  
   CONFIGURATION & STATE  
   ========================================= */  
const API_URL = 'https://zenmux.ai/api/v1/chat/completions';  
const STORAGE_KEY = 'bloomCoachConfig';  
  
// Removed MODEL_LISTS because we use direct input now  
  
const DOM = {  
  question: document.getElementById('question'),  
  intendedBloom: document.getElementById('intendedBloom'),  
  mode: document.getElementById('mode'),  
  apiKey: document.getElementById('apiKey'),  
  modelName: document.getElementById('modelName'), // Now reading input directly  
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
  localStorage.removeItem(STORAGE_KEY); // Reset for clean state  
  loadConfiguration();  
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
  
/* =========================================  
   UI LOGIC  
   ========================================= */  
function saveConfiguration() {  
  const config = {  
    apiKey: DOM.apiKey.value,  
    modelName: DOM.modelName.value  
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
      DOM.modelName.value = config.modelName || 'gpt-3.5-turbo'; // Default model  
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
  
  const apiKey = DOM.apiKey.value.trim();  
  const model = DOM.modelName.value.trim();  
  
  if (!apiKey) {  
    showToast("API Key is required.", "error");  
    return;  
  }  
    
  if (!model) {  
    showToast("Model Name is required.", "error");  
    return;  
  }  
  
  setLoading(true);  
  
  try {  
    const result = await realApiCall(apiKey, model);  
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
function buildPromptData() {  
  const question = DOM.question.value.trim();  
  const intended = DOM.intendedBloom.value;  
  const mode = DOM.mode.value;  
  
  const systemPrompt = `You are an expert exam validator and pedagogical coach specializing in Bloom's Taxonomy.   
Analyze the user's exam question.  
  
CRITICAL RULES:  
1. Bloom Level: Determine level based on COGNITIVE VERB and task, NOT on grammar.  
   - "Calculate", "Find", "Determine" = Apply.  
   - "Define", "List", "Identify" = Remember.  
   - "Explain", "Summarize" = Understand.  
   - "Analyze", "Compare", "Differentiate" = Analyze.  
   - "Evaluate", "Judge", "Critique" = Evaluate.  
   - "Design", "Create", "Construct" = Create.  
2. Typos and poor grammar do NOT lower Bloom level.  
  
MODES (V1):  
- Diagnose: Identify Bloom Level and list issues (typos, ambiguity). Fix errors only. Do NOT change Bloom Level.  
- Refine: Improve clarity, phrasing, and professional tone. Keep SAME Bloom Level.  
  
Return ONLY a raw JSON object (no markdown formatting) with this exact schema:  
{  
  "level": "Detected Bloom Level (e.g., Apply)",  
  "why": "Brief explanation of why it fits this level.",  
  "flags": ["List of strings identifying issues like typos, ambiguity"],  
  "redraft": "An improved version of the question based on the specific mode.",  
  "beforeAfter": "Short summary (e.g., 'Diagnosed as Apply - Fixed typos' or 'Refined phrasing - Same level')."  
}`;  
  
  let userPrompt = `Question: "${question}"\nMode: ${mode}`;  
  if (intended) {  
    userPrompt += `\nIntended Level: ${intended}`;  
  }  
  
  return { systemPrompt, userPrompt };  
}  
  
async function realApiCall(apiKey, model) {  
  const { systemPrompt, userPrompt } = buildPromptData();  
  
  const url = API_URL;   
    
  const headers = {  
    'Content-Type': 'application/json',  
    'Authorization': `Bearer ${apiKey}`  
  };  
    
  const body = {  
    model: model, // Reads directly from input field  
    messages: [  
      { role: "system", content: systemPrompt },  
      { role: "user", content: userPrompt }  
    ],  
    temperature: 0.3  
  };  
  
  DOM.debugPrompt.textContent = `URL: ${url}\nModel: ${model}`;  
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
  const cleanString = contentString.replace(/```json/g, '').replace(/```/g, '').trim();  
  
  return JSON.parse(cleanString);  
}  
  
function renderOutput(data) {  
  DOM.level.textContent = data.level || 'Unknown';  
  DOM.beforeAfter.textContent = data.beforeAfter || '';  
  DOM.why.textContent = data.why || 'No explanation provided.';  
  DOM.flags.textContent = Array.isArray(data.flags) ? data.flags.join('\n') : (data.flags || 'None');  
  DOM.redraft.textContent = data.redraft || 'No redraft available.';  
}  
