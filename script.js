// Data Storage
let students = JSON.parse(localStorage.getItem('students')) || [];
let attendance = JSON.parse(localStorage.getItem('attendance')) || {};
let sortByRoll = false;
let searchTerm = '';
let isAdminMode = false;

// Admin Configuration
const ADMIN_PASSWORD = 'admin123';

// DOM Elements - Admin
const adminLoginScreen = document.getElementById('adminLoginScreen');
const adminPanel = document.getElementById('adminPanel');
const mainApp = document.getElementById('mainApp');
const adminPassword = document.getElementById('adminPassword');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const userModeBtn = document.getElementById('userModeBtn');
const logoutBtn = document.getElementById('logoutBtn');
const adminStudentName = document.getElementById('adminStudentName');
const adminStudentRoll = document.getElementById('adminStudentRoll');
const adminAddBtn = document.getElementById('adminAddBtn');
const adminStudentsList = document.getElementById('adminStudentsList');
const startAttendanceBtn = document.getElementById('startAttendanceBtn');
const adminLogoUpload = document.getElementById('adminLogoUpload');
const adminNameInput = document.getElementById('adminNameInput');
const adminRollInput = document.getElementById('adminRollInput');
const saveAdminSettingsBtn = document.getElementById('saveAdminSettingsBtn');
const adminSettingsInApp = document.getElementById('adminSettingsInApp');

// DOM Elements - App
const studentName = document.getElementById('studentName');
const rollNumber = document.getElementById('rollNumber');
const addBtn = document.getElementById('addBtn');
const studentsList = document.getElementById('studentsList');
const attendanceDate = document.getElementById('attendanceDate');
const clearDateBtn = document.getElementById('clearDateBtn');
const totalStudentsEl = document.getElementById('totalStudents');
const presentCountEl = document.getElementById('presentCount');
const absentCountEl = document.getElementById('absentCount');
const exportBtn = document.getElementById('exportBtn');
const resetBtn = document.getElementById('resetBtn');
const collegeLogoImg = document.getElementById('collegeLogo');
const logoUpload = document.getElementById('logoUpload');
const myNameInput = document.getElementById('myNameInput');
const studentRollInput = document.getElementById('studentRollInput');
const saveStudentInfoBtn = document.getElementById('saveStudentInfoBtn');
const studentInfoDisplay = document.getElementById('studentInfoDisplay');
const searchInput = document.getElementById('searchInput');
const sortBtn = document.getElementById('sortBtn');
const detailsModal = document.getElementById('detailsModal');
const closeModal = document.querySelector('.close');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupAdminLogin();
});

// ===== ADMIN LOGIN FUNCTIONS =====

function setupAdminLogin() {
    adminLoginBtn.addEventListener('click', () => {
        if (adminPassword.value === ADMIN_PASSWORD) {
            isAdminMode = true;
            showAdminPanel();
        } else {
            alert('❌ Incorrect password! Default password is "admin123"');
            adminPassword.value = '';
        }
    });

    userModeBtn.addEventListener('click', () => {
        isAdminMode = false;
        showMainApp();
    });

    logoutBtn.addEventListener('click', () => {
        isAdminMode = false;
        adminPassword.value = '';
        adminStudentName.value = '';
        adminStudentRoll.value = '';
        adminNameInput.value = '';
        adminRollInput.value = '';
        showLoginScreen();
    });

    adminPassword.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adminLoginBtn.click();
    });
}

function showLoginScreen() {
    adminLoginScreen.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    mainApp.classList.add('hidden');
}

function showAdminPanel() {
    adminLoginScreen.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    mainApp.classList.add('hidden');
    
    // Load existing admin settings
    const savedAdminName = localStorage.getItem('adminName') || '';
    const savedAdminRoll = localStorage.getItem('adminRoll') || '';
    adminNameInput.value = savedAdminName;
    adminRollInput.value = savedAdminRoll;
    
    // Load existing logo
    const savedLogo = localStorage.getItem('collegeLogo');
    if (savedLogo) {
        collegeLogoImg.src = savedLogo;
    }
    
    renderAdminStudentList();
    
    // Setup admin settings handlers
    saveAdminSettingsBtn.addEventListener('click', saveAdminSettings);
    adminLogoUpload.addEventListener('change', uploadAdminLogo);
    
    // Setup admin add student
    adminAddBtn.addEventListener('click', addStudentFromAdmin);
    startAttendanceBtn.addEventListener('click', () => {
        isAdminMode = true;
        showMainApp();
    });
}

