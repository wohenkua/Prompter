// 读取 API Key（存储在 chrome.storage.local）
async function getApiKey() {
  const { openaiKey } = await chrome.storage.local.get("openaiKey");
  if (!openaiKey) {
    // 找到当前激活的 tab，把提醒消息发给 content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "SHOW_REMINDER" });
      }
    });
    // 中断后续逻辑
    throw new Error("请先在扩展选项里填入 OpenAI API Key");
  }
  return openaiKey;
}

console.log("background.js正在运行中....");
// 用系统提示词封装后调用 ChatGPT
async function optimizePrompt(original) {
  const apiKey = await getApiKey();
  if (!apiKey) {
    console.log("apikey不存在");
    return;
  }

  const sysPrompt =  `
你是一位 Prompt 工程专家。你的任务是直接优化用户提供的 prompt，使其更清晰、具体，并补充必要的上下文。

- 如果原始 prompt 中有信息不全或含糊的部分，请直接用「{请补充...}」形式标注，不要反问用户。
- 你不需要解释过程，只输出改写后的完整 prompt。
- 请保持语言精炼，确保优化后的 prompt 能被模型准确理解。

原始 prompt 如下：
`;

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        { role: "system", content: sysPrompt },
        { role: "user", content: original },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  const data = await resp.json();

  console.log("OpenAI 返回的 raw data:", data);

  if (!resp.ok) {
    console.error("OpenAI API 返回错误：", data.error);
    return null;
  }

  return data.choices?.[0]?.message?.content?.trim();
}

// 监听需要优化的内容
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "OPTIMIZE_PROMPT") {
    console.log("接受到的消息：" + msg);
    optimizePrompt(msg.payload.original)
      .then(async (optimized) => {
        if (optimized) {
          console.log(`优化后的内容是：${optimized}`);
        } else {
          console.warn("优化结果为空");
        }
        // 持久化（时间戳索引便于排序）
        const timestamp = Date.now();
        await chrome.storage.local.set({
          [timestamp]: { original: msg.payload.original, optimized },
        });
        sendResponse(optimized);
      })
      .catch((err) => {
        console.error(err);
        sendResponse(null);
      });
    return true; // 表示异步
  }

  if (msg.type === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    return false;
  }
});
