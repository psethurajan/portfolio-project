/* ============================================================
   auth.js — Login, Logout, Registration, Session Management
   ============================================================ */

const USERS = {
  admin: { password: 'admin123', role: 'admin', name: 'Admin User',  email: 'admin@app.com' },
  user1: { password: 'user123',  role: 'user',  name: 'John User',   email: 'john@user.com' },
  user2: { password: 'pass123',  role: 'user',  name: 'Sarah Smith', email: 'sarah@user.com' }
};

// Called when user clicks Admin or User card on landing page
function goToLogin(role) {
  saveSession(null);
  localStorage.setItem('selectedRole', role);

  const isAdmin = role === 'admin';
  document.getElementById('loginIcon').textContent  = isAdmin ? '🛡️' : '👤';
  document.getElementById('loginTitle').textContent = isAdmin ? 'Admin Login' : 'User Login';
  document.getElementById('loginSub').textContent   = isAdmin ? 'Sign in to manage complaints' : 'Sign in to submit & track complaints';
  document.getElementById('demoUser').textContent   = isAdmin ? 'admin' : 'user1';
  document.getElementById('demoPass').textContent   = isAdmin ? 'admin123' : 'user123';
  document.getElementById('loginBtn').className     = 'btn-login ' + (isAdmin ? 'btn-admin-login' : 'btn-user-login');
  document.getElementById('loginUsername').value    = '';
  document.getElementById('loginPassword').value    = '';
  document.getElementById('loginError').style.display = 'none';

  // Show/hide register link (only for users)
  const regLink = document.getElementById('registerLink');
  if (regLink) regLink.style.display = isAdmin ? 'none' : 'block';

  showPage('loginPage');
}

// Called on Sign In button click
function doLogin() {
  const role = localStorage.getItem('selectedRole');
  const u    = document.getElementById('loginUsername').value.trim();
  const p    = document.getElementById('loginPassword').value.trim();
  const err  = document.getElementById('loginError');

  if (!u || !p) {
    err.textContent = '❌ Please fill in all fields.';
    err.style.display = 'block'; return;
  }

  let user = null;

  // Check hardcoded users first
  if (USERS[u] && USERS[u].password === p && USERS[u].role === role) {
    user = USERS[u];
  }

  // If not found, check registered users (only for user role)
  if (!user && role === 'user') {
    const registeredUser = findUser(u);
    if (registeredUser && registeredUser.password === p) {
      user = registeredUser;
    }
  }

  if (!user) {
    err.textContent = '❌ Invalid credentials. Try again.';
    err.style.display = 'block'; return;
  }

  err.style.display = 'none';
  saveSession({ ...user, username: u });

  if (role === 'admin') {
    window.location.href = 'pages/admin.html';
  } else {
    window.location.href = 'pages/dashboard.html';
  }
}

// Register new user
function doRegister() {
  const name     = document.getElementById('regName').value.trim();
  const email    = document.getElementById('regEmail').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value.trim();
  const confirm  = document.getElementById('regConfirm').value.trim();
  const err      = document.getElementById('regError');
  const success  = document.getElementById('regSuccess');

  err.style.display     = 'none';
  success.style.display = 'none';

  // Validations
  if (!name || !email || !username || !password || !confirm) {
    err.textContent = '❌ Please fill in all fields.';
    err.style.display = 'block'; return;
  }
  if (username.length < 3) {
    err.textContent = '❌ Username must be at least 3 characters.';
    err.style.display = 'block'; return;
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    err.textContent = '❌ Username: letters, numbers, underscore only.';
    err.style.display = 'block'; return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    err.textContent = '❌ Please enter a valid email address.';
    err.style.display = 'block'; return;
  }
  if (password.length < 6) {
    err.textContent = '❌ Password must be at least 6 characters.';
    err.style.display = 'block'; return;
  }
  if (password !== confirm) {
    err.textContent = '❌ Passwords do not match.';
    err.style.display = 'block'; return;
  }
  if (isUsernameTaken(username)) {
    err.textContent = '❌ Username already taken. Choose another.';
    err.style.display = 'block'; return;
  }

  // Save new user to localStorage
  const newUser = { username, password, name, email, role: 'user' };
  const users = getRegisteredUsers();
  users.push(newUser);
  saveRegisteredUsers(users);

  // Show success message
  success.textContent = '✅ Account created successfully! Redirecting to login...';
  success.style.display = 'block';

  // Clear form fields
  ['regName','regEmail','regUsername','regPassword','regConfirm']
    .forEach(id => document.getElementById(id).value = '');

  // Go to login after 2 seconds
  setTimeout(() => { window.location.href = '../index.html'; }, 2000);
}

// Toggle password visibility on login page
function togglePwd() {
  const f = document.getElementById('loginPassword');
  f.type = f.type === 'password' ? 'text' : 'password';
}

// Toggle password visibility on register page
function toggleRegPwd(id) {
  const f = document.getElementById(id);
  f.type = f.type === 'password' ? 'text' : 'password';
}

// Called on Back button
function goBack() {
  showPage('landingPage');
}

// Logout from any page
function logout() {
  clearSession();
  window.location.href = '../index.html';
}

// Guard pages — redirect to login if no session
function requireAuth(expectedRole) {
  const session = getSession();
  if (!session) {
    window.location.href = '../index.html'; return null;
  }
  if (expectedRole && session.role !== expectedRole) {
    window.location.href = '../index.html'; return null;
  }
  return session;
}

// Show/hide pages on index
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
