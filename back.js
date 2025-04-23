const express = require('express');
const app = express();
const path = require('path');
const morgan = require('morgan');
const bodyParser = require('body-parser');
// Middleware to serve static files
app.use(express.static(path.join(__dirname, 'public')));
const { sql, poolPromise } = require('./db');
// For JSON and URL encoded data (if you use forms or fetch API)
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan('default')); 
  


app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'));    });

// Optional: Route to handle form or API logic
app.post('/login', async (req, res) => {
  const { Department, Password } = req.body;
console.log(req.body)
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('Department', Department)
      .input('Password', Password)
      .query('SELECT * FROM login2 WHERE Department = @Department AND Password = @Password');

    const user = result.recordset[0]; // or use result.recordset.length > 0

    res
      .status(user ? 200 : 401)
      .send(user ? "Login success" : "Unauthorized");
    
  } catch (err) {
    res.status(500).send("Server error");
  }
});
app.get('/department/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    // Total students in the department
    const students = await pool
      .request()
      .input('dept', dept)
      .input('Class', `I ${dept}`)
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept or Class LIKE @Class + '%'");

    // Placed students
    const placed = await pool
    .request()
    .input('dept', dept)
    .input('placed', 'yes')
    .input('Class', `I ${dept}`)
    .query(`
      SELECT COUNT(*) AS count 
      FROM Student_Master 
      WHERE (Department = @dept OR Class LIKE CONCAT(@Class, '%')) 
        AND placed = @placed
    `);
  
  console.log('Placed students:', placed.recordset[0].count);
  
    // Staff count
    const staff = await pool
      .request()
      .input('dept', dept)
      .query("SELECT COUNT(*) AS count FROM Staff_Master WHERE Department = @dept");

    // Non-teaching staff
    const nonteachstaff = await pool
      .request()
      .input('dept', dept)
      .query("SELECT COUNT(*) AS count FROM Staff_Master WHERE Department = @dept AND Staff_Type = 'non teaching'");

    // Absent students today (query string fixed with backticks)
    const absentees = await pool
      .request()
      .input('dept', dept)
      .query(`
      
SELECT COUNT(*) AS Full_Day_Absent_Count
FROM (
    SELECT Reg_Number, att_date
    FROM Student_Attendance
    WHERE Period IS NOT NULL
      AND att_date =  CAST(GETDATE() AS DATE)
 and Class  like '%'+@dept+ '%'
    GROUP BY Reg_Number, att_date
) AS FullAbsentList;

      `);
      const longabsentees = await pool
      .request()
      .input('dept', dept)
      .query(`


        WITH DistinctDays AS (
          SELECT DISTINCT att_date
          FROM Student_Attendance
          WHERE Class LIKE '%'+@dept+'%'
            AND att_date <= CAST(GETDATE() AS DATE)  -- Only up to today
      ),
      AbsentDays AS (
          SELECT sa.Reg_Number, dd.att_date
          FROM DistinctDays dd
          CROSS JOIN (SELECT DISTINCT Reg_Number FROM Student_Attendance WHERE Class LIKE '%'+@dept+'%') sa
          LEFT JOIN Student_Attendance a
              ON sa.Reg_Number = a.Reg_Number
              AND dd.att_date = a.att_date
              AND Class LIKE '%'+@dept+'%'
              AND a.Period IS NOT NULL
          WHERE a.Reg_Number IS NULL
      ),
      RankedAbsents AS (
          SELECT Reg_Number, att_date,
                 ROW_NUMBER() OVER (PARTITION BY Reg_Number ORDER BY att_date) 
                 - DENSE_RANK() OVER (PARTITION BY Reg_Number ORDER BY att_date) AS grp
          FROM AbsentDays
      ),
      GroupedAbsents AS (
          SELECT Reg_Number, MIN(att_date) AS FromDate, MAX(att_date) AS ToDate, COUNT(*) AS Consecutive_Days
          FROM RankedAbsents
          GROUP BY Reg_Number, grp
          HAVING COUNT(*) >= 5
      )
      SELECT COUNT(DISTINCT Reg_Number) AS Students_With_5_Consecutive_Leaves
      FROM GroupedAbsents
      WHERE ToDate >= DATEADD(DAY, -4, CAST(GETDATE() AS DATE));  -- Ended today or within past 4 days
            

      `);

    res.status(200).json({
      studentsCount: students.recordset[0].count,
      placedCount: placed.recordset[0].count,
      staffCount: staff.recordset[0].count,
      nonteachstaff: nonteachstaff.recordset[0].count,
      absentees: absentees.recordset[0].Full_Day_Absent_Count
      ,longabs: longabsentees.recordset[0].Students_With_5_Consecutive_Leaves
      // 🟢 Correct property used!
    });

  } catch (err) {
    res.status(500).send("Error while fetching counts: " + err.message);
  }
});


 
app.get('/facultycounts/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
   
    // Count total students in that department
    const totalFaculty = await pool
      .request()
      .input('dept', dept)
      .query("SELECT COUNT(*) AS count FROM Staff_Master WHERE Department = @dept");

    // Count placed students
    const professorCount = await pool
      .request()
      .input('dept', dept)
      .input('Designation', 'Professor')
      .query("SELECT COUNT(*) AS count FROM Staff_Master WHERE Department = @dept AND Designation = @Designation");

    // Count staff in department
    const associateProfCount = await pool
      .request()
      .input('dept', dept)
      .input('Designation', 'Associate Professor')
      .query("SELECT COUNT(*) AS count FROM Staff_Master WHERE Department = @dept  AND Designation = @Designation");

    // Count absentees
    const assistantProfCount = await pool
      .request()
      .input('dept', dept)
      .input('absentees', 'ab')
      .input('Designation', 'Assistant Professor')
      .query("SELECT COUNT(*) AS count FROM Staff_Master WHERE Department = @dept AND Designation = @Designation");

    res.status(200).json({
      total_faculty: totalFaculty.recordset[0].count,
      professors: professorCount.recordset[0].count,
      associate_Professors: associateProfCount.recordset[0].count,
      assistant_Professors: assistantProfCount.recordset[0].count // ✅ fixed here!
    });

  } catch (err) {
    res.status(500).send("Error while fetching counts: " + err.message);
  }
});
app.get('/placement/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    // Count total students in that department
    const students = await pool
      .request()
      .input('Class', `I ${dept}`)
      .input('dept', dept)
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept or Class LIKE @Class + '%'");

    // Count placed students
    const placed = await pool
      .request()
      .input('dept', dept)
      .input('placed', 'yes')
      .input('Class', `I ${dept}`)
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept AND placed = @placed or Class LIKE @Class + '%'");

    // Count staff in department
    
    const notwilling = await pool
    .request()
    .input('dept', dept)
    .input('Placement_not_willing', 'yes')
    .input('Class', `I ${dept}`)
    .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept AND Placement_not_willing = @Placement_not_willing or Class LIKE @Class + '%'");
    const notelligible = await pool
    .request()
    .input('dept', dept)
    .input('not_elligible', 'nil')
    .input('Class', `I ${dept}`)
    .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept AND Arrear_Status != @not_elligible or Class LIKE @Class + '%'");

    //['Placed', 'Not Placed', 'Not Willing', 'Not Eligible'],
   

    res.status(200).json({
      Placed: placed.recordset[0].count,
       Not_Placed: students.recordset[0].count-placed.recordset[0].count- notwilling.recordset[0].count-notelligible.recordset[0].count,
      Not_Willing: notwilling.recordset[0].count,
      Not_Elligible: notelligible.recordset[0].count
     // ✅ fixed here!
    });

  } catch (err) {
    res.status(500).send("Error while fetching counts: " + err.message);
  }
});
app.get('/coursestop3/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`SELECT TOP 3 * 
FROM recent_course1 
WHERE Department = @dept 
ORDER BY mark1 DESC;
`);

    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/courses/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`SELECT * FROM recent_course1 where Department=@dept`);

    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/facultywork4/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`SELECT TOP 3 * FROM faculty_work4 WHERE Department = @dept ORDER BY Work_Assign_Dt`);
console.log(result.recordset);
    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/facultyinfo/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`SELECT TOP 4 Staff_Name,photo, Designation, roleofwork, qualification, Experience_Year FROM Staff_Master WHERE Department = @dept ORDER BY id`);
console.log(result.recordset);
    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/place/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    // Count total students in that department
    const students = await pool
      .request()
      .input('dept', dept)
      .input('Class', `I ${dept}`)
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept OR Class LIKE CONCAT(@Class, '%')");

    // Count placed students
    const placed = await pool
      .request()
      .input('dept', dept)
      .input('Class', `I ${dept}`)
      .input('placed', 'yes')
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE Department = @dept AND placed = @placed OR Class LIKE CONCAT(@Class, '%')");
  
      res.status(200).json({
        total_student: students.recordset[0].count,
        placedcount: placed.recordset[0].count,
        notplacedcount:students.recordset[0].count-placed.recordset[0].count,
        placedpercent: ((placed.recordset[0].count/students.recordset[0].count)*100).toFixed(1)
      });
  
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });
  app.get('/placedcompany/:dept', async (req, res) => {
    try {
      const dept = req.params.dept;
      const pool = await poolPromise;
  
      // Count total students in that department
      const placedongoogle = await pool
        .request()
        .input('Department', dept)
        .input('placed_company', 'Google')
        .input('Class', `I ${dept}`)
        .query("SELECT COUNT(*) AS count FROM Student_Master WHERE  (Department = @Department OR Class LIKE CONCAT(@Class, '%')) AND placed_company = @placed_company");
  
      // Count placed students
      const placedoninfosys = await pool
        .request()
        .input('Department', dept)
        .input('placed_company', 'Infosys')
        .input('Class', `I ${dept}`)
        .query("SELECT COUNT(*) AS count FROM Student_Master WHERE  (Department = @Department OR Class LIKE CONCAT(@Class, '%')) AND placed_company = @placed_company");
  
      // Count staff in department
      
      const placedonms = await pool
        .request()
        .input('Department', dept)
        .input('Class', `I ${dept}`)
        .input('placed_company','Microsoft')
        .query("SELECT COUNT(*) AS count FROM Student_Master WHERE  (Department = @Department OR Class LIKE CONCAT(@Class, '%')) AND placed_company = @placed_company");
  
      //['Placed', 'Not Placed', 'Not Willing', 'Not Eligible'],
      const placedonwipro = await pool
      .request()
      .input('Department', dept)
      .input('Class', `I ${dept}`)
      .input('placed_company', 'wipro')
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE  (Department = @Department OR Class LIKE CONCAT(@Class, '%')) AND placed_company = @placed_company");
      const placedontcs = await pool
      .request()
      .input('Department', dept)
      .input('Class', `I ${dept}`)
      .input('placed_company', 'tcs')
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE  (Department = @Department OR Class LIKE CONCAT(@Class, '%')) AND placed_company = @placed_company");
      const placedonothers = await pool
      .request()
      .input('Department', dept)
      .input('Class', `I ${dept}`)
      .input('placed_company', 'others')
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE  (Department = @Department OR Class LIKE CONCAT(@Class, '%')) AND placed_company = @placed_company");

      res.status(200).json({
        google: placedongoogle.recordset[0].count,
         infosys: placedoninfosys.recordset[0].count,
        ms: placedonms.recordset[0].count,
        wipro: placedonwipro.recordset[0].count,
        tcs: placedontcs.recordset[0].count,
        others: placedonothers.recordset[0].count
       // ✅ fixed here!
      });
  
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });

  app.get('/yearlygraph/:dept', async (req, res) => {
    try {
      const dept = req.params.dept;
      const pool = await poolPromise;
      const result = await pool
        .request()
         .input('department', dept)
        .query(`
          SELECT * FROM (
            SELECT TOP 5 * 
            FROM Placement_Stats 
            WHERE department = @department
            ORDER BY year DESC
          ) AS Last5
          ORDER BY year ASC
        `);
      const formattedData = result.recordset.map(row => ({
        year: row.year,
        placementPercentage: ((row.students_placed / row.total_students) * 100).toFixed(2)  // 2 decimal points
      }));
  
      res.status(200).json(formattedData);
  
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });
  app.get('/studentinfo/:dept', async (req, res) => {
    try {
      const dept = req.params.dept;
      const pool = await poolPromise;
  
      const result = await pool
        .request()
        .input('Class', sql.VarChar, `I ${dept}`) // ✅ Added sql.VarChar
        .query(`SELECT Name, Reg_Number, Address, Mobile, Father_Mobile 
                FROM Student_Master 
                WHERE Class LIKE @Class + '%'`);
  
      res.json(result.recordset);
    } catch (err) {
      res.status(500).send("Error while fetching student info: " + err.message);
    }
  });
  
  app.get('/studentinfo1/:dept', async (req, res) => {
    try {
      const dept = req.params.dept;
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('Class', sql.VarChar, `II ${dept}`)
        .query(`SELECT Name, Reg_Number, Address, Mobile, Father_Mobile 
          FROM Student_Master 
          WHERE Class LIKE @Class + '%'`);

      res.json(result.recordset); // ✅ Fixed typo
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });
  app.get('/studentinfo2/:dept', async (req, res) => {
    try {
      const dept = req.params.dept;
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('Class', sql.VarChar, `III ${dept}`)
        .query(`SELECT Name, Reg_Number, Address, Mobile, Father_Mobile 
          FROM Student_Master 
          WHERE Class LIKE @Class + '%'`);

      res.json(result.recordset); // ✅ Fixed typo
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });
  app.get('/studentinfo3/:dept', async (req, res) => {
    try {
      const dept = req.params.dept;
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('Class', sql.VarChar, `IV ${dept}`)
        .query(`SELECT Name, Reg_Number, Address, Mobile, Father_Mobile 
          FROM Student_Master 
          WHERE Class LIKE @Class + '%'`);

      res.json(result.recordset); // ✅ Fixed typo
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });
  app.get('/attendanceup', async (req, res) => {
    try {
      const dept = req.query.department;
      const sem = req.query.semester;
      const pool = await poolPromise;
  
      // Query to get today's student attendance
      const todayspresent = await pool
        .request()
        .input('Department', sql.VarChar(50), dept)
        .input('Class', sql.VarChar(50), `I ${dept}`)
        .input('semester', sql.VarChar(10), sem)
        .query(`
          SELECT COUNT(*) AS Students_Present_Today
          FROM vw_Attendance_Stats
          WHERE (Department = @Department OR Class LIKE 'I ' + @Department + '%')
            AND Semester = @semester
            AND Today_Status = 'Present';
        `);
  
      // Query to get today's staff attendance
      const todaysstaffpresent = await pool
        .request()
        .input('department', dept)
        .query(`
          SELECT COUNT(*) AS present_today_count
          FROM studentsattendance s
          JOIN attendance_student a ON s.student_id = a.student_id
          WHERE a.status = 'Present'
            AND s.department = @department
            AND CAST(a.date AS DATE) = CAST(GETDATE() AS DATE);
        `);
  
      // Query to get today's absent students
      const todaysabsent = await pool
        .request()
        .input('department', dept)
        .input('Class', `I ${dept}`)
        .input('semester', sql.VarChar(10), sem)
        .query(`
          SELECT COUNT(*) AS absent_today_count
          FROM studentsattendance s
          JOIN attendance_student a ON s.student_id = a.student_id
          WHERE a.status = 'Absent'
            AND s.department = @department
            AND CAST(a.date AS DATE) = CAST(GETDATE() AS DATE);
        `);
  
      // Calculate the percentage of students present today
      const totalStudents = todayspresent.recordset[0].Students_Present_Today + todaysabsent.recordset[0].absent_today_count;
      const studentpresentPercentage = totalStudents > 0
        ? ((todayspresent.recordset[0].Students_Present_Today / totalStudents) * 100).toFixed(1)
        : 0;
  
      res.status(200).json({
        studentpresent: studentpresentPercentage,
        staffpresent: todaysstaffpresent.recordset[0].present_today_count
      });
  
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });
  
  
  app.get('/studentatt1', async (req, res) => {
    try {
      const dept = req.query.department;
      const sem = req.query.semester;
      const pool = await poolPromise;
      const poor = await pool
      .request()
      .input('Department', sql.VarChar(50), dept)
      .input('semester',   sql.VarChar(10), sem)
      .input('Class',      sql.VarChar(50), `I ${dept}`)
      .query(`
        SELECT Name, attendance_percentage, leaves
        FROM vw_Attendance_Stats
        WHERE (Department = @Department OR Class LIKE 'I ' + @Department + '%')
          AND Semester = @semester
          AND attendance_percentage < 50;
      `);
    
    const avg = await pool
      .request()
      .input('Department', sql.VarChar(50), dept)
      .input('semester',   sql.VarChar(10), sem)
      .input('Class',      sql.VarChar(50), `I ${dept}`)
      .query(`
        SELECT Name, attendance_percentage, leaves
        FROM vw_Attendance_Stats
        WHERE (Department = @Department OR Class LIKE 'I ' + @Department + '%')
          AND Semester = @semester
          AND attendance_percentage < 60;
          
      `);
    
    const good = await pool
      .request()
      .input('Department', sql.VarChar(50), dept)
      .input('semester',   sql.VarChar(10), sem)
      .input('Class',      sql.VarChar(50), `I ${dept}`)
      .query(`
        SELECT Name, attendance_percentage, leaves
        FROM vw_Attendance_Stats
        WHERE (Department = @Department OR Class LIKE 'I ' + @Department + '%')
          AND Semester = @semester
          AND attendance_percentage BETWEEN 60 AND 80;
      `);
    
    const excel = await pool
      .request()
      .input('Department', sql.VarChar(50), dept)
      .input('semester',   sql.VarChar(10), sem)
      .input('Class',      sql.VarChar(50), `I ${dept}`)
      .query(`
        SELECT Name, attendance_percentage, leaves
        FROM vw_Attendance_Stats
        WHERE (Department = @Department OR Class LIKE 'I ' + @Department + '%')
          AND Semester = @semester
          AND attendance_percentage BETWEEN 80 AND 100;
      `);
        const studentatt = await pool
        .request()
        .input('department', sql.VarChar, dept)
        .input('semester',   sql.VarChar(10), sem)
        .query(`
           SELECT 
  name,
  attendance_percentage,
  leaves
FROM vw_Attendance_Stats
WHERE (Department = @Department OR Class LIKE 'I ' + @Department + '%')
  AND Semester = @semester
  AND Today_Status = 'Present';

 `);
 const staffatt = await pool
        .request()
        .input('department', sql.VarChar, dept)
        .query(`
        	 SELECT 
  s.name,
  COUNT(CASE WHEN a.status = 'Present' THEN 1 END) * 100.0 / COUNT(*) AS attendance_percentage,
  SUM(CASE WHEN a.status = 'Absent' THEN 1 ELSE 0 END) AS leaves
FROM staffattendance s
JOIN attendance_staff a ON s.staff_id = a.staff_id
WHERE s.department =@department
  AND s.staff_id IN (
    SELECT a.staff_id 
    FROM attendance_staff
    WHERE a.status = 'Present'
      AND CAST(a.date AS DATE) = CAST(GETDATE() AS DATE)
  )
GROUP BY s.name
 `);
  
  
      res.status(200).json({
        excellent: excel.recordset,
        good1: good.recordset,
        average: avg.recordset,
        poor1: poor.recordset,
        studentattended:studentatt.recordset,
        staffattended:staffatt.recordset    
      });
  
    } catch (err) {
      res.status(500).send("Error while fetching counts: " + err.message);
    }
  });

  let students = [
    { id: 1, name: "Vishnu", dept: "CSE" },
    { id: 2, name: "Arun", dept: "ECE" },
    { id: 3, name: "Ravi", dept: "MECH" },
  ];
  
  app.get('/students7', (req, res) => {
    res.json(students);
  });
  
app.put('/students7/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, dept } = req.body;
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index].name = name;
    students[index].dept = dept;
    res.json({ message: "Updated successfully" });
  } else {
    res.status(404).json({ message: "Student not found" });
  }
});

  
  app.put('/students8/:Reg_Number', async (req, res) => {
    try {
      const Reg_Number =req.params.Reg_Number; // from URL
      const { Name, Address, Mobile, Father_Mobile } = req.body;
    
      const pool = await poolPromise;
      console.log(req.body);
      // <50%
      const result = await pool.request()
        .input('Name', sql.NVarChar, Name)
        .input('Address', sql.NVarChar, Address)
        .input('Mobile', sql.NVarChar, Mobile)
        .input('Father_Mobile', sql.NVarChar, Father_Mobile)
        .input('Reg_Number', sql.VarChar, Reg_Number)  // Use sql.Int for Reg_Number
    
        .query(`UPDATE Student_Master SET Name = @Name, Address = @Address, Mobile = @Mobile, Father_Mobile = @Father_Mobile
                WHERE Reg_Number = @Reg_Number`);
    
      res.status(200).json(result.recordset);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
// Express.js backend example
// app.get("/Student.html", (req, res) => {
//   const name = req.query.Name;
//   const regno = req.query.Reg_Number;
//   const address = req.query.Address;
//   const mobile = req.query.Mobile;
//   const fatherMobile = req.query.Father_Mobile;

//   console.log(name, regno, address, mobile, fatherMobile);
// });
app.get('/facultytask/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`SELECT * FROM faculty_work4 WHERE Department = @dept`);
console.log(result.recordset);
    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/facultyinfo1/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`SELECT Staff_Name,photo,Designation, roleofwork, qualification, Experience_Year FROM Staff_Master WHERE Department = @dept`);
console.log(result.recordset);
    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/facultysearch/:dept", async (req, res) => {
  const dept = req.params.dept;
  const searchTerm = req.query.q;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("searchTerm", sql.VarChar, `%${searchTerm}%`)
      .input('department', sql.VarChar, dept)
      .query(`
        SELECT  Staff_Name,photo, Designation, roleofwork, qualification, Experience_Year 
        FROM Staff_Master
        WHERE LOWER(Staff_Name) LIKE LOWER(@searchTerm)
           OR LOWER(roleofwork) LIKE LOWER(@searchTerm)
           OR LOWER(Designation) LIKE LOWER(@searchTerm)
          and  Department = @department 
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});
app.get('/studentcount/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    const year1 = await pool
      .request()
      .input('Class', `I ${dept}`)
      .query(`SELECT COUNT(*) AS count FROM Student_Master WHERE Class LIKE @Class + '%'`);

    const year2 = await pool
      .request()
      .input('Class', `II ${dept}`)
      .query(`SELECT COUNT(*) AS count FROM Student_Master WHERE Class LIKE @Class + '%'`);

    const year3 = await pool
      .request()
      .input('Class', `III ${dept}`)
      .query(`SELECT COUNT(*) AS count FROM Student_Master WHERE Class LIKE @Class + '%'`);

    const year4 = await pool
      .request()
      .input('Class', `IV ${dept}`)
      .query(`SELECT COUNT(*) AS count FROM Student_Master WHERE Class LIKE @Class + '%'`);

    res.status(200).json({
      year1: year1.recordset[0].count,
      year2: year2.recordset[0].count,
      year3: year3.recordset[0].count,
      year4: year4.recordset[0].count,
    });
  } catch (err) {
    res.status(500).send('Error while fetching counts: ' + err.message);
  }
});

