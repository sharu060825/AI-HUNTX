(function () {
  const API = '/api/admin';
  const TOKEN_KEY = 'shark_admin_token';

  const loginCard   = document.getElementById('login-card');
  const dashboard    = document.getElementById('dashboard');
  const loginForm    = document.getElementById('login-form');
  const loginMsg     = document.getElementById('login-msg');
  const logoutBtn     = document.getElementById('logout-btn');
  const statCount     = document.getElementById('stat-count');
  const statMax       = document.getElementById('stat-max');
  const statMembers   = document.getElementById('stat-members');
  const maxInput       = document.getElementById('max-participants');
  const saveCapBtn     = document.getElementById('save-cap-btn');
  const settingsMsg    = document.getElementById('settings-msg');
  const exportBtn       = document.getElementById('export-btn');
  const regTbody         = document.getElementById('reg-tbody');
  const editCard = document.getElementById('edit-card');
  const editModal = document.getElementById('edit-modal');
  const editFields = {
    fullname: document.getElementById('edit-fullname'),
    regno: document.getElementById('edit-regno'),
    mobile: document.getElementById('edit-mobile'),
    email: document.getElementById('edit-email'),
    dept: document.getElementById('edit-dept'),
    section: document.getElementById('edit-section'),
    teamname: document.getElementById('edit-teamname'),
    membersSelect: document.getElementById('edit-members-select'),
    memberFields: document.getElementById('edit-member-fields'),
  };
  let editingId = null;

  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
  function clearToken() { localStorage.removeItem(TOKEN_KEY); }

  async function authFetch(url, opts = {}) {
    const res = await fetch(url, {
      ...opts,
      headers: { ...(opts.headers || {}), Authorization: `Bearer ${getToken()}` },
    });
    if (res.status === 401) {
      clearToken();
      showLogin();
      throw new Error('Session expired — please log in again.');
    }
    return res;
  }

  function showLogin() {
    loginCard.style.display = 'block';
    dashboard.style.display = 'none';
  }

  function showDashboard() {
    loginCard.style.display = 'none';
    dashboard.style.display = 'block';
    loadDashboard();
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginMsg.textContent = '';
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const body = await res.json();
      if (!res.ok) { loginMsg.textContent = body.message || 'Login failed.'; return; }
      setToken(body.token);
      showDashboard();
    } catch (err) {
      loginMsg.textContent = 'Network error: ' + err.message;
    }
  });

  logoutBtn.addEventListener('click', () => {
    clearToken();
    showLogin();
  });

  async function loadDashboard() {
    try {
      const [settingsRes, regsRes] = await Promise.all([
        authFetch(`${API}/settings`),
        authFetch(`${API}/registrations`),
      ]);
      const settings = await settingsRes.json();
      const { registrations } = await regsRes.json();

      statCount.textContent = settings.count;
      statMax.textContent = settings.maxParticipants;
      maxInput.value = settings.maxParticipants;

      // total members = sum of participantCount
      const totalMembers = registrations.reduce((s, r) => s + (r.participantCount || 0), 0);
      if (statMembers) statMembers.textContent = totalMembers;

      regTbody.innerHTML = registrations.map((r) => `
        <tr data-id="${r._id}">
          <td>${new Date(r.createdAt).toLocaleString()}</td>
          <td>${escapeHtml(r.fullname)}</td>
          <td>${escapeHtml(r.regno)}</td>
          <td>${escapeHtml(r.mobile)}</td>
          <td>${escapeHtml(r.email)}</td>
          <td>${escapeHtml(r.dept)}</td>
          <td>${escapeHtml(r.section)}</td>
          <td>${escapeHtml(r.teamname || '—')}</td>
          <td>${r.participantCount}</td>
          <td>${r.memberDetails.map((m) => escapeHtml(`${m.name} (${m.regno})`)).join(', ')}</td>
          <td style="white-space:nowrap">
            <button class="secondary edit-btn" data-id="${r._id}">Edit</button>
            <button class="danger delete-btn" data-id="${r._id}" style="margin-left:0.5rem">Delete</button>
          </td>
        </tr>
      `).join('');

      // wire buttons
      document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', onEditClick));
      document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', onDeleteClick));
    } catch (err) {
      console.error(err);
    }
  }

  async function onDeleteClick(e) {
    const id = e.currentTarget.getAttribute('data-id');
    if (!id) return;
    if (!confirm('Delete this registration? This cannot be undone.')) return;
    try {
      const res = await authFetch(`${API}/registrations/${id}`, { method: 'DELETE' });
      let body = null;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        body = await res.json();
      } else {
        const text = await res.text();
        body = { message: text };
      }
      if (!res.ok) { alert(body.message || 'Delete failed'); return; }
      await loadDashboard();
      alert('Deleted');
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  function renderEditMemberFields(n, existing) {
    editFields.memberFields.innerHTML = '';
    for (let i = 1; i <= n; i++) {
      const nameKey = `member${i}_name`;
      const regKey = `member${i}_regno`;
      const deptKey = `member${i}_dept`;
      const div = document.createElement('div');
      div.className = 'row';
      div.style.marginBottom = '0.5rem';
      div.innerHTML = `
        <div style="flex:1"><label>Member ${i} Name</label><input id="e_${nameKey}" value="${escapeHtml(existing?.[i-1]?.name||'')}"></div>
        <div style="flex:1"><label>Reg No</label><input id="e_${regKey}" value="${escapeHtml(existing?.[i-1]?.regno||'')}"></div>
        <div style="flex:1"><label>Dept</label><input id="e_${deptKey}" value="${escapeHtml(existing?.[i-1]?.dept||'')}"></div>
      `;
      editFields.memberFields.appendChild(div);
    }
  }

  async function onEditClick(e) {
    const id = e.currentTarget.getAttribute('data-id');
    if (!id) return;
    // fetch registration
    try {
      const res = await authFetch(`${API}/registrations`);
      const body = await res.json();
      const reg = body.registrations.find(r => r._id === id);
      if (!reg) return alert('Registration not found');

      editingId = id;
      editFields.fullname.value = reg.fullname || '';
      editFields.regno.value = reg.regno || '';
      editFields.mobile.value = reg.mobile || '';
      editFields.email.value = reg.email || '';
      editFields.dept.value = reg.dept || '';
      editFields.section.value = reg.section || '';
      editFields.teamname.value = reg.teamname || '';
      // Determine members: prefer stored memberDetails length (data may be inconsistent), fallback to participantCount-1
      const members = (Array.isArray(reg.memberDetails) && reg.memberDetails.length > 0)
        ? reg.memberDetails.length
        : Math.max(0, (reg.participantCount || 1) - 1);
      editFields.membersSelect.value = String(members);
      renderEditMemberFields(members, reg.memberDetails || []);
      if (editModal) editModal.style.display = 'flex';
    } catch (err) {
      console.error(err);
      alert('Failed to load registration');
    }
  }

  editFields.membersSelect.addEventListener('change', () => {
    const n = parseInt(editFields.membersSelect.value, 10) || 0;
    renderEditMemberFields(n, []);
  });

  document.getElementById('cancel-edit-btn').addEventListener('click', () => {
    if (editModal) editModal.style.display = 'none';
    editCard.style.display = 'none'; editingId = null;
  });

  document.getElementById('save-edit-btn').addEventListener('click', async () => {
    if (!editingId) return;
    const members = parseInt(editFields.membersSelect.value, 10) || 0;
    const memberDetails = [];
    for (let i = 1; i <= members; i++) {
      const nameEl = document.getElementById(`e_member${i}_name`);
      const regnoEl = document.getElementById(`e_member${i}_regno`);
      const deptEl = document.getElementById(`e_member${i}_dept`);
      const name = nameEl ? nameEl.value.trim() : '';
      const regno = regnoEl ? regnoEl.value.trim() : '';
      const dept = deptEl ? deptEl.value.trim() : '';
      memberDetails.push({ name, regno, dept });
    }

    // Client-side validation: memberDetails length must match members
    if (memberDetails.length !== members) {
      return alert('Please ensure the number of member fields matches the selected number of members.');
    }

    const payload = {
      fullname: editFields.fullname.value.trim(),
      regno: editFields.regno.value.trim(),
      mobile: editFields.mobile.value.trim(),
      email: editFields.email.value.trim(),
      dept: editFields.dept.value.trim(),
      section: editFields.section.value.trim(),
      teamname: editFields.teamname.value.trim(),
      participantCount: members + 1,
      memberDetails,
    };

    try {
      const res = await authFetch(`${API}/registrations/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      let body = null;
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        body = await res.json();
      } else {
        const text = await res.text();
        body = { message: text };
      }
      if (!res.ok) { alert(body.message || 'Save failed'); return; }
      if (editModal) editModal.style.display = 'none';
      editCard.style.display = 'none'; editingId = null;
      await loadDashboard();
      alert('Saved');
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  });

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }

  saveCapBtn.addEventListener('click', async () => {
    settingsMsg.className = 'msg';
    settingsMsg.textContent = '';
    const maxParticipants = parseInt(maxInput.value, 10);
    if (!Number.isInteger(maxParticipants) || maxParticipants < 1) {
      settingsMsg.className = 'msg error';
      settingsMsg.textContent = 'Enter a valid positive number.';
      return;
    }

    try {
      const res = await authFetch(`${API}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maxParticipants }),
      });
      const body = await res.json();
      if (!res.ok) { settingsMsg.className = 'msg error'; settingsMsg.textContent = body.message; return; }
      settingsMsg.className = 'msg ok';
      settingsMsg.textContent = 'Saved.';
      statMax.textContent = body.maxParticipants;
    } catch (err) {
      settingsMsg.className = 'msg error';
      settingsMsg.textContent = err.message;
    }
  });

  exportBtn.addEventListener('click', async () => {
    try {
      const res = await authFetch(`${API}/export`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'shark-registrations.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Export failed: ' + err.message);
    }
  });

  if (getToken()) showDashboard(); else showLogin();
})();
