async function render() {
  const listElem = document.getElementById('list');
  const all = await chrome.storage.local.get(null);
  const items = Object.entries(all)
    .filter(([k]) => /^\d+$/.test(k))
    .sort((a, b) => b[0] - a[0]); // 最近在前

  listElem.innerHTML = '';

  for (const [ts, { original, optimized }] of items) {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="small">${new Date(+ts).toLocaleString()}</div>
      <div><strong>优化后：</strong>${optimized}</div>
      <div class="small"><strong>原始：</strong>${original}</div>
      <button class="copy-btn">复制</button>
    `;
    li.querySelector('.copy-btn').onclick = () => {
      navigator.clipboard.writeText(optimized);
    };
    listElem.appendChild(li);
  }
}

render();
