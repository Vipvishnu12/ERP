const urlParams = new URLSearchParams(window.location.search);
const dept = urlParams.get('dept');

document.addEventListener('DOMContentLoaded', async function () {
  //  console.log('Dashboard loaded');

    // 🔁 Fetch pie chart data
    try {
        const response = await fetch(`/placement/${dept}`); // your API endpoint
        if (!response.ok) throw new Error("Failed to fetch faculty data");

        const rawData = await response.json();
const total=  rawData.Placed+ rawData.Not_Placed+ rawData.Not_Willing+rawData.Not_Elligible;
//console.log(total);
document.getElementById("placed1").innerHTML = `${rawData.Placed} (${(rawData.Placed/total*100).toFixed(1)}%)`;
document.getElementById("notplaced1").innerHTML = `${rawData.Not_Placed} (${(rawData.Not_Placed/total*100).toFixed(1)}%)`;
document.getElementById("notwilling1").innerHTML = `${rawData.Not_Willing} (${(rawData.Not_Willing/total*100).toFixed(1)}%)`;
document.getElementById("notelligible1").innerHTML = `${rawData.Not_Elligible} (${(rawData.Not_Elligible/total*100).toFixed(1)}%)`;
           
        const chartData = [
            rawData.Placed || 0,
            rawData.Not_Placed || 0,
            rawData.Not_Willing || 0,
            rawData.Not_Elligible || 0
        ];
     //   console.log(chartData);
        // Create Pie Chart
        const chartContainer = document.getElementById('placementChart');
        chartContainer.innerHTML = ''; // Clear existing chart if any

        const ctx = document.createElement('canvas');
        ctx.style.width = '100%';
        ctx.style.height = '300px';
        chartContainer.appendChild(ctx);

        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Placed', 'Not Placed', 'Not Willing', 'Not Eligible'],
                datasets: [{
                    data: chartData,
                    backgroundColor: [
                        '#4285F4', // Blue
                        '#EA4335', // Red
                        '#FBBC05', // Yellow
                        '#34A853'  // Green
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                const dataset = context.dataset;
                                const total = dataset.data.reduce((acc, val) => acc + val, 0);
                                const value = dataset.data[context.dataIndex];
                                const percentage = Math.round((value / total) * 100);
                                return `${context.label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

    } catch (err) {
        console.error("Error fetching placement graph:", err);
    }


    // 🔁 Fetch department info
    if (dept) {
        try {
            const res = await fetch(`/department/${dept}`);
            const data = await res.json();

            //console.log(data);
            document.getElementById("totalstudents").innerHTML = `${data.studentsCount}`;
            document.getElementById("placements").innerHTML = `${data.placedCount}`;
            document.getElementById("faculty").innerHTML = `${data.staffCount}`;
            document.getElementById("absentees").innerHTML = `${data.absentees}`;
            document.getElementById("teach").innerHTML = `Teaching Staff ${data.staffCount-data.nonteachstaff}`;
            document.getElementById("nonteach").innerHTML = `Non Teaching Staff ${data.nonteachstaff}`;
            document.getElementById("longabs").innerHTML = `Long absentees ${data.longabs}`;
            
           // console.log(rawData);

           const res1 = await fetch(`/studentcount/${dept}`);
           const data1 = await res1.json();

          // console.log(data1);
           document.getElementById("1styear").innerHTML = `1st year ${data1.year1}`;
           document.getElementById("2styear").innerHTML = `2nd year ${data1.year2}`;
           document.getElementById("3styear").innerHTML = `3rd year ${data1.year3}`;
           document.getElementById("4styear").innerHTML = `4th year ${data1.year4}`;

        } catch (err) {
            console.error(err);
            document.getElementById("totalstudents").innerText = "Failed to load data.";
        }
    } else {
        console.error('No department specified in URL.');
    }
});
window.onload = () => {
    loadCourses();
    loadfacperformance(); // Load courses on page load
};

async function loadCourses() {
    try {
        const response = await fetch(`/coursestop3/${dept}`); // <-- Replace with your actual API endpoint
        const data = await response.json();

        const tableBody = document.getElementById('course-body');
        tableBody.innerHTML = ""; // Clear existing data

        data.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.course_code}</td>
                <td>${course.course_name}</td>
                <td>${course.faculty}</td>
                <td>${course.noofattendees}</td>
                <td>${course.noofpass}</td>
                <td>${course.nooffail}</td>
                <td>${course.mark1}</td>
                <td>${course.mark2}</td>
                <td>${course.mark3}</td>
                <td>${course.noofarrears}</td>
            `;
            tableBody.appendChild(row);
        });
       
    } catch (error) {
        console.error('Error fetching course data:', error);
        document.getElementById('course-body').innerHTML = `
            <tr><td colspan="10">Failed to load data</td></tr>
        `;
    }
}

async function loadfacperformance() {
    try {
        const response = await fetch(`/performancetop3/${dept}`); // <-- Replace with your actual API endpoint
        const data = await response.json();

        const tableBody = document.getElementById('datacontainer');
        tableBody.innerHTML = ""; // Clear existing data

        data.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${course.Staff_Name}</td>
                <td>${course.Research_Papers}</td>
                <td>${course.Workshops}</td>
                <td>${course.Performance}</td>
                    `;
            tableBody.appendChild(row);
        });
       
    } catch (error) {
        console.error('Error fetching course data:', error);
        document.getElementById('datacontainer').innerHTML = `
            <tr><td colspan="10">Failed to load data</td></tr>
        `;
    }
}
document.getElementById('facultyMenuItem').addEventListener('click', function() {
    // Navigate to the faculty page
 // console.log(dept);
    window.location.href = `faculty.html?dept=${dept}`;
});
document.getElementById('placementMenuItem').addEventListener('click', function() {
    // Navigate to the faculty page
  //console.log(dept);
    window.location.href = `placement.html?dept=${dept}`;
});
document.getElementById('studentMenuItem').addEventListener('click', function() {
    // Navigate to the faculty page
//  console.log(dept);
    window.location.href = `Student.html?dept=${dept}`;
});


document.getElementById('AttendanceMenuItem').addEventListener('click', function() {
    // Navigate to the faculty page
 // console.log(dept);
    window.location.href = `Attendance.html?dept=${dept}`;
});

document.getElementById("viewAllCoursesBtn").addEventListener("click", function (e) {
    e.preventDefault(); // prevent default anchor behavior
    window.location.href = `AllCourses.html?dept=${dept}`;
});

document.getElementById("viewperformance").addEventListener("click", function (e) {
    e.preventDefault(); // prevent default anchor behavior
    window.location.href = `facultyperformance.html?dept=${dept}`;
});

document.getElementById("logoutMenuItem").addEventListener("click", function (e) {
    e.preventDefault(); // prevent default anchor behavior
    window.location.href = `login.html`;
});
document.getElementById("transportMenuItem").addEventListener("click", function (e) {
    e.preventDefault(); // prevent default anchor behavior
    window.location.href = `transport.html?dept=${dept}`;
});

document.getElementById("facultyLink").href = `search.html?dept=${dept}`;

document.addEventListener('DOMContentLoaded', async function () {
    // ✅ Fetch and process student academic data
    try {
        const response = await fetch(`/studentacadamicdet/${dept}`); // Correctly await
        const studentData = await response.json();

        const cgpaData = [
            { category: 'Arrear', count: studentData.Arrear.length, color: '#EA4335',
                category: 'Dull', count: studentData.dull.length, color: '#EA4335' },
            { category: 'Average', count: studentData.average.length, color: '#FBBC05' },
            { category: 'Good', count: studentData.good.length, color: '#34A853' },
            { category: 'Best', count: studentData.best.length, color: '#4285F4' }
        ];

        createCGPAChart(cgpaData, studentData); // Pass both

    } catch (err) {
        console.error('Error loading student academic data:', err);
    }
});

   // Function to close the popup
   function closePopup() {
    const popup = document.getElementById('studentPopup');
    const overlay = document.getElementById('overlay');
    
    popup.style.display = 'none';
    overlay.style.display = 'none';
}

// Initialize the CGPA chart
document.addEventListener('DOMContentLoaded', function() {
   // createCGPAChart(cgpaData, studentData);     
    // Add event listener to close popup button
    document.getElementById('closePopup').addEventListener('click', closePopup);
    document.getElementById('overlay').addEventListener('click', closePopup);
});
    // Function to create the CGPA chart
    function createCGPAChart(cgpaData, studentData) {
        const chart = document.getElementById('cgpaChart');
        chart.innerHTML = ''; // Clear existing bars
       // console.log(cgpaData);
        //console.log(studentData);
        const maxValue = 50; // Update as per your max logic
    
        cgpaData.forEach((item, index) => {
            const bar = document.createElement('div');
            bar.className = 'cgpa-bar';
            bar.style.backgroundColor = item.color;
    
            const height = (item.count / maxValue) * 300;
            bar.style.height = `${height}px`;
    
            const valueLabel = document.createElement('div');
            valueLabel.className = 'cgpa-bar-value';
            valueLabel.textContent = item.count;
            bar.appendChild(valueLabel);
    
            bar.dataset.category = item.category.toLowerCase();
    
            bar.addEventListener('click', () => showStudentList(item.category.toLowerCase(), studentData));
    
            chart.appendChild(bar);
        });
    }
    
    // Function to show student list popup
    function showStudentList(category, studentData) {
        const studentList = studentData[category];
        const popup = document.getElementById('studentPopup');
        const overlay = document.getElementById('overlay');
        const popupTitle = document.getElementById('popupTitle');
        const studentTableBody = document.getElementById('studentTableBody');
    
        popupTitle.textContent = `Students in ${category.charAt(0).toUpperCase() + category.slice(1)} Category`;
    
        studentTableBody.innerHTML = '';
    
        studentList.forEach(student => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.Reg_Number}</td>
                <td>${student.Name}</td>
                <td>${student.CGPA}</td>
                <td>${student.Class}</td>
                <td>${student.Arrear_Status}</td>
            `;
            studentTableBody.appendChild(row);
        });
    
        popup.style.display = 'block';
        overlay.style.display = 'block';
    }
    

 