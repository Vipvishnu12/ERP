    // Wait for DOM to be fully loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Get DOM elements
        const profileDropdownBtn = document.getElementById('profileDropdownBtn');
        const profileDropdown = document.getElementById('profileDropdown');
        
        // Toggle profile dropdown
        profileDropdownBtn.addEventListener('click', () => {
            profileDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    });
    document.addEventListener('DOMContentLoaded', function() {
        const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
        const sidebar = document.querySelector('.sidebar');
        const mainContent = document.querySelector('.main-content');
        
        // Check screen size on load
        function checkScreenSize() {
            if (window.innerWidth <= 768) {
                sidebar.classList.add('sidebar-collapsed');
                mainContent.classList.remove('main-content-expanded');
            }
        }
        
        // Initial check
        checkScreenSize();
        
        // Toggle sidebar
        sidebarToggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-collapsed');
            mainContent.classList.toggle('main-content-expanded');
        });
        
        // Listen for window resize events
        window.addEventListener('resize', checkScreenSize);
    });
