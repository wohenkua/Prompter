(async () => {
  const { openaiKey } = await chrome.storage.local.get("openaiKey");
  if (openaiKey) document.getElementById("key").value = openaiKey;
})();

document.getElementById("save").onclick = async () => {
  await chrome.storage.local.set({
    openaiKey: document.getElementById("key").value.trim(),
  });

  alert("已保存!");
<<<<<<< HEAD
=======


  window.open("https://chatgpt.com")

  
>>>>>>> d9f0d41 (migrate changes from suggestionPanel)
};
