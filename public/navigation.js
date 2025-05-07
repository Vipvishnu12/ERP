const urlParams = new URLSearchParams(window.location.search);
const dept = urlParams.get('dept');
document.addEventListener('DOMContentLoaded', function () {
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    const pageMap = {
        'dashboard.html': 0,
        'hodprofile.html': 1,
        'Student.html': 2,
        'faculty.html': 3,  
        'Placement.Html': 4,
        'Attendance.html': 5,
        'Transport.html': 6,
        'login.html': 7
    };

    // Get current file name from URL
    const currentPage = window.location.pathname.split('/').pop();

    if (pageMap[currentPage] !== undefined) {
        menuItems.forEach(item => item.classList.remove('active'));
        menuItems[pageMap[currentPage]].classList.add('active');
    }

    // Navigation logic
    menuItems[0].addEventListener('click', () => window.location.href = `dashboard.html?dept=${dept}`);
    menuItems[1].addEventListener('click', () => window.location.href = `hodprofile.html?dept=${dept}`);
    menuItems[2].addEventListener('click', () => window.location.href = `Student.html?dept=${dept}`);
    menuItems[3].addEventListener('click', () => window.location.href = `faculty.html?dept=${dept}`);
    menuItems[4].addEventListener('click', () => window.location.href = `Placement.Html?dept=${dept}`);
    menuItems[5].addEventListener('click', () => window.location.href = `Attendance.html?dept=${dept}`);
    menuItems[6].addEventListener('click', () => window.location.href = `Transport.html?dept=${dept}`);
    menuItems[7].addEventListener('click', () => window.location.href = `login.html`);
});
