// State
let isProcessing = false;
let isPaused = false;
let referenceImageData = null;
const settings = {
  model: 'nano_banana2',
  aspectRatio: 'landscape',
  imageCount: '1',
  downloadQuality: '1K',
  minDelay: 10,
  maxDelay: 15,
  autoDownload: true,
  stealthMode: true
};

// Elements
const fileInput = document.getElementById('referenceImage');
const fileLabel = document.getElementById('fileLabel');
const preview = document.getElementById('preview');
const promptsTextarea = document.getElementById('prompts');
const promptCountDiv = document.getElementById('promptCount');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const stopBtn = document.getElementById('stopBtn');
const statusBox = document.getElementById('statusBox');
const statusMessage = document.getElementById('statusMessage');
const progressFill = document.getElementById('progressFill');
const errorList = document.getElementById('errorList');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  setupEventListeners();
  updatePromptCount();
});

// Setup Event Listeners
function setupEventListeners() {
  // File input
  fileInput.addEventListener('change', handleFileSelect);
  fileLabel.addEventListener('dragover', e => {
    e.preventDefault();
    fileLabel.style.background = '#f0f0ff';
  });
  fileLabel.addEventListener('dragleave', () => {
    fileLabel.style.background = '';
  });
  fileLabel.addEventListener('drop', e => {
    e.preventDefault();
    fileLabel.style.background = '';
    const files = e.dataTransfer.files;
    if (files[0]) fileInput.files = files;
    handleFileSelect();
  });

  // Prompts
  promptsTextarea.addEventListener('input', updatePromptCount);

  // Settings
  document.getElementById('model').addEventListener('change', e => {
    settings.model = e.target.value;
    saveSettings();
  });
  document.getElementById('aspectRatio').addEventListener('change', e => {
    settings.aspectRatio = e.target.value;
    saveSettings();
  });
  document.getElementById('imageCount').addEventListener('change', e => {
    settings.imageCount = e.target.value;
    saveSettings();
  });
  document.getElementById('downloadQuality').addEventListener('change', e => {
    settings.downloadQuality = e.target.value;
    saveSettings();
  });
  document.getElementById('minDelay').addEventListener('change', e => {
    settings.minDelay = parseInt(e.target.value);
    saveSettings();
  });
  document.getElementById('maxDelay').addEventListener('change', e => {
    settings.maxDelay = parseInt(e.target.value);
    saveSettings();
  });

  // Toggles
  document.querySelectorAll('.toggle').forEach(toggle => {
    toggle.addEventListener('click', handleToggle);
  });

  // Buttons
  startBtn.addEventListener('click', startGeneration);
  pauseBtn.addEventListener('click', pauseGeneration);
  stopBtn.addEventListener('click', stopGeneration);
}

// File handling
function handleFileSelect() {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    referenceImageData = e.target.result;
    preview.src = referenceImageData;
    preview.style.display = 'block';
    fileLabel.classList.add('selected');
    fileLabel.textContent = '✓ ' + file.name;
  };
  reader.readAsDataURL(file);
}

// Prompt count
function updatePromptCount() {
  const text = promptsTextarea.value.trim();
  const count = text ? text.split('\n').filter(l => l.trim()).length : 0;
  promptCountDiv.textContent = `${count} prompt${count !== 1 ? 's' : ''}`;
}

// Toggle settings
function handleToggle(e) {
  const toggle = e.currentTarget;
  const setting = toggle.dataset.setting;
  toggle.classList.toggle('active');
  settings[setting] = toggle.classList.contains('active');
  saveSettings();
}

// Show status
function showStatus(message, type = 'info', errors = []) {
  statusBox.classList.add('show');
  statusBox.className = `status-box show ${type}`;
  statusMessage.textContent = message;
  
  if (errors.length > 0) {
    errorList.style.display = 'block';
    errorList.innerHTML = errors.map(e => `<li>• ${e}</li>`).join('');
  } else {
    errorList.style.display = 'none';
  }
}

function updateProgress(current, total) {
  const percent = total > 0 ? (current / total) * 100 : 0;
  progressFill.style.width = percent + '%';
  statusMessage.textContent = `Processing: ${current}/${total} prompts`;
}

