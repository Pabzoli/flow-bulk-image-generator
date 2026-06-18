// Service Worker
console.log('✅ Flow Bulk Image Generator background service worker loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('🔧 Extension installed');
});

// Keep service worker alive
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Message listener to keep the service worker active
  sendResponse({received: true});
});
