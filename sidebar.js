/* ============================================================
   sidebar.js — Renders sidebar dynamically based on role
   ============================================================ */

function renderSidebar(activeSection) {
  const session = requireAuth();
  if (!session) return null;

  const isAdmin = session.role === 'admin';
  const base    = isAdmin ? '.' : '.';

  const adminLinks = `
    <a href="admin.html"          class="nav-item-sidebar ${activeSection==='dashboard'  ?'active':''}"><i class="fas fa-chart-pie"></i> Dashboard</a>
    <a href="admin-complaints.html" class="nav-item-sidebar ${activeSection==='complaints'?'active':''}"><i class="fas fa-list-ul"></i> All Complaints</a>
  `;
  const userLinks = `
    <a href="dashboard.html"      class="nav-item-sidebar ${activeSection==='dashboard'  ?'active':''}"><i class="fas fa-home"></i> Dashboard</a>
    <a href="add-complaint.html"  class="nav-item-sidebar ${activeSection==='add'        ?'active':''}"><i class="fas fa-plus-circle"></i> Add Complaint</a>
    <a href="my-complaints.html"  class="nav-item-sidebar ${activeSection==='complaints' ?'active':''}"><i class="fas fa-clipboard-list"></i> My Complaints</a>
  `;

  const html = `
  <div class="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-brand-name">📋 Complaint App</div>
      <span class="sidebar-role-badge ${isAdmin?'badge-admin':'badge-user'}">
        ${isAdmin ? '🛡 Admin' : '👤 User'}
      </span>
    </div>
    <div class="nav-section-label">Menu</div>
    ${isAdmin ? adminLinks : userLinks}
    <div class="sidebar-footer">
      <div class="user-info-sidebar">
        <div class="user-avatar">${session.name[0]}</div>
        <div>
          <div class="user-name-sidebar">${session.name}</div>
          <div class="user-email-sidebar">${session.email}</div>
        </div>
      </div>
      <button class="btn-logout" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
    </div>
  </div>`;

  document.getElementById('sidebarContainer').innerHTML = html;
  return session;
}

// Shared modal HTML for complaint details
function renderModal(isAdmin = false) {
  return `
  <div class="modal-overlay" id="detailModal">
    <div class="modal-box">
      <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:20px;">
        <div class="modal-title" id="modalTitle">Complaint Details</div>
        <span onclick="closeModal()" style="cursor:pointer;font-size:1.4rem;color:rgba(255,255,255,0.4);">✕</span>
      </div>
      <div id="modalContent"></div>
      ${isAdmin ? `
      <div id="modalAdminActions" style="margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.08);">
        <div style="font-size:0.85rem;font-weight:700;margin-bottom:12px;color:rgba(255,255,255,0.7);">Update Status</div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-gradient btn-yellow" onclick="updateStatus('In Progress')" style="padding:8px 16px;font-size:0.8rem;">🔄 In Progress</button>
          <button class="btn-gradient btn-green"  onclick="updateStatus('Solved')"      style="padding:8px 16px;font-size:0.8rem;">✅ Solved</button>
          <button class="btn-gradient btn-red"    onclick="updateStatus('Rejected')"    style="padding:8px 16px;font-size:0.8rem;">❌ Reject</button>
          <button class="btn-gradient btn-red"    onclick="deleteComplaint()"           style="padding:8px 16px;font-size:0.8rem;margin-left:auto;">🗑 Delete</button>
        </div>
      </div>` : ''}
    </div>
  </div>`;
}
