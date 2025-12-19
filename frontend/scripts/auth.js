(function () {
  let currentUser = null;
  let mfaSetupData = null;

  const loginForm = document.getElementById('loginForm');
  const mfaSetupModal = document.getElementById('mfaSetupModal');
  const totpGroup = document.getElementById('totpGroup');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      const totpCode = document.getElementById('totpCode').value.trim();

      if (!username || !password) {
        showMessage('Please fill in all fields', 'error');
        return;
      }

      // Store credentials for later use
      if (!currentUser) {
        currentUser = { username, password };
      }

      console.log('🚀 Submitting login:', { username, hasTOTP: !!totpCode });

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ username, password, totpCode })
        });

        const data = await response.json();
        console.log('📥 Login response:', data);

        if (data.success) {
          if (data.requireMFASetup) {
            await setupMFA();
          } else if (data.requireMFAToken) {
            showTOTPInput();
            showMessage('Enter your 6-digit authentication code', 'info');
          } else {
            showMessage('Login successful! Redirecting...', 'success');
            setTimeout(() => {
              window.location.href = '/dashboard.html';
            }, 500);
          }
        } else {
          if (data.blocked) {
            showMessage('Your account has been blocked. Please contact support.', 'error');
          } else {
            showMessage(data.message || 'Login failed', 'error');
          }
          // Clear TOTP input on error
          document.getElementById('totpCode').value = '';
        }
      } catch (error) {
        console.error('❌ Login error:', error);
        showMessage('Login failed. Please try again.', 'error');
      }
    });
  }

  async function setupMFA() {
    try {
      const response = await fetch('/api/auth/setup-mfa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: currentUser.username
        })
      });

      const data = await response.json();
      if (data.success) {
        mfaSetupData = data;
        showMFASetupModal(data);
      } else {
        showMessage('Failed to setup MFA', 'error');
      }
    } catch (error) {
      console.error('MFA setup error:', error);
      showMessage('Failed to setup MFA', 'error');
    }
  }

  function showMFASetupModal(data) {
    const qrContainer = document.getElementById('qrCodeContainer');
    const backupContainer = document.getElementById('backupCodesContainer');

    // Display QR code
    qrContainer.innerHTML = `<img src="${data.qrCode}" alt="QR Code" style="max-width: 200px;" />`;

    // Display backup codes
    const backupCodesHtml = data.backupCodes.map(code =>
      `<span class="backup-code">${code}</span>`
    ).join('');
    backupContainer.innerHTML = backupCodesHtml;

    mfaSetupModal.classList.remove('hidden');

    // Setup verify button
    document.getElementById('verifyMfaBtn').onclick = verifyMFASetup;

    // Setup download backup codes
    document.getElementById('downloadBackupCodes').onclick = () => {
      downloadBackupCodes(data.backupCodes);
    };
  }

  async function verifyMFASetup() {
    const verifyCode = document.getElementById('verifyMfaCode').value.trim();
    if (!verifyCode || verifyCode.length !== 6) {
      showMessage('Please enter a valid 6-digit code', 'error');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          username: currentUser.username,
          password: currentUser.password,
          totpCode: verifyCode
        })
      });

      const data = await response.json();
      if (data.success) {
        mfaSetupModal.classList.add('hidden');
        showMessage('MFA setup successful! Redirecting...', 'success');
        setTimeout(() => {
          window.location.href = '/dashboard.html';
        }, 500);
      } else {
        showMessage('Invalid verification code', 'error');
        document.getElementById('verifyMfaCode').value = '';
      }
    } catch (error) {
      console.error('MFA verification error:', error);
      showMessage('Verification failed', 'error');
    }
  }

  function showTOTPInput() {
    totpGroup.classList.remove('hidden');
    const totpInput = document.getElementById('totpCode');
    totpInput.focus();
    
    // Auto-submit when 6 digits entered
    totpInput.addEventListener('input', (e) => {
      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
      e.target.value = value;
      
      if (value.length === 6) {
        console.log('🔐 Auto-submitting 6-digit code');
        loginForm.dispatchEvent(new Event('submit'));
      }
    });
  }

  function downloadBackupCodes(codes) {
    const content = `MSSP Console - Backup Codes\n\nUsername: ${currentUser.username}\nGenerated: ${new Date().toISOString()}\n\nBackup Codes:\n${codes.join('\n')}\n\nKeep these codes safe and secure!`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MSSP_BackupCodes_${currentUser.username}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
      messageElement.textContent = message;
      messageElement.className = `message ${type}`;
      messageElement.style.display = 'block';
      
      // Auto-hide after 5 seconds for non-error messages
      if (type !== 'error') {
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 5000);
      }
    } else {
      alert(message);
    }
    console.log(`💬 Message (${type}):`, message);
  }
})();

async function checkAuth() {
  try {
    const response = await fetch('/api/auth/check', {
      credentials: 'include'
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Auth check error:', error);
    return { authenticated: false };
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include'
    });
    window.location.href = '/login.html';
  } catch (error) {
    console.error('Logout error:', error);
    alert('Logout failed');
  }
}

window.__auth = {
  checkAuth: checkAuth,
  logout: logout
};