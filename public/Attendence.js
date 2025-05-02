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
    'Transport.html':5,
    'login.html': 6
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
  menuItems[4].addEventListener('click', () => window.location.href = `Attendance.html?dept=${dept}`);
  menuItems[5].addEventListener('click', () => window.location.href = `Transport.html?dept=${dept}`);
  menuItems[6].addEventListener('click', () => window.location.href = 'login.html');

});

const semesterSelect = document.getElementById("semesterSelect");
  const departmentSelect = document.getElementById("departmentSelect");
  const modal = document.getElementById("studentModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  const categories = ["Excellent", "Good", "Average", "Poor"];
  const colors = ["#4caf50", "#2196f3", "#ff9800", "#f44336"];

  let dummyData = {}; // declare globally
  let pieChart, barChart;

  semesterSelect.addEventListener("change", async () => {
    const semester = semesterSelect.value;

    if (semester === "I") {
      console.log("Semester 1 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["I"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
         
        };
       // document.getElementById("todayAttendance").innerHTML = `${res.dummyData["I"].studentattended1.length}`;
     //   document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
        // console.log( dummyData["II"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
   else if (semester === "II") {
      console.log("Semester 2 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["II"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
         
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
       // console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
      //  document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
         console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
   else if (semester === "III") {
      console.log("Semester 3 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["III"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
       
        };
       // document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
         //console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
    else if (semester === "IV") {
      console.log("Semester 4 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["IV"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
    
        };
           //document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
       //  console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
  
      else if (semester === "V") {
      console.log("Semester 5 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["V"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
        
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
       // document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
       //  console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
    
    else if (semester === "VI") {
      console.log("Semester 6 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["VI"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
         
        };
        //document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
         //console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
    else if (semester === "VII") {
      //console.log("Semester 7 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
console.log(result);
        dummyData["VII"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
        
    };
       // document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
       //  console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
    else if (semester === "VIII") {
      console.log("Semester 8 selected!");

      try {
        const response = await fetch(`/studentatt1/?department=${dept}&semester=${semester}`);
        const result = await response.json();
//console.log(result);
        dummyData["VIII"] = {
          Excellent: result.excellent.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.Name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
         
        };
       //document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
         //console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
    
  });
  fetchTeacherData(dept); 
  function updateCharts() {
    const semester = semesterSelect.value;
    const data = dummyData[semester] || {};
    document.getElementById("below50").innerHTML =data['Poor'].length;
    document.getElementById("below60").innerHTML =data['Average'].length;
    updatePieChart(data);
       
  }
  function updatePieChart(data) {
    const counts = categories.map(cat => (data[cat] || []).length);
    const pieCtx = document.getElementById("pieChart").getContext("2d");
  
    if (pieChart) pieChart.destroy();
  
    pieChart = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: categories,
        datasets: [{
          data: counts,
          backgroundColor: colors
        }]
      },
      options: {
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            showModal(categories[index]);
          }
        }
      }
    });
  }
  function showModalForStaff(category, data) {
    const modal = document.getElementById('staffModal');
    const modalContent = document.getElementById('staffModalContent');
    // Generate dynamic table or content here based on `data`
    let tableHTML = '<table><tr><th>Name</th><th>LOP</th></tr>';
    data.forEach(student => {
      tableHTML += `<tr><td>${student.name}</td><td>${student.count}</td></tr>`;
    });
    tableHTML += '</table>';
  
    // Insert dynamic content into the modal
    modalContent.innerHTML = tableHTML;
  
    // Show the modal
    modal.style.display = 'block'; // Change display to block to show it
  }
  

  function updateStaffBarChart(data) {
    
    const counts = categories.map(cat => (data[cat] || []).length);
    const ctx = document.getElementById("barChart").getContext("2d");
  
    if (barChart) barChart.destroy(); // destroy if already exists
  
    barChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: categories,
        datasets: [{
          label: "No. of Staff (by LOP)",
          data: counts,
          backgroundColor: colors
        }]
      },
      options: {
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            showModalForStaff(categories[index], data[categories[index]]);
          }
        },
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
  let result1 = {}; // global

async function fetchTeacherData(department) {
  try {
    const response = await fetch(`/api/teacher-status/${department}`);
    result1 = await response.json(); // ✅ assign to global

    // ✅ Update the count AFTER result1 is assigned
    document.getElementById("staffPresent").innerHTML = `${result1.todayStatus?.length || 0}`;

    const result = result1['lopCategory'] || {};

    const data = {
      Excellent: result.excellent?.map(s => ({ name: s.Staff_Name, count: s.LOP_Count })) || [],
      Good: result.good1?.map(s => ({ name: s.Staff_Name, count: s.LOP_Count })) || [],
      Average: result.average?.map(s => ({ name: s.Staff_Name, count: s.LOP_Count })) || [],
      Poor: result.poor1?.map(s => ({ name: s.Staff_Name, count: s.LOP_Count })) || []
    };

    updateStaffBarChart(data); // chart rendering
  } catch (error) {
    console.error("Error fetching teacher data:", error);
  }
}

  function showModalpresent() {
    modal.style.display = "flex";
    modalTitle.textContent = "Today Status Report";
  //console.log(result1['todayStatus']);
  console.log(result1);
    const staffList = result1.todayStatus || [];
  
    if (staffList.length === 0) {
      modalBody.innerHTML = "<p>No staff data available for today.</p>";
    } else {
    
      modalBody.innerHTML = `
        <table>
          <tr><th>Name</th><th>Staff Code</th><th>Today Status</th></tr>
          ${staffList.map(s => `
            <tr>
              <td>${s.Staff_Name}</td>
              <td>${s.Staff_Code}</td>
              <td>${s.Today_Status}</td>
            </tr>
          `).join("")}
        </table>`;
    }
  }
  
  
  function showModal(category) {
    modal.style.display = "flex";
    modalTitle.textContent = category;

    const semester = semesterSelect.value;
    const data = dummyData[semester] || {};
  // console.log( student[category])

   
   
    const students = data[category] || [];
    if (students.length === 0) {
      modalBody.innerHTML = "<p>No students in this category.</p>";
    } 
    
    else {
      modalBody.innerHTML = `
        <table>
          <tr><th>Name</th><th>Attendance %</th><th>Leaves</th></tr>
          ${students.map(s => `<tr><td>${s.name}</td><td>${s.percent}%</td><td>${s.leaves}</td></tr>`).join("")}
        </table>`;
    }
  }

  function closeModal() {
    modal.style.display = "none";
    
  }
  const modal1 = document.getElementById('staffModal');

  function closeModal1() {
    modal1.style.display = "none";
  }
  
  // Combine all logic into one handler
  window.onclick = function(event) {
    if (event.target === modal1) {
      closeModal1();
    }
  };
  
  

  window.onclick = function (event) {
    if (event.target === modal) closeModal();
  };

  // Trigger on page load too (optional)
  window.onload = () => {
    semesterSelect.dispatchEvent(new Event("change"));
  };
