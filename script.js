// ===== AUTH STATE =====
var isDemo = true;
var currentEmail = null;

// ===== CONFIG =====
var CAT = {
    food: { icon: 'fa-utensils', cls: 'food', color: '#f59e0b', label: 'Food & Dining', builtin: true },
    transport: { icon: 'fa-car', cls: 'transport', color: '#3b82f6', label: 'Transport', builtin: true },
    shopping: { icon: 'fa-shopping-bag', cls: 'shopping', color: '#ec4899', label: 'Shopping', builtin: true },
    salary: { icon: 'fa-briefcase', cls: 'salary', color: '#10b981', label: 'Salary', builtin: true },
    freelance: { icon: 'fa-laptop-code', cls: 'freelance', color: '#6366f1', label: 'Freelance', builtin: true },
    bills: { icon: 'fa-file-invoice', cls: 'bills', color: '#ef4444', label: 'Bills & Utilities', builtin: true },
    entertainment: { icon: 'fa-film', cls: 'entertainment', color: '#8b5cf6', label: 'Entertainment', builtin: true },
    health: { icon: 'fa-heartbeat', cls: 'health', color: '#14b8a6', label: 'Health', builtin: true },
    education: { icon: 'fa-book', cls: 'education', color: '#0891b2', label: 'Education', builtin: true },
    investment: { icon: 'fa-chart-line', cls: 'investment', color: '#059669', label: 'Investment', builtin: true },
    other: { icon: 'fa-ellipsis-h', cls: 'other', color: '#6b7280', label: 'Other', builtin: true }
};

var EXP_CATS = ['food', 'transport', 'shopping', 'bills', 'entertainment', 'health', 'education', 'other'];
var INC_CATS = ['salary', 'freelance', 'investment', 'other'];
var CAT_COLORS = ['#f59e0b', '#3b82f6', '#ec4899', '#ef4444', '#8b5cf6', '#14b8a6', '#0891b2', '#059669', '#f97316', '#84cc16', '#06b6d4', '#6366f1'];

var PAGE_META = {
    dashboard: { title: 'Dashboard', desc: "Welcome back! Here's your financial overview." },
    transactions: { title: 'Transactions', desc: 'View and manage all your transactions.' },
    analytics: { title: 'Analytics', desc: 'Deep dive into your spending patterns.' },
    budgets: { title: 'Budgets', desc: 'Set and track spending limits by category.' },
    goals: { title: 'Goals', desc: 'Track your savings goals progress.' },
    categories: { title: 'Categories', desc: 'Manage your spending and income categories.' },
    settings: { title: 'Settings', desc: 'Customize your FinTrack experience.' },
    help: { title: 'Help', desc: 'Frequently asked questions and guides.' }
};

var FAQS = [
    { q: 'Where is my data stored?', a: "All data is stored in your browser's localStorage. Each user has their own separate data." },
    { q: 'Can I edit a transaction?', a: 'Currently you can add and delete transactions. Editing is planned for a future update.' },
    { q: 'How do budgets work?', a: 'Set a monthly spending limit for each expense category. Red means exceeded.' },
    { q: 'What are Goals?', a: 'Goals let you set savings targets. Add funds over time and track progress.' },
    { q: 'Can I add custom categories?', a: 'Yes! Go to Categories page and click Add Category.' },
    { q: 'Can I use this on mobile?', a: 'Yes! Fully responsive with a hamburger menu on small screens.' },
    { q: 'What is the demo?', a: 'The demo shows a pre-filled dashboard you can fully interact with. Register to get your own account.' }
];

// ===== STATE =====
var transactions = [], budgets = {}, goals = [], settings = {}, customCategories = [];
var currentPage = 'dashboard', txnFilterType = 'all', charts = {}, currentTxnType = 'expense';
var selectedCatColor = CAT_COLORS[0], pendingConfirmAction = null;

// ===== STORAGE =====
function prefix() { return isDemo ? 'ft_demo_' : 'ft_u_' + currentEmail + '_'; }
function save() { var p = prefix(); localStorage.setItem(p + 'txn', JSON.stringify(transactions)); localStorage.setItem(p + 'bud', JSON.stringify(budgets)); localStorage.setItem(p + 'goals', JSON.stringify(goals)); localStorage.setItem(p + 'settings', JSON.stringify(settings)); localStorage.setItem(p + 'custom_cats', JSON.stringify(customCategories)); }
function load() { var p = prefix(); transactions = JSON.parse(localStorage.getItem(p + 'txn')) || []; budgets = JSON.parse(localStorage.getItem(p + 'bud')) || {}; goals = JSON.parse(localStorage.getItem(p + 'goals')) || []; settings = JSON.parse(localStorage.getItem(p + 'settings')) || {}; customCategories = JSON.parse(localStorage.getItem(p + 'custom_cats')) || []; }
function getUsers() { return JSON.parse(localStorage.getItem('ft_users')) || []; }
function saveUsers(u) { localStorage.setItem('ft_users', JSON.stringify(u)); }

// ===== NOTIFICATIONS =====
function getNotifs() { return JSON.parse(localStorage.getItem(prefix() + 'notifs')) || []; }
function saveNotifs(n) { localStorage.setItem(prefix() + 'notifs', JSON.stringify(n)); updateNotifBadge(); }
function addNotif(msg, type) {
    var n = getNotifs();
    n.unshift({ id: Date.now(), message: msg, type: type || 'info', time: new Date().toISOString() });
    if (n.length > 50) n = n.slice(0, 50);
    saveNotifs(n);
}
function updateNotifBadge() {
    var n = getNotifs(); var b = document.getElementById('notifBadge');
    if (b) { b.textContent = n.length; b.style.display = n.length > 0 ? 'flex' : 'none'; }
}
function toggleNotifDropdown() {
    var dd = document.getElementById('notifDropdown');
    dd.classList.toggle('show');
    if (dd.classList.contains('show')) renderNotifs();
}
function renderNotifs() {
    var n = getNotifs();
    var el = document.getElementById('notifList');
    if (!n.length) { el.innerHTML = '<div class="notif-empty"><i class="far fa-bell-slash"></i>No notifications</div>'; return; }
    el.innerHTML = n.map(function (item) {
        var iconCls = item.type === 'success' ? 'fa-check-circle' : item.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        var ago = timeAgo(item.time);
        return '<div class="notif-item"><div class="notif-icon ' + (item.type || 'info') + '"><i class="fas ' + iconCls + '"></i></div><div class="notif-body"><div class="nb-msg">' + esc(item.message) + '</div><div class="nb-time">' + ago + '</div></div></div>';
    }).join('');
}
function clearNotifications() { saveNotifs([]); renderNotifs(); }
function timeAgo(iso) {
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
}

