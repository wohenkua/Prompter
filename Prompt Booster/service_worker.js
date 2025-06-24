// 读取 API Key（存储在 chrome.storage.local）
async function getApiKey() {
  const { openaiKey } = await chrome.storage.local.get('openaiKey');
  if (!openaiKey) throw new Error('请先在扩展选项里填入 OpenAI API Key');
  return openaiKey;
}

// 用系统提示词封装后调用 ChatGPT
async function optimizePrompt(original) {
  const apiKey = await getApiKey();

  const sysPrompt = `
你是一位 prompt 工程专家。请改写用户的 prompt，使其：
1. 清晰具体（指定格式/角色/输出语言等）；
2. 删除歧义与赘述，但保留语义；
3. 在末尾添加“一次完成，如果不足可继续追问”的说明。`;

  const resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: original }
      ],
      temperature: 0.3,
      max_tokens: 1024
    })
  });

  const data = await resp.json();
  return data.choices?.[0]?.message?.content?.trim();
}

// 监听来自 content 的请求
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'OPTIMIZE_PROMPT') {
    optimizePrompt(msg.payload.original)
      .then(async optimized => {
        // 持久化（时间戳索引便于排序）
        const timestamp = Date.now();
        await chrome.storage.local.set({
          [timestamp]: { original: msg.payload.original, optimized }
        });
        sendResponse(optimized);
      })
      .catch(err => {
        console.error(err);
        sendResponse(null);
      });
    return true; // 表示异步
  }
});
