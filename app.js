// Income Expense Calculator

// DOM Elements
const entryForm = document.getElementById('entry-form');
const descriptionInput = document.getElementById('description');
const amountInput = document.getElementById('amount');
const typeInput = document.getElementById('type');
const entryList = document.getElementById('entry-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpenseEl = document.getElementById('total-expense');
const netBalanceEl = document.getElementById('net-balance');
const resetBtn = document.getElementById('reset-btn');
const addBtn = document.getElementById('add-btn');
const editIdInput = document.getElementById('edit-id');
const filterRadios = document.querySelectorAll('input[name="filter"]');

let entries = [];

// --- Local Storage ---
function saveEntries() {
    localStorage.setItem('incomeExpenseEntries', JSON.stringify(entries));
}
function loadEntries() {
    const data = localStorage.getItem('incomeExpenseEntries');
    entries = data ? JSON.parse(data) : [];
}

// --- CRUD Operations ---
function addEntry(entry) {
    entries.push(entry);
    saveEntries();
    renderEntries();
}
function updateEntry(id, updatedEntry) {
    const idx = entries.findIndex(e => e.id === id);
    if (idx !== -1) {
        entries[idx] = updatedEntry;
        saveEntries();
        renderEntries();
    }
}
function deleteEntry(id) {
    entries = entries.filter(e => e.id !== id);
    saveEntries();
    renderEntries();
}

// --- Rendering ---
function renderEntries() {
    const filter = document.querySelector('input[name="filter"]:checked').value;
    entryList.innerHTML = '';
    let filtered = entries;
    if (filter !== 'all') {
        filtered = entries.filter(e => e.type === filter);
    }
    filtered.forEach(entry => {
        const li = document.createElement('li');
        li.className = `entry-item ${entry.type}`;
        li.innerHTML = `
            <div class="entry-details">
                <span class="entry-description">${entry.description}</span>
                <span class="entry-amount ${entry.type}">₹${Number(entry.amount).toLocaleString()}</span>
            </div>
            <div class="entry-actions">
                <button class="edit" title="Edit" data-id="${entry.id}">✏️</button>
                <button class="delete" title="Delete" data-id="${entry.id}">🗑️</button>
            </div>
        `;
        entryList.appendChild(li);
    });
    updateSummary();
}
function updateSummary() {
    const income = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
    const expense = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
    totalIncomeEl.textContent = `₹${income.toLocaleString()}`;
    totalExpenseEl.textContent = `₹${expense.toLocaleString()}`;
    netBalanceEl.textContent = `₹${(income - expense).toLocaleString()}`;
}

// --- Event Handlers ---
entryForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const description = descriptionInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const type = typeInput.value;
    const editId = editIdInput.value;

    if (!description || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid description and amount.');
        return;
    }

    if (editId) {
        // Update
        updateEntry(editId, {
            id: editId,
            description,
            amount,
            type
        });
        addBtn.textContent = 'Add';
        editIdInput.value = '';
    } else {
        // Create
        addEntry({
            id: Date.now().toString(),
            description,
            amount,
            type
        });
    }
    entryForm.reset();
});

resetBtn.addEventListener('click', function() {
    entryForm.reset();
    addBtn.textContent = 'Add';
    editIdInput.value = '';
});

entryList.addEventListener('click', function(e) {
    if (e.target.classList.contains('edit')) {
        const id = e.target.dataset.id;
        const entry = entries.find(e => e.id === id);
        if (entry) {
            descriptionInput.value = entry.description;
            amountInput.value = entry.amount;
            typeInput.value = entry.type;
            editIdInput.value = entry.id;
            addBtn.textContent = 'Update';
        }
    } else if (e.target.classList.contains('delete')) {
        const id = e.target.dataset.id;
        if (confirm('Delete this entry?')) {
            deleteEntry(id);
            entryForm.reset();
            addBtn.textContent = 'Add';
            editIdInput.value = '';
        }
    }
});

filterRadios.forEach(radio => {
    radio.addEventListener('change', renderEntries);
});

// --- Initialization ---
loadEntries();
renderEntries();