// Close notification dropdown on outside click
document.addEventListener('click', function (e) {
    var dd = document.getElementById('notifDropdown');
    var bell = document.getElementById('notifBell');
    if (dd && dd.classList.contains('show') && !bell.contains(e.target) && !dd.contains(e.target)) {
        dd.classList.remove('show');
    }
});

// ===== PASSWORD TOGGLE =====
function togglePass(inputId, btn) {
    var inp = document.getElementById(inputId);
    var icon = btn.querySelector('i');
    if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

// ===== CATEGORY HELPERS =====
function getCatConfig(key) {
    if (CAT[key]) return CAT[key];
    var c = customCategories.find(function (x) { return x.key === key; });
    if (c) return { icon: 'fa-tag', cls: 'other', color: c.color, label: c.name, builtin: false };
    return CAT.other;
}
function getAllExpenseCats() { var c = EXP_CATS.slice(); customCategories.forEach(function (x) { if (x.type === 'expense' && c.indexOf(x.key) === -1) c.push(x.key); }); return c; }
function getAllIncomeCats() { var c = INC_CATS.slice(); customCategories.forEach(function (x) { if (x.type === 'income' && c.indexOf(x.key) === -1) c.push(x.key); }); return c; }
function catTxnCount(k) { return transactions.filter(function (t) { return t.category === k; }).length; }
function populateDropdowns() {
    document.getElementById('txnCat').innerHTML = '<option value="">Select category</option>' + getAllExpenseCats().map(function (k) { return '<option value="' + k + '">' + getCatConfig(k).label + '</option>'; }).join('');
    document.getElementById('txnIncCat').innerHTML = '<option value="">Select source</option>' + getAllIncomeCats().map(function (k) { return '<option value="' + k + '">' + getCatConfig(k).label + '</option>'; }).join('');
}

// ===== GENERAL HELPERS =====
function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmt(n) { return (settings.currency || '$') + Math.round(n).toLocaleString(); }
function fmtDate(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function totalIncome() { return transactions.filter(function (t) { return t.type === 'income'; }).reduce(function (s, t) { return s + t.amount; }, 0); }
function totalExpense() { return transactions.filter(function (t) { return t.type === 'expense'; }).reduce(function (s, t) { return s + t.amount; }, 0); }
function catSpent(cat) { return transactions.filter(function (t) { return t.type === 'expense' && t.category === cat; }).reduce(function (s, t) { return s + t.amount; }, 0); }
function getCatData() { var exp = transactions.filter(function (t) { return t.type === 'expense'; }); var m = {}; exp.forEach(function (t) { m[t.category] = (m[t.category] || 0) + t.amount; }); var te = exp.reduce(function (s, t) { return s + t.amount; }, 0); return Object.keys(m).map(function (k) { var c = getCatConfig(k); return { key: k, total: m[k], pct: te > 0 ? ((m[k] / te) * 100).toFixed(1) : 0, icon: c.icon, cls: c.cls, color: c.color, label: c.label }; }).sort(function (a, b) { return b.total - a.total; }); }

// ===== CHART HELPERS =====
function mkChart(id, cfg) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } var ctx = document.getElementById(id); if (!ctx) return null; charts[id] = new Chart(ctx.getContext('2d'), cfg); return charts[id]; }
function destroyPageCharts(page) { var m = { dashboard: ['dashBar', 'dashDoughnut'], analytics: ['analyticsLine', 'analyticsDoughnut'] }; (m[page] || []).forEach(function (id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }); }
var chartTooltip = { backgroundColor: '#1e293b', titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 12 }, padding: 12, cornerRadius: 8 };
var chartLegend = { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { family: 'Inter', size: 12, weight: '500' } } };

// ===== AUTH UI =====
function applyAuthUI() { var banner = document.getElementById('demoBanner'), demoBtns = document.getElementById('demoAuthBtns'), logInfo = document.getElementById('loggedInInfo'), passSec = document.getElementById('settingsPassword'); if (isDemo) { banner.style.display = 'flex'; demoBtns.style.display = 'flex'; logInfo.style.display = 'none'; passSec.style.display = 'none'; } else { banner.style.display = 'none'; demoBtns.style.display = 'none'; logInfo.style.display = 'flex'; passSec.style.display = 'block'; var i = (settings.name || 'U').split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2); document.getElementById('topbarAvatar').textContent = i; document.getElementById('topbarName').textContent = settings.name || 'User'; } }
function showScreen(type) { document.getElementById('loginScreen').classList.remove('show'); document.getElementById('registerScreen').classList.remove('show'); if (type === 'login') document.getElementById('loginScreen').classList.add('show'); if (type === 'register') document.getElementById('registerScreen').classList.add('show'); document.body.style.overflow = 'hidden'; }
function backToDemo() { document.getElementById('loginScreen').classList.remove('show'); document.getElementById('registerScreen').classList.remove('show'); document.body.style.overflow = ''; }

