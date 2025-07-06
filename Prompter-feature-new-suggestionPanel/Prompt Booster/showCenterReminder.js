/*
 * showCenterReminder.js
 * Content script helper: displays a centered reminder overlay
 * with two options and returns a Promise resolving to the user's choice.
 */
(function() {
  // Expose the function globally
  window.showCenterReminder = function(msg) {
    return new Promise((resolve) => {
      // Create overlay
      const overlay = document.createElement('div');
      Object.assign(overlay.style, {
        position: 'fixed',
        top: '0', left: '0',
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 2147483647,  // ensure on top
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      });

      // Create dialog box
      const box = document.createElement('div');
      Object.assign(box.style, {
        position: 'relative',
        backgroundColor: '#fff',
        top: '-10%',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
        textAlign: 'center',
        maxWidth: '320px',
        width: '80%',
      });

      // Create close button
      const closeBtn = document.createElement('span');
      closeBtn.innerHTML = '&times;';
      Object.assign(closeBtn.style, {
        position: 'absolute',
        top: '8px',
        right: '12px',
        fontSize: '18px',
        cursor: 'pointer',
        color: '#888'
      });
      closeBtn.addEventListener('click', () => {
        cleanup();
        resolve(null);
      });
      box.appendChild(closeBtn);

      // Inner HTML content
      const messageP = document.createElement('p');
      messageP.style.cssText = 'margin-bottom:16px; font-size:14px; color:#333;';
      messageP.textContent = msg;
      box.appendChild(messageP);

      // Buttons container
      const btnContainer = document.createElement('div');
      btnContainer.style.cssText = 'display:flex; justify-content:center; gap:12px;';

      const apiBtn = document.createElement('button');
      apiBtn.id = 'opt-api';
      apiBtn.textContent = 'Enter API Key';
      Object.assign(apiBtn.style, {
        flex: '1', padding: '4px', border: 'none', borderRadius: '4px',
        cursor: 'pointer', background: '#007bff', color: '#fff',fontSize:"14px"
      });

      const subBtn = document.createElement('button');
      subBtn.id = 'opt-subscribe';
      subBtn.textContent = 'Learn Subscription';
      Object.assign(subBtn.style, {
        flex: '1', padding: '4px', border: 'none', borderRadius: '4px',
        cursor: 'pointer', background: '#6c757d', color: '#fff',fontSize:"14px"
      });

      btnContainer.append(apiBtn, subBtn);
      box.appendChild(btnContainer);

      // Button handlers
      apiBtn.addEventListener('click', () => {
        cleanup();
        resolve('apikey');
      });
      subBtn.addEventListener('click', () => {
        cleanup();
        resolve('subscription');
      });

      // Remove overlay function
      function cleanup() {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }

      // Append to document
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    });
  };
})();
