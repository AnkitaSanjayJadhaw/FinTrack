// ===== API CONFIG =====
var API = 'api.php';

// ===== AUTH STATE =====
var isDemo = true;
var isAdmin = false;
var adminViewingUserId = null;
var currentEmail = null;

// ===== CATEGORY CONFIG =====
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
    users: { title: 'All Users', desc: 'Admin panel — view and manage all registered users.' },
    settings: { title: 'Settings', desc: 'Customize your FinTrack experience.' },
    help: { title: 'Help', desc: 'Frequently asked questions and guides.' }
};

var FAQS = [
    { q: 'Can I edit a transaction?', a: 'Currently you can add and delete transactions. Editing is planned for a future update.' },
    { q: 'How do budgets work?', a: 'Set a monthly spending limit for each expense category. Red means exceeded.' },
    { q: 'What are Goals?', a: 'Goals let you set savings targets. Add funds over time and track progress.' },
    { q: 'Can I add custom categories?', a: 'Yes! Go to Categories page and click Add Category.' },
    { q: 'What is the demo?', a: 'The demo shows a pre-filled dashboard. No login needed. Register to get your own account.' }
];

// ===== STATE =====
var transactions = [], budgets = {}, goals = [], settings = {}, customCategories = [], notifications = [];
var currentPage = 'dashboard', txnFilterType = 'all', charts = {}, currentTxnType = 'expense';
var selectedCatColor = CAT_COLORS[0], pendingConfirmAction = null;

// ===== DEMO DATA =====
function daysAgo(n) { var d = new Date(); d.setDate(d.getDate() - n); return d.toISOString().split('T')[0]; }
function loadDemoData() {
    transactions = [
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
    ];
    budgets = { food: 300, transport: 150, shopping: 200, bills: 200, entertainment: 100, health: 100, education: 50, other: 100 };
    goals = [
        { id: 1, name: 'Vacation Fund', target: 3000, saved: 1250, color: '#06b6d4' },
        { id: 2, name: 'Emergency Fund', target: 10000, saved: 4200, color: '#10b981' },
        { id: 3, name: 'New Laptop', target: 1500, saved: 890, color: '#8b5cf6' }
    ];
    settings = { name: 'Ankita Sanjay', currency: '$' };
    customCategories = [];
    notifications = [];
}

// ===== API CALL =====
async function apiCall(data) {
    try {
        var res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await res.json();
    } catch (e) {
        console.error('API Error:', e);
        toast('Server connection error. Is WAMP running?', 'error');
        return null;
    }
}

async function loadData() {
    if (isDemo) { loadDemoData(); return; }
    var result = await apiCall({ action: 'get_data' });
    if (result && result.success) {
        var d = result.data;
        transactions = (d.transactions || []).map(function (t) {
            return { id: parseInt(t.id), name: t.name, amount: parseFloat(t.amount), type: t.type, category: t.category, date: t.date, note: t.note || '' };
        });
        budgets = {};
        (d.budgets || []).forEach(function (b) { budgets[b.category] = parseFloat(b.amount); });
        goals = (d.goals || []).map(function (g) {
            return { id: parseInt(g.id), name: g.name, target: parseFloat(g.target), saved: parseFloat(g.saved), color: g.color };
        });
        customCategories = (d.custom_categories || []).map(function (c) {
            return { key: c.category_key, name: c.name, color: c.color, type: c.type };
        });
        notifications = (d.notifications || []).map(function (n) {
            return { id: parseInt(n.id), message: n.message, type: n.type, time: n.created_at };
        });
        settings = d.settings || {};
    }
}

// ===== HELPERS =====
function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmt(n) { return (settings.currency || '$') + Math.round(n).toLocaleString(); }
function fmtDate(s) { return new Date(s + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function totalIncome() { return transactions.filter(function (t) { return t.type === 'income'; }).reduce(function (s, t) { return s + t.amount; }, 0); }
function totalExpense() { return transactions.filter(function (t) { return t.type === 'expense'; }).reduce(function (s, t) { return s + t.amount; }, 0); }
function catSpent(cat) { return transactions.filter(function (t) { return t.type === 'expense' && t.category === cat; }).reduce(function (s, t) { return s + t.amount; }, 0); }
function getCatData() {
    var exp = transactions.filter(function (t) { return t.type === 'expense'; });
    var m = {}; exp.forEach(function (t) { m[t.category] = (m[t.category] || 0) + t.amount; });
    var te = exp.reduce(function (s, t) { return s + t.amount; }, 0);
    return Object.keys(m).map(function (k) {
        var c = getCatConfig(k);
        return { key: k, total: m[k], pct: te > 0 ? ((m[k] / te) * 100).toFixed(1) : 0, icon: c.icon, cls: c.cls, color: c.color, label: c.label };
    }).sort(function (a, b) { return b.total - a.total; });
}
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

// ===== NOTIFICATIONS =====
function updateNotifBadge() {
    var b = document.getElementById('notifBadge');
    if (b) { b.textContent = notifications.length; b.style.display = notifications.length > 0 ? 'flex' : 'none'; }
}
function toggleNotifDropdown() {
    var dd = document.getElementById('notifDropdown');
    dd.classList.toggle('show');
    if (dd.classList.contains('show')) renderNotifs();
}
function renderNotifs() {
    var el = document.getElementById('notifList');
    if (!notifications.length) { el.innerHTML = '<div class="notif-empty"><i class="far fa-bell-slash"></i>No notifications</div>'; return; }
    el.innerHTML = notifications.map(function (item) {
        var iconCls = item.type === 'success' ? 'fa-check-circle' : item.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
        var ago = timeAgo(item.time);
        return '<div class="notif-item"><div class="notif-icon ' + (item.type || 'info') + '"><i class="fas ' + iconCls + '"></i></div><div class="notif-body"><div class="nb-msg">' + esc(item.message) + '</div><div class="nb-time">' + ago + '</div></div></div>';
    }).join('');
}
async function clearNotifications() {
    if (isDemo) { notifications = []; updateNotifBadge(); renderNotifs(); return; }
    await apiCall({ action: 'clear_notifications' });
    notifications = []; updateNotifBadge(); renderNotifs();
}
function timeAgo(iso) {
    if (!iso) return '';
    var s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'Just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
}
document.addEventListener('click', function (e) {
    var dd = document.getElementById('notifDropdown');
    var bell = document.getElementById('notifBell');
    if (dd && dd.classList.contains('show') && !bell.contains(e.target) && !dd.contains(e.target)) dd.classList.remove('show');
});

// ===== PASSWORD TOGGLE =====
function togglePass(inputId, btn) {
    var inp = document.getElementById(inputId);
    var icon = btn.querySelector('i');
    if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
    else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}

// ===== CHART HELPERS =====
function mkChart(id, cfg) {
    if (charts[id]) { charts[id].destroy(); delete charts[id]; }
    var ctx = document.getElementById(id);
    if (!ctx) return null;
    charts[id] = new Chart(ctx.getContext('2d'), cfg);
    return charts[id];
}
function destroyPageCharts(page) {
    var m = { dashboard: ['dashBar', 'dashDoughnut'], analytics: ['analyticsLine', 'analyticsDoughnut'] };
    (m[page] || []).forEach(function (id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } });
}
var chartTooltip = { backgroundColor: '#1e293b', titleFont: { family: 'Inter', size: 12 }, bodyFont: { family: 'Inter', size: 12 }, padding: 12, cornerRadius: 8 };
var chartLegend = { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 16, font: { family: 'Inter', size: 12, weight: '500' } } };

