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
  menuItems[4].addEventListener('click', () => window.location.href = `Attendance.html?dept=${dept}`);
  menuItems[5].addEventListener('click', () => window.location.href = 'reports.html');
  menuItems[6].addEventListener('click', () => window.location.href = 'settings.html');
  menuItems[7].addEventListener('click', () => window.location.href = 'login.html');

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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
       // console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
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
console.log(result);
        dummyData["VIII"] = {
          Excellent: result.excellent.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Good: result.good1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Average: result.average.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          Poor: result.poor1.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
         , studentattended1: result.studentattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          })),
          staffattended1: result.staffattended.map(item => ({
            name: item.name,
            percent: item.attendance_percentage,
            leaves: item.leaves
          }))
        };
        const respo= await fetch(`/attendanceup/?department=${dept}&semester=${semester}`);
        const res = await respo.json();
        console.log(res);
        document.getElementById("todayAttendance").innerHTML = `${res.studentpresent}`;
        document.getElementById("staffPresent").innerHTML = `${res.staffpresent}`;
              
         //console.log( dummyData["2"]);
        updateCharts(); // call after data update

      } catch (error) {
        console.error("Error fetching data:", error);
        modalBody.innerHTML = `<p style="color:red;">Unable to fetch attendance data.</p>`;
      }

    }
    
  });

  function updateCharts() {
    const semester = semesterSelect.value;
    const data = dummyData[semester] || {};
    const counts = categories.map(cat => (data[cat] || []).length);

    document.getElementById("below50").textContent = Object.values(data).flat().filter(s => s.percent < 50).length;
    document.getElementById("below60").textContent = Object.values(data).flat().filter(s => s.percent < 60).length;

    const pieCtx = document.getElementById("pieChart").getContext("2d");
    const barCtx = document.getElementById("barChart").getContext("2d");

    if (pieChart) pieChart.destroy();
    if (barChart) barChart.destroy();

    pieChart = new Chart(pieCtx, {
      type: "pie",
      data: {
        labels: categories,
        datasets: [{ data: counts, backgroundColor: colors }]
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

    barChart = new Chart(barCtx, {
      type: "bar",
      data: {
        labels: categories,
        datasets: [{ label: "No. of Students", data: counts, backgroundColor: colors }]
      },
      options: {
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            showModal(categories[index]);
          }
        },
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }

  function showModal(category) {
    modal.style.display = "flex";
    modalTitle.textContent = category;

    const semester = semesterSelect.value;
    const data = dummyData[semester] || {};
  // console.log( student[category])

    if (category.includes("Below") || category.includes("Today")) {
      modalBody.innerHTML = `<p>No specific student data for "${category}".</p>`;
      return;
    }
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

  window.onclick = function (event) {
    if (event.target === modal) closeModal();
  };

  // Trigger on page load too (optional)
  window.onload = () => {
    semesterSelect.dispatchEvent(new Event("change"));
  };