// ===== REGISTER =====
function registerUser(e) {
    e.preventDefault();
    var first = document.getElementById('regFirst').value.trim(), last = document.getElementById('regLast').value.trim(), email = document.getElementById('regEmail').value.trim().toLowerCase(), pass = document.getElementById('regPass').value, currency = document.getElementById('regCurrency').value;
    if (!first || !last) { toast('Enter your full name.', 'error'); return false; }
    if (pass.length < 8) { toast('Password must be at least 8 characters.', 'error'); return false; }
    var users = getUsers();
    if (users.find(function (u) { return u.email === email; })) { toast('This email is already registered.', 'error'); return false; }
    users.push({ first: first, last: last, email: email, pass: pass, currency: currency }); saveUsers(users);
    var p = 'ft_u_' + email + '_';
    localStorage.setItem(p + 'settings', JSON.stringify({ name: first + ' ' + last, currency: currency }));
    localStorage.setItem(p + 'txn', JSON.stringify([]));
    localStorage.setItem(p + 'bud', JSON.stringify({}));
    localStorage.setItem(p + 'goals', JSON.stringify([]));
    localStorage.setItem(p + 'custom_cats', JSON.stringify([]));
    localStorage.setItem(p + 'notifs', JSON.stringify([{ id: Date.now(), message: 'Welcome to FinTrack, ' + first + '! Thank you for registering. Start by adding your first transaction.', type: 'info', time: new Date().toISOString() }]));
    localStorage.setItem('ft_current_user', email);
    toast('Account created! Welcome, ' + first + '!');
    setTimeout(function () { location.reload(); }, 800); return false;
}

// ===== LOGIN =====
function loginUser(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim().toLowerCase(), pass = document.getElementById('loginPass').value;
    var users = getUsers(), user = users.find(function (u) { return u.email === email && u.pass === pass; });
    if (!user) {
    alert('❌ Wrong email or password. Please try again.');
    return false;
}

localStorage.setItem('ft_current_user', email);
currentEmail = email;
isDemo = false;
toast('Welcome back, ' + user.first + '!');

setTimeout(function () {
    location.reload();
}, 800);

return false;
}
// cancel login //
function cancelLogin() {
    localStorage.removeItem('ft_current_user');

    // force clear memory state
    currentEmail = null;
    isDemo = true;

    // optional: full reset of runtime state
    transactions = [];
    budgets = {};
    goals = [];
    customCategories = [];

    location.reload();
}

function logoutUser() { localStorage.removeItem('ft_current_user'); toast('Logged out.'); setTimeout(function () { location.reload(); }, 500); }
function changePassword() {
    var np = document.getElementById('newPass').value;
    if (!np || np.length < 8) { toast('Password must be at least 8 characters.', 'error'); return; }
    var users = getUsers(), idx = users.findIndex(function (u) { return u.email === currentEmail; });
    if (idx !== -1) { users[idx].pass = np; saveUsers(users); document.getElementById('newPass').value = ''; addNotif('Password updated successfully.', 'success'); toast('Password updated!'); }
}

// ===== CONFIRM DIALOG =====
function showConfirm(title, message, warningText, btnText, callback) { document.getElementById('confirmTitle').textContent = title; document.getElementById('confirmMessage').textContent = message; var w = document.getElementById('confirmWarning'); if (warningText) { w.style.display = 'flex'; document.getElementById('confirmWarningText').textContent = warningText; } else { w.style.display = 'none'; } document.getElementById('confirmActionBtn').textContent = btnText; pendingConfirmAction = callback; openModal('confirmDialog'); }
document.getElementById('confirmActionBtn').addEventListener('click', function () { if (pendingConfirmAction) { pendingConfirmAction(); pendingConfirmAction = null; } closeModal('confirmDialog'); });

// ===== ROUTER =====
function navigateTo(page) { destroyPageCharts(currentPage); currentPage = page; document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); }); document.querySelector('.page[data-page="' + page + '"]').classList.add('active'); document.querySelectorAll('.nav-item').forEach(function (n) { n.classList.toggle('active', n.dataset.page === page); }); document.getElementById('pageTitle').textContent = PAGE_META[page].title; document.getElementById('pageDesc').textContent = PAGE_META[page].desc; renderPage(page); closeSidebar(); }
function renderPage(page) { switch (page) { case 'dashboard': renderDashboard(); break; case 'transactions': renderTransactionsPage(); break; case 'analytics': renderAnalytics(); break; case 'budgets': renderBudgets(); break; case 'goals': renderGoals(); break; case 'categories': renderCategories(); break; case 'settings': renderSettings(); break; case 'help': renderHelp(); break; } }
function refreshCurrent() { renderPage(currentPage); }

