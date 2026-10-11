const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const resultsSection = document.getElementById('resultsSection');
const desktopResults = document.getElementById('desktopResults');
const mobileResults = document.getElementById('mobileResults');
const resultsCount = document.getElementById('resultsCount');
const cachedBadge = document.getElementById('cachedBadge');
const errorMessage = document.getElementById('errorMessage');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');

let currentResults = [];

// Theme toggle
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

// Allow Enter key to search
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
});

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('active');
    setTimeout(() => errorMessage.classList.remove('active'), 5000);
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function setLoading(loading) {
    if (loading) {
        searchBtn.disabled = true;
        searchBtn.innerHTML = '<div class="spinner"></div><span>Searching...</span>';
    } else {
        searchBtn.disabled = false;
        searchBtn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Search Database</span>
        `;
    }
}

function formatCNIC(cnic) {
    if (cnic && cnic.length === 13) {
        return `${cnic.slice(0, 5)}-${cnic.slice(5, 12)}-${cnic.slice(12)}`;
    }
    return cnic;
}

function cleanAddress(address) {
    return address
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/^"|"$/g, '')
        .trim();
}

async function performSearch() {
    const query = searchInput.value.trim();
    
    if (!query) {
        showError('Please enter a phone number or CNIC');
        return;
    }

    errorMessage.classList.remove('active');
    resultsSection.classList.remove('active');
    
    setLoading(true);

    try {
        const response = await fetch(`https://fam-official.serv00.net/api/database.php?number=${encodeURIComponent(queryValue)}`);
        const data = await response.json();

        if (!data.ok) {
            throw new Error('API request failed');
        }

        currentResults = data.data || [];
        displayResults(data);
    } catch (error) {
        showError('Failed to fetch data. Please try again.');
        console.error('Search error:', error);
    } finally {
        setLoading(false);
    }
}

function displayResults(data) {
    const records = data.data || [];
    
    if (records.length === 0) {
        const noResultsHtml = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <p>No records found for this search</p>
            </div>
        `;
        desktopResults.innerHTML = noResultsHtml;
        mobileResults.innerHTML = noResultsHtml;
    } else {
        let tableHtml = `
            <table class="results-table">
                <thead>
                    <tr>
                        <th>Phone Number</th>
                        <th>Name</th>
                        <th>CNIC</th>
                        <th>Address</th>
                    </tr>
                </thead>
                <tbody>
        `;

        records.forEach(record => {
            const cleanAddr = cleanAddress(record.adr || 'no');
            const displayAddr = cleanAddr === 'no' ? '<em style="opacity: 0.5;">Not available</em>' : cleanAddr;
            
            tableHtml += `
                <tr>
                    <td class="phone-cell">${record.nbr || '-'}</td>
                    <td><strong>${record.nam || '-'}</strong></td>
                    <td class="cnic-cell">${formatCNIC(record.cni) || '-'}</td>
                    <td class="address-cell">${displayAddr}</td>
                </tr>
            `;
        });

        tableHtml += '</tbody></table>';
        desktopResults.innerHTML = tableHtml;

        let cardsHtml = '';
        records.forEach(record => {
            const cleanAddr = cleanAddress(record.adr || 'no');
            const phone = record.nbr || '-';
            const name = record.nam || '-';
            const cnic = formatCNIC(record.cni) || '-';
            const address = cleanAddr === 'no' ? '<span class="na">Not available</span>' : cleanAddr;

            cardsHtml += `
                <div class="result-card">
                    <div class="result-card-row">
                        <span class="result-card-label">Phone</span>
                        <span class="result-card-value phone">${phone}</span>
                    </div>
                    <div class="result-card-row">
                        <span class="result-card-label">Name</span>
                        <span class="result-card-value name">${name}</span>
                    </div>
                    <div class="result-card-row">
                        <span class="result-card-label">CNIC</span>
                        <span class="result-card-value cnic">${cnic}</span>
                    </div>
                    <div class="result-card-row">
                        <span class="result-card-label">Address</span>
                        <span class="result-card-value address">${address}</span>
                    </div>
                </div>
            `;
        });
        mobileResults.innerHTML = cardsHtml;
    }

    resultsCount.textContent = `Found ${records.length} record${records.length !== 1 ? 's' : ''}`;
    cachedBadge.style.display = data.cached === 'yes' ? 'inline-block' : 'none';
    resultsSection.classList.add('active');
}

function copyResults() {
    if (currentResults.length === 0) {
        showToast('No results to copy');
        return;
    }

    const searchQuery = searchInput.value.trim();
    const timestamp = new Date().toLocaleString();
    
    let copyText = `╔══════════════════════════════════════════════════════════╗
║          ALI RAZA SIM DATABASE - SEARCH RESULTS           ║
╠══════════════════════════════════════════════════════════╣
║  Search Query: ${searchQuery.padEnd(45)} ║
║  Date: ${timestamp.padEnd(51)} ║
║  Records Found: ${String(currentResults.length).padEnd(42)} ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  RESULTS:                                                ║
║  ${'─'.repeat(52)}  ║
`;

    currentResults.forEach((record, index) => {
        const cleanAddr = cleanAddress(record.adr || 'no');
        const addr = cleanAddr === 'no' ? 'N/A' : cleanAddr;
        
        copyText += `║  #${index + 1}                                                    ║
║  📱 Phone: ${(record.nbr || '-').padEnd(45)} ║
║  👤 Name:  ${(record.nam || '-').padEnd(45)} ║
║  🆔 CNIC:  ${(formatCNIC(record.cni) || '-').padEnd(45)} ║
║  📍 Addr:  ${addr.substring(0, 45).padEnd(45)} ║
║  ${'─'.repeat(52)}  ║
`;
    });

    copyText += `║                                                          ║
╠══════════════════════════════════════════════════════════╣
║  🔍 Powered by ALI RAZA SIM DATABASE API                  ║
║  👨‍💻 Developer: ALI RAZA                      ║
║  🌐 Website: https://                     ║
║  📢 HACK WIZARD X Channel - Listen Worldwide                   ║
╚══════════════════════════════════════════════════════════╝`;

    navigator.clipboard.writeText(copyText).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Copied!</span>
        `;
        showToast('Results copied!');
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy Results</span>
            `;
        }, 2000);
    }).catch(() => {
        showToast('Failed to copy results');
    });
}