// Validation
function validateInputs() {
  const prompts = promptsTextarea.value.trim().split('\n').filter(l => l.trim());
  
  if (prompts.length === 0) {
    showStatus('❌ Please enter at least one prompt', 'error');
    return null;
  }
  
  if (!referenceImageData) {
    showStatus('❌ Please upload a reference image', 'error');
    return null;
  }
  
  return prompts;
}

// Start Generation
async function startGeneration() {
  if (isProcessing) return;

  const prompts = validateInputs();
  if (!prompts) return;

  isProcessing = true;
  isPaused = false;
  startBtn.style.display = 'none';
  pauseBtn.style.display = 'block';
  stopBtn.style.display = 'block';
  startBtn.disabled = true;

  showStatus(`🚀 Starting generation of ${prompts.length} image(s)...`, 'info');
  updateProgress(0, prompts.length);

  try {
    // Get active Flow tab
    const tabs = await chrome.tabs.query({ url: '*://labs.google/fx/tools/flow/*' });
    if (tabs.length === 0) {
      showStatus('❌ Google Flow tab not found. Open Flow first.', 'error');
      resetUI();
      return;
    }

    const tabId = tabs[0].id;

    // Send to content script
    const response = await chrome.tabs.sendMessage(tabId, {
      action: 'startBulkGeneration',
      prompts: prompts,
      referenceImage: referenceImageData,
      settings: settings
    });

    if (response.success) {
      showStatus('✅ Generation started', 'success');
    } else {
      showStatus(`❌ ${response.error || 'Failed to start generation'}`, 'error');
      resetUI();
    }
  } catch (error) {
    showStatus(`❌ Error: ${error.message}`, 'error');
    resetUI();
  }
}

// Pause Generation
async function pauseGeneration() {
  isPaused = !isPaused;
  
  const tabs = await chrome.tabs.query({ url: '*://labs.google/fx/tools/flow/*' });
  if (tabs.length === 0) return;

  chrome.tabs.sendMessage(tabs[0].id, {
    action: 'pauseBulkGeneration',
    paused: isPaused
  }).catch(() => {});

  pauseBtn.textContent = isPaused ? '▶ Resume' : '⏸ Pause';
  pauseBtn.className = isPaused ? 'btn-pause' : 'btn-start';
  showStatus(isPaused ? '⏸ Generation paused' : '▶ Generation resumed', 'info');
}

// Stop Generation
async function stopGeneration() {
  const tabs = await chrome.tabs.query({ url: '*://labs.google/fx/tools/flow/*' });
  if (tabs.length === 0) return;

  chrome.tabs.sendMessage(tabs[0].id, {
    action: 'stopBulkGeneration'
  }).catch(() => {});

  resetUI();
  showStatus('⏹ Generation stopped', 'warning');
}

// Reset UI
function resetUI() {
  isProcessing = false;
  isPaused = false;
  startBtn.style.display = 'block';
  pauseBtn.style.display = 'none';
  stopBtn.style.display = 'none';
  pauseBtn.textContent = '⏸ Pause';
  pauseBtn.className = 'btn-pause';
  startBtn.disabled = false;
  progressFill.style.width = '0%';
}

// Listen for updates from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'progressUpdate') {
    updateProgress(message.current, message.total);
  } else if (message.action === 'generationComplete') {
    resetUI();
    showStatus(`✅ Generation complete! ${message.downloaded || 0} images downloaded.`, 'success');
  } else if (message.action === 'generationError') {
    showStatus(`❌ Error: ${message.error}`, 'error', message.errors || []);
  }
});

// Storage
function saveSettings() {
  chrome.storage.sync.set({ flowBulkSettings: settings });
}

function loadSettings() {
  chrome.storage.sync.get('flowBulkSettings', data => {
    if (data.flowBulkSettings) {
      Object.assign(settings, data.flowBulkSettings);
      
      // Update UI
      document.getElementById('model').value = settings.model;
      document.getElementById('aspectRatio').value = settings.aspectRatio;
      document.getElementById('imageCount').value = settings.imageCount;
      document.getElementById('downloadQuality').value = settings.downloadQuality;
      document.getElementById('minDelay').value = settings.minDelay;
      document.getElementById('maxDelay').value = settings.maxDelay;
      
      // Update toggles
      if (settings.autoDownload) document.getElementById('toggleAutoDownload').classList.add('active');
      if (settings.stealthMode) document.getElementById('toggleStealthMode').classList.add('active');
    }
  });
}