// ===== DASHBOARD =====
function renderDashboard() {
    var inc = totalIncome(),
        exp = totalExpense(),
        bal = inc - exp,
        rate = inc > 0 ? ((bal / inc) * 100).toFixed(1) : 0;

    // Summary Cards
    document.getElementById('dashSummary').innerHTML =
        '<div class="s-card inc"><div class="ch"><span class="lb">Total Income</span><div class="ci"><i class="fas fa-arrow-down"></i></div></div><div class="amt">' + fmt(inc) + '</div><div class="tr up"><i class="fas fa-arrow-up"></i> 12.5% <span>vs last month</span></div></div>' +
        '<div class="s-card exp"><div class="ch"><span class="lb">Total Expenses</span><div class="ci"><i class="fas fa-arrow-up"></i></div></div><div class="amt">' + fmt(exp) + '</div><div class="tr dn"><i class="fas fa-arrow-down"></i> 3.2% <span>vs last month</span></div></div>' +
        '<div class="s-card bal"><div class="ch"><span class="lb">Net Balance</span><div class="ci"><i class="fas fa-wallet"></i></div></div><div class="amt">' + fmt(bal) + '</div><div class="tr up"><i class="fas fa-arrow-up"></i> 8.1% <span>vs last month</span></div></div>' +
        '<div class="s-card sav"><div class="ch"><span class="lb">Savings Rate</span><div class="ci"><i class="fas fa-piggy-bank"></i></div></div><div class="amt">' + rate + '%</div><div class="tr up"><i class="fas fa-arrow-up"></i> 2.4% <span>vs last month</span></div></div>';

    // Bar Chart (FIXED brackets)
    mkChart('dashBar', {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Income',
                    data: [0, 0, 5200, 0, 0, 800, 0],
                    backgroundColor: 'rgba(16,185,129,0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                },
                {
                    label: 'Expense',
                    data: [142, 95, 48, 15, 89, 65, 184],
                    backgroundColor: 'rgba(239,68,68,0.8)',
                    borderRadius: 6,
                    borderSkipped: false,
                    barPercentage: 0.6,
                    categoryPercentage: 0.7
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: chartLegend,
                tooltip: Object.assign({}, chartTooltip, {
                    callbacks: {
                        label: function (c) {
                            return c.dataset.label + ': ' + fmt(c.parsed.y);
                        }
                    }
                })
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8' }
                },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { family: 'Inter', size: 12 },
                        color: '#94a3b8',
                        callback: function (v) { return fmt(v); }
                    }
                }
            }
        }
    });

    // Doughnut Chart
    var cd = getCatData();

    mkChart('dashDoughnut', {
        type: 'doughnut',
        data: {
            labels: cd.map(c => c.label),
            datasets: [{
                data: cd.map(c => c.total),
                backgroundColor: cd.map(c => c.color),
                borderWidth: 0,
                spacing: 3,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: Object.assign({}, chartTooltip, {
                    callbacks: {
                        label: function (c) {
                            var t = c.dataset.data.reduce((a, b) => a + b, 0);
                            return fmt(c.parsed) + ' (' + ((c.parsed / t) * 100).toFixed(1) + '%)';
                        }
                    }
                })
            }
        }
    });

    // Category List
    document.getElementById('dashCatList').innerHTML =
        cd.slice(0, 4).map(function (c) {
            return '<div class="cat-item"><div class="cat-dot" style="background:' + c.color + '"></div><div class="cat-info"><div class="cn"><span>' + c.label + '</span><span class="cp">' + c.pct + '%</span></div><div class="cat-bar"><div class="cat-bar-fill" style="width:' + c.pct + '%;background:' + c.color + '"></div></div></div></div>';
        }).join('');

    // Recent Transactions
    var recent = transactions.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    document.getElementById('dashTxnList').innerHTML =
        recent.length
            ? recent.map(txnItemHTML).join('')
            : '<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions yet.</p></div>';

    // Breakdown
    document.getElementById('dashBreakdown').innerHTML =
        cd.length
            ? cd.map(function (c) {
                return '<div class="cat-item" style="margin-bottom:12px"><div class="cat-dot" style="background:' + c.color + '"></div><div class="cat-info"><div class="cn"><span>' + c.label + '</span><span class="cp">' + c.pct + '%</span></div><div class="cat-bar"><div class="cat-bar-fill" style="width:' + c.pct + '%;background:' + c.color + '"></div></div></div><span style="font-size:13px;font-weight:600;white-space:nowrap">' + fmt(c.total) + '</span></div>';
            }).join('')
            : '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No expenses to show.</p></div>';
}
// ===== TRANSACTIONS =====
function txnItemHTML(t) { var c = getCatConfig(t.category); var isE = t.type === 'expense'; return '<div class="txn-item"><div class="txn-icon ' + c.cls + '"><i class="fas ' + c.icon + '"></i></div><div class="txn-det"><div class="tn">' + esc(t.name) + '</div><div class="tc">' + c.label + '</div></div><div class="txn-amt"><div class="a ' + (isE ? 'ev' : 'iv') + '">' + (isE ? '-' : '+') + fmt(t.amount) + '</div><div class="d">' + fmtDate(t.date) + '</div></div><button class="del-btn" onclick="deleteTxn(' + t.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button></div>'; }
function setTxnFilter(type, btn) { txnFilterType = type; document.querySelectorAll('.txn-filters .tf').forEach(function (b) { b.classList.remove('active'); }); btn.classList.add('active'); renderTransactionsPage(); }
function renderTransactionsPage() {
    var inc = totalIncome(), exp = totalExpense();
    document.getElementById('txnSummaryRow').innerHTML = '<div class="txn-stat"><div class="ts-l">Total Income</div><div class="ts-v" style="color:var(--success)">' + fmt(inc) + '</div></div><div class="txn-stat"><div class="ts-l">Total Expenses</div><div class="ts-v" style="color:var(--danger)">' + fmt(exp) + '</div></div><div class="txn-stat"><div class="ts-l">Net Balance</div><div class="ts-v" style="color:' + (inc - exp >= 0 ? 'var(--primary)' : 'var(--danger)') + '">' + fmt(inc - exp) + '</div></div>';
    var sel = document.getElementById('txnCatFilter'), curVal = sel.value, allCats = [];
    transactions.forEach(function (t) { if (allCats.indexOf(t.category) === -1) allCats.push(t.category); });
    sel.innerHTML = '<option value="all">All Categories</option>' + allCats.map(function (c) { return '<option value="' + c + '">' + getCatConfig(c).label + '</option>'; }).join('');
    sel.value = curVal;
    var list = transactions.slice(), search = (document.getElementById('txnSearch') ? document.getElementById('txnSearch').value : '').toLowerCase(), catF = document.getElementById('txnCatFilter') ? document.getElementById('txnCatFilter').value : 'all';
    if (txnFilterType !== 'all') list = list.filter(function (t) { return t.type === txnFilterType; });
    if (catF !== 'all') list = list.filter(function (t) { return t.category === catF; });
    if (search) list = list.filter(function (t) { return t.name.toLowerCase().indexOf(search) !== -1; });
    list.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });
    document.getElementById('txnCount').textContent = 'Showing ' + list.length + ' of ' + transactions.length + ' transactions';
    document.getElementById('txnFullList').innerHTML = list.length ? list.map(txnItemHTML).join('') : '<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions match your filters.</p></div>';
}

