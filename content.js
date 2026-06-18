console.log('✅ Flow Bulk Image Generator content script loaded');

// State
let isProcessing = false;
let isPaused = false;
let currentPromptIndex = 0;
let prompts = [];
let referenceImageData = null;
let settings = {};
let generatedCount = 0;

// Constants
const SELECTORS = {
  promptEditor: '[data-slate-editor="true"]',
  submitButton: '//button[.//i[normalize-space()="arrow_forward"]]',
  settingsButton: '//button[@aria-haspopup="menu" and .//div[@data-type="button-overlay"]]',
  addImageButton: '//button[.//i[normalize-space()="add_2"]]',
  dialog: '[role="dialog"][data-state="open"]',
  assetSearch: 'input[type="text"]'
};

// Utility Functions
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getXPath(xpath) {
  try {
    return document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  } catch (e) {
    console.error('XPath error:', e);
    return null;
  }
}

function getRandomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

function clickElement(el) {
  if (!el) return false;
  const {x, y} = el.getBoundingClientRect();
  el.dispatchEvent(new MouseEvent('mousedown', {bubbles: true, clientX: x, clientY: y}));
  el.dispatchEvent(new MouseEvent('mouseup', {bubbles: true, clientX: x, clientY: y}));
  el.dispatchEvent(new MouseEvent('click', {bubbles: true, clientX: x, clientY: y}));
  return true;
}

// Text Injection
async function injectPrompt(text) {
  const editor = document.querySelector(SELECTORS.promptEditor);
  if (!editor) {
    console.error('❌ Editor not found');
    return false;
  }

  editor.focus();
  editor.click();
  await sleep(150);

  // Select all and replace
  document.execCommand('selectAll', false, null);
  await sleep(80);

  if (settings.stealthMode && text.length > 120) {
    // Human-like paste for long prompts
    await sleep(300 + Math.random() * 600);
    const dt = new DataTransfer();
    dt.setData('text/plain', text);
    const pasteEvent = new ClipboardEvent('paste', {bubbles: true, clipboardData: dt});
    editor.dispatchEvent(pasteEvent);
    await sleep(250 + Math.random() * 220);
  } else {
    // Type character by character for short prompts
    const content = editor.textContent || '';
    if (content.length > 0) document.execCommand('delete', false, null);
    
    for (let char of text) {
      document.execCommand('insertText', false, char);
      await sleep(30 + Math.random() * 95);
    }
  }

  await sleep(400);
  return true;
}

// Reference Image Upload & Attach
async function uploadReferenceImage(imageData) {
  if (!imageData) return true; // Skip if no image

  const addBtn = getXPath(SELECTORS.addImageButton);
  if (!addBtn) {
    console.warn('⚠️ Add image button not found');
    return true; // Continue anyway
  }

  clickElement(addBtn);
  await sleep(600);

  const dialog = document.querySelector(SELECTORS.dialog);
  if (!dialog) {
    console.warn('⚠️ Image library dialog did not open');
    return true;
  }

  const searchInput = dialog.querySelector(SELECTORS.assetSearch);
  if (!searchInput) {
    console.warn('⚠️ Search input not found');
    return true;
  }

  // Convert base64 to file
  const base64Data = imageData.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const file = new File([bytes], 'reference.jpg', {type: 'image/jpeg'});
  const fileInput = document.querySelector('input[type="file"][accept*="image"]');
  
  if (fileInput) {
    const dt = new DataTransfer();
    dt.items.add(file);
    fileInput.files = dt.files;
    fileInput.dispatchEvent(new Event('change', {bubbles: true}));
    await sleep(800);
  }

  // Search and select
  searchInput.value = 'reference';
  searchInput.dispatchEvent(new Event('input', {bubbles: true}));
  await sleep(500);

  const results = dialog.querySelectorAll('img[alt]');
  if (results.length > 0) {
    const resultRow = results[0].parentElement;
    clickElement(resultRow);
    await sleep(600);
  }

  // Close dialog
  document.body.dispatchEvent(new KeyboardEvent('keydown', {
    key: 'Escape',
    keyCode: 27,
    bubbles: true
  }));
  await sleep(300);

  return true;
}