app.get("/studentsearch/:dept", async (req, res) => {
  const dept = req.params.dept;
  const searchTerm = req.query.q;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("searchTerm", sql.VarChar, `%${searchTerm}%`)
      .input('Department', sql.VarChar, dept)
      .input('Class', `I ${dept}`)
      .query(`
        SELECT  Name,photo,placed,placed_company,Reg_Number,Arrear_Status,Mobile
        FROM Student_Master
        WHERE LOWER(Name) LIKE LOWER(@searchTerm)
           OR LOWER(Reg_Number) LIKE LOWER(@searchTerm)
           OR LOWER(placed_Company) LIKE LOWER(@searchTerm)
           OR LOWER(Arrear_Status) LIKE LOWER(@searchTerm)
          and (Department = @Department OR Class LIKE CONCAT(@Class, '%'))
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
});

app.get('/performancetop3/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    
    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`
        SELECT TOP 3 Staff_Name, Performance, Workshops, Research_Papers
        FROM Staff_Master
        WHERE Department = @dept
        ORDER BY Staff_Name;
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/studentdet/:regNumber', async (req, res) => {
  try {
    const regNumber = req.params.regNumber;
    const pool = await poolPromise;
    
    const result = await pool
      .request()
      .input('Reg_Number', sql.VarChar, regNumber)
      .query(`
        SELECT Name,photo,Section,placed,placed_company,Reg_Number,Arrear_Status,Mobile
        FROM Student_Master
        WHERE Reg_Number = @Reg_Number;
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/performance/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`
        SELECT 
          Staff_Name, 
          Performance, 
          Workshops,
          Staff_Code,
          Student_Feedback,
          Research_Papers,
          Department
        FROM Staff_Master
        WHERE Department = @dept;
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("Error fetching performance data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/studentacadamicdet/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;
    
    const dull = await pool
      .request()
      .input('Department', sql.VarChar, dept)
      .query(`
        SELECT Name, photo, CGPA,Class, Section, placed, placed_company, Reg_Number, Arrear_Status, Mobile
        FROM Student_Master
        WHERE CGPA <= 6 AND Department = @Department;
      `);
      const Arrear = await pool
      .request()
      .input('Department', sql.VarChar, dept)
      .input('Class', `I ${dept}`)
      .query(`
        SELECT Name, photo, CGPA,Class, Section, placed, placed_company, Reg_Number, Arrear_Status, Mobile
        FROM Student_Master
        WHERE Arrear_Status != 'nil'  AND (Department = @Department OR Class LIKE CONCAT(@Class, '%')) ;
      `);
      const average = await pool
      .request()
      .input('Department', sql.VarChar, dept)
      .input('Class', `I ${dept}`)
      .query(`
        SELECT Name, photo, CGPA, Class,Section, placed, placed_company, Reg_Number, Arrear_Status, Mobile
        FROM Student_Master
        WHERE CGPA > 6 and CGPA<=7.5  AND  (Department = @Department OR Class LIKE CONCAT(@Class, '%'));
      `);
      const good = await pool
      .request()
      .input('Department', sql.VarChar, dept)
      .input('Class', `I ${dept}`)
      .query(`
        SELECT Name, photo, CGPA,Class, Section, placed, placed_company, Reg_Number, Arrear_Status, Mobile
        FROM Student_Master
        WHERE CGPA >7.5 and CGPA<=8.5 AND  (Department = @Department OR Class LIKE CONCAT(@Class, '%'));
      `);
      const best = await pool
      .request()
      .input('Department', sql.VarChar, dept)
      .input('Class', `I ${dept}`)
      .query(`
        SELECT Name, photo, CGPA,Class, Section, placed, placed_company, Reg_Number, Arrear_Status, Mobile
        FROM Student_Master
        WHERE CGPA >8.5 and CGPA<=10  AND  (Department = @Department OR Class LIKE CONCAT(@Class, '%'));
      `);


      res.status(200).json({
        dull: dull.recordset,
        average: average.recordset,
        good: good.recordset,
        best: best.recordset 
        ,Arrear: Arrear.recordset   
      });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/dashattdet/:dept", async (req, res) => {
  const dept = req.params.dept;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('department', sql.VarChar, dept)
      .input('Class', `I ${dept}`)
      .query(`
        

WITH WorkingDays AS (
   SELECT Date1 AS att_date
FROM Academic_Calendar
WHERE Status = 'Working Day'
  AND Date1 <= CAST(GETDATE() AS DATE)
),
StudentMaster AS (
    SELECT Reg_Number, Name
    FROM Student_Master
    WHERE Department = @department or Class LIKE @Class + '%'
),
StudentAttendance AS (
    SELECT Reg_Number, att_date
    FROM Student_Attendance
    WHERE Period IS NOT NULL
    GROUP BY Reg_Number, att_date
)

SELECT 
    sm.Reg_Number,
    sm.Name,
    COUNT(wd.att_date) AS Total_Working_Days,
    COUNT(CASE WHEN sa.att_date IS NOT NULL THEN 1 END) AS Full_Day_Absents,
    COUNT(CASE WHEN sa.att_date IS  NULL THEN 1 END) AS Present_Days,
    CAST(100.0 * COUNT(CASE WHEN sa.att_date IS  NULL THEN 1 END) / COUNT(wd.att_date) AS DECIMAL(5,2)) AS attendance
FROM StudentMaster sm
CROSS JOIN WorkingDays wd
LEFT JOIN StudentAttendance sa 
    ON sa.Reg_Number = sm.Reg_Number AND sa.att_date = wd.att_date
GROUP BY sm.Reg_Number, sm.Name;

      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ message: "failed" });
  }
});
app.get('/transport/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('dept', sql.VarChar, dept)
      .query(`
        SELECT 
       Name,Reg_Number,busNumber,feeStatus,Transport_Details,Hosteler
        FROM Student_Master
        WHERE Department = @dept;
      `);

    res.status(200).json(result.recordset);

  } catch (err) {
    console.error("Error fetching performance data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/hostelcount/:dept', async (req, res) => {
  try {
    const dept = req.params.dept;
    const pool = await poolPromise;

    const hosteler = await pool
      .request()
      .input('Class', `${dept}`)
      .query(`SELECT COUNT(*) AS count FROM Student_Master WHERE Class LIKE '%'+@Class + '%' and Hosteler='yes'`);
      const hostellerpresent = await pool
      .request()
      .input('Class', `${dept}`)
      .query(`SELECT COUNT(*) AS count
    FROM vw_Attendance_Stats v
    WHERE v.Reg_Number IN (
        SELECT Reg_Number
        FROM Student_Master
        WHERE Class LIKE '%' + @Class + '%'
          AND Hosteler = 'yes'
    )
    AND v.Today_Status = 'Present';
    `);

    


    res.status(200).json({
    Totalcount: hosteler.recordset[0].count,
      present_today_count : hostellerpresent.recordset[0].count,
      absent_today_count: hosteler.recordset[0].count-hostellerpresent.recordset[0].count 
    });

    







  } catch (err) {
    res.status(500).send('Error while fetching counts: ' + err.message);
  }
});















  
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});