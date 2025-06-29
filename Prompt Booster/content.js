console.log("✅ content.js has been injected");

function getBoosterButton(textarea) {
  let btn = document.querySelector(".pb-booster--draggable");
  if (btn) return btn;

  btn = document.createElement("button");
  btn.className = "pb-booster--draggable";
  btn.innerText = "⚡️";
  btn.title = "Prompt";
  Object.assign(btn.style, {
    position: "fixed",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: "9999",
    userSelect: "none",
    opacity: "0",
    background: "#444",
    transition: "transform 0.2s ease",
  });

  // 注入 :hover 样式到全局 CSS
  const style = document.createElement("style");
  style.textContent = `
  .pb-booster--draggable:hover {
    transform: scale(1.2); 
  }
`;
  document.head.appendChild(style);

  document.body.appendChild(btn);

  const btnHalf = 14;

  function place() {
    btn.style.left = `${textarea.getBoundingClientRect().left - btnHalf}px`;
    btn.style.top = `${textarea.getBoundingClientRect().bottom - btnHalf}px`;
  }

  /*** 初始化并监听 ***/
  place();
  btn.style.opacity = "1";
  window.addEventListener("scroll", place, true);
  window.addEventListener("resize", place);

  // 需要一个变量来判断移动是否超过阈值
  let isDragging = false;

  /* 拖拽逻辑（保持不变） */
  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    btn.style.cursor = "pointer";

    isDragging = false;
    const startX = e.clientX;
    const startY = e.clientY;
    const shiftX = startX - btn.getBoundingClientRect().left;
    const shiftY = startY - btn.getBoundingClientRect().top;

    function onMouseMove(evt) {
      const dx = Math.abs(evt.clientX - startX);
      const dy = Math.abs(evt.clientY - startY);
      if (!isDragging && (dx > 5 || dy > 5)) {
        isDragging = true;
      }

      if (isDragging) {
        const maxX = window.innerWidth - btnHalf * 2;
        const maxY = window.innerHeight - btnHalf * 2;
        btn.style.left = `${Math.min(
          Math.max(0, evt.clientX - shiftX),
          maxX
        )}px`;
        btn.style.top = `${Math.min(
          Math.max(0, evt.clientY - shiftY),
          maxY
        )}px`;
      }
    }
    function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      btn.style.cursor = "pointer";

      if (isDragging) {
        const cancelClick = (clickEvent) => {
          clickEvent.stopImmediatePropagation();
          btn.removeEventListener("click", cancelClick, true);
        };

        btn.addEventListener("click", cancelClick, true);
      }
      /* 拖过一次就不再自动跟随 */
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    }

    function rightClick() {}

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  });

  btn.ondragstart = () => false;
  return btn;
}

const observer = new MutationObserver(() => {
  const textarea = document.querySelector("#prompt-textarea");
  if (!textarea || textarea.dataset.pbBound) return;

  textarea.dataset.pbBound = "true";
  const btn = getBoosterButton(textarea);

  btn.addEventListener("click", async () => {
    console.log("🟢 [content] 按钮被点击");
    const originalContent = btn.innerHTML;
    const loadingUrl = chrome.runtime.getURL("assets/loading.webp");

    // 切换到 loading
    btn.innerHTML = `<img src="${loadingUrl}" width="24" height="24" alt="loading" style="pointer-events:none" />`;
    btn.disabled = true;

    try {
      const original = textarea.innerText;
      if (!original) {
        console.log("🟠 [content] original 为空，直接 return");
        showToast("优化内容不能为空");
        return;
      }

      console.log("🟢 [content] 即将发送消息，内容 =", original);
      const optimized = await chrome.runtime.sendMessage({
        type: "OPTIMIZE_PROMPT",
        payload: { original },
      });
      if (optimized) {
        console.log("🟢 [content] sendMessage 返回 =", optimized);
        textarea.innerText = optimized;
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (e) {
      console.error("❌ [content] sendMessage 抛错 =", e);
    } finally {
      // 恢复按钮
      btn.innerHTML = originalContent;
      btn.disabled = false;
    }
  });
});

function showToast(msg) {
  const toast = document.createElement("div");
  toast.innerText = msg;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "50px",
    left: "50%",
    transform: "translateX(-50%)",
    background: "#444",
    color: "#fff",
    padding: "10px 16px",
    borderRadius: "6px",
    fontSize: "14px",
    zIndex: 99999,
    opacity: 0,
    transition: "opacity 0.3s",
  });
  document.body.appendChild(toast);
  requestAnimationFrame(() => (toast.style.opacity = 1));
  setTimeout(() => {
    toast.style.opacity = 0;
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

observer.observe(document.body, { childList: true, subtree: true });