function uploadAdminLogo() {
    const file = adminLogoUpload.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const logoData = event.target.result;
            localStorage.setItem('collegeLogo', logoData);
            collegeLogoImg.src = logoData;
            adminLogoUpload.value = '';
            alert('✅ College logo updated successfully!');
        };
        reader.readAsDataURL(file);
    }
}

function saveAdminSettings() {
    const adminName = adminNameInput.value.trim();
    const adminRoll = adminRollInput.value.trim();
    
    if (adminName && adminRoll) {
        localStorage.setItem('adminName', adminName);
        localStorage.setItem('adminRoll', adminRoll);
        alert('✅ Admin settings saved successfully!');
        myNameInput.value = adminName;
        studentRollInput.value = adminRoll;
    } else {
        alert('❌ Please enter both admin name and roll number');
    }
}

function showMainApp() {
    adminLoginScreen.classList.add('hidden');
    adminPanel.classList.add('hidden');
    mainApp.classList.remove('hidden');
    
    // Hide admin settings in user mode, show in admin mode
    if (isAdminMode) {
        adminSettingsInApp.style.display = 'flex';
    } else {
        adminSettingsInApp.style.display = 'none';
    }
    
    // Hide add student section if user mode
    const addStudentSection = document.querySelector('.add-student-section');
    if (!isAdminMode && addStudentSection) {
        addStudentSection.style.display = 'none';
    } else if (isAdminMode && addStudentSection) {
        addStudentSection.style.display = 'block';
    }
    
    // Initialize app
    setTodayDate();
    renderStudents();
    updateStats();
    loadLogo();
    setupLogoUpload();
    loadStudentInfo();
    setupStudentInfoSave();
    setupSearchAndSort();
    setupModal();
}

function addStudentFromAdmin() {
    const name = adminStudentName.value.trim();
    const roll = adminStudentRoll.value.trim();
    
    if (name && roll) {
        // Check if student already exists
        if (students.some(s => s.roll === roll)) {
            alert('❌ Student with this roll number already exists!');
            return;
        }
        
        students.push({
            id: Date.now(),
            name: name,
            roll: roll
        });
        
        localStorage.setItem('students', JSON.stringify(students));
        adminStudentName.value = '';
        adminStudentRoll.value = '';
        renderAdminStudentList();
        alert('✅ Student added successfully!');
    } else {
        alert('Please enter both name and roll number');
    }
}

function renderAdminStudentList() {
    const listHtml = students.length > 0
        ? students.map(student => `
            <div class="admin-student-item">
                <div class="admin-student-info">
                    <strong>${student.name}</strong>
                    <small>Roll: ${student.roll}</small>
                </div>
                <button class="btn btn-danger" onclick="deleteStudentFromAdmin(${student.id})">Delete</button>
            </div>
        `).join('')
        : '<p>No students added yet</p>';
    
    adminStudentsList.innerHTML = listHtml;
}

function deleteStudentFromAdmin(id) {
    if (confirm('Are you sure you want to delete this student? This cannot be undone.')) {
        students = students.filter(s => s.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        renderAdminStudentList();
        alert('✅ Student deleted!');
    }
}

function deleteStudentInApp(studentId) {
    if (!isAdminMode) {
        alert('Only admin can delete students!');
        return;
    }
    
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== studentId);
        
        // Remove from all attendance records
        Object.keys(attendance).forEach(key => {
            if (attendance[key] && attendance[key][studentId]) {
                delete attendance[key][studentId];
            }
        });

        saveData();
        renderStudents();
        updateStats();
    }
}

// ===== END ADMIN LOGIN FUNCTIONS =====


// Load saved logo
function loadLogo() {
    const savedLogo = localStorage.getItem('collegeLogo');
    if (savedLogo) {
        collegeLogoImg.src = savedLogo;
    }
}

// Load student info (name and roll)
function loadStudentInfo() {
    // Load admin name and roll (admin is the creator)
    const savedName = localStorage.getItem('adminName');
    const savedRoll = localStorage.getItem('adminRoll');
    if (savedName) myNameInput.value = savedName;
    if (savedRoll) studentRollInput.value = savedRoll;
    displayStudentInfo();
}

// Display student info
function displayStudentInfo() {
    const name = myNameInput.value.trim();
    const roll = studentRollInput.value.trim();
    
    if (name || roll) {
        const display = name && roll 
            ? `👤 ${name} | 📝 Roll: ${roll}`
            : name 
            ? `👤 ${name}`
            : `📝 Roll: ${roll}`;
        studentInfoDisplay.textContent = display;
    } else {
        studentInfoDisplay.textContent = '';
    }
}

