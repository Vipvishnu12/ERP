// Sample initial data
let students = [
    { id: 1, name: "John Doe", regno: "R20210001", type: "hostel", roomno: "A-101", status: "present" },
    { id: 2, name: "Jane Smith", regno: "R20210002", type: "hostel", roomno: "B-202", status: "present" },
    { id: 3, name: "Robert Johnson", regno: "R20210003", type: "day", roomno: "", status: "absent" },
    { id: 4, name: "Emily Davis", regno: "R20210004", type: "hostel", roomno: "A-103", status: "absent" },
    { id: 5, name: "Michael Wilson", regno: "R20210005", type: "day", roomno: "", status: "present" }
];

// DOM Elements
const studentsList = document.getElementById('students-list');
const absenteesList = document.getElementById('absentees-list');
const addStudentForm = document.getElementById('add-student-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const filterType = document.getElementById('filter-type');
const filterStatus = document.getElementById('filter-status');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const menuItems = document.querySelectorAll('.menu-item');
const contentSections = document.querySelectorAll('.content-section');
const yearTabs = document.querySelectorAll('.year-tab');

// Function to render students table
function renderStudentsTable(studentsData = students) {
    studentsList.innerHTML = '';
    
    studentsData.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.regno}</td>
            <td>${student.type === 'hostel' ? 'Hostel Student' : 'Day Scholar'}</td>
            <td>${student.roomno || 'N/A'}</td>
            <td>
                <span class="${student.status === 'present' ? 'status-present' : 'status-absent'}">
                    ${student.status === 'present' ? 'Present' : 'Absent'}
                </span>
            </td>
            <td>
                <button class="action-btn ${student.status === 'present' ? 'btn-absent' : 'btn-present'}" 
                        data-id="${student.id}" 
                        data-action="${student.status === 'present' ? 'mark-absent' : 'mark-present'}">
                    ${student.status === 'present' ? 'Mark Absent' : 'Mark Present'}
                </button>
                <button class="action-btn btn-edit" data-id="${student.id}" data-action="edit">
                    Edit
                </button>
                <button class="action-btn btn-delete" data-id="${student.id}" data-action="delete">
                    Delete
                </button>
            </td>
        `;
        studentsList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionButtonClick);
    });
}

// Function to render absentees table
function renderAbsenteesTable() {
    absenteesList.innerHTML = '';
    
    const absentStudents = students.filter(student => student.status === 'absent');
    
    if (absentStudents.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="5" style="text-align: center;">No absentees for today!</td>';
        absenteesList.appendChild(row);
        return;
    }
    
    absentStudents.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${student.name}</td>
            <td>${student.regno}</td>
            <td>${student.type === 'hostel' ? 'Hostel Student' : 'Day Scholar'}</td>
            <td>${student.roomno || 'N/A'}</td>
            <td>
                <button class="action-btn btn-present" data-id="${student.id}" data-action="mark-present">
                    Mark Present
                </button>
            </td>
        `;
        absenteesList.appendChild(row);
    });
    
    // Add event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', handleActionButtonClick);
    });
}

// Handle action button clicks
function handleActionButtonClick(e) {
    const action = e.target.dataset.action;
    const id = parseInt(e.target.dataset.id);
    
    switch(action) {
        case 'mark-present':
            markStudentPresent(id);
            break;
        case 'mark-absent':
            markStudentAbsent(id);
            break;
        case 'edit':
            editStudent(id);
            break;
        case 'delete':
            deleteStudent(id);
            break;
    }
}

// Mark student present
function markStudentPresent(id) {
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex !== -1) {
        students[studentIndex].status = 'present';
        updateDashboard();
    }
}

// Mark student absent
function markStudentAbsent(id) {
    const studentIndex = students.findIndex(s => s.id === id);
    if (studentIndex !== -1) {
        students[studentIndex].status = 'absent';
        updateDashboard();
    }
}

// Edit student
function editStudent(id) {
    alert(`Edit student with ID: ${id}`);
    // Implementation would go here
}

// Delete student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== id);
        updateDashboard();
    }
}

// Update dashboard
function updateDashboard() {
    // Update statistics
    document.getElementById('total-students').textContent = students.length;
    document.getElementById('hostel-students').textContent = students.filter(s => s.type === 'hostel').length;
    document.getElementById('day-scholars').textContent = students.filter(s => s.type === 'day').length;
    document.getElementById('absentees').textContent = students.filter(s => s.status === 'absent').length;
    
    // Re-render tables
    renderStudentsTable();
    renderAbsenteesTable();
}

// Search functionality
searchBtn.addEventListener('click', () => {
    const searchTerm = searchInput.value.toLowerCase();
    
    if (searchTerm.trim() === '') {
        renderStudentsTable();
        return;
    }
    
    const filteredStudents = students.filter(student => 
        student.name.toLowerCase().includes(searchTerm) || 
        student.regno.toLowerCase().includes(searchTerm)
    );
    
    renderStudentsTable(filteredStudents);
});

// Type filter
filterType.addEventListener('change', filterStudents);

// Status filter
filterStatus.addEventListener('change', filterStudents);

// Filter students
function filterStudents() {
    const typeFilter = filterType.value;
    const statusFilter = filterStatus.value;
    
    let filteredStudents = [...students];
    
    if (typeFilter !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.type === typeFilter);
    }
    
    if (statusFilter !== 'all') {
        filteredStudents = filteredStudents.filter(student => student.status === statusFilter);
    }
    
    renderStudentsTable(filteredStudents);
}

// Tab switching
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.dataset.tab;
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show corresponding content
        tabContents.forEach(content => {
            content.classList.remove('active');
            if (content.id === tabId) {
                content.classList.add('active');
            }
        });
    });
});

// Menu item switching
menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionId = item.dataset.section;
        
        if (!sectionId) return;
        
        // Update active menu item
        menuItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        // Show corresponding section
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    });
});

// Year tab switching
yearTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
        yearTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// Add student form submission
addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('full-name').value;
    const regno = document.getElementById('registration-number').value;
    const type = document.getElementById('student-type').value;
    const roomno = document.getElementById('room-number').value;
    
    // Simple validation
    if (!name || !regno || !type) {
        alert('Please fill all required fields');
        return;
    }
    
    // Create new student
    const newStudent = {
        id: students.length + 1,
        name,
        regno,
        type,
        roomno: type === 'hostel' ? roomno : '',
        status: 'present'
    };
    
    // Add to students array
    students.push(newStudent);
    
    // Reset form
    addStudentForm.reset();
    
    // Update dashboard
    updateDashboard();
    
    alert('Student added successfully!');
});

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    renderStudentsTable();
    renderAbsenteesTable();
    updateDashboard();
});