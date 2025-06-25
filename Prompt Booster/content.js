console.log("✅ content.js has been injected");

function getBoosterButton(textarea) {
  const wrapper = textarea.parentElement;

  // 强制 wrapper 具备定位上下文
  const style = window.getComputedStyle(wrapper);
  if (style.position === 'static') {
    wrapper.style.position = 'relative';
  }

  // 删除旧按钮（防止多次添加）
  const oldBtn = wrapper.querySelector('.pb-booster');
  if (oldBtn) return oldBtn;

  const booster = document.createElement('button');
  booster.className = 'pb-booster';
  booster.style.cssText = `
    position: absolute;
    right: 12px;
    bottom: 12px;
    z-index: 9999;
    background:rgb(31, 96, 216);
    color: #fff;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;
  booster.title = '优化 Prompt';
  booster.innerText = '⚡️';

  wrapper.appendChild(booster);
  return booster;
}


const observer = new MutationObserver(() => {
  const textarea = document.querySelector('textarea');
  if (!textarea || textarea.dataset.pbBound) return;


  textarea.dataset.pbBound = 'true';
  const btn = getBoosterButton(textarea);

  btn.onclick = async () => {
    const original = textarea.value.trim();
    if (!original) return;

    try {
      const optimized = await chrome.runtime.sendMessage({
        type: 'OPTIMIZE_PROMPT',
        payload: { original }
      });

      if (optimized) {
        textarea.value = optimized;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (e) {
      console.error('优化失败:', e);
    }
  };
});

observer.observe(document.body, { childList: true, subtree: true });