// Setup student info save
function setupStudentInfoSave() {
    saveStudentInfoBtn.addEventListener('click', () => {
        const name = myNameInput.value.trim();
        const roll = studentRollInput.value.trim();
        
        if (name && roll) {
            // Save as admin info (only shown to admin)
            localStorage.setItem('adminName', name);
            localStorage.setItem('adminRoll', roll);
            displayStudentInfo();
            alert('Your information saved successfully!');
        } else {
            alert('Please enter both name and roll number');
        }
    });
    
    [myNameInput, studentRollInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') saveStudentInfoBtn.click();
        });
        input.addEventListener('change', displayStudentInfo);
    });
}

// Setup logo upload
function setupLogoUpload() {
    logoUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const logoData = event.target.result;
                localStorage.setItem('collegeLogo', logoData);
                collegeLogoImg.src = logoData;
                alert('College logo uploaded successfully!');
            };
            reader.readAsDataURL(file);
        }
    });
}

// Setup search and sort
function setupSearchAndSort() {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        renderStudents();
    });
    
    sortBtn.addEventListener('click', () => {
        sortByRoll = !sortByRoll;
        sortBtn.textContent = sortByRoll ? '↕️ Sorted by Roll ✓' : '↕️ Sort by Roll Number';
        renderStudents();
    });
}

// Setup modal
function setupModal() {
    closeModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
}

// Get filtered and sorted students
function getFilteredStudents() {
    let filtered = students.filter(s => 
        s.name.toLowerCase().includes(searchTerm) || 
        s.roll.toString().includes(searchTerm)
    );
    
    if (sortByRoll) {
        filtered.sort((a, b) => {
            const rollA = parseInt(a.roll) || 0;
            const rollB = parseInt(b.roll) || 0;
            return rollA - rollB;
        });
    }
    
    return filtered;
}

// Set today's date by default
function setTodayDate() {
    const today = new Date().toISOString().split('T')[0];
    attendanceDate.value = today;
}

// Add Student
addBtn.addEventListener('click', () => {
    const name = studentName.value.trim();
    const roll = rollNumber.value.trim();

    if (!name || !roll) {
        alert('Please enter both name and roll number');
        return;
    }

    if (students.some(s => s.roll === roll)) {
        alert('Roll number already exists');
        return;
    }

    const student = {
        id: Date.now(),
        name: name,
        roll: roll
    };

    students.push(student);
    saveData();
    renderStudents();
    updateStats();
    studentName.value = '';
    rollNumber.value = '';
    studentName.focus();
});

// Render Students
function renderStudents() {
    const filteredStudents = getFilteredStudents();
    
    if (students.length === 0) {
        studentsList.innerHTML = '<p class="empty-message">No students added yet. Add a student to get started!</p>';
        return;
    }
    
    if (filteredStudents.length === 0) {
        studentsList.innerHTML = '<p class="empty-message">No students match your search.</p>';
        return;
    }

    const date = attendanceDate.value;
    const attendanceKey = `attendance_${date}`;
    const dateAttendance = attendance[attendanceKey] || {};

    studentsList.innerHTML = filteredStudents.map(student => {
        const status = dateAttendance[student.id];
        let statusClass = 'status-unmarked';
        let statusText = 'Unmarked';

        if (status === 'present') {
            statusClass = 'status-present';
            statusText = '✓ Present';
        } else if (status === 'absent') {
            statusClass = 'status-absent';
            statusText = '✗ Absent';
        }

        return `
            <div class="student-item">
                <div class="student-info" onclick="showStudentDetails(${student.id})">
                    <div class="student-name">${student.name}</div>
                    <div class="student-roll">Roll #${student.roll}</div>
                </div>
                <div class="attendance-status">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <button class="btn btn-success" onclick="markAttendance(${student.id}, 'present', '${date}')">Present</button>
                    <button class="btn btn-warning" onclick="markAttendance(${student.id}, 'absent', '${date}')">Absent</button>
                    ${isAdminMode ? `<button class="btn btn-danger delete-btn" onclick="deleteStudentInApp(${student.id})">Delete</button>` : ''}
                </div>
            </div>
        `;
    }).join('');
}

