const urlParams = new URLSearchParams(window.location.search);
const dept = urlParams.get('dept');
document.addEventListener('DOMContentLoaded', function () {
    const menuItems = document.querySelectorAll('.sidebar-menu-item');
    const pageMap = {
      'dashboard.html': 0,
      'Student.html': 1,
      'faculty.html': 2,
      'Placement.Html': 3,
      'Attendance.html': 4,
      'reports.html': 5,
      'settings.html': 6,
      'login.html': 7
    };
  
    // Get current file name from URL
    const currentPage = window.location.pathname.split('/').pop();
  
    if (pageMap[currentPage] !== undefined) {
      menuItems[pageMap[currentPage]].classList.add('active');
    }
  
    // Navigation logic
    menuItems[0].addEventListener('click', () => window.location.href = `dashboard.html?dept=${dept}`);
    menuItems[1].addEventListener('click', () => window.location.href = `Student.html?dept=${dept}`);
    menuItems[2].addEventListener('click', () => window.location.href = `faculty.html?dept=${dept}`);
    menuItems[3].addEventListener('click', () => window.location.href = `Placement.Html?dept=${dept}`);
    menuItems[4].addEventListener('click', () => window.location.href = `Attendance.Html?dept=${dept}`);
    menuItems[5].addEventListener('click', () => window.location.href = 'reports.html');
    menuItems[6].addEventListener('click', () => window.location.href = 'settings.html');
    menuItems[7].addEventListener('click', () => window.location.href = 'login.html');
  });
 
document.addEventListener('DOMContentLoaded', async function () {
    try {
        // Later make this dynamic if needed
        const response = await fetch(`/placedcompany/${dept}`);
        if (!response.ok) {
            throw new Error("Failed to fetch placement data");
        }

        const rawData = await response.json();

        // Labels and mapping based on your backend keys
        const labels = ['Microsoft', 'Google', 'Infosys', 'TCS', 'Wipro', 'Others'];
        const data = [
            rawData.ms || 0,       // Microsoft
            rawData.google || 0,   // Google
            rawData.infosys || 0,  // Infosys
            rawData.tcs || 0,      // TCS
            rawData.wipro || 0,    // Wipro
            rawData.others || 0    // Others
        ];

        const backgroundColor = [
            '#4355e8', // Microsoft
            '#f44336', // Google
            '#4caf50', // Infosys
            '#9c27b0', // TCS
            '#00bcd4', // Wipro
            '#795548'  // Others
        ];

        const companyPieCtx = document.getElementById('companyPieChart').getContext('2d');

        const companyPieChart = new Chart(companyPieCtx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColor,
                    borderColor: '#ffffff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            font: { size: 12 },
                            boxWidth: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((acc, d) => acc + d, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} students (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true,
                    duration: 1500
                }
            }
        });

    } catch (error) {
        console.error("Error loading placement data:", error);
    }
});
document.addEventListener('DOMContentLoaded', function() {
  // Placement trend line chart
 // Placement trend line chart
const trendCtx = document.getElementById('trendChart').getContext('2d');
let trendChart;

fetch(`/yearlygraph/${dept}`)  // 🔁 Replace 'CSE' with dynamic department if needed
  .then(response => response.json())
  .then(data => {
    const labels = data.map(item => item.year);
    const percentages = data.map(item => parseFloat(item.placementPercentage));

    trendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Percentage Placed',
          data: percentages,
          borderColor: '#4355e8',
          backgroundColor: 'rgba(67, 85, 232, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#4355e8',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: false,
            min: 0,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + '%';
              },
              font: {
                size: 12
              }
            },
            title: {
              display: true,
              text: 'Placement Percentage',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                bottom: 10
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            title: {
              display: true,
              text: 'Year',
              font: {
                size: 14,
                weight: 'bold'
              },
              padding: {
                top: 10
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                return `Placement: ${context.raw}%`;
              }
            },
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: 10,
            cornerRadius: 6
          },
          legend: {
            labels: {
              font: {
                size: 14
              }
            }
          }
        },
        animation: {
          duration: 2000,
          easing: 'easeOutQuart'
        }
      }
    });
  })
  .catch(error => {
    console.error('Error loading placement data:', error);
  });

});
window.onload = () => {
  loadstudents(); // Load courses on page load
};
async function loadstudents() {
  try {
      const response = await fetch(`/place/${dept}`); // <-- Replace with your actual API endpoint
      const data = await response.json();
      document.getElementById("totstudents").innerHTML = `${data.total_student}`;
      document.getElementById("noplaced").innerHTML = `${data.placedcount}`;
      document.getElementById("nonotplaced").innerHTML = `${data.notplacedcount}`;
      document.getElementById("place%").innerHTML = `${data.placedpercent}`;
  }
  catch (error) {
      console.error('Error fetching course data:', error);}}