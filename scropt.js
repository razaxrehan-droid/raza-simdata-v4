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
    if(!query) return;

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

// Case-insensitive Helper Function to find values safely
function getFieldValue(item, possibleKeys) {
    if (!item) return 'N/A';
    const itemKeys = Object.keys(item);
    for (const key of possibleKeys) {
        const matchedKey = itemKeys.find(k => k.toLowerCase() === key.toLowerCase());
        if (matchedKey && item[matchedKey]) {
            return item[matchedKey];
        }
    }
    return 'N/A';
}

// Render Only Name, Number, CNIC, Address on Web Page
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

        // Filter and extract only specific required fields
        const name = getFieldValue(item, ['name', 'full_name', 'fullname', 'owner_name', 'customer_name']);
        const number = getFieldValue(item, ['mobile', 'phone', 'number', 'phone_number', 'msisdn', 'mobile_num']);
        const cnic = getFieldValue(item, ['cnic', 'id_card', 'cnic_num', 'nic']);
        const address = getFieldValue(item, ['address', 'addr', 'location', 'residence']);

        card.innerHTML = `
            <div class="record-badge">Record #${index + 1}</div>
            <div class="data-grid">
                <div class="data-item">
                    <span class="data-key">Name</span>
                    <span class="data-value">${name}</span>
                </div>
                <div class="data-item">
                    <span class="data-key">Number</span>
                    <span class="data-value">${number}</span>
                </div>
                <div class="data-item">
                    <span class="data-key">CNIC</span>
                    <span class="data-value">${cnic}</span>
                </div>
                <div class="data-item">
                    <span class="data-key">Address</span>
                    <span class="data-value">${address}</span>
                </div>
            </div>
        `;

        dataViewer.appendChild(card);
    });
}

// Copy Only Name, Number, CNIC, Address
copyBtn.addEventListener('click', () => {
    if (!currentRawJSON) return;

    let renderTarget = currentRawJSON;
    if (currentRawJSON.data && Array.isArray(currentRawJSON.data)) renderTarget = currentRawJSON.data;
    else if (currentRawJSON.result && Array.isArray(currentRawJSON.result)) renderTarget = currentRawJSON.result;

    const items = Array.isArray(renderTarget) ? renderTarget : [renderTarget];

    let copyText = '';

    items.forEach((item, index) => {
        const name = getFieldValue(item, ['name', 'full_name', 'fullname', 'owner_name', 'customer_name']);
        const number = getFieldValue(item, ['mobile', 'phone', 'number', 'phone_number', 'msisdn', 'mobile_num']);
        const cnic = getFieldValue(item, ['cnic', 'id_card', 'cnic_num', 'nic']);
        const address = getFieldValue(item, ['address', 'addr', 'location', 'residence']);

        copyText += `Record #${index + 1}\n`;
        copyText += `Name: ${name}\n`;
        copyText += `Number: ${number}\n`;
        copyText += `CNIC: ${cnic}\n`;
        copyText += `Address: ${address}\n\n`;
    });

    navigator.clipboard.writeText(copyText.trim()).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = `<span style="color: #4ade80;">✓ Copied!</span>`;
        setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
    });
});