// ===== AUTH UI =====
function applyAuthUI() {
    var banner = document.getElementById('demoBanner');
    var demoBtns = document.getElementById('demoAuthBtns');
    var logInfo = document.getElementById('loggedInInfo');
    var passSec = document.getElementById('settingsPassword');
    var navUsers = document.getElementById('navUsers');
    var adminLabel = document.getElementById('adminNavLabel');
    var adminBanner = document.getElementById('adminViewBanner');
    var dataSec = document.getElementById('settingsData');

    if (isDemo) {
        banner.style.display = 'flex';
        demoBtns.style.display = 'flex';
        logInfo.style.display = 'none';
        passSec.style.display = 'none';
        navUsers.style.display = 'none';
        adminLabel.style.display = 'none';
        adminBanner.style.display = 'none';
        dataSec.style.display = 'none';
    } else {
        banner.style.display = 'none';
        demoBtns.style.display = 'none';
        logInfo.style.display = 'flex';
        passSec.style.display = 'block';
        dataSec.style.display = 'block';

        var initials = (settings.name || 'U').split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
        document.getElementById('topbarAvatar').textContent = initials;
        document.getElementById('topbarName').textContent = settings.name || 'User';
        document.getElementById('topbarRole').textContent = isAdmin ? 'Admin' : 'My Account';

        if (isAdmin) {
            navUsers.style.display = 'flex';
            adminLabel.style.display = 'block';
        } else {
            navUsers.style.display = 'none';
            adminLabel.style.display = 'none';
        }

        if (adminViewingUserId) {
            adminBanner.style.display = 'flex';
        } else {
            adminBanner.style.display = 'none';
        }
    }
}

function showScreen(type) {
    document.getElementById('loginScreen').classList.remove('show');
    document.getElementById('registerScreen').classList.remove('show');
    if (type === 'login') document.getElementById('loginScreen').classList.add('show');
    if (type === 'register') document.getElementById('registerScreen').classList.add('show');
    document.body.style.overflow = 'hidden';
}
function backToDemo() {
    document.getElementById('loginScreen').classList.remove('show');
    document.getElementById('registerScreen').classList.remove('show');
    document.body.style.overflow = '';
}

// ===== LOADING =====
function showLoading(text) {
    var el = document.createElement('div');
    el.className = 'loading-overlay';
    el.id = 'loadingOverlay';
    el.innerHTML = '<div class="loading-spinner"></div><div class="loading-text">' + (text || 'Loading...') + '</div>';
    document.body.appendChild(el);
}
function hideLoading() {
    var el = document.getElementById('loadingOverlay');
    if (el) el.remove();
}

// ===== REGISTER =====

async function registerUser(e) {
    e.preventDefault();
    var first = document.getElementById('regFirst').value.trim();
    var last = document.getElementById('regLast').value.trim();
    var email = document.getElementById('regEmail').value.trim().toLowerCase();
    var pass = document.getElementById('regPass').value;
    var currency = document.getElementById('regCurrency').value;

    if (!first || !last) { toast('Enter your full name.', 'error'); return false; }
    if (!currency) { toast('Please select a currency first.', 'error'); return false; }
    if (pass.length < 8) { toast('Password must be at least 8 characters.', 'error'); return false; }

    showLoading('Creating account...');
    var result = await apiCall({ action: 'register', first: first, last: last, email: email, pass: pass, currency: currency });
    hideLoading();

    if (result && result.success) {
        toast('Account created! Welcome, ' + first + '!');
        setTimeout(function () { location.reload(); }, 800);
    } else {
        toast(result ? result.error : 'Registration failed.', 'error');
    }
    return false;
}

// ===== LOGIN =====
async function loginUser(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim().toLowerCase();
    var pass = document.getElementById('loginPass').value;
    showLoading('Logging in...');
    var result = await apiCall({ action: 'login', email: email, pass: pass });
    hideLoading();
    if (result && result.success) {
        toast('Welcome back!');
        setTimeout(function () { location.reload(); }, 800);
    } else {
        toast(result ? result.error : 'Login failed.', 'error');
    }
    return false;
}