// ===== ANALYTICS =====
function renderAnalytics() {
    var exp = transactions.filter(function (t) { return t.type === 'expense'; }),
        uniqueDays = [];

    exp.forEach(function (t) {
        if (uniqueDays.indexOf(t.date) === -1) uniqueDays.push(t.date);
    });

    var avgDaily = exp.length
        ? (totalExpense() / Math.max(uniqueDays.length, 1)).toFixed(0)
        : 0,
        topCat = getCatData()[0],
        highest = exp.length
            ? Math.max.apply(null, exp.map(function (t) { return t.amount; }))
            : 0;

    // Stats
    document.getElementById('analyticsStats').innerHTML =
        '<div class="a-stat"><div class="as-i"><i class="fas fa-receipt"></i></div><div class="as-v">' + transactions.length + '</div><div class="as-l">Total Transactions</div></div>' +
        '<div class="a-stat"><div class="as-i"><i class="fas fa-calculator"></i></div><div class="as-v">' + fmt(avgDaily) + '</div><div class="as-l">Avg Daily Spend</div></div>' +
        '<div class="a-stat"><div class="as-i"><i class="fas fa-trophy"></i></div><div class="as-v" style="font-size:16px">' + (topCat ? topCat.label : 'N/A') + '</div><div class="as-l">Top Category</div></div>' +
        '<div class="a-stat"><div class="as-i"><i class="fas fa-arrow-up"></i></div><div class="as-v">' + fmt(highest) + '</div><div class="as-l">Highest Expense</div></div>';

    // Last 14 days data
    var days = [];
    for (var i = 13; i >= 0; i--) {
        var d = new Date();
        d.setDate(d.getDate() - i);

        var ds = d.toISOString().split('T')[0];

        var da = exp
            .filter(function (t) { return t.date === ds; })
            .reduce(function (s, t) { return s + t.amount; }, 0);

        days.push({
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            amount: da
        });
    }

    // ✅ FIXED LINE CHART (removed extra })
    mkChart('analyticsLine', {
        type: 'line',
        data: {
            labels: days.map(function (d) { return d.label; }),
            datasets: [{
                label: 'Daily Spending',
                data: days.map(function (d) { return d.amount; }),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79,70,229,0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#4f46e5',
                pointBorderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: Object.assign({}, chartTooltip, {
                    callbacks: {
                        label: function (c) {
                            return 'Spent: ' + fmt(c.parsed.y);
                        }
                    }
                })
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: 'Inter', size: 11 },
                        color: '#94a3b8',
                        maxRotation: 45
                    }
                },
                y: {
                    grid: { color: '#f1f5f9' },
                    ticks: {
                        font: { family: 'Inter', size: 12 },
                        color: '#94a3b8',
                        callback: function (v) { return fmt(v); }
                    }
                }
            }
        }
    });

    // Doughnut chart
    var cd = getCatData();

    mkChart('analyticsDoughnut', {
        type: 'doughnut',
        data: {
            labels: cd.map(function (c) { return c.label; }),
            datasets: [{
                data: cd.map(function (c) { return c.total; }),
                backgroundColor: cd.map(function (c) { return c.color; }),
                borderWidth: 0,
                spacing: 3,
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 6,
                        padding: 12,
                        font: { family: 'Inter', size: 11 }
                    }
                },
                tooltip: Object.assign({}, chartTooltip, {
                    callbacks: {
                        label: function (c) {
                            var total = c.dataset.data.reduce(function (a, b) { return a + b; }, 0);
                            return fmt(c.parsed) + ' (' + ((c.parsed / total) * 100).toFixed(1) + '%)';
                        }
                    }
                })
            }
        }
    });

    // Top expenses
    var topExp = exp.slice().sort(function (a, b) { return b.amount - a.amount; }).slice(0, 5);

    document.getElementById('topExpenses').innerHTML =
        topExp.length
            ? topExp.map(function (t, idx) {
                var c = getCatConfig(t.category);
                return '<div class="te-item"><div class="te-rank">' + (idx + 1) + '</div><div class="te-info"><div class="te-n">' + esc(t.name) + '</div><div class="te-c">' + c.label + ' &middot; ' + fmtDate(t.date) + '</div></div><div class="te-amt">' + fmt(t.amount) + '</div></div>';
            }).join('')
            : '<div class="empty-state"><i class="fas fa-list"></i><p>No expenses yet.</p></div>';
}
// ===== BUDGETS =====
function renderBudgets() {
    var ac = getAllExpenseCats(); ac.forEach(function (c) { if (budgets[c] === undefined) budgets[c] = 300; });
    var tb = ac.reduce(function (s, c) { return s + (budgets[c] || 0); }, 0), ts = ac.reduce(function (s, c) { return s + catSpent(c); }, 0), rem = tb - ts;
    document.getElementById('budgetOverview').innerHTML = '<div class="bo-card"><div class="bo-v" style="color:var(--primary)">' + fmt(tb) + '</div><div class="bo-l">Total Budget</div></div><div class="bo-card"><div class="bo-v" style="color:var(--danger)">' + fmt(ts) + '</div><div class="bo-l">Total Spent</div></div><div class="bo-card"><div class="bo-v" style="color:' + (rem >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + fmt(rem) + '</div><div class="bo-l">' + (rem >= 0 ? 'Remaining' : 'Over Budget') + '</div></div>';
    document.getElementById('budgetList').innerHTML = ac.map(function (c) { var cat = getCatConfig(c), b = budgets[c] || 0, s = catSpent(c), pct = b > 0 ? Math.min((s / b) * 100, 100) : 0, over = s > b, barColor = over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)', statusColor = over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)', statusText = over ? 'Over by ' + fmt(s - b) : 'Remaining: ' + fmt(b - s); return '<div class="budget-item"><div class="bi-icon" style="background:' + cat.color + '20;color:' + cat.color + '"><i class="fas ' + cat.icon + '"></i></div><div class="bi-info"><div class="bi-top"><span class="bi-name">' + cat.label + '</span><span class="bi-amts"><strong>' + fmt(s) + '</strong> / ' + fmt(b) + '</span></div><div class="bi-bar"><div class="bi-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div><div class="bi-status" style="color:' + statusColor + '">' + statusText + '</div></div><div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:var(--text-muted)">' + (settings.currency || '$') + '</span><input class="budget-input" type="number" value="' + b + '" min="0" step="10" onchange="updateBudget(\'' + c + '\',this.value)"></div></div>'; }).join('');
}
function updateBudget(cat, val) { budgets[cat] = parseFloat(val) || 0; save(); renderBudgets(); }

