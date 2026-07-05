// ===== ADMIN JAVASCRIPT =====

(function() {
    'use strict';

    // ===== CHECK ADMIN LOGIN =====
    if (!localStorage.getItem('lumina_admin')) {
        // Don't redirect on login page
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
        return;
    }

    // ===== DOM REFS =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    // ===== LOAD DATA =====
    function loadDashboard() {
        const users = JSON.parse(localStorage.getItem('lumina_users') || '[]');
        const visits = parseInt(localStorage.getItem('lumina_visits') || '0');
        const shares = parseInt(localStorage.getItem('lumina_total_shares') || '0');
        const claimed = users.filter(u => u.claimed).length;

        // Update stats
        const stats = {
            totalVisits: visits,
            totalPhones: users.length,
            totalShares: shares,
            totalClaimed: claimed
        };

        Object.keys(stats).forEach(key => {
            const el = document.getElementById(key);
            if (el) el.textContent = stats[key].toLocaleString();
        });

        // Build users table
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: rgba(255,255,255,0.2); padding: 40px;">
                        <i class="fas fa-users"></i> No users yet
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = users.slice(-50).reverse().map((user, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${user.phone || 'N/A'}</td>
                <td><span class="network-badge">${(user.network || 'N/A').toUpperCase()}</span></td>
                <td>${user.name || 'Anonymous'}</td>
                <td>${user.shares || 0}</td>
                <td>${user.claimed ? '✅ Yes' : '❌ No'}</td>
                <td>${new Date(user.date).toLocaleString()}</td>
            </tr>
        `).join('');
    }

    // ===== EXPORT CSV =====
    function exportCSV() {
        const users = JSON.parse(localStorage.getItem('lumina_users') || '[]');
        
        const headers = ['Phone', 'Network', 'Name', 'Email', 'State', 'Shares', 'Claimed', 'Date'];
        const rows = users.map(user => [
            user.phone || '',
            user.network || '',
            user.name || '',
            user.email || '',
            user.state || '',
            user.shares || 0,
            user.claimed ? 'Yes' : 'No',
            new Date(user.date).toLocaleString()
        ]);
        
        let csv = headers.join(',') + '\n';
        rows.forEach(row => {
            csv += row.join(',') + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `lumina_users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    // ===== ACTIVITY LOG =====
    function addActivity(message) {
        const log = document.getElementById('activityLog');
        if (!log) return;
        
        const div = document.createElement('div');
        div.style.cssText = 'padding: 4px 0; animation: fadeUp 0.3s ease;';
        div.textContent = message;
        log.insertBefore(div, log.firstChild);
        
        if (log.children.length > 10) {
            log.removeChild(log.lastChild);
        }
    }

    // ===== SIMULATE ACTIVITY =====
    const activities = [
        () => `📱 New user registered: 080****${Math.floor(1000 + Math.random() * 9000)}`,
        () => `✅ User claimed reward: 080****${Math.floor(1000 + Math.random() * 9000)}`,
        () => `📤 User shared offer: 080****${Math.floor(1000 + Math.random() * 9000)}`,
        () => `📥 User completed verification: 080****${Math.floor(1000 + Math.random() * 9000)}`,
        () => `🔥 ${Math.floor(Math.random() * 50 + 10)} users online now`,
        () => `📊 ${Math.floor(Math.random() * 100 + 50)} shares in the last hour`
    ];

    // ===== INIT =====
    document.addEventListener('DOMContentLoaded', function() {
        loadDashboard();

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', exportCSV);
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (confirm('Are you sure you want to logout?')) {
                    localStorage.removeItem('lumina_admin');
                    window.location.href = 'login.html';
                }
            });
        }

        // Navigation
        const navLinks = {
            navUsers: '.stats-grid',
            navLeads: '.table-container',
            navExport: null
        };

        Object.keys(navLinks).forEach(id => {
            const el = document.getElementById(id);
            if (el && navLinks[id]) {
                el.addEventListener('click', function(e) {
                    e.preventDefault();
                    const target = document.querySelector(navLinks[id]);
                    if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            }
        });

        // Activity simulation
        setInterval(() => {
            const msg = activities[Math.floor(Math.random() * activities.length)]();
            addActivity(msg);
        }, 5000);

        // Refresh data every 10 seconds
        setInterval(() => {
            loadDashboard();
        }, 10000);

        console.log('📊 Admin dashboard initialized');
        console.log(`👥 ${JSON.parse(localStorage.getItem('lumina_users') || '[]').length} total users`);
    });

})();