// ===== ADMIN AUTO LOGIN =====
async function adminAutoLogin() {
    showLoading('Connecting as admin...');
    var result = await apiCall({ action: 'admin_auto_login' });
    hideLoading();
    if (result && result.success) {
        toast('Logged in as Admin!');
        setTimeout(function () { location.reload(); }, 800);
    } else {
        toast(result ? result.error : 'Admin login failed. Did you import database.sql?', 'error');
    }
}

// ===== LOGOUT =====
async function logoutUser() {
    if (!isDemo) await apiCall({ action: 'logout' });
    toast('Logged out.');
    setTimeout(function () { location.reload(); }, 500);
}

// ===== CHANGE PASSWORD =====
async function changePassword() {
    var np = document.getElementById('newPass').value;
    if (!np || np.length < 8) { toast('Password must be at least 8 characters.', 'error'); return; }
    var result = await apiCall({ action: 'change_password', new_pass: np });
    if (result && result.success) {
        document.getElementById('newPass').value = '';
        await loadData(); updateNotifBadge();
        toast('Password updated!');
    } else {
        toast(result ? result.error : 'Failed to update password.', 'error');
    }
}

// ===== ADMIN VIEW USER =====
async function adminViewUser(userId, userName) {
    showLoading('Loading user data...');
    var result = await apiCall({ action: 'admin_view_user', user_id: userId });
    hideLoading();
    if (result && result.success) {
        adminViewingUserId = userId;
        document.getElementById('adminViewName').textContent = userName;
        await loadData(); applyAuthUI(); navigateTo('dashboard');
        toast('Viewing ' + userName + "'s data");
    }
}

async function adminStopViewing() {
    showLoading('Switching back...');
    await apiCall({ action: 'admin_stop_viewing' });
    adminViewingUserId = null;
    await loadData(); applyAuthUI(); hideLoading();
    navigateTo('users');
    toast('Back to admin view');
}

// ===== SETTINGS =====
async function saveName() {
    if (isDemo) return;
    var name = document.getElementById('settingsName').value.trim();
    if (!name) return;
    await apiCall({ action: 'update_settings', name: name });
    settings.name = name; updateSidebar(); applyAuthUI();
    toast('Name updated!');
}
async function saveCurrency() {
    if (isDemo) return;
    var nc = document.getElementById('settingsCurrency').value;
    if (nc === settings.currency) return;
    showConfirm('Change Currency', 'Change currency to ' + nc + '?', 'All amounts will update to the new symbol.', 'Change', async function () {
        await apiCall({ action: 'update_settings', currency: nc });
        settings.currency = nc; refreshCurrent();
        toast('Currency updated to ' + nc);
    });
}

var resetClick = 0;
async function resetData() {
    if (isDemo) {
        showConfirm('Cannot Reset', "You can't delete demo data.", 'The demo uses sample data. Register to manage your own data.', 'Got It', function () { });
        return;
    }
    var btn = document.getElementById('resetBtn');
    if (resetClick === 0) {
        resetClick = 1; btn.textContent = 'Click Again to Confirm'; btn.classList.add('confirm');
        setTimeout(function () { resetClick = 0; btn.textContent = 'Reset Data'; btn.classList.remove('confirm'); }, 3000);
        return;
    }
    resetClick = 0; btn.textContent = 'Reset Data'; btn.classList.remove('confirm');
    showConfirm('Reset All Data?', 'This will permanently delete ALL your transactions, budgets, goals, and categories from the database.', 'This action cannot be undone.', 'Delete Everything', async function () {
        showLoading('Resetting data...');
        await apiCall({ action: 'reset_data' });
        await loadData(); populateDropdowns(); refreshCurrent(); hideLoading();
        toast('All data has been reset.', 'error');
    });
}

// ===== CONFIRM DIALOG =====
function showConfirm(title, message, warningText, btnText, callback) {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    var w = document.getElementById('confirmWarning');
    if (warningText) { w.style.display = 'flex'; document.getElementById('confirmWarningText').textContent = warningText; }
    else { w.style.display = 'none'; }
    document.getElementById('confirmActionBtn').textContent = btnText;
    pendingConfirmAction = callback;
    openModal('confirmDialog');
}
document.getElementById('confirmActionBtn').addEventListener('click', function () {
    if (pendingConfirmAction) { pendingConfirmAction(); pendingConfirmAction = null; }
    closeModal('confirmDialog');
});

// ===== ROUTER =====
function navigateTo(page) {
    destroyPageCharts(currentPage);
    currentPage = page;
    document.querySelectorAll('.page').forEach(function (p) { p.classList.remove('active'); });
    document.querySelector('.page[data-page="' + page + '"]').classList.add('active');
    document.querySelectorAll('.nav-item[data-page]').forEach(function (n) { n.classList.toggle('active', n.dataset.page === page); });
    document.getElementById('pageTitle').textContent = PAGE_META[page].title;
    document.getElementById('pageDesc').textContent = PAGE_META[page].desc;
    renderPage(page);
    closeSidebar();
}
function renderPage(page) {
    switch (page) {
        case 'dashboard': renderDashboard(); break;
        case 'transactions': renderTransactionsPage(); break;
        case 'analytics': renderAnalytics(); break;
        case 'budgets': renderBudgets(); break;
        case 'goals': renderGoals(); break;
        case 'categories': renderCategories(); break;
        case 'users': renderUsersPage(); break;
        case 'settings': renderSettings(); break;
        case 'help': renderHelp(); break;
    }
}
async function refreshCurrent() { await loadData(); updateNotifBadge(); renderPage(currentPage); }