// ===== GOALS =====
function renderGoals() {
    document.getElementById('newGoalBtn').style.display = 'flex';
    document.getElementById('goalsGrid').innerHTML = goals.length ? goals.map(function (g) { var pct = Math.min((g.saved / g.target) * 100, 100), done = g.saved >= g.target; return '<div class="goal-card ' + (done ? 'completed' : '') + '"><div class="gc-bar" style="background:' + g.color + '"></div><div class="gc-body"><div class="gc-done"><i class="fas fa-check-circle"></i> Goal Reached!</div><div class="gc-name">' + esc(g.name) + '</div><div class="gc-amt"><strong>' + fmt(g.saved) + '</strong> of ' + fmt(g.target) + '</div><div class="gc-prog"><div class="gc-fill" style="width:' + pct + '%;background:' + g.color + '"></div></div><div class="gc-pct">' + pct.toFixed(1) + '% complete</div><div class="gc-actions"><button class="gc-btn add" onclick="openFundsModal(' + g.id + ',\'' + esc(g.name).replace(/'/g, "\\'") + '\')"><i class="fas fa-plus"></i>Add Funds</button><button class="gc-btn del" onclick="deleteGoal(' + g.id + ')"><i class="fas fa-trash-alt"></i>Delete</button></div></div></div>'; }).join('') : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-bullseye"></i><p>No goals yet.</p></div>';
}
function openGoalModal() { document.getElementById('goalName').value = ''; document.getElementById('goalTarget').value = ''; openModal('goalModal'); }
function handleCreateGoal(e) { e.preventDefault(); var name = document.getElementById('goalName').value.trim(), target = parseFloat(document.getElementById('goalTarget').value), color = document.getElementById('goalColor').value; if (!name || !target) return false; goals.push({ id: Date.now(), name: name, target: target, saved: 0, color: color }); save(); renderGoals(); closeModal('goalModal'); addNotif('Goal "' + name + '" created.', 'success'); toast('Goal "' + name + '" created!'); return false; }
function openFundsModal(id, name) { document.getElementById('fundsGoalId').value = id; document.getElementById('fundsGoalName').textContent = 'Adding funds to: ' + name; document.getElementById('fundsAmt').value = ''; openModal('fundsModal'); }
function handleAddFunds(e) { e.preventDefault(); var id = parseInt(document.getElementById('fundsGoalId').value), amt = parseFloat(document.getElementById('fundsAmt').value); if (!amt || amt <= 0) return false; var g = goals.find(function (g) { return g.id === id; }); if (g) { g.saved = Math.min(g.saved + amt, g.target); save(); renderGoals(); closeModal('fundsModal'); if (g.saved >= g.target) { addNotif('Congratulations! Goal "' + g.name + '" reached!', 'success'); toast('Goal reached!'); } else { addNotif(fmt(amt) + ' added to "' + g.name + '".', 'success'); toast(fmt(amt) + ' added.'); } } return false; }
function deleteGoal(id) { var g = goals.find(function (g) { return g.id === id; }); goals = goals.filter(function (g) { return g.id !== id; }); save(); renderGoals(); addNotif('Goal "' + (g ? g.name : '') + '" deleted.', 'error'); toast('Goal deleted.', 'error'); }

// ===== CATEGORIES =====
function renderCategories() {
    document.getElementById('catGrid').innerHTML = getAllExpenseCats().map(function (k) { var cat = getCatConfig(k), total = catSpent(k), cnt = catTxnCount(k), delBtn = cat.builtin ? '' : '<button class="cc-del" onclick="deleteCategory(\'' + k + '\')" title="Delete"><i class="fas fa-times"></i></button>'; return '<div class="cat-card"><div class="cc-icon" style="background:' + cat.color + '18;color:' + cat.color + '"><i class="fas ' + cat.icon + '"></i></div>' + delBtn + '<div class="cc-name">' + cat.label + '</div><div class="cc-total" style="color:' + (total > 0 ? 'var(--text)' : 'var(--text-muted)') + '">' + fmt(total) + '</div><div class="cc-cnt">' + cnt + ' transaction' + (cnt !== 1 ? 's' : '') + '</div></div>'; }).join('');
    document.getElementById('incCatGrid').innerHTML = getAllIncomeCats().map(function (k) { var cat = getCatConfig(k), total = catSpent(k), cnt = catTxnCount(k), delBtn = cat.builtin ? '' : '<button class="cc-del" onclick="deleteCategory(\'' + k + '\')" title="Delete"><i class="fas fa-times"></i></button>'; return '<div class="cat-card"><div class="cc-icon" style="background:' + cat.color + '18;color:' + cat.color + '"><i class="fas ' + cat.icon + '"></i></div>' + delBtn + '<div class="cc-name">' + cat.label + '</div><div class="cc-total" style="color:' + (total > 0 ? 'var(--text)' : 'var(--text-muted)') + '">' + fmt(total) + '</div><div class="cc-cnt">' + cnt + ' transaction' + (cnt !== 1 ? 's' : '') + '</div></div>'; }).join('');
}
function openCatModal(type) { document.getElementById('catTypeInput').value = type; document.getElementById('catModalTitle').textContent = type === 'expense' ? 'Add Expense Category' : 'Add Income Source'; document.getElementById('catNameInput').value = ''; selectedCatColor = CAT_COLORS[0]; renderColorPicker(); openModal('catModal'); }
function renderColorPicker() { document.getElementById('catColorPicker').innerHTML = CAT_COLORS.map(function (c) { return '<div class="color-opt' + (c === selectedCatColor ? ' selected' : '') + '" style="background:' + c + '" onclick="selectCatColor(\'' + c + '\',this)"></div>'; }).join(''); }
function selectCatColor(color, el) { selectedCatColor = color; document.querySelectorAll('.color-opt').forEach(function (e) { e.classList.remove('selected'); }); el.classList.add('selected'); }
function handleCreateCategory(e) { e.preventDefault(); var name = document.getElementById('catNameInput').value.trim(), type = document.getElementById('catTypeInput').value; if (!name) { toast('Enter a category name.', 'error'); return false; } var key = 'custom_' + Date.now(); customCategories.push({ key: key, name: name, color: selectedCatColor, type: type }); if (type === 'expense' && budgets[key] === undefined) budgets[key] = 0; save(); populateDropdowns(); renderCategories(); renderBudgets(); closeModal('catModal'); addNotif((type === 'expense' ? 'Category' : 'Source') + ' "' + name + '" added.', 'success'); toast('"' + name + '" added!'); return false; }
function deleteCategory(key) { var cat = getCatConfig(key), cnt = catTxnCount(key), warning = cnt > 0 ? cnt + ' transaction' + (cnt !== 1 ? 's' : '') + ' use this category. They will keep their data but the category will be removed from dropdowns.' : null; showConfirm('Delete Category', 'Are you sure you want to delete "' + cat.label + '"?', warning, 'Delete', function () { customCategories = customCategories.filter(function (c) { return c.key !== key; }); delete budgets[key]; save(); populateDropdowns(); renderCategories(); renderBudgets(); addNotif('"' + cat.label + '" deleted.', 'error'); toast('"' + cat.label + '" deleted.', 'error'); }); }

// ===== SETTINGS =====
function renderSettings() { document.getElementById('settingsName').value = settings.name || ''; document.getElementById('settingsCurrency').value = settings.currency || '$'; }
function saveName() { settings.name = document.getElementById('settingsName').value.trim() || 'User'; save(); updateSidebar(); applyAuthUI(); }
function saveCurrency() { var nc = document.getElementById('settingsCurrency').value; if (nc === settings.currency) return; showConfirm('Change Currency', 'Are you sure you want to change the currency to ' + nc + '?', 'All amounts on the dashboard, charts, and transactions will update to use the new symbol.', 'Change Currency', function () { settings.currency = nc; save(); refreshCurrent(); addNotif('Currency changed to ' + nc + '.', 'info'); toast('Currency updated to ' + nc); }); }
function updateSidebar() { var n = settings.name || (isDemo ? 'Ankita Sanjay' : 'User'); document.getElementById('sidebarName').textContent = n; document.getElementById('sidebarAvatar').textContent = n.split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2); document.getElementById('sidebarRole').textContent = isDemo ? 'Demo Mode' : 'My Account'; }
var resetClick = 0;
function resetData() { if (isDemo) { showConfirm('Cannot Reset', "You can't delete this data — it's for demo purposes.", 'The demo dashboard uses shared sample data so every visitor can explore all features. Register or login to manage your own data.', 'Got It', function () { }); return; } var btn = document.getElementById('resetBtn'); if (resetClick === 0) { resetClick = 1; btn.textContent = 'Click Again to Confirm'; btn.classList.add('confirm'); setTimeout(function () { resetClick = 0; btn.textContent = 'Reset Data'; btn.classList.remove('confirm'); }, 3000); return; } resetClick = 0; btn.textContent = 'Reset Data'; btn.classList.remove('confirm'); transactions = []; budgets = {}; goals = []; customCategories = []; save(); populateDropdowns(); refreshCurrent(); addNotif('All data has been reset.', 'error'); toast('All data has been reset.', 'error'); }

// ===== HELP =====
function renderHelp() { document.getElementById('faqList').innerHTML = FAQS.map(function (f, i) { return '<div class="accordion-item"><div class="accordion-q" onclick="toggleFaq(' + i + ')">' + f.q + '<i class="fas fa-chevron-down"></i></div><div class="accordion-a" id="faq-' + i + '">' + f.a + '</div></div>'; }).join(''); }
function toggleFaq(i) { var a = document.getElementById('faq-' + i), q = a.previousElementSibling, wasOpen = a.classList.contains('open'); document.querySelectorAll('.accordion-a').forEach(function (x) { x.classList.remove('open'); }); document.querySelectorAll('.accordion-q').forEach(function (x) { x.classList.remove('open'); }); if (!wasOpen) { a.classList.add('open'); q.classList.add('open'); } }

// ===== MODALS =====
function openModal(id) { document.getElementById(id).classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('show'); document.body.style.overflow = ''; if (id === 'txnModal') { var form = document.getElementById('txnModal').querySelector('form'); if (form) form.reset(); setType('expense'); } }
document.getElementById('fabBtn').addEventListener('click', function () { document.getElementById('txnDate').value = new Date().toISOString().split('T')[0]; openModal('txnModal'); });
document.querySelectorAll('.modal-ov').forEach(function (ov) { ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(ov.id); }); });
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { document.querySelectorAll('.modal-ov.show').forEach(function (m) { closeModal(m.id); }); backToDemo(); } });
function setType(type) { currentTxnType = type; document.getElementById('expBtn').className = 'type-btn' + (type === 'expense' ? ' ate' : ''); document.getElementById('incBtn').className = 'type-btn' + (type === 'income' ? ' ati' : ''); document.getElementById('expCatGrp').style.display = type === 'expense' ? 'block' : 'none'; document.getElementById('incCatGrp').style.display = type === 'income' ? 'block' : 'none'; }

