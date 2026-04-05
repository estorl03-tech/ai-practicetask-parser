const form = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const charCounter = document.getElementById("char-counter");
const statusMessage = document.getElementById("status-message");
const resultCard = document.getElementById("result-card");
const rawResponse = document.getElementById("raw-response");

const resultTitle = document.getElementById("result-title");
const resultDueDate = document.getElementById("result-due-date");
const resultCategory = document.getElementById("result-category");
const resultTags = document.getElementById("result-tags");
const resultPath = document.getElementById("result-path");
const historyList = document.getElementById("history-list");
const historyEmpty = document.getElementById("history-empty");
const clearHistoryButton = document.getElementById("clear-history");

const STORAGE_KEY = "task-parser-history";

function updateCounter() {
  charCounter.textContent = `${taskInput.value.length} / 150`;
}

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveHistory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderHistory() {
  const items = loadHistory();
  historyList.innerHTML = "";

  if (items.length === 0) {
    historyEmpty.classList.remove("is-hidden");
    historyList.classList.add("is-hidden");
    return;
  }

  historyEmpty.classList.add("is-hidden");
  historyList.classList.remove("is-hidden");

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "history-item";
    li.innerHTML = `
      <div class="history-item-top">
        <strong>${item.title}</strong>
        <div class="history-item-actions">
          <span class="history-source">${item.source}</span>
          <button type="button" class="history-delete-button" data-index="${index}">削除</button>
        </div>
      </div>
      <div class="history-meta">
        <span>期限: ${item.dueDate ?? "null"}</span>
        <span>分類: ${item.category}</span>
      </div>
      <div class="history-tags">${item.tags.join(", ")}</div>
      <div class="history-original">元入力: ${item.originalText}</div>
    `;
    historyList.appendChild(li);
  });
}

function persistResult(originalText, data) {
  if (!data?.result) {
    return;
  }

  const current = loadHistory();
  const next = [
    {
      originalText,
      title: data.result.title,
      dueDate: data.result.dueDate,
      category: data.result.category,
      tags: Array.isArray(data.result.tags) ? data.result.tags : [],
      source: data.meta?.source ?? "unknown"
    },
    ...current
  ].slice(0, 8);

  saveHistory(next);
  renderHistory();
}

function showResult(data) {
  resultCard.classList.remove("is-hidden");
  resultTitle.textContent = data.result?.title ?? "-";
  resultDueDate.textContent = data.result?.dueDate ?? "null";
  resultCategory.textContent = data.result?.category ?? "-";
  resultTags.textContent = Array.isArray(data.result?.tags) ? data.result.tags.join(", ") : "-";

  const source = data.meta?.source ?? "unknown";
  const usedFallback = data.meta?.usedFallback ? "true" : "false";
  resultPath.textContent = `${source} / usedFallback=${usedFallback}`;
  rawResponse.textContent = JSON.stringify(data, null, 2);
}

function showError(data) {
  resultCard.classList.add("is-hidden");
  rawResponse.textContent = JSON.stringify(data, null, 2);
}

taskInput.addEventListener("input", updateCounter);

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();
  statusMessage.textContent = "解析中...";

  try {
    const response = await fetch("/parse-task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ text })
    });

    const data = await response.json();

    if (!response.ok) {
      statusMessage.textContent = data.error?.message ?? "エラーが発生しました。";
      showError(data);
      return;
    }

    statusMessage.textContent = "解析が完了しました。";
    showResult(data);
    persistResult(text, data);
  } catch (error) {
    resultCard.classList.add("is-hidden");
    rawResponse.textContent = String(error);
    statusMessage.textContent = "通信に失敗しました。サーバー起動状態を確認してください。";
  }
});

clearHistoryButton.addEventListener("click", () => {
  saveHistory([]);
  renderHistory();
});

historyList.addEventListener("click", (event) => {
  const target = event.target;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (!target.classList.contains("history-delete-button")) {
    return;
  }

  const index = Number(target.dataset.index);
  const items = loadHistory();
  items.splice(index, 1);
  saveHistory(items);
  renderHistory();
});

updateCounter();
renderHistory();
