<<<<<<< HEAD
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
=======
console.log("✅ content.js has been injected");


// content.js 最顶端，确保在 showCenterReminder.js 加载之后执行
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_REMINDER") {
    // 收到后台通知，弹出居中提醒
    showCenterReminder("No API Key detected, please choose one of following：")
      .then(choice => {
        if (choice === "apikey") {
          chrome.runtime.sendMessage({ type: "OPEN_OPTIONS" });
        } else if (choice === "subscription") {
          window.open("https://google.com", "_blank");
        }
      });
  }
});


function getBoosterButton(textarea) {
  let btn = document.querySelector(".pb-booster--draggable");
  if (btn) return btn;

  btn = document.createElement("button");
  btn.className = "pb-booster--draggable";
  const iconURL = chrome.runtime.getURL("assets/icon32.png");
btn.innerHTML = `
  <img 
    src="${iconURL}" 
    alt="Prompt" 
    style="width:100%; height:100%; pointer-events:none;" 
  />
`;
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
    transition: "transform 0.2s ease",
    border:"2px solid grey"
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
        showToast("The content to be optimized cannot be empty");
        return;
      }

      console.log("🟢 [content] 即将发送消息，内容 =", original);
      const optimized = await chrome.runtime.sendMessage({
        type: "OPTIMIZE_PROMPT",
        payload: { original },
      });
      if (optimized) {
        console.log("🟢 [content] sendMessage 返回 =", optimized);
        // textarea.innerText = optimized;
        // textarea.dispatchEvent(new Event("input", { bubbles: true }));
        openSuggestionPanel(btn, optimized, textarea);
      }
    } catch (e) {
      console.error("❌ [content] sendMessage 抛错 =", e);
      showToast("Optimization failed. Please try again later.");
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

function openSuggestionPanel(btn, text, textarea) {
  // 先移除旧面板
  const EXIST = document.querySelector(".pb-suggest-panel");
  if (EXIST) EXIST.remove();

  // —— 1. 创建面板容器 ——
  const panel = document.createElement("div");
  panel.className = "pb-suggest-panel";
  Object.assign(panel.style, {
    position: "fixed",
    width: "300px",
    maxHeight: "300px",
    background: "#28A745",
    border: "1px solid #ccc",
    borderRadius: "6px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
    padding: "8px",
    zIndex: 100000,
    display: "flex",
    flexDirection: "column",
  });

  // —— 1.1 插入关闭按钮 ——
  const closeBtn = document.createElement('span');
  closeBtn.innerText = '×';
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '2px',
    bottom:"2px",
    right: '8px',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#fff',
    userSelect: 'none',
    zIndex: 100001      // 提升层级
  });
  closeBtn.addEventListener('click', () => panel.remove());
  panel.appendChild(closeBtn);

  // —— 2. 可编辑内容区 ——
  const area = document.createElement("div");
  area.contentEditable = "true";
  area.innerText = text;
  Object.assign(area.style, {
    flex: "1",
    padding: "4px",
    marginTop:"12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    overflow: "auto",
    backgroundColor: "white", 
    color: "#000",
    whiteSpace: "pre-wrap", 
  });

  // —— 3. 按钮区 ——
  const btnBar = document.createElement("div");
  Object.assign(btnBar.style, {
    marginTop: "8px",
    textAlign: "right",
  });

  const agree = document.createElement("button");
  agree.innerText = "Confirm";
  const revise = document.createElement("button");
  revise.innerText = "Re-Optimize";

  // 给按钮加点样式，让它们更明显
  [agree, revise].forEach((b) =>
    Object.assign(b.style, {
      margin: "0 4px",
      padding: "4px 8px",
      backgroundColor: "#d5d5d5",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    })
  );

  btnBar.append(agree, revise);
  panel.append(area, btnBar);
  document.body.append(panel);

  // —— 4. 面板定位 & 跟随 ——
  function updatePanelPosition() {
    const rect = btn.getBoundingClientRect();
    panel.style.left = `${rect.right + 8}px`;
    panel.style.top = `${rect.top}px`;
  }

  // 初始一次
  updatePanelPosition();
  // 在滚动/窗口大小变化时也跟新位置
  window.addEventListener("scroll", updatePanelPosition, true);
  window.addEventListener("resize", updatePanelPosition);

  // 在按钮拖拽过程中，也实时跟新位置
  function onDragMove() {
    updatePanelPosition();
  }
  btn.addEventListener("mousedown", () => {
    document.addEventListener("mousemove", onDragMove);
  });
  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", onDragMove);
  });

  // —— 5. “同意”逻辑 ——
  agree.addEventListener("click", () => {
    textarea.innerText = area.innerText;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
    panel.remove();
  });

  // —— 6. “继续修改”逻辑 ——
  revise.addEventListener("click", async () => {
    revise.disabled = true;
    revise.innerText = "Optimizing…";
    try {
      const refined = await chrome.runtime.sendMessage({
        type: "OPTIMIZE_PROMPT",
        payload: { original: area.innerText },
      });
      if (refined) area.innerText = refined;
    } catch (e) {
      console.error(e);
      showToast("Re-Optimization failed. Please try agin");
    } finally {
      revise.disabled = false;
      revise.innerText = "Re-Optimize";
    }
  });
}

observer.observe(document.body, { childList: true, subtree: true });
>>>>>>> d9f0d41 (migrate changes from suggestionPanel)