// ===== ADD / DELETE TRANSACTION =====
function handleAddTxn(e) {
    e.preventDefault(); e.stopPropagation();
    var nameEl = document.getElementById('txnName'), amtEl = document.getElementById('txnAmt'), dateEl = document.getElementById('txnDate'), noteEl = document.getElementById('txnNote'), catEl = document.getElementById('txnCat'), incCatEl = document.getElementById('txnIncCat');
    var name = nameEl.value.trim(), amount = parseFloat(amtEl.value), date = dateEl.value, note = noteEl.value.trim(), category = currentTxnType === 'expense' ? catEl.value : incCatEl.value;
    if (!name) { toast('Enter a description.', 'error'); nameEl.focus(); return false; }
    if (!amount || amount <= 0) { toast('Enter a valid amount.', 'error'); amtEl.focus(); return false; }
    if (!date) { toast('Pick a date.', 'error'); dateEl.focus(); return false; }
    if (!category) { toast('Select a category.', 'error'); if (currentTxnType === 'expense') catEl.focus(); else incCatEl.focus(); return false; }
    transactions.push({ id: Date.now(), name: name, amount: amount, type: currentTxnType, category: category, date: date, note: note });
    save(); refreshCurrent(); closeModal('txnModal');
    var typeLabel = currentTxnType === 'income' ? 'Income' : 'Expense';
    addNotif(typeLabel + ' of ' + fmt(amount) + ' added for "' + name + '".', currentTxnType === 'income' ? 'success' : 'info');
    toast(typeLabel + ' of ' + fmt(amount) + ' added!'); return false;
}
function deleteTxn(id) { var t = transactions.find(function (t) { return t.id === id; }); transactions = transactions.filter(function (t) { return t.id !== id; }); save(); refreshCurrent(); addNotif('Transaction "' + (t ? t.name : '') + '" deleted.', 'error'); toast('Transaction deleted.', 'error'); }

