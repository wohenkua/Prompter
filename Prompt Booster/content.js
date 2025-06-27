console.log("✅ content.js has been injected");


function getBoosterButton(textarea) {
  let btn = document.querySelector('.pb-booster--draggable');
  if (btn) return btn;

  btn = document.createElement('button');
  btn.className = 'pb-booster--draggable';
  btn.innerText = '⚡️';
  btn.title = 'Prompt';
  Object.assign(btn.style, {
    position: 'fixed',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    cursor: 'pointer',
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '9999',
    userSelect: 'none',
    opacity: '0',
    background:'blue'
  });
  document.body.appendChild(btn);

  const btnHalf = 14;

  function place() {
    btn.style.left = `${textarea.getBoundingClientRect().left - btnHalf}px`;
    btn.style.top  = `${textarea.getBoundingClientRect().bottom - btnHalf}px`;
  }

  /*** 初始化并监听 ***/
  place();
  btn.style.opacity = '1';
  window.addEventListener('scroll', place, true);
  window.addEventListener('resize', place);

  /* 拖拽逻辑（保持不变） */
  btn.addEventListener('mousedown', e => {
    e.preventDefault();
    btn.style.cursor = 'pointer';
    const shiftX = e.clientX - btn.getBoundingClientRect().left;
    const shiftY = e.clientY - btn.getBoundingClientRect().top;

    function onMouseMove(evt) {
      const maxX = window.innerWidth  - btnHalf * 2;
      const maxY = window.innerHeight - btnHalf * 2;
      btn.style.left = `${Math.min(Math.max(0, evt.clientX - shiftX), maxX)}px`;
      btn.style.top  = `${Math.min(Math.max(0, evt.clientY - shiftY), maxY)}px`;
    }
    function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      btn.style.cursor = 'pointer';
      /* 拖过一次就不再自动跟随 */
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    }
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });

  btn.ondragstart = () => false;
  return btn;
}



const observer = new MutationObserver(() => {
  const textarea = document.querySelector('#prompt-textarea');
  if (!textarea || textarea.dataset.pbBound) return;


  textarea.dataset.pbBound = 'true';
  const btn = getBoosterButton(textarea);

  btn.onclick = async () => {
  console.log('🟢 [content] 按钮被点击');
  const original = textarea.innerText;
  if (!original) {
    console.log('🟠 [content] original 为空，直接 return');
    return;
  }

  console.log('🟢 [content] 即将发送消息，内容 =', original);
  let optimized;
  try {
    optimized = await chrome.runtime.sendMessage({
      type: 'OPTIMIZE_PROMPT',
      payload: { original }
    });
    console.log('🟢 [content] sendMessage 返回 =', optimized);
  } catch (e) {
    console.error('❌ [content] sendMessage 抛错 =', e);
  }

  if (optimized) {
    textarea.value = optimized;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }
};

});

observer.observe(document.body, { childList: true, subtree: true });