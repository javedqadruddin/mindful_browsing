// Temporary bypass set: URLs that have been approved via the slow countdown
const bypassed = new Set();

chrome.webNavigation.onBeforeNavigate.addListener((details) => {
  // Only act on top-level navigation (not iframes)
  if (details.frameId !== 0) return;

  const url = new URL(details.url);

  // Skip non-http(s) URLs and our own extension pages
  if (!url.protocol.startsWith("http")) return;

  // If this URL was approved via slow countdown, let it through
  if (bypassed.has(details.url)) {
    bypassed.delete(details.url);
    return;
  }

  const domain = url.hostname.replace(/^www\./, "");

  chrome.storage.local.get({ blockedList: [], slowList: [] }, (data) => {
    const isBlocked = data.blockedList.some(
      (d) => domain === d || domain.endsWith("." + d)
    );
    const isSlow = data.slowList.some(
      (d) => domain === d || domain.endsWith("." + d)
    );

    if (isBlocked) {
      const redirectUrl = chrome.runtime.getURL("blocked.html?mode=blocked");
      chrome.tabs.update(details.tabId, { url: redirectUrl });
    } else if (isSlow) {
      const target = encodeURIComponent(details.url);
      const redirectUrl = chrome.runtime.getURL(
        `blocked.html?mode=slow&target=${target}`
      );
      chrome.tabs.update(details.tabId, { url: redirectUrl });
    }
  });
});

// Listen for bypass requests from the blocked page
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "bypass" && message.url) {
    bypassed.add(message.url);
    sendResponse({ ok: true });
  }
});
