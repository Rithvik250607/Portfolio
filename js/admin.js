const ADMIN_EMAIL = 'rithvikpr25@gmail.com';
const SESSION_KEY = 'portfolio-admin-access-token';

let supabaseConfig;

document.addEventListener('DOMContentLoaded', async () => {
  const loginForm = document.getElementById('login-form');
  const loginStatus = document.getElementById('login-status');
  const loginPanel = document.getElementById('login-panel');
  const inboxPanel = document.getElementById('inbox-panel');
  const logoutButton = document.getElementById('logout-button');

  try {
    const response = await fetch('/api/config', { cache: 'no-store' });
    supabaseConfig = await response.json();
    if (!response.ok) throw new Error(supabaseConfig.error || 'Admin login is not configured yet.');
  } catch (error) {
    loginStatus.textContent = error.message;
    loginForm.querySelector('button[type="submit"]').disabled = true;
    return;
  }

  const accessToken = sessionStorage.getItem(SESSION_KEY);
  if (accessToken) {
    const user = await getCurrentUser(accessToken);
    if (user && user.email?.toLowerCase() === ADMIN_EMAIL) {
      showInbox();
      await loadMessages(accessToken);
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = document.getElementById('login-button');
    const password = document.getElementById('admin-password').value;
    loginStatus.textContent = 'Signing in…';
    button.disabled = true;

    try {
      const response = await fetch(`${supabaseConfig.url.replace(/\/$/, '')}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          apikey: supabaseConfig.anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: ADMIN_EMAIL, password })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.user?.email?.toLowerCase() !== ADMIN_EMAIL) {
        throw new Error('Email or password is incorrect, or this account is not the portfolio admin.');
      }

      sessionStorage.setItem(SESSION_KEY, result.access_token);
      loginForm.reset();
      showInbox();
      await loadMessages(result.access_token);
    } catch (error) {
      loginStatus.textContent = error.message || 'Could not sign in. Please try again.';
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById('refresh-button').addEventListener('click', async () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    if (token) await loadMessages(token);
  });

  logoutButton.addEventListener('click', async () => {
    const token = sessionStorage.getItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    if (token) {
      await fetch(`${supabaseConfig.url.replace(/\/$/, '')}/auth/v1/logout`, {
        method: 'POST',
        headers: { apikey: supabaseConfig.anonKey, Authorization: `Bearer ${token}` }
      }).catch(() => {});
    }
    inboxPanel.classList.add('admin-hidden');
    logoutButton.classList.add('admin-hidden');
    loginPanel.classList.remove('admin-hidden');
    loginStatus.textContent = 'Signed out.';
  });

  function showInbox() {
    loginPanel.classList.add('admin-hidden');
    inboxPanel.classList.remove('admin-hidden');
    logoutButton.classList.remove('admin-hidden');
  }
});

async function getCurrentUser(accessToken) {
  try {
    const response = await fetch(`${supabaseConfig.url.replace(/\/$/, '')}/auth/v1/user`, {
      headers: { apikey: supabaseConfig.anonKey, Authorization: `Bearer ${accessToken}` }
    });
    return response.ok ? await response.json() : null;
  } catch (_error) {
    return null;
  }
}

async function loadMessages(accessToken) {
  const status = document.getElementById('inbox-status');
  const list = document.getElementById('messages-list');
  status.textContent = 'Loading messages…';

  const query = new URLSearchParams({
    select: 'id,name,email,message,created_at',
    order: 'created_at.desc',
    limit: '100'
  });

  try {
    const response = await fetch(`${supabaseConfig.url.replace(/\/$/, '')}/rest/v1/contact_messages?${query}`, {
      headers: {
        apikey: supabaseConfig.anonKey,
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (response.status === 401) {
      sessionStorage.removeItem(SESSION_KEY);
      window.location.reload();
      return;
    }
    if (!response.ok) throw new Error('Could not load messages. Check the SQL schema and admin account setup.');

    const messages = await response.json();
    list.replaceChildren();
    if (!messages.length) {
      status.textContent = 'No messages yet.';
      return;
    }

    for (const message of messages) {
      const article = document.createElement('article');
      article.className = 'admin-message';
      const heading = document.createElement('h2');
      heading.textContent = message.name;
      const email = document.createElement('a');
      email.href = `mailto:${encodeURIComponent(message.email)}`;
      email.textContent = message.email;
      const date = document.createElement('time');
      date.dateTime = message.created_at;
      date.textContent = new Date(message.created_at).toLocaleString();
      const body = document.createElement('p');
      body.textContent = message.message;
      article.append(heading, email, date, body);
      list.append(article);
    }
    status.textContent = `${messages.length} recent message${messages.length === 1 ? '' : 's'}.`;
  } catch (error) {
    status.textContent = error.message || 'Could not load messages.';
  }
}
