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
      'Transport.html': 5,
      'login.html': 6
    };
  
    // Get current file name from URL
    const currentPage = window.location.pathname.split('/').pop();
  
    if (pageMap[currentPage] !== undefined) {
      menuItems[pageMap[currentPage]].classList.add('active');
    }
  
    // Navigation logic
    menuItems[0].addEventListener('click', () => window.location.href = `dashboard.html?dept=${dept}`);
  //  menuItems[1].addEventListener('click', () => window.location.href = `Student.html?dept=${dept}`);
    menuItems[2].addEventListener('click', () => window.location.href = `faculty.html?dept=${dept}`);
    menuItems[3].addEventListener('click', () => window.location.href = `Placement.Html?dept=${dept}`);
    menuItems[4].addEventListener('click', () => window.location.href = `Attendance.html?dept=${dept}`);
    menuItems[5].addEventListener('click', () => window.location.href = `Transport.html?dept=${dept}`);
    menuItems[6].addEventListener('click', () => window.location.href = 'login.html');
  });
  document.addEventListener("DOMContentLoaded", function () {
    function  fetchStudents(){}
       fetch(`/studentinfo/${dept}`)  // 👉 Replace with your actual backend route
         .then(res => res.json())
         .then(data => {
           const tableBody = document.getElementById('studentTableBody');
           tableBody.innerHTML = ''; // Clear existing rows
     
           data.forEach(student => {
             const row = document.createElement('tr');
     
             row.innerHTML = `
               <td>${student.Name}</td>
               <td>${student.Reg_Number}</td>
               <td>${student.Address}</td>
               <td>${student.Mobile}</td>
               <td>${student.Father_Mobile}</td>
               <td>
          <button class="action-btn edit" onclick="goToEdit(this)">Edit</button>
 <button class="action-btn view" onclick="openDialog(this)">View</button>
         </td>
             `;
     
             tableBody.appendChild(row);
           });
         })
         .catch(error => {
           console.error("Error loading student data:", error);
         });
     });
     document.addEventListener("DOMContentLoaded", function () {
       fetch(`/studentinfo1/${dept}`)  // 👉 Replace with your actual backend route
         .then(res => res.json())
         .then(data => {
           const tableBody = document.getElementById('st1');
           tableBody.innerHTML = ''; // Clear existing rows
     
           data.forEach(student => {
             const row = document.createElement('tr');
     
             row.innerHTML = `
               <td>${student.Name}</td>
               <td>${student.Reg_Number}</td>
               <td>${student.Address}</td>
               <td>${student.Mobile}</td>
               <td>${student.Father_Mobile}</td>
               <td>
                 <button class="action-btn edit" onclick="goToEdit(this)">Edit</button>
    <button class="action-btn view" onclick="openDialog(this)">View</button>
        </td>
             `;
     
             tableBody.appendChild(row);
           });
         })
         .catch(error => {
           console.error("Error loading student data:", error);
         });
     });
     document.addEventListener("DOMContentLoaded", function () {
       fetch(`/studentinfo2/${dept}`)  // 👉 Replace with your actual backend route
         .then(res => res.json())
         .then(data => {
           const tableBody = document.getElementById('st2');
           tableBody.innerHTML = ''; // Clear existing rows
     
           data.forEach(student => {
             const row = document.createElement('tr');
     
             row.innerHTML = `
               <td>${student.Name}</td>
               <td>${student.Reg_Number}</td>
               <td>${student.Address}</td>
               <td>${student.Mobile}</td>
               <td>${student.Father_Mobile}</td>
               <td>
      <button class="action-btn edit" onclick="goToEdit(this)">Edit</button>

               <button class="action-btn view" onclick="openDialog(this)">View</button>
            </td>
             `;
     
             tableBody.appendChild(row);
           });
         })
         .catch(error => {
           console.error("Error loading student data:", error);
         });
    
       });
       fetch(`/studentinfo3/${dept}`)  // 👉 Replace with your actual backend route
       .then(res => res.json())
       .then(data => {
         const tableBody = document.getElementById('st3');
         tableBody.innerHTML = ''; // Clear existing rows
   
         data.forEach(student => {
           const row = document.createElement('tr');
   
           const studentSafe = JSON.stringify(student).replace(/'/g, "&apos;");
           
           row.innerHTML = `
             <td>${student.Name}</td>
             <td>${student.Reg_Number}</td>
             <td>${student.Address}</td>
             <td>${student.Mobile}</td>
             <td>${student.Father_Mobile}</td>
             <td>
     <button class="action-btn edit" onclick="goToEdit(this)">Edit</button>
  <button class="action-btn view" onclick="openDialog(this)">View</button>
         </td>
           `;
           
   
           tableBody.appendChild(row);
         });
       })
       .catch(error => {
         console.error("Error loading student data:", error);
       }); 
   
       function openEdit(student) {
     console.log(student);
     
     // Ensure modal exists
     const modal = document.getElementById("editModal");
     if (modal) {
       modal.classList.add("active");
       document.getElementById("editregno").value = student.Reg_Number;
       document.getElementById("editname").value = student.Name;
       document.getElementById("editAddress").value = student.Address;
       document.getElementById("editstudno").value = student.Mobile;
       document.getElementById("editparno").value = student.Father_Mobile;
     } else {
       console.error("Modal not found.");
     }
   }
   
   // Modal closing function
   function closeModal() {
     const modal = document.getElementById("editModal");
     if (modal) {
       modal.classList.remove("active");
     } else {
       console.error("Modal not found.");
     }
   }
   
   // Submitting the form to update student data
  //  document.getElementById("editForm").addEventListener("submit", function (e) {
     
   
  //    const Reg_Number = document.getElementById("editregno").value;
  //    const Name = document.getElementById("editname").value;
  //    const Address = document.getElementById("editAddress").value;
  //    const Mobile = document.getElementById("editstudno").value;
  //    const Father_Mobile = document.getElementById("editparno").value;
  //  const dept="agri";
  //    console.log(dept);
   
  //    fetch(`/students8/${Reg_Number}`, {
  //      method: "PUT",
  //      headers: { "Content-Type": "application/json" },
  //      body: JSON.stringify({ dept})
  //    })
  //    .then(res => {
  //      if (!res.ok) {
  //        throw new Error("Failed to update student data");
  //      }
  //      return res.json();
  //    })
  //    .then(() => {
  //      // Redirect to Student.html without query parameters
  //     window.location.href = '/Student.html'; // Redirect without query params
  //    })
  //    .catch(err => {
  //      console.error(err);
  //    });
  //  console.log(Name);
  //  });


  // async function openDialog() {
  //   try {
  //     const response = await fetch(`/placement/agri`);
  //     const data = await response.json();

  //     const tbody = document.getElementById("placementBody");
  //     tbody.innerHTML = ""; // Clear previous rows

  //     data.forEach(student => {
  //       const row = `<tr>
  //         <td>${student.Name}</td>
  //         <td>${student.Reg_Number}</td>
  //         <td>${student.Placed}</td>
  //         <td>${student.Placed_Company}</td>
  //       </tr>`;
  //       tbody.innerHTML += row;
  //     });

  //     document.getElementById("dialogBox").style.display = "block";
  //   } catch (err) {
  //     console.error("Error fetching data:", err);
  //   }
  // }
  async function openDialog(button) {
    try {
      const row = button.closest("tr"); // get full row
    const regNumber = row.cells[1].innerText;
    console.log(regNumber);
      const response = await fetch(`/studentdet/${regNumber}`);
      const data = await response.json();

      const tbody = document.getElementById("placementBody");
      tbody.innerHTML = ""; // Clear previous rows
console.log(data);
      data.forEach(student => {
       const row = document.createElement('tr');
            row.innerHTML = `
          <td>${student.Name}</td>
          <td>${student.Section}</td>
          <td>${student.placed}</td>
           <td>${student.placed_company}</td>
          <td>${student.Arrear_Status}</td>`;
        tbody.appendChild(row);
      });

      document.getElementById("dialogBox").style.display = "block";
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  }
 
  

  function closeDialog() {
    document.getElementById("dialogBox").style.display = "none";
  }

  function submitValue() {
    alert("Submitted!");
    closeDialog();
  }

  function goToEdit(button) {
    const row = button.closest("tr");
    const regNumber = row.cells[1].innerText;
    const Name = row.cells[0].innerText;
    const Mobile = row.cells[3].innerText;
    const Father_Mobile = row.cells[4].innerText;
    const Address = row.cells[2].innerText;
   // const dept = new URLSearchParams(window.location.search).get("dept");
  
    window.location.href = `edit.html?reg=${encodeURIComponent(regNumber)}&dept=${encodeURIComponent(dept)}&Name=${encodeURIComponent(Name)}&Mobile=${encodeURIComponent(Mobile)}&Father_Mobile=${encodeURIComponent(Father_Mobile)}&Address=${encodeURIComponent(Address)}`;
  }
  