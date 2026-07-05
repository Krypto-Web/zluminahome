// ===== MAIN JAVASCRIPT - LUMINA HOME =====

(function() {
    'use strict';

    // ===== DOM REFS =====
    const $ = (sel) => document.querySelector(sel);
    const sections = {
        intro: $('#sectionIntro'),
        loader: $('#sectionLoader'),
        phone: $('#sectionPhone'),
        activating: $('#sectionActivating'),
        share: $('#sectionShare'),
        claim: $('#sectionClaim')
    };

    const btnGetOffer = $('#btnGetOffer');
    const btnSend = $('#btnSend');
    const btnShare = $('#btnShare');
    const btnActivateData = $('#btnActivateData');
    const btnActivateAirtime = $('#btnActivateAirtime');
    const phoneInput = $('#phoneInput');
    const phoneError = $('#phoneError');
    const networkSelect = $('#networkSelect');
    const networkError = $('#networkError');
    const loaderProgress = $('#loaderProgress');
    const activationBar = $('#activationBar');
    const activationStatus = $('#activationStatus');
    const shareBar = $('#shareBar');
    const shareStatus = $('#shareStatus');

    // ===== STATE =====
    const STORAGE_KEY = 'lumina_share_progress';
    let shareProgress = parseInt(localStorage.getItem(STORAGE_KEY)) || 0;

    // ===== TRACK VISIT =====
    function trackVisit() {
        let visits = parseInt(localStorage.getItem('lumina_visits') || '0');
        visits++;
        localStorage.setItem('lumina_visits', visits);
    }
    trackVisit();

    // ===== UTILITY =====
    function showSection(id) {
        Object.keys(sections).forEach(key => {
            sections[key].classList.toggle('active', key === id);
        });
    }

    function validatePhone(phone) {
        return /^[0-9]{11}$/.test(phone.replace(/\D/g, ''));
    }

    function saveUser(data) {
        const users = JSON.parse(localStorage.getItem('lumina_users') || '[]');
        users.push({
            ...data,
            date: new Date().toISOString(),
            shares: 0,
            claimed: false
        });
        localStorage.setItem('lumina_users', JSON.stringify(users));
    }

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== COUNTDOWN =====
    let count = 4548;
    const timer = $('#countdownTimer');
    if (timer) {
        setInterval(() => {
            count += Math.floor(Math.random() * 400) + 50;
            timer.textContent = count.toLocaleString();
        }, 2000);
    }

    // ===== STEP 1: GET OFFER =====
    if (btnGetOffer) {
        btnGetOffer.addEventListener('click', function() {
            if (!networkSelect.value) {
                networkSelect.classList.add('error');
                networkError.classList.add('show');
                networkSelect.focus();
                return;
            }
            networkSelect.classList.remove('error');
            networkError.classList.remove('show');

            // Save network
            localStorage.setItem('lumina_network', networkSelect.value);

            showSection('loader');
            simulateLoader();
        });

        networkSelect.addEventListener('change', function() {
            if (this.value) {
                this.classList.remove('error');
                networkError.classList.remove('show');
            }
        });

        networkSelect.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value) {
                btnGetOffer.click();
            }
        });
    }

    async function simulateLoader() {
        for (let i = 0; i <= 100; i += Math.floor(Math.random() * 15) + 5) {
            if (i > 100) i = 100;
            if (loaderProgress) loaderProgress.textContent = i + '%';
            await sleep(150 + Math.random() * 200);
        }
        showSection('phone');
        if (phoneInput) phoneInput.focus();
    }

    // ===== STEP 2: SEND PHONE =====
    if (btnSend) {
        btnSend.addEventListener('click', function() {
            const phone = phoneInput.value.trim();
            if (!validatePhone(phone)) {
                phoneInput.classList.add('error');
                phoneError.classList.add('show');
                return;
            }
            phoneInput.classList.remove('error');
            phoneError.classList.remove('show');

            // Save phone
            localStorage.setItem('lumina_phone', phone);
            saveUser({ phone, network: localStorage.getItem('lumina_network') || 'MTN' });

            showSection('activating');
            simulateActivation();
        });

        if (phoneInput) {
            phoneInput.addEventListener('input', function() {
                this.value = this.value.replace(/\D/g, '').slice(0, 11);
                if (this.value.length === 11) {
                    this.classList.remove('error');
                    phoneError.classList.remove('show');
                }
            });

            phoneInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') btnSend.click();
            });
        }
    }

    async function simulateActivation() {
        const statuses = ['Connecting...', 'Verifying number...', 'Checking eligibility...', 'Almost done...'];
        for (let i = 0; i <= 100; i += Math.floor(Math.random() * 10) + 2) {
            if (i > 100) i = 100;
            if (activationBar) activationBar.style.width = i + '%';
            if (activationStatus) activationStatus.textContent = i + '%';
            const idx = Math.min(Math.floor(i / 25), statuses.length - 1);
            await sleep(200 + Math.random() * 250);
        }
        await sleep(500);
        showSection('share');
        restoreShareProgress();
    }

    // ===== STEP 3: SHARE =====
    function restoreShareProgress() {
        if (shareProgress > 0) {
            if (shareBar) shareBar.style.width = shareProgress + '%';
            if (shareStatus) shareStatus.textContent = shareProgress + '%';
            if (shareProgress >= 100) {
                showSection('claim');
            }
        }
    }

    if (btnShare) {
        btnShare.addEventListener('click', function() {
            const shareText = encodeURIComponent(
                '🎉 *LUMINA HOME ANNIVERSARY GIVEAWAY!* 🎉\n\n' +
                'Get 10GB Free Data + ₦5,000 Airtime!\n' +
                'In collaboration with MTN, Airtel, Glo & 9-Mobile.\n\n' +
                '👉 Claim yours: ' + window.location.origin + '/index.html'
            );
            const whatsappUrl = 'https://api.whatsapp.com/send?text=' + shareText;
            window.open(whatsappUrl, '_blank');

            // Update share count
            let totalShares = parseInt(localStorage.getItem('lumina_total_shares') || '0');
            totalShares++;
            localStorage.setItem('lumina_total_shares', totalShares);

            // Simulate progress
            if (shareProgress < 100) {
                const increments = {
                    0: 50,
                    50: 15,
                    65: 10,
                    75: 8,
                    83: 5,
                    88: 4,
                    92: 3,
                    95: 2,
                    97: 3
                };
                let added = 0;
                for (let threshold in increments) {
                    if (shareProgress >= parseInt(threshold)) {
                        added = increments[threshold];
                    }
                }
                shareProgress = Math.min(shareProgress + (added || 2), 100);
                localStorage.setItem(STORAGE_KEY, shareProgress);

                if (shareBar) shareBar.style.width = shareProgress + '%';
                if (shareStatus) shareStatus.textContent = shareProgress + '%';

                // Update user shares
                const users = JSON.parse(localStorage.getItem('lumina_users') || '[]');
                if (users.length > 0) {
                    users[users.length - 1].shares = (users[users.length - 1].shares || 0) + 1;
                    localStorage.setItem('lumina_users', JSON.stringify(users));
                }

                if (shareProgress >= 100) {
                    setTimeout(() => {
                        showSection('claim');
                        // Mark as claimed
                        const users = JSON.parse(localStorage.getItem('lumina_users') || '[]');
                        if (users.length > 0) {
                            users[users.length - 1].claimed = true;
                            localStorage.setItem('lumina_users', JSON.stringify(users));
                        }
                    }, 600);
                }
            }
        });
    }

    // ===== STEP 4: CLAIM =====
    if (btnActivateData) {
        btnActivateData.addEventListener('click', function() {
            window.open('https://omg10.com/4/11169333', '_blank');
        });
    }

    if (btnActivateAirtime) {
        btnActivateAirtime.addEventListener('click', function() {
            window.open('https://omg10.com/4/11169333', '_blank');
        });
    }

    // ===== PRE-LOADER =====
    const preLoader = document.getElementById('preLoader');
    if (preLoader) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                preLoader.classList.add('hidden');
            }, 800);
        });
    }

    // ===== COMMENT INPUT =====
    const commentInput = $('#commentInput');
    if (commentInput) {
        commentInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                const comment = this.value.trim();
                const container = this.closest('.comments-section');
                const newComment = document.createElement('div');
                newComment.className = 'comment-item';
                newComment.style.animation = 'fadeUp 0.3s ease';
                newComment.innerHTML = `
                    <div style="width: 36px; height: 36px; min-width: 36px; border-radius: 50%; background: #ffd700; display: flex; align-items: center; justify-content: center; color: #1a1a2e; font-weight: 700; font-size: 16px;">U</div>
                    <div class="body">
                        <span class="name">Anonymous <span class="badge">New</span></span>
                        <div class="text">${comment}</div>
                        <div class="meta">
                            <span>Just now</span>
                            <span>·</span>
                            <span>Like</span>
                            <span>·</span>
                            <span>Reply</span>
                        </div>
                    </div>
                `;
                const commentSection = container.querySelector('.comment-item:last-child');
                if (commentSection) {
                    commentSection.parentNode.insertBefore(newComment, commentSection.nextSibling);
                } else {
                    container.appendChild(newComment);
                }
                this.value = '';
                
                // Update comment count
                const count = container.querySelector('.counter .count:last-child');
                if (count) {
                    const current = parseInt(count.textContent.replace(/[^0-9]/g, ''));
                    if (!isNaN(current)) {
                        count.textContent = (current + 1).toLocaleString() + ' comments';
                    }
                }
            }
        });
    }

    console.log('✅ Lumina Home loaded successfully');
    console.log('📱 Phone saved:', localStorage.getItem('lumina_phone') || 'None');
    console.log('📊 Total users:', JSON.parse(localStorage.getItem('lumina_users') || '[]').length);

})();