// ===== DASHBOARD =====
function renderDashboard() {
    var inc = totalIncome(), exp = totalExpense(), bal = inc - exp, rate = inc > 0 ? ((bal / inc) * 100).toFixed(1) : 0;
    document.getElementById('dashSummary').innerHTML =
        '<div class="s-card inc"><div class="ch"><span class="lb">Total Income</span><div class="ci"><i class="fas fa-arrow-down"></i></div></div><div class="amt">' + fmt(inc) + '</div><div class="tr up"><i class="fas fa-arrow-up"></i> 12.5% <span>vs last month</span></div></div>' +
        '<div class="s-card exp"><div class="ch"><span class="lb">Total Expenses</span><div class="ci"><i class="fas fa-arrow-up"></i></div></div><div class="amt">' + fmt(exp) + '</div><div class="tr dn"><i class="fas fa-arrow-down"></i> 3.2% <span>vs last month</span></div></div>' +
        '<div class="s-card bal"><div class="ch"><span class="lb">Net Balance</span><div class="ci"><i class="fas fa-wallet"></i></div></div><div class="amt">' + fmt(bal) + '</div><div class="tr up"><i class="fas fa-arrow-up"></i> 8.1% <span>vs last month</span></div></div>' +
        '<div class="s-card sav"><div class="ch"><span class="lb">Savings Rate</span><div class="ci"><i class="fas fa-piggy-bank"></i></div></div><div class="amt">' + rate + '%</div><div class="tr up"><i class="fas fa-arrow-up"></i> 2.4% <span>vs last month</span></div></div>';

    mkChart('dashBar', {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                { label: 'Income', data: [0, 0, 5200, 0, 0, 800, 0], backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, borderSkipped: false, barPercentage: 0.6, categoryPercentage: 0.7 },
                { label: 'Expense', data: [142, 95, 48, 15, 89, 65, 184], backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6, borderSkipped: false, barPercentage: 0.6, categoryPercentage: 0.7 }
            ]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: chartLegend, tooltip: Object.assign({}, chartTooltip, { callbacks: { label: function (c) { return c.dataset.label + ': ' + fmt(c.parsed.y); } } }) },
            scales: { x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8' } }, y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8', callback: function (v) { return fmt(v); } } } }
        }
    });

    var cd = getCatData();
    mkChart('dashDoughnut', {
        type: 'doughnut',
        data: { labels: cd.map(function (c) { return c.label; }), datasets: [{ data: cd.map(function (c) { return c.total; }), backgroundColor: cd.map(function (c) { return c.color; }), borderWidth: 0, spacing: 3, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { display: false }, tooltip: Object.assign({}, chartTooltip, { callbacks: { label: function (c) { var t = c.dataset.data.reduce(function (a, b) { return a + b; }, 0); return fmt(c.parsed) + ' (' + ((c.parsed / t) * 100).toFixed(1) + '%)'; } } }) } }
    });

    document.getElementById('dashCatList').innerHTML = cd.slice(0, 4).map(function (c) {
        return '<div class="cat-item"><div class="cat-dot" style="background:' + c.color + '"></div><div class="cat-info"><div class="cn"><span>' + c.label + '</span><span class="cp">' + c.pct + '%</span></div><div class="cat-bar"><div class="cat-bar-fill" style="width:' + c.pct + '%;background:' + c.color + '"></div></div></div></div>';
    }).join('');

    var recent = transactions.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); }).slice(0, 5);
    document.getElementById('dashTxnList').innerHTML = recent.length ? recent.map(txnItemHTML).join('') : '<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions yet.</p></div>';

    document.getElementById('dashBreakdown').innerHTML = cd.length ? cd.map(function (c) {
        return '<div class="cat-item" style="margin-bottom:12px"><div class="cat-dot" style="background:' + c.color + '"></div><div class="cat-info"><div class="cn"><span>' + c.label + '</span><span class="cp">' + c.pct + '%</span></div><div class="cat-bar"><div class="cat-bar-fill" style="width:' + c.pct + '%;background:' + c.color + '"></div></div></div><span style="font-size:13px;font-weight:600;white-space:nowrap">' + fmt(c.total) + '</span></div>';
    }).join('') : '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>No expenses to show.</p></div>';
}

