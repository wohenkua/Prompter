// 读取 API Key（存储在 chrome.storage.local）
async function getApiKey() {
  const { openaiKey } = await chrome.storage.local.get("openaiKey");
  console.log(openaiKey);
  if (!openaiKey) throw new Error("请先在扩展选项里填入 OpenAI API Key");
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

  const sysPrompt = `
  你是prompt专家，请帮我改善prompt，使其：
  1. 清晰具体；
  2. 增加必要语境；
  你应主动判断原prompt的意图，并以此进一步完善prompt。
  原prompt如下:
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
      max_tokens: 1024,
    }),
  });

  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim();
}

// 监听来自 content 的请求
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
});
