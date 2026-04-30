/* ============================================================
   complaint.js — Complaint CRUD Operations
   ============================================================ */

let currentComplaintId = null;
let currentSession     = null;

// ---- Submit New Complaint ----
function submitComplaint() {
  const title = document.getElementById('cTitle').value.trim();
  const desc  = document.getElementById('cDesc').value.trim();
  const cat   = document.getElementById('cCategory').value;
  const pri   = document.getElementById('cPriority').value;

  if (!title || !desc || !cat || !pri) {
    showToast('error', 'Please fill all required fields!'); return;
  }

  const imgEl = document.getElementById('cImage');
  if (imgEl.files[0]) {
    const reader = new FileReader();
    reader.onload = e => saveComplaint(title, desc, cat, pri, e.target.result);
    reader.readAsDataURL(imgEl.files[0]);
  } else {
    saveComplaint(title, desc, cat, pri, null);
  }
}

function saveComplaint(title, desc, cat, pri, img) {
  const session    = getSession();
  const complaints = getComplaints();
  const c = {
    id:          generateId(),
    title, description: desc, category: cat, priority: pri,
    status:      'Pending',
    date:        new Date().toISOString(),
    image:       img,
    username:    session.username,
    userName:    session.name,
    timeline: [{
      status: 'Pending',
      date:   new Date().toISOString(),
      note:   'Complaint submitted successfully.'
    }]
  };
  complaints.push(c);
  saveComplaints(complaints);
  clearForm();
  showToast('success', `Complaint ${c.id} submitted! 🎉`);
  setTimeout(() => { window.location.href = 'my-complaints.html'; }, 1200);
}

// ---- Clear Form ----
function clearForm() {
  ['cTitle','cDesc','cCategory','cPriority'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const img = document.getElementById('cImage');
  if (img) img.value = '';
  const preview = document.getElementById('imgPreview');
  if (preview) preview.style.display = 'none';
  const aiBox = document.getElementById('aiBox');
  if (aiBox) aiBox.classList.remove('show');
}

// ---- Image Preview ----
function previewImage() {
  const file = document.getElementById('cImage').files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const img = document.getElementById('imgPreview');
    img.src = e.target.result;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// ---- Render Complaint Lists ----
function renderList(containerId, complaints, isAdmin) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = complaints.length
    ? complaints.map(c => complaintCardHTML(c, isAdmin)).join('')
    : emptyStateHTML('No complaints found');
}

function getFilteredComplaints(opts = {}) {
  let list = getComplaints();
  const { username, search, status, sort } = opts;

  if (username) list = list.filter(c => c.username === username);
  if (search)   list = list.filter(c =>
    c.title.toLowerCase().includes(search) ||
    c.id.toLowerCase().includes(search) ||
    c.category.toLowerCase().includes(search)
  );
  if (status) list = list.filter(c => c.status === status);
  if (sort === 'priority') {
    list.sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority));
  } else {
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  return list;
}

// ---- Open Detail Modal ----
function openDetail(id) {
  currentComplaintId = id;
  const c = getComplaints().find(x => x.id === id);
  if (!c) return;

  document.getElementById('modalTitle').textContent = c.title;
  document.getElementById('modalContent').innerHTML = `
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;">
      <span class="badge-pill ${statusClass(c.status)}">${c.status}</span>
      <span class="badge-pill ${priorityClass(c.priority)}">${c.priority} Priority</span>
      <span class="badge-pill bp-cat">${c.category}</span>
    </div>
    <div style="font-size:0.82rem;color:rgba(255,255,255,0.5);margin-bottom:6px;">
      ${c.id} · Submitted by ${c.userName} · ${formatDate(c.date)}
    </div>
    <div style="font-size:0.88rem;color:rgba(255,255,255,0.75);line-height:1.7;margin-bottom:20px;">${c.description}</div>
    ${c.image ? `<img src="${c.image}" style="width:100%;max-height:200px;object-fit:cover;border-radius:12px;margin-bottom:20px;border:1px solid rgba(255,255,255,0.1);">` : ''}
    <div style="font-size:0.9rem;font-weight:700;margin-bottom:14px;">📋 Status Timeline</div>
    <div class="timeline">${timelineHTML(c.timeline)}</div>
  `;

  const adminActions = document.getElementById('modalAdminActions');
  if (adminActions) adminActions.style.display = 'block';

  document.getElementById('detailModal').classList.add('show');
}

function closeModal() {
  document.getElementById('detailModal').classList.remove('show');
  currentComplaintId = null;
}

// ---- Admin: Update Status ----
function updateStatus(newStatus) {
  const complaints = getComplaints();
  const idx = complaints.findIndex(c => c.id === currentComplaintId);
  if (idx === -1) return;

  complaints[idx].status = newStatus;
  if (!complaints[idx].timeline) complaints[idx].timeline = [];
  complaints[idx].timeline.push({
    status: newStatus,
    date:   new Date().toISOString(),
    note:   `Status updated to "${newStatus}" by Admin.`
  });
  saveComplaints(complaints);
  closeModal();
  showToast('success', `Status updated to "${newStatus}" ✅`);
  if (typeof refreshPage === 'function') refreshPage();
}

// ---- Admin: Delete Complaint ----
function deleteComplaint() {
  if (!confirm('Delete this complaint permanently?')) return;
  const complaints = getComplaints().filter(c => c.id !== currentComplaintId);
  saveComplaints(complaints);
  closeModal();
  showToast('success', 'Complaint deleted.');
  if (typeof refreshPage === 'function') refreshPage();
}
