const AI_RULES = [
  {
    keywords: ['network','internet','wifi','connection','slow','down','offline','broadband','router'],
    cat: 'Network / Connectivity', pri: 'High',
    sol: 'Check router/modem. Restart device. Contact ISP if issue persists.'
  },
  {
    keywords: ['bill','payment','charge','invoice','money','refund','fee','overcharged','deducted'],
    cat: 'Billing Problem', pri: 'High',
    sol: 'Review billing statement. Contact finance team to dispute or request refund.'
  },
  {
    keywords: ['delivery','shipping','package','courier','not arrived','late','order','dispatch'],
    cat: 'Delivery Issue', pri: 'Medium',
    sol: 'Track your order. Contact courier with tracking number to expedite.'
  },
  {
    keywords: ['rude','staff','behavior','attitude','service','treated','employee','representative'],
    cat: 'Staff Behavior', pri: 'Medium',
    sol: 'Report to HR/management. Provide staff name and incident details.'
  },
  {
    keywords: ['broken','defect','damage','product','quality','not working','manufacturing','faulty'],
    cat: 'Product Defect', pri: 'High',
    sol: 'Stop using product. Take photos as evidence. Initiate return/replacement process.'
  },
  {
    keywords: ['app','software','error','crash','bug','login','password','update','version'],
    cat: 'Technical Issue', pri: 'Medium',
    sol: 'Clear cache. Reinstall app. Report error code to tech support team.'
  },
  {
    keywords: ['service','support','help','assistance','response','feedback','complaint'],
    cat: 'Service Complaint', pri: 'Low',
    sol: 'Submit formal complaint. Escalate to supervisor if no response within 48 hours.'
  },
];

let aiTimer = null;

// Called as user types in title/description
function triggerAI() {
  clearTimeout(aiTimer);
  const title = document.getElementById('cTitle')?.value || '';
  const desc  = document.getElementById('cDesc')?.value  || '';
  const combined = (title + ' ' + desc).trim();

  if (combined.length < 5) {
    document.getElementById('aiBox')?.classList.remove('show');
    return;
  }
  aiTimer = setTimeout(() => runAI(combined), 600);
}

// Analyze text and show suggestions
function runAI(text) {
  const lower   = text.toLowerCase();
  const matched = AI_RULES.find(r => r.keywords.some(k => lower.includes(k)))
    || { cat: 'Other', pri: 'Low', sol: 'Please provide more details for better assistance.' };

  // Build suggestion lists
  const cats = [matched.cat, 'Technical Issue', 'Other']
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);
  const pris = [matched.pri, matched.pri === 'High' ? 'Medium' : 'High', 'Low']
    .filter((v, i, a) => a.indexOf(v) === i).slice(0, 3);

  // Render category chips
  document.getElementById('aiCatChips').innerHTML = cats.map(c =>
    `<span class="ai-chip" onclick="applyAI('cCategory','${c}',this)">${c}</span>`
  ).join('');

  // Render priority chips
  document.getElementById('aiPriChips').innerHTML = pris.map(p =>
    `<span class="ai-chip" onclick="applyAI('cPriority','${p}',this)">${p}</span>`
  ).join('');

  // Show solution
  document.getElementById('aiSolution').textContent = '💡 ' + matched.sol;

  document.getElementById('aiBox').classList.add('show');
}

// Apply clicked chip value to form field
function applyAI(fieldId, value, chipEl) {
  const field = document.getElementById(fieldId);
  if (field) {
    field.value = value;
    // Highlight selected chip
    const siblings = chipEl.parentElement.querySelectorAll('.ai-chip');
    siblings.forEach(c => c.classList.remove('selected'));
    chipEl.classList.add('selected');
  }
}
