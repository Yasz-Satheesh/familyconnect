document.addEventListener('DOMContentLoaded', () => {
    // --- State ---
    let familyData = [];
    const STORAGE_KEY = 'family_details_data';
    
    // --- DOM Elements ---
    const familyForm = document.getElementById('familyForm');
    const fullNameInput = document.getElementById('fullName');
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const genderInput = document.getElementById('gender');
    const relationInput = document.getElementById('relation');
    const educationInput = document.getElementById('education');
    const submitBtn = document.getElementById('submitBtn');
    const resetBtn = document.getElementById('resetBtn');
    const editIdInput = document.getElementById('editId');
    
    const tableBody = document.getElementById('tableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const memberCount = document.getElementById('memberCount');
    
    const searchInput = document.getElementById('searchInput');
    const filterGender = document.getElementById('filterGender');
    const filterRelation = document.getElementById('filterRelation');

    // --- Initialization ---
    init();

    function init() {
        loadData();
        renderTable(familyData);
        setupEventListeners();
    }

    function loadData() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            familyData = JSON.parse(stored);
        }
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(familyData));
        renderTable(applyFilters()); // Re-render with current filters applied
    }

    // --- Event Listeners ---
    function setupEventListeners() {
        // Form Submit
        familyForm.addEventListener('submit', handleFormSubmit);
        
        // Age Calculation on DOB change
        dobInput.addEventListener('change', () => {
            const age = calculateAge(dobInput.value);
            ageInput.value = age !== null ? age : '';
        });

        // Reset Button
        resetBtn.addEventListener('click', resetForm);

        // Filter & Search
        searchInput.addEventListener('input', () => renderTable(applyFilters()));
        filterGender.addEventListener('change', () => renderTable(applyFilters()));
        filterRelation.addEventListener('change', () => renderTable(applyFilters()));
    }

    // --- Core Logic ---

    function handleFormSubmit(e) {
        e.preventDefault();

        const id = editIdInput.value;
        const member = {
            id: id ? id : crypto.randomUUID(),
            name: fullNameInput.value.trim(),
            dob: dobInput.value,
            age: calculateAge(dobInput.value), // Recalculate to be safe
            gender: genderInput.value,
            relation: relationInput.value,
            education: educationInput.value.trim()
        };

        if (id) {
            // Update
            const index = familyData.findIndex(m => m.id === id);
            if (index !== -1) {
                familyData[index] = member;
            }
        } else {
            // Add
            familyData.push(member);
        }

        saveData();
        resetForm();
    }

    function calculateAge(dobString) {
        if (!dobString) return null;
        const dob = new Date(dobString);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        
        // Adjust if birthday hasn't occurred yet this year
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
            age--;
        }
        return age >= 0 ? age : 0;
    }

    function resetForm() {
        familyForm.reset();
        editIdInput.value = '';
        ageInput.value = '';
        submitBtn.textContent = 'Add Member';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-primary');
    }

    // --- Table & Filtering ---

    function applyFilters() {
        const term = searchInput.value.toLowerCase().trim();
        const gender = filterGender.value;
        const relation = filterRelation.value;

        return familyData.filter(member => {
            const matchesSearch = member.name.toLowerCase().includes(term) || 
                                  member.relation.toLowerCase().includes(term);
            const matchesGender = gender === 'all' || member.gender === gender;
            const matchesRelation = relation === 'all' || member.relation === relation;

            return matchesSearch && matchesGender && matchesRelation;
        });
    }

    function renderTable(data) {
        tableBody.innerHTML = '';
        memberCount.textContent = `${data.length} Members`;

        if (data.length === 0) {
            noDataMessage.classList.remove('hidden');
            return;
        }

        noDataMessage.classList.add('hidden');

        data.forEach(member => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${escapeHtml(member.name)}</td>
                <td>${member.age}</td>
                <td><span class="badge">${member.gender}</span></td>
                <td>${member.relation}</td>
                <td>${escapeHtml(member.education || '-')}</td>
                <td>
                    <button class="btn btn-edit" data-id="${member.id}">
                        ✏️ Edit
                    </button>
                    <button class="btn btn-danger" data-id="${member.id}">
                        🗑️ Delete
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });

        // Add listeners to new buttons
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => startEdit(e.target.dataset.id));
        });

        document.querySelectorAll('.btn-danger').forEach(btn => {
            btn.addEventListener('click', (e) => deleteMember(e.target.dataset.id));
        });
    }

    function startEdit(id) {
        const member = familyData.find(m => m.id === id);
        if (!member) return;

        editIdInput.value = member.id;
        fullNameInput.value = member.name;
        dobInput.value = member.dob;
        ageInput.value = member.age;
        genderInput.value = member.gender;
        relationInput.value = member.relation;
        educationInput.value = member.education;

        submitBtn.textContent = 'Update Member';
        // Scroll to form
        familyForm.scrollIntoView({ behavior: 'smooth' });
    }

    function deleteMember(id) {
        if (confirm('Are you sure you want to delete this family member?')) {
            familyData = familyData.filter(m => m.id !== id);
            saveData();
        }
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