// Apply Settings
async function applySettings() {
  const settingsBtn = getXPath(SELECTORS.settingsButton);
  if (!settingsBtn) {
    console.warn('⚠️ Settings button not found');
    return true;
  }

  clickElement(settingsBtn);
  await sleep(600);

  // Model selection (simplified)
  const modelName = {
    'nano_banana2': 'Nano Banana 2',
    'nano_banana_pro': 'Nano Banana Pro',
    'imagen4': 'Imagen 4',
    'veo3_fast': 'Veo 3.1 - Fast'
  }[settings.model] || 'Nano Banana 2';

  // Close settings
  document.body.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', keyCode: 27, bubbles: true}));
  await sleep(400);

  return true;
}

// Submit Prompt
async function submitPrompt() {
  const submitBtn = getXPath(SELECTORS.submitButton);
  if (!submitBtn) {
    console.error('❌ Submit button not found');
    return false;
  }

  const {x, y} = submitBtn.getBoundingClientRect();
  submitBtn.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true, clientX: x, clientY: y}));
  submitBtn.dispatchEvent(new PointerEvent('pointerup', {bubbles: true, clientX: x, clientY: y}));
  await sleep(300);

  return true;
}

// Process Single Prompt
async function processPrompt(prompt, index) {
  console.log(`📝 Processing prompt ${index + 1}/${prompts.length}: "${prompt.substring(0, 50)}..."`);

  // Apply settings
  if (!await applySettings()) return false;
  await sleep(500);

  // Upload reference image
  if (index === 0) {
    if (!await uploadReferenceImage(referenceImageData)) return false;
    await sleep(500);
  }

  // Inject prompt
  if (!await injectPrompt(prompt)) {
    console.error('❌ Failed to inject prompt');
    return false;
  }
  await sleep(500);

  // Submit
  if (!await submitPrompt()) {
    console.error('❌ Failed to submit');
    return false;
  }
  await sleep(800);

  generatedCount++;
  sendUpdate('progressUpdate', {current: index + 1, total: prompts.length});

  return true;
}

// Main Generation Loop
async function startBulkGeneration(promptList, refImage, genSettings) {
  prompts = promptList;
  referenceImageData = refImage;
  settings = genSettings;
  isProcessing = true;
  isPaused = false;
  currentPromptIndex = 0;
  generatedCount = 0;

  console.log(`🚀 Starting bulk generation: ${prompts.length} prompts`);
  sendUpdate('progressUpdate', {current: 0, total: prompts.length});

  for (let i = 0; i < prompts.length; i++) {
    currentPromptIndex = i;

    // Check pause
    while (isPaused && isProcessing) {
      await sleep(500);
    }

    if (!isProcessing) break;

    // Process prompt
    const success = await processPrompt(prompts[i], i);
    if (!success) {
      console.error(`❌ Failed at prompt ${i + 1}`);
      break;
    }

    // Delay before next prompt
    if (i < prompts.length - 1) {
      const delay = getRandomDelay(settings.minDelay || 10, settings.maxDelay || 15);
      console.log(`⏳ Waiting ${delay / 1000}s before next prompt...`);
      await sleep(delay);
    }
  }

  isProcessing = false;
  sendUpdate('generationComplete', {downloaded: generatedCount});
}

// Send update to popup
function sendUpdate(action, data) {
  try {
    chrome.runtime.sendMessage({action, ...data}).catch(() => {});
  } catch (e) {
    console.error('Failed to send update:', e);
  }
}

// Message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startBulkGeneration') {
    startBulkGeneration(message.prompts, message.referenceImage, message.settings)
      .then(() => sendResponse({success: true}))
      .catch(err => sendResponse({success: false, error: err.message}));
    return true;
  } else if (message.action === 'pauseBulkGeneration') {
    isPaused = message.paused;
    sendResponse({success: true});
  } else if (message.action === 'stopBulkGeneration') {
    isProcessing = false;
    sendResponse({success: true});
  }
});
