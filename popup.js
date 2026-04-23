function renderList(listEl, items, storageKey) {
  listEl.innerHTML = "";
  items.forEach((domain, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="domain">${domain}</span>`;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "Remove";
    removeBtn.addEventListener("click", () => {
      items.splice(i, 1);
      chrome.storage.local.set({ [storageKey]: items }, () => {
        renderList(listEl, items, storageKey);
      });
    });
    li.appendChild(removeBtn);
    listEl.appendChild(li);
  });
}

function setupSection(inputId, btnId, listId, storageKey) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  const listEl = document.getElementById(listId);

  chrome.storage.local.get({ [storageKey]: [] }, (data) => {
    const items = data[storageKey];
    renderList(listEl, items, storageKey);
  });

  const addDomain = () => {
    const domain = input.value.trim().toLowerCase().replace(/^www\./, "");
    if (!domain) return;

    chrome.storage.local.get({ [storageKey]: [] }, (data) => {
      const items = data[storageKey];
      if (!items.includes(domain)) {
        items.push(domain);
        chrome.storage.local.set({ [storageKey]: items }, () => {
          renderList(listEl, items, storageKey);
          input.value = "";
        });
      }
    });
  };

  btn.addEventListener("click", addDomain);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addDomain();
  });
}

setupSection("blocked-input", "blocked-add", "blocked-list", "blockedList");
setupSection("slow-input", "slow-add", "slow-list", "slowList");
