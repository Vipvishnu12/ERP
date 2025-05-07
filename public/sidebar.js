// Sidebar navigation and toggle logic for all pages

document.addEventListener('DOMContentLoaded', function () {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.querySelector('.sidebar-toggle');
  const mainContent = document.querySelector('.main-content');
  const menuItems = document.querySelectorAll('.sidebar-menu-item');
  const urlParams = new URLSearchParams(window.location.search);
  const dept = urlParams.get('dept');

  // Map page names to sidebar index (update as per your sidebar order)
  const pageMap = [
    { file: 'dashboard.html', id: 'dashboardMenuItem' },
    { file: 'hodprofile.html', id: 'profileMenuItem' },
    { file: 'Student.html', id: 'studentMenuItem' },
    { file: 'faculty.html', id: 'facultyMenuItem' },
    { file: 'Placement.html', id: 'placementMenuItem' },
    { file: 'Attendance.html', id: 'AttendanceMenuItem' },
    { file: 'Transport.html', id: 'transportMenuItem' },
    { file: 'login.html', id: 'logoutMenuItem' }
  ];

  // Highlight active menu item
  const currentPage = window.location.pathname.split('/').pop().toLowerCase();
  pageMap.forEach((item, idx) => {
    if (item.file.toLowerCase() === currentPage) {
      menuItems.forEach(mi => mi.classList.remove('active'));
      const el = document.getElementById(item.id);
      if (el) el.classList.add('active');
    }
  });

  // Navigation logic
  pageMap.forEach((item, idx) => {
    const el = document.getElementById(item.id);
    if (el) {
      el.onclick = function (e) {
        e.preventDefault();
        if (item.file === 'login.html') {
          window.location.href = 'login.html';
        } else if (item.file === 'hodprofile.html') {
          window.location.href = `hodprofile.html?dept=${dept}`;
        } else {
          window.location.href = `${item.file}?dept=${dept}`;
        }
      };
    }
  });

  // Sidebar toggle for mobile/tablet
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', function () {
      sidebar.classList.toggle('visible');
      if (mainContent) {
        mainContent.classList.toggle('sidebar-open');
      }
      // Change icon
      const icon = toggleBtn.querySelector('.toggle-icon');
      if (icon) {
        icon.textContent = sidebar.classList.contains('visible') ? '✕' : '☰';
      }
    });
  }

  // Hide sidebar when clicking outside on mobile
  document.addEventListener('click', function (e) {
    if (
      window.innerWidth <= 768 &&
      sidebar.classList.contains('visible') &&
      !sidebar.contains(e.target) &&
      !toggleBtn.contains(e.target)
    ) {
      sidebar.classList.remove('visible');
      if (mainContent) mainContent.classList.remove('sidebar-open');
      const icon = toggleBtn.querySelector('.toggle-icon');
      if (icon) icon.textContent = '☰';
    }
  });
});