// ===== TOAST =====
function toast(msg, type) { type = type || 'success'; var c = document.getElementById('toastC'), t = document.createElement('div'); t.className = 'toast ' + type; t.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle') + '"></i><span>' + msg + '</span>'; c.appendChild(t); setTimeout(function () { t.remove(); }, 3000); }

// ===== SIDEBAR MOBILE =====
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOv').classList.remove('show'); }
document.getElementById('menuToggle').addEventListener('click', function () { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarOv').classList.toggle('show'); });
document.getElementById('sidebarOv').addEventListener('click', closeSidebar);

// ===== NAV & SEARCH =====
document.querySelectorAll('.nav-item[data-page]').forEach(function (n) { n.addEventListener('click', function () { navigateTo(n.dataset.page); }); });
document.getElementById('globalSearch').addEventListener('keyup', function (e) { if (e.key === 'Enter' && this.value.trim()) { var val = this.value.trim(); document.getElementById('txnSearch').value = val; if (currentPage !== 'transactions') navigateTo('transactions'); else renderTransactionsPage(); } });

// ===== DEMO DATA =====
function initDemoData() {
    var p = 'ft_demo_';

    // ALWAYS reset demo data (overwrite every time)
    localStorage.setItem(p + 'txn', JSON.stringify([
        { id: 1, name: 'Monthly Salary', amount: 5200, type: 'income', category: 'salary', date: daysAgo(0), note: '' },
        { id: 2, name: 'Freelance Website', amount: 800, type: 'income', category: 'freelance', date: daysAgo(3), note: 'Client project' },
        { id: 3, name: 'Stock Dividends', amount: 120, type: 'income', category: 'investment', date: daysAgo(5), note: '' },
        { id: 4, name: 'Grocery Store', amount: 142, type: 'expense', category: 'food', date: daysAgo(0), note: 'Weekly groceries' },
        { id: 5, name: 'Electric Bill', amount: 95, type: 'expense', category: 'bills', date: daysAgo(1), note: '' },
        { id: 6, name: 'Uber Rides', amount: 48, type: 'expense', category: 'transport', date: daysAgo(1), note: '' },
        { id: 7, name: 'Netflix', amount: 15, type: 'expense', category: 'entertainment', date: daysAgo(2), note: 'Monthly sub' },
        { id: 8, name: 'Amazon', amount: 89, type: 'expense', category: 'shopping', date: daysAgo(2), note: 'Headphones' },
        { id: 9, name: 'Restaurant', amount: 65, type: 'expense', category: 'food', date: daysAgo(3), note: 'With friends' },
        { id: 10, name: 'Gym', amount: 40, type: 'expense', category: 'health', date: daysAgo(4), note: 'Monthly' }
    ]));

    localStorage.setItem(p + 'bud', JSON.stringify({
        food: 300,
        transport: 150,
        shopping: 200,
        bills: 200,
        entertainment: 100,
        health: 100,
        education: 50,
        other: 100
    }));

    localStorage.setItem(p + 'goals', JSON.stringify([
        { id: 1, name: 'Vacation Fund', target: 3000, saved: 1250, color: '#06b6d4' },
        { id: 2, name: 'Emergency Fund', target: 10000, saved: 4200, color: '#10b981' },
        { id: 3, name: 'New Laptop', target: 1500, saved: 890, color: '#8b5cf6' }
    ]));

    localStorage.setItem(p + 'settings', JSON.stringify({
        name: 'Ankita Sanjay',
        currency: '$'
    }));

    localStorage.setItem(p + 'custom_cats', JSON.stringify([]));

    // IMPORTANT: reset notifications too
    localStorage.setItem(p + 'notifs', JSON.stringify([]));
}
// ===== INIT =====
document.addEventListener('DOMContentLoaded', function () {
    try {

        // FORCE read fresh value
        currentEmail = localStorage.getItem('ft_current_user');

        // HARD CLEAN check
        if (currentEmail === "null" || currentEmail === "undefined") {
            localStorage.removeItem('ft_current_user');
            currentEmail = null;
        }

        // FINAL MODE DECISION
        isDemo = !currentEmail;

        // IMPORTANT: prevent wrong carry state
        transactions = [];
        budgets = {};
        goals = [];
        customCategories = [];

        if (isDemo) {
            initDemoData();
        }

        load();
        populateDropdowns();
        updateSidebar();
        applyAuthUI();
        updateNotifBadge();
        navigateTo('dashboard');

    } catch (e) {
        console.error('Init error:', e);
    }
});