/* ============================================================
   utils.js — Shared helper functions
   ============================================================ */

// ---------- LocalStorage Helpers ----------
function getComplaints() {
  return JSON.parse(localStorage.getItem('complaints') || '[]');
}

function saveComplaints(arr) {
  localStorage.setItem('complaints', JSON.stringify(arr));
}

function getSession() {
  return JSON.parse(localStorage.getItem('session') || 'null');
}

function saveSession(user) {
  localStorage.setItem('session', JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem('session');
}

// ---------- Registered Users (localStorage) ----------
function getRegisteredUsers() {
  return JSON.parse(localStorage.getItem('registeredUsers') || '[]');
}

function saveRegisteredUsers(arr) {
  localStorage.setItem('registeredUsers', JSON.stringify(arr));
}

function isUsernameTaken(username) {
  // Check hardcoded users
  const hardcoded = ['admin', 'user1', 'user2'];
  if (hardcoded.includes(username.toLowerCase())) return true;
  // Check registered users
  const registered = getRegisteredUsers();
  return registered.some(u => u.username.toLowerCase() === username.toLowerCase());
}

function findUser(username) {
  // First check registered users in localStorage
  const registered = getRegisteredUsers();
  const found = registered.find(u => u.username.toLowerCase() === username.toLowerCase());
  if (found) return found;
  return null;
}

// ---------- Date Formatting ----------
function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// ---------- Priority Helpers ----------
function priorityOrder(p) {
  return p === 'High' ? 0 : p === 'Medium' ? 1 : 2;
}

function priorityClass(p) {
  return p === 'High' ? 'bp-high' : p === 'Medium' ? 'bp-medium' : 'bp-low';
}

function statusClass(s) {
  if (s === 'Pending')     return 'bp-status-pending';
  if (s === 'In Progress') return 'bp-status-inprogress';
  if (s === 'Solved')      return 'bp-status-solved';
  return 'bp-status-rejected';
}

// ---------- Complaint ID Generator ----------
function generateId() {
  return 'CMP-' + Date.now().toString().slice(-6);
}

// ---------- Toast Notifications ----------
function showToast(type, msg) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast-msg toast-${type}`;
  t.innerHTML = `${icons[type] || ''} ${msg}`;
  container.appendChild(t);
  setTimeout(() => t.remove(), 3500);
}

// ---------- Empty State HTML ----------
function emptyStateHTML(msg) {
  return `<div class="empty-state"><i class="fas fa-inbox"></i><p>${msg}</p></div>`;
}

// ---------- Complaint Card HTML ----------
function complaintCardHTML(c, isAdmin = false) {
  return `
  <div class="complaint-card priority-${c.priority.toLowerCase()}" onclick="openDetail('${c.id}')">
    <div style="display:flex;justify-content:space-between;align-items:start;flex-wrap:wrap;gap:8px;">
      <div style="flex:1;">
        <div class="complaint-id">${c.id}</div>
        <div class="complaint-title">${c.title}</div>
        <div class="complaint-desc">${c.description.slice(0, 100)}${c.description.length > 100 ? '...' : ''}</div>
      </div>
      ${c.image ? `<img src="${c.image}" style="width:60px;height:60px;object-fit:cover;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">` : ''}
    </div>
    <div class="complaint-meta">
      <span class="badge-pill bp-cat">${c.category}</span>
      <span class="badge-pill ${priorityClass(c.priority)}">${c.priority} Priority</span>
      <span class="badge-pill ${statusClass(c.status)}">${c.status}</span>
      ${isAdmin ? `<span style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-left:auto;"><i class="fas fa-user"></i> ${c.userName}</span>` : ''}
      <span style="font-size:0.75rem;color:rgba(255,255,255,0.35);${!isAdmin ? 'margin-left:auto' : ''}">${formatDate(c.date)}</span>
    </div>
  </div>`;
}

// ---------- Timeline HTML ----------
function timelineHTML(timeline) {
  return (timeline || []).map((t, i, arr) => {
    const isLast = i === arr.length - 1;
    return `
    <div class="timeline-item">
      <div class="timeline-dot ${isLast ? 'active' : 'done'}"></div>
      <div class="timeline-content">
        <div class="timeline-title">${t.status}</div>
        <div class="timeline-time">${formatDate(t.date)}</div>
        <div class="timeline-desc">${t.note || ''}</div>
      </div>
    </div>`;
  }).join('');
}

// ---------- Seed Sample Data ----------
function seedData() {
  if (getComplaints().length > 0) return;
  const samples = [
    { title: 'Internet not working since morning', desc: 'My internet connection has been down since 8 AM. All devices affected.', cat: 'Network / Connectivity', pri: 'High', status: 'In Progress', user: 'user1', name: 'John User' },
    { title: 'Wrong amount charged on invoice',    desc: 'I was charged $250 instead of $150 as per the plan I subscribed.',      cat: 'Billing Problem',        pri: 'High', status: 'Pending',     user: 'user1', name: 'John User' },
    { title: 'Package not delivered',              desc: 'My order was supposed to arrive 3 days ago but still at warehouse.',     cat: 'Delivery Issue',         pri: 'Medium', status: 'Solved',   user: 'user2', name: 'Sarah Smith' },
    { title: 'App crashes on login',               desc: 'The mobile app crashes every time I try to log in after latest update.', cat: 'Technical Issue',        pri: 'Medium', status: 'Pending',   user: 'user2', name: 'Sarah Smith' },
  ];
  const result = samples.map((s, i) => ({
    id: `CMP-10${i + 1}`,
    title: s.title, description: s.desc, category: s.cat,
    priority: s.pri, status: s.status,
    date: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString(),
    image: null, username: s.user, userName: s.name,
    timeline: [
      { status: 'Pending', date: new Date(Date.now() - (i + 1) * 86400000 * 2).toISOString(), note: 'Complaint submitted.' },
      ...(s.status !== 'Pending' ? [{ status: s.status, date: new Date(Date.now() - (i + 1) * 86400000).toISOString(), note: `Status updated to "${s.status}" by Admin.` }] : [])
    ]
  }));
  saveComplaints(result);
}