// ===== TRANSACTIONS =====
function txnItemHTML(t) {
    var c = getCatConfig(t.category); var isE = t.type === 'expense';
    return '<div class="txn-item"><div class="txn-icon ' + c.cls + '"><i class="fas ' + c.icon + '"></i></div><div class="txn-det"><div class="tn">' + esc(t.name) + '</div><div class="tc">' + c.label + '</div></div><div class="txn-amt"><div class="a ' + (isE ? 'ev' : 'iv') + '">' + (isE ? '-' : '+') + fmt(t.amount) + '</div><div class="d">' + fmtDate(t.date) + '</div></div>' + (!isDemo && !adminViewingUserId ? '<button class="del-btn" onclick="deleteTxn(' + t.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' : '') + '</div>';
}
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
    var canDelete = !isDemo && !adminViewingUserId;
    document.getElementById('txnFullList').innerHTML = list.length ? list.map(function (t) {
        var c = getCatConfig(t.category); var isE = t.type === 'expense';
        return '<div class="txn-item"><div class="txn-icon ' + c.cls + '"><i class="fas ' + c.icon + '"></i></div><div class="txn-det"><div class="tn">' + esc(t.name) + '</div><div class="tc">' + c.label + '</div></div><div class="txn-amt"><div class="a ' + (isE ? 'ev' : 'iv') + '">' + (isE ? '-' : '+') + fmt(t.amount) + '</div><div class="d">' + fmtDate(t.date) + '</div></div>' + (canDelete ? '<button class="del-btn" onclick="deleteTxn(' + t.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' : '') + '</div>';
    }).join('') : '<div class="empty-state"><i class="fas fa-receipt"></i><p>No transactions match your filters.</p></div>';
}

// ===== ANALYTICS =====
function renderAnalytics() {
    var exp = transactions.filter(function (t) { return t.type === 'expense'; }), uniqueDays = [];
    exp.forEach(function (t) { if (uniqueDays.indexOf(t.date) === -1) uniqueDays.push(t.date); });
    var avgDaily = exp.length ? (totalExpense() / Math.max(uniqueDays.length, 1)).toFixed(0) : 0;
    var topCat = getCatData()[0];
    var highest = exp.length ? Math.max.apply(null, exp.map(function (t) { return t.amount; })) : 0;

    document.getElementById('analyticsStats').innerHTML =
        '<div class="a-stat"><div class="as-i"><i class="fas fa-receipt"></i></div><div class="as-v">' + transactions.length + '</div><div class="as-l">Total Transactions</div></div>' +
        '<div class="a-stat"><div class="as-i"><i class="fas fa-calculator"></i></div><div class="as-v">' + fmt(avgDaily) + '</div><div class="as-l">Avg Daily Spend</div></div>' +
        '<div class="a-stat"><div class="as-i"><i class="fas fa-trophy"></i></div><div class="as-v" style="font-size:16px">' + (topCat ? topCat.label : 'N/A') + '</div><div class="as-l">Top Category</div></div>' +
        '<div class="a-stat"><div class="as-i"><i class="fas fa-arrow-up"></i></div><div class="as-v">' + fmt(highest) + '</div><div class="as-l">Highest Expense</div></div>';

    var days = [];
    for (var i = 13; i >= 0; i--) {
        var d = new Date(); d.setDate(d.getDate() - i);
        var ds = d.toISOString().split('T')[0];
        var da = exp.filter(function (t) { return t.date === ds; }).reduce(function (s, t) { return s + t.amount; }, 0);
        days.push({ label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), amount: da });
    }

    mkChart('analyticsLine', {
        type: 'line',
        data: { labels: days.map(function (d) { return d.label; }), datasets: [{ label: 'Daily Spending', data: days.map(function (d) { return d.amount; }), borderColor: '#4f46e5', backgroundColor: 'rgba(79,70,229,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#4f46e5', pointBorderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: Object.assign({}, chartTooltip, { callbacks: { label: function (c) { return 'Spent: ' + fmt(c.parsed.y); } } }) }, scales: { x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#94a3b8', maxRotation: 45 } }, y: { grid: { color: '#f1f5f9' }, ticks: { font: { family: 'Inter', size: 12 }, color: '#94a3b8', callback: function (v) { return fmt(v); } } } } }
    });

    var cd = getCatData();
    mkChart('analyticsDoughnut', {
        type: 'doughnut',
        data: { labels: cd.map(function (c) { return c.label; }), datasets: [{ data: cd.map(function (c) { return c.total; }), backgroundColor: cd.map(function (c) { return c.color; }), borderWidth: 0, spacing: 3, borderRadius: 4 }] },
        options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', boxWidth: 6, padding: 12, font: { family: 'Inter', size: 11 } } }, tooltip: Object.assign({}, chartTooltip, { callbacks: { label: function (c) { var total = c.dataset.data.reduce(function (a, b) { return a + b; }, 0); return fmt(c.parsed) + ' (' + ((c.parsed / total) * 100).toFixed(1) + '%)'; } } }) } }
    });

    var topExp = exp.slice().sort(function (a, b) { return b.amount - a.amount; }).slice(0, 5);
    document.getElementById('topExpenses').innerHTML = topExp.length ? topExp.map(function (t, idx) {
        var c = getCatConfig(t.category);
        return '<div class="te-item"><div class="te-rank">' + (idx + 1) + '</div><div class="te-info"><div class="te-n">' + esc(t.name) + '</div><div class="te-c">' + c.label + ' &middot; ' + fmtDate(t.date) + '</div></div><div class="te-amt">' + fmt(t.amount) + '</div></div>';
    }).join('') : '<div class="empty-state"><i class="fas fa-list"></i><p>No expenses yet.</p></div>';
}

// ===== BUDGETS =====
function renderBudgets() {
    var ac = getAllExpenseCats();
    ac.forEach(function (c) { if (budgets[c] === undefined) budgets[c] = 0; });
    var tb = ac.reduce(function (s, c) { return s + (budgets[c] || 0); }, 0);
    var ts = ac.reduce(function (s, c) { return s + catSpent(c); }, 0);
    var rem = tb - ts;

    document.getElementById('budgetOverview').innerHTML =
        '<div class="bo-card"><div class="bo-v" style="color:var(--primary)">' + fmt(tb) + '</div><div class="bo-l">Total Budget</div></div>' +
        '<div class="bo-card"><div class="bo-v" style="color:var(--danger)">' + fmt(ts) + '</div><div class="bo-l">Total Spent</div></div>' +
        '<div class="bo-card"><div class="bo-v" style="color:' + (rem >= 0 ? 'var(--success)' : 'var(--danger)') + '">' + fmt(rem) + '</div><div class="bo-l">' + (rem >= 0 ? 'Remaining' : 'Over Budget') + '</div></div>';

    var canEdit = !isDemo && !adminViewingUserId;

    document.getElementById('budgetList').innerHTML = ac.map(function (c) {
        var cat = getCatConfig(c), b = budgets[c] || 0, s = catSpent(c);
        var pct = b > 0 ? Math.min((s / b) * 100, 100) : 0;
        var over = s > b;
        var barColor = over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)';
        var statusColor = over ? 'var(--danger)' : pct > 75 ? 'var(--warning)' : 'var(--success)';
        var statusText = over ? 'Over by ' + fmt(s - b) : 'Remaining: ' + fmt(b - s);
        var inputHtml = canEdit
            ? '<div style="display:flex;align-items:center;gap:6px"><span style="font-size:12px;color:var(--text-muted)">' + (settings.currency || '$') + '</span><input class="budget-input" type="number" value="' + b + '" min="0" step="10" onchange="updateBudget(\'' + c + '\',this.value)"></div>'
            : '<div style="font-size:13px;font-weight:600;color:var(--text-sec);text-align:right;min-width:80px">' + fmt(b) + '</div>';

        return '<div class="budget-item"><div class="bi-icon" style="background:' + cat.color + '20;color:' + cat.color + '"><i class="fas ' + cat.icon + '"></i></div><div class="bi-info"><div class="bi-top"><span class="bi-name">' + cat.label + '</span><span class="bi-amts"><strong>' + fmt(s) + '</strong> / ' + fmt(b) + '</span></div><div class="bi-bar"><div class="bi-fill" style="width:' + pct + '%;background:' + barColor + '"></div></div><div class="bi-status" style="color:' + statusColor + '">' + statusText + '</div></div>' + inputHtml + '</div>';
    }).join('');
}

async function updateBudget(cat, val) {
    if (isDemo) return;
    await apiCall({ action: 'update_budget', category: cat, amount: parseFloat(val) || 0 });
    budgets[cat] = parseFloat(val) || 0;
    renderBudgets();
    toast('Budget updated!');
}

// ===== GOALS =====
function renderGoals() {
    document.getElementById('newGoalBtn').style.display = (!isDemo && !adminViewingUserId) ? 'flex' : 'none';
    document.getElementById('goalsGrid').innerHTML = goals.length ? goals.map(function (g) {
        var pct = Math.min((g.saved / g.target) * 100, 100), done = g.saved >= g.target;
        var canAct = !isDemo && !adminViewingUserId;
        return '<div class="goal-card ' + (done ? 'completed' : '') + '"><div class="gc-bar" style="background:' + g.color + '"></div><div class="gc-body"><div class="gc-done"><i class="fas fa-check-circle"></i> Goal Reached!</div><div class="gc-name">' + esc(g.name) + '</div><div class="gc-amt"><strong>' + fmt(g.saved) + '</strong> of ' + fmt(g.target) + '</div><div class="gc-prog"><div class="gc-fill" style="width:' + pct + '%;background:' + g.color + '"></div></div><div class="gc-pct">' + pct.toFixed(1) + '% complete</div><div class="gc-actions"><button class="gc-btn add" ' + (canAct ? 'onclick="openFundsModal(' + g.id + ',\'' + esc(g.name).replace(/'/g, "\\'") + '\')"' : 'style="display:none"') + '><i class="fas fa-plus"></i>Add Funds</button><button class="gc-btn del" ' + (canAct ? 'onclick="deleteGoal(' + g.id + ')"' : 'style="display:none"') + '><i class="fas fa-trash-alt"></i>Delete</button></div></div></div>';
    }).join('') : '<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-bullseye"></i><p>No goals yet.</p></div>';
}

function openGoalModal() { document.getElementById('goalName').value = ''; document.getElementById('goalTarget').value = ''; openModal('goalModal'); }
async function handleCreateGoal(e) {
    e.preventDefault();
    if (isDemo) return false;
    var name = document.getElementById('goalName').value.trim(), target = parseFloat(document.getElementById('goalTarget').value), color = document.getElementById('goalColor').value;
    if (!name || !target) return false;
    var result = await apiCall({ action: 'create_goal', name: name, target: target, color: color });
    if (result && result.success) { await loadData(); renderGoals(); closeModal('goalModal'); toast('Goal "' + name + '" created!'); }
    return false;
}
function openFundsModal(id, name) { document.getElementById('fundsGoalId').value = id; document.getElementById('fundsGoalName').textContent = 'Adding funds to: ' + name; document.getElementById('fundsAmt').value = ''; openModal('fundsModal'); }
async function handleAddFunds(e) {
    e.preventDefault();
    var id = parseInt(document.getElementById('fundsGoalId').value), amt = parseFloat(document.getElementById('fundsAmt').value);
    if (!amt || amt <= 0) return false;
    var result = await apiCall({ action: 'add_funds', goal_id: id, amount: amt, currency: settings.currency || '$' });
    if (result && result.success) { await loadData(); renderGoals(); closeModal('fundsModal'); toast(result.data.reached ? 'Goal reached!' : fmt(amt) + ' added!'); }
    return false;
}
async function deleteGoal(id) {
    if (isDemo) return;
    showConfirm('Delete Goal', 'Are you sure you want to delete this goal?', null, 'Delete', async function () {
        await apiCall({ action: 'delete_goal', id: id });
        await loadData(); renderGoals();
        toast('Goal deleted.', 'error');
    });
}

// ===== CATEGORIES =====
function renderCategories() {
    var canDel = !isDemo && !adminViewingUserId;
    document.getElementById('catGrid').innerHTML = getAllExpenseCats().map(function (k) {
        var cat = getCatConfig(k), total = catSpent(k), cnt = catTxnCount(k);
        var delBtn = (canDel && !cat.builtin) ? '<button class="cc-del" onclick="deleteCategory(\'' + k + '\')" title="Delete"><i class="fas fa-times"></i></button>' : '';
        return '<div class="cat-card"><div class="cc-icon" style="background:' + cat.color + '18;color:' + cat.color + '"><i class="fas ' + cat.icon + '"></i></div>' + delBtn + '<div class="cc-name">' + cat.label + '</div><div class="cc-total" style="color:' + (total > 0 ? 'var(--text)' : 'var(--text-muted)') + '">' + fmt(total) + '</div><div class="cc-cnt">' + cnt + ' transaction' + (cnt !== 1 ? 's' : '') + '</div></div>';
    }).join('');
    document.getElementById('incCatGrid').innerHTML = getAllIncomeCats().map(function (k) {
        var cat = getCatConfig(k), total = catSpent(k), cnt = catTxnCount(k);
        var delBtn = (canDel && !cat.builtin) ? '<button class="cc-del" onclick="deleteCategory(\'' + k + '\')" title="Delete"><i class="fas fa-times"></i></button>' : '';
        return '<div class="cat-card"><div class="cc-icon" style="background:' + cat.color + '18;color:' + cat.color + '"><i class="fas ' + cat.icon + '"></i></div>' + delBtn + '<div class="cc-name">' + cat.label + '</div><div class="cc-total" style="color:' + (total > 0 ? 'var(--text)' : 'var(--text-muted)') + '">' + fmt(total) + '</div><div class="cc-cnt">' + cnt + ' transaction' + (cnt !== 1 ? 's' : '') + '</div></div>';
    }).join('');
}

function openCatModal(type) {
    document.getElementById('catTypeInput').value = type;
    document.getElementById('catModalTitle').textContent = type === 'expense' ? 'Add Expense Category' : 'Add Income Source';
    document.getElementById('catNameInput').value = '';
    selectedCatColor = CAT_COLORS[0];
    renderColorPicker();
    openModal('catModal');
}
function renderColorPicker() {
    document.getElementById('catColorPicker').innerHTML = CAT_COLORS.map(function (c) {
        return '<div class="color-opt' + (c === selectedCatColor ? ' selected' : '') + '" style="background:' + c + '" onclick="selectCatColor(\'' + c + '\',this)"></div>';
    }).join('');
}
function selectCatColor(color, el) { selectedCatColor = color; document.querySelectorAll('.color-opt').forEach(function (e) { e.classList.remove('selected'); }); el.classList.add('selected'); }

async function handleCreateCategory(e) {
    e.preventDefault();
    if (isDemo) return false;
    var name = document.getElementById('catNameInput').value.trim(), type = document.getElementById('catTypeInput').value;
    if (!name) { toast('Enter a category name.', 'error'); return false; }
    var result = await apiCall({ action: 'create_category', name: name, color: selectedCatColor, type: type });
    if (result && result.success) { await loadData(); populateDropdowns(); renderCategories(); renderBudgets(); closeModal('catModal'); toast('"' + name + '" added!'); }
    return false;
}

function deleteCategory(key) {
    if (isDemo) return;
    var cat = getCatConfig(key), cnt = catTxnCount(key);
    var warning = cnt > 0 ? cnt + ' transaction' + (cnt !== 1 ? 's' : '') + ' use this category.' : null;
    showConfirm('Delete Category', 'Delete "' + cat.label + '"?', warning, 'Delete', async function () {
        await apiCall({ action: 'delete_category', key: key });
        await loadData(); populateDropdowns(); renderCategories(); renderBudgets();
        toast('"' + cat.label + '" deleted.', 'error');
    });
}

// ===== USERS PAGE (ADMIN) =====

async function renderUsersPage() {
    if (!isAdmin) return;
    showLoading('Loading users...');
    var result = await apiCall({ action: 'admin_get_users' });
    hideLoading();
    if (!result || !result.success) { toast('Failed to load users.', 'error'); return; }
    var users = result.data;
    var totalUsers = users.length, totalTxns = 0, totalInc = 0, totalExp = 0;
    users.forEach(function (u) { totalTxns += parseInt(u.txn_count); totalInc += parseFloat(u.total_income); totalExp += parseFloat(u.total_expense); });

    document.getElementById('usersStats').innerHTML =
        '<div class="us-card"><div class="us-v" style="color:var(--primary)">' + totalUsers + '</div><div class="us-l">Total Users</div></div>' +
        '<div class="us-card"><div class="us-v" style="color:var(--success)">' + fmt(totalInc) + '</div><div class="us-l">Total Income (All)</div></div>' +
        '<div class="us-card"><div class="us-v" style="color:var(--danger)">' + fmt(totalExp) + '</div><div class="us-l">Total Expenses (All)</div></div>';

    document.getElementById('usersTable').innerHTML = users.length ? '<table class="users-table"><thead><tr><th>User</th><th>Role</th><th>Transactions</th><th>Income</th><th>Expenses</th><th>Joined</th><th>Actions</th></tr></thead><tbody>' +
        users.map(function (u) {
            var fullName = u.first_name + ' ' + u.last_name;
            return '<tr><td><div class="ut-name">' + esc(fullName) + '</div><div class="ut-email">' + esc(u.email) + '</div></td><td><span class="ut-role ' + u.role + '">' + u.role + '</span></td><td>' + u.txn_count + '</td><td class="ut-amt green">' + (u.currency || '$') + Math.round(parseFloat(u.total_income)).toLocaleString() + '</td><td class="ut-amt red">' + (u.currency || '$') + Math.round(parseFloat(u.total_expense)).toLocaleString() + '</td><td class="ut-date">' + new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + '</td><td><div class="ut-actions">' +
                (u.role !== 'admin' ? '<button class="ut-btn view" onclick="adminViewUser(' + u.id + ',\'' + esc(fullName).replace(/'/g, "\\'") + '\')"><i class="fas fa-eye"></i>View</button>' : '') +
                (u.role !== 'admin' ? '<button class="ut-btn del" onclick="adminDeleteUser(' + u.id + ',\'' + esc(fullName).replace(/'/g, "\\'") + '\')"><i class="fas fa-trash-alt"></i></button>' : '') +
                '</div></td></tr>';
        }).join('') + '</tbody></table>'
        : '<div class="empty-state"><i class="fas fa-users"></i><p>No users registered yet.</p></div>';
}

async function adminDeleteUser(id, name) {
    showConfirm('Delete User', 'Delete "' + name + '" and ALL their data permanently?', 'This will delete all their transactions, budgets, goals, and categories from the database.', 'Delete User', async function () {
        showLoading('Deleting user...');
        await apiCall({ action: 'admin_delete_user', user_id: id });
        hideLoading();
        renderUsersPage();
        toast('"' + name + '" deleted.', 'error');
    });
} 
// ===== SETTINGS =====
function renderSettings() {
    document.getElementById('settingsName').value = settings.name || '';
    document.getElementById('settingsCurrency').value = settings.currency || '$';
}

function updateSidebar() {
    var n = settings.name || (isDemo ? 'Ankita Sanjay' : 'User');
    document.getElementById('sidebarName').textContent = n;
    document.getElementById('sidebarAvatar').textContent = n.split(' ').map(function (w) { return w[0] || ''; }).join('').toUpperCase().slice(0, 2);
    document.getElementById('sidebarRole').textContent = isDemo ? 'Demo Mode' : (isAdmin ? 'Admin' : 'My Account');
}

// ===== HELP =====
function renderHelp() {
    document.getElementById('faqList').innerHTML = FAQS.map(function (f, i) {
        return '<div class="accordion-item"><div class="accordion-q" onclick="toggleFaq(' + i + ')">' + f.q + '<i class="fas fa-chevron-down"></i></div><div class="accordion-a" id="faq-' + i + '">' + f.a + '</div></div>';
    }).join('');
}
function toggleFaq(i) {
    var a = document.getElementById('faq-' + i), q = a.previousElementSibling, wasOpen = a.classList.contains('open');
    document.querySelectorAll('.accordion-a').forEach(function (x) { x.classList.remove('open'); });
    document.querySelectorAll('.accordion-q').forEach(function (x) { x.classList.remove('open'); });
    if (!wasOpen) { a.classList.add('open'); q.classList.add('open'); }
}

// ===== MODALS =====
function openModal(id) { document.getElementById(id).classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeModal(id) {
    document.getElementById(id).classList.remove('show');
    document.body.style.overflow = '';
    if (id === 'txnModal') { var form = document.getElementById('txnModal').querySelector('form'); if (form) form.reset(); setType('expense'); }
}
document.getElementById('fabBtn').addEventListener('click', function () {
    if (isDemo || adminViewingUserId) { toast('Login to add transactions.', 'error'); return; }
    document.getElementById('txnDate').value = new Date().toISOString().split('T')[0];
    openModal('txnModal');
});
document.querySelectorAll('.modal-ov').forEach(function (ov) { ov.addEventListener('click', function (e) { if (e.target === ov) closeModal(ov.id); }); });
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { document.querySelectorAll('.modal-ov.show').forEach(function (m) { closeModal(m.id); }); backToDemo(); }
});
function setType(type) {
    currentTxnType = type;
    document.getElementById('expBtn').className = 'type-btn' + (type === 'expense' ? ' ate' : '');
    document.getElementById('incBtn').className = 'type-btn' + (type === 'income' ? ' ati' : '');
    document.getElementById('expCatGrp').style.display = type === 'expense' ? 'block' : 'none';
    document.getElementById('incCatGrp').style.display = type === 'income' ? 'block' : 'none';
}

// ===== ADD / DELETE TRANSACTION =====
async function handleAddTxn(e) {
    e.preventDefault();
    if (isDemo) return false;
    var nameEl = document.getElementById('txnName'), amtEl = document.getElementById('txnAmt'), dateEl = document.getElementById('txnDate'), noteEl = document.getElementById('txnNote'), catEl = document.getElementById('txnCat'), incCatEl = document.getElementById('txnIncCat');
    var name = nameEl.value.trim(), amount = parseFloat(amtEl.value), date = dateEl.value, note = noteEl.value.trim(), category = currentTxnType === 'expense' ? catEl.value : incCatEl.value;
    if (!name) { toast('Enter a description.', 'error'); nameEl.focus(); return false; }
    if (!amount || amount <= 0) { toast('Enter a valid amount.', 'error'); amtEl.focus(); return false; }
    if (!date) { toast('Pick a date.', 'error'); dateEl.focus(); return false; }
    if (!category) { toast('Select a category.', 'error'); return false; }
    var result = await apiCall({ action: 'add_transaction', name: name, amount: amount, type: currentTxnType, category: category, date: date, note: note, currency: settings.currency || '$' });
    if (result && result.success) {
        await loadData(); updateNotifBadge(); refreshCurrent(); closeModal('txnModal');
        toast((currentTxnType === 'income' ? 'Income' : 'Expense') + ' of ' + fmt(amount) + ' added!');
    }
    return false;
}

async function deleteTxn(id) {
    if (isDemo) return;
    showConfirm('Delete Transaction', 'Are you sure you want to delete this transaction?', null, 'Delete', async function () {
        await apiCall({ action: 'delete_transaction', id: id });
        await loadData(); updateNotifBadge(); refreshCurrent();
        toast('Transaction deleted.', 'error');
    });
}

// ===== TOAST =====
function toast(msg, type) {
    type = type || 'success';
    var c = document.getElementById('toastC'), t = document.createElement('div');
    t.className = 'toast ' + type;
    t.innerHTML = '<i class="fas ' + (type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle') + '"></i><span>' + msg + '</span>';
    c.appendChild(t);
    setTimeout(function () { t.remove(); }, 3000);
}

// ===== SIDEBAR MOBILE =====
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOv').classList.remove('show'); }
document.getElementById('menuToggle').addEventListener('click', function () { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarOv').classList.toggle('show'); });
document.getElementById('sidebarOv').addEventListener('click', closeSidebar);

// ===== NAV & SEARCH =====
document.querySelectorAll('.nav-item[data-page]').forEach(function (n) { n.addEventListener('click', function () { navigateTo(n.dataset.page); }); });
document.getElementById('globalSearch').addEventListener('keyup', function (e) { if (e.key === 'Enter' && this.value.trim()) { document.getElementById('txnSearch').value = this.value.trim(); if (currentPage !== 'transactions') navigateTo('transactions'); else renderTransactionsPage(); } });

// ===== BAR CHART FILTER =====
function updateBarChart(period, btn) {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    renderDashboard();
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', async function () {
    try {
        var result = await apiCall({ action: 'check_session' });

        if (result && result.success) {
            isDemo = false;
            isAdmin = result.data.role === 'admin';
            adminViewingUserId = result.data.viewing_user_id || null;
            currentEmail = result.data.email;
            await loadData();
        } else {
            isDemo = true;
            loadDemoData();
        }

        populateDropdowns();
        updateSidebar();
        applyAuthUI();
        updateNotifBadge();
        navigateTo('dashboard');
    } catch (e) {
        console.error('Init error:', e);
        isDemo = true;
        loadDemoData();
        populateDropdowns();
        updateSidebar();
        applyAuthUI();
        navigateTo('dashboard');
    }
});
