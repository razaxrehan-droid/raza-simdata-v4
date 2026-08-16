const API_URL = 'https://sim-db-api.faizankhichi.me/?search=';
let currentRawJSON = null;

const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const submitBtn = document.getElementById('submitBtn');
const loader = document.getElementById('loader');
const resultsContainer = document.getElementById('resultsContainer');
const dataViewer = document.getElementById('dataViewer');
const errorBox = document.getElementById('errorBox');
const errorMsg = document.getElementById('errorMsg');
const copyBtn = document.getElementById('copyBtn');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    // UI Reset
    errorBox.classList.add('hidden');
    resultsContainer.classList.add('hidden');
    loader.classList.remove('hidden');
    submitBtn.disabled = true;

    try {
        const response = await fetch(`${API_URL}${encodeURIComponent(query)}`);
        const data = await response.json();

        if (!response.ok || data.error || data.success === false) {
            throw new Error(data.error || data.message || 'Data not found or API error.');
        }

        currentRawJSON = data;
        renderData(data);

        loader.classList.add('hidden');
        resultsContainer.classList.remove('hidden');

    } catch (error) {
        loader.classList.add('hidden');
        errorMsg.textContent = error.message;
        errorBox.classList.remove('hidden');
    } finally {
        submitBtn.disabled = false;
    }
});

function renderData(data) {
    dataViewer.innerHTML = '';

    let renderTarget = data;
    if (data.data && Array.isArray(data.data)) renderTarget = data.data;
    else if (data.result && Array.isArray(data.result)) renderTarget = data.result;

    const items = Array.isArray(renderTarget) ? renderTarget : [renderTarget];

    if (items.length === 0) {
        dataViewer.innerHTML = `<div class="glass-panel" style="text-align:center; color: var(--text-muted);">No records found.</div>`;
        return;
    }

    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'glass-panel';

        let html = `
            <div class="record-badge">Record #${index + 1}</div>
            <div class="data-grid">
        `;

        for (const [key, value] of Object.entries(item)) {
            if (typeof value === 'object') continue;

            const formattedKey = key.replace(/_/g, ' ');
            const formattedValue = value || '<span style="color: #64748b; font-style: italic;">N/A</span>';

            html += `
                <div class="data-item">
                    <span class="data-key">${formattedKey}</span>
                    <span class="data-value">${formattedValue}</span>
                </div>
            `;
        }

        html += `</div>`;
        card.innerHTML = html;
        dataViewer.appendChild(card);
    });
}

copyBtn.addEventListener('click', () => {
    if (currentRawJSON) {
        navigator.clipboard.writeText(JSON.stringify(currentRawJSON, null, 2));
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span style="color: #4ade80;">✓ Copied!</span>`;
        setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
    }
});
