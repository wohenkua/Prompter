/**
 * 获取（或创建）输入框旁的 Grammarly 风格按钮
 */
function getBoosterButton(textarea) {
  let btn = textarea.parentElement.querySelector('.pb-booster');
  if (btn) return btn;

  btn = document.createElement('button');
  btn.className =
    'pb-booster fixed right-2 bottom-2 z-10 rounded-full shadow pb-trans';
  btn.style.cssText =
    'background:#10a37f;color:#fff;width:28px;height:28px;border:none;cursor:pointer';
  btn.title = '优化 Prompt';
  btn.innerText = '⚡️';
  textarea.parentElement.style.position = 'relative';
  textarea.parentElement.appendChild(btn);
  return btn;
}

/**
 * 主逻辑：监听输入框变化，为当前输入框插入按钮
 */
const observer = new MutationObserver(() => {
  const textarea = document.querySelector('textarea');
  if (!textarea) return;

  const btn = getBoosterButton(textarea);
  btn.onclick = async () => {
    const original = textarea.value.trim();
    if (!original) return;

    // 通知 background 调用 ChatGPT API
    const optimized = await chrome.runtime.sendMessage({
      type: 'OPTIMIZE_PROMPT',
      payload: { original }
    });

    if (optimized) {
      textarea.value = optimized;
      // 将光标移动到末尾
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
  };
});

observer.observe(document.body, { childList: true, subtree: true });