// Show student details in modal
function showStudentDetails(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Calculate stats
    let totalPresent = 0, totalAbsent = 0;
    const history = [];
    
    Object.keys(attendance).forEach(key => {
        const status = attendance[key][studentId];
        if (status === 'present') totalPresent++;
        if (status === 'absent') totalAbsent++;
        
        if (status) {
            const date = key.replace('attendance_', '');
            history.push({ date, status });
        }
    });
    
    const total = totalPresent + totalAbsent;
    const percentage = total > 0 ? ((totalPresent / total) * 100).toFixed(2) : 0;
    
    // Populate modal
    document.getElementById('detailsStudentName').textContent = student.name;
    document.getElementById('detailsRoll').textContent = student.roll;
    document.getElementById('detailsPresent').textContent = totalPresent;
    document.getElementById('detailsAbsent').textContent = totalAbsent;
    document.getElementById('detailsPercentage').textContent = percentage + '%';
    
    // Show history
    const historyDiv = document.getElementById('detailsHistory');
    if (history.length > 0) {
        historyDiv.innerHTML = '<h3>Attendance History:</h3>' + history.reverse().map(h =>
            `<div class="attendance-record">
                <span>${new Date(h.date).toDateString()}</span>
                <span class="status-badge ${h.status === 'present' ? 'status-present' : 'status-absent'}">
                    ${h.status === 'present' ? '✓ Present' : '✗ Absent'}
                </span>
            </div>`
        ).join('');
    } else {
        historyDiv.innerHTML = '<p>No attendance records yet.</p>';
    }
    
    detailsModal.style.display = 'flex';
}

// Mark Attendance
function markAttendance(studentId, status, date) {
    const attendanceKey = `attendance_${date}`;
    
    if (!attendance[attendanceKey]) {
        attendance[attendanceKey] = {};
    }

    attendance[attendanceKey][studentId] = status;
    saveData();
    renderStudents();
    updateStats();
}

// Delete Student
function deleteStudent(studentId) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== studentId);
        
        // Remove from all attendance records
        Object.keys(attendance).forEach(key => {
            delete attendance[key][studentId];
        });

        saveData();
        renderStudents();
        updateStats();
    }
}

// Update Statistics
function updateStats() {
    const date = attendanceDate.value;
    const attendanceKey = `attendance_${date}`;
    const dateAttendance = attendance[attendanceKey] || {};

    const present = Object.values(dateAttendance).filter(s => s === 'present').length;
    const absent = Object.values(dateAttendance).filter(s => s === 'absent').length;

    totalStudentsEl.textContent = students.length;
    presentCountEl.textContent = present;
    absentCountEl.textContent = absent;
}

// Clear Date
clearDateBtn.addEventListener('click', () => {
    attendanceDate.value = '';
});

// Handle Date Change
attendanceDate.addEventListener('change', () => {
    renderStudents();
    updateStats();
});

// Export Report
exportBtn.addEventListener('click', () => {
    const date = attendanceDate.value;
    if (!date) {
        alert('Please select a date first');
        return;
    }

    const attendanceKey = `attendance_${date}`;
    const dateAttendance = attendance[attendanceKey] || {};
    
    const studentName = localStorage.getItem('studentName') || 'Student';
    const studentRoll = localStorage.getItem('studentRoll') || 'N/A';

    let report = `ATTENDANCE REPORT\n`;
    report += `Project By: ${studentName} | Roll: ${studentRoll}\n`;
    report += `Date: ${new Date(date).toDateString()}\n`;
    report += `${'='.repeat(70)}\n\n`;
    report += `${'Roll'.padEnd(8)} | ${'Name'.padEnd(30)} | Status\n`;
    report += `${'-'.repeat(70)}\n`;

    students.forEach(student => {
        const status = dateAttendance[student.id];
        const statusText = status === 'present' ? 'PRESENT' : status === 'absent' ? 'ABSENT' : 'UNMARKED';
        report += `${student.roll.padEnd(8)} | ${student.name.padEnd(30)} | ${statusText}\n`;
    });

    report += `\n${'='.repeat(70)}\n`;
    const presentCount = Object.values(dateAttendance).filter(s => s === 'present').length;
    const absentCount = Object.values(dateAttendance).filter(s => s === 'absent').length;
    report += `Total Students: ${students.length}\n`;
    report += `Total Present: ${presentCount}\n`;
    report += `Total Absent: ${absentCount}\n`;
    report += `Attendance %: ${students.length > 0 ? ((presentCount / students.length) * 100).toFixed(2) : 0}%\n`;
    report += `Generated By: ${studentName} (${studentRoll})\n`;

    // Download as text file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(report));
    element.setAttribute('download', `attendance_${date}_${studentRoll}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    alert('Report exported successfully!');
});

// Reset All
resetBtn.addEventListener('click', () => {
    if (confirm('WARNING: This will delete all students and attendance records. Are you sure?')) {
        students = [];
        attendance = {};
        saveData();
        renderStudents();
        updateStats();
        alert('All data has been reset!');
    }
});

// Save Data to LocalStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendance', JSON.stringify(attendance));
}

// Allow Enter key to add student
studentName.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') rollNumber.focus();
});

rollNumber.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addBtn.click();
});
