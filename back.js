const express = require('express');
const app = express();
const path = require('path');
const mysqlPool = require('./mysql');
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
    const classPrefix = `I ${dept}%`; // For LIKE filter

    const pool = await poolPromise;

    const result = await pool.request()
      .input('dept', sql.VarChar(50), dept)
      .input('classPattern', sql.VarChar(50), classPrefix)
      .query(`
        -- All counts fetched in a single round-trip
        WITH DistinctDays AS (
            SELECT DISTINCT att_date
            FROM Student_Subject_Hour
            WHERE Class LIKE '%' + @dept + '%'
              AND att_date <= CAST(GETDATE() AS DATE)
        ),
        AbsentDays AS (
            SELECT sa.Reg_Number, dd.att_date
            FROM DistinctDays dd
            CROSS JOIN (SELECT DISTINCT Reg_Number FROM Student_Attendance WHERE Class LIKE '%' + @dept + '%') sa
            LEFT JOIN Student_Attendance a
              ON sa.Reg_Number = a.Reg_Number
             AND dd.att_date = a.att_date
             AND a.Class LIKE '%' + @dept + '%'
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
        
        SELECT
          (SELECT COUNT(*) FROM Student_Master WHERE Department = @dept OR Class LIKE @classPattern) AS studentsCount,
          (SELECT COUNT(*) FROM Student_Master WHERE (Department = @dept OR Class LIKE @classPattern) AND placed = 'yes') AS placedCount,
          (SELECT COUNT(*) FROM Staff_Master WHERE Department = @dept) AS staffCount,
          (SELECT COUNT(*) FROM Staff_Master WHERE Department = @dept AND Staff_Type = 'non teaching') AS nonteachstaff,
          (SELECT COUNT(*) 
           FROM (
             SELECT Reg_Number, att_date
             FROM Student_Attendance
             WHERE Period IS NOT NULL
               AND att_date = CAST(GETDATE() AS DATE)
               AND Class LIKE '%' + @dept + '%'
             GROUP BY Reg_Number, att_date
           ) AS FullAbsentList
          ) AS absentees,
          (SELECT COUNT(DISTINCT Reg_Number)
           FROM GroupedAbsents
           WHERE ToDate >= DATEADD(DAY, -4, CAST(GETDATE() AS DATE))
          ) AS longabs
      `);

    const counts = result.recordset[0];

    res.status(200).json({
      studentsCount: counts.studentsCount,
      placedCount: counts.placedCount,
      staffCount: counts.staffCount,
      nonteachstaff: counts.nonteachstaff,
      absentees: counts.absentees,
      longabs: counts.longabs
    });

  } catch (err) {
    res.status(500).send("Error while fetching department stats: " + err.message);
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
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE (Department = @dept or Class LIKE @Class + '%') AND placed = @placed ");

    // Count staff in department
    
    const notwilling = await pool
    .request()
    .input('dept', dept)
    .input('Placement_not_willing', 'yes')
    .input('Class', `I ${dept}`)
    .query("SELECT COUNT(*) AS count FROM Student_Master WHERE (Department = @dept or Class LIKE @Class + '%') AND Placement_not_willing = @Placement_not_willing ");
    const notelligible = await pool
    .request()
    .input('dept', dept)
    .input('not_elligible', 'nil')
    .input('Class', `I ${dept}`)
    .query("SELECT COUNT(*) AS count FROM Student_Master WHERE (Department = @dept or Class LIKE @Class + '%') AND Arrear_Status != @not_elligible ");

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
      .query(`SELECT TOP 3 * FROM Staff_To_DO WHERE Department = @dept ORDER BY Work_Assign_Dt`);
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
      .query("SELECT COUNT(*) AS count FROM Student_Master WHERE (Department = @dept  OR Class LIKE CONCAT(@Class, '%')) AND placed = @placed");
  
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

    // Precompute Class value for optimization
    const classVal = `%${dept}%`;

    const pool = await poolPromise;

    // Query with the necessary fields
    const result = await pool
      .request()
      
      .input('Semester', sql.VarChar(10), sem)
      .input('Class', sql.VarChar(50), classVal)
      .query(`
        SELECT 
          Name,
          attendance_percentage,
          leaves,
          Today_Status,
          CASE
            WHEN attendance_percentage < 70 THEN 'poor'
            WHEN attendance_percentage BETWEEN 70 AND 80 THEN 'average'
            WHEN attendance_percentage BETWEEN 80 AND 90 THEN 'good'
            WHEN attendance_percentage BETWEEN 90 AND 100 THEN 'excellent'
            ELSE 'unknown'
          END AS Category
        FROM vw_Attendance_Stats
        WHERE ( Class LIKE @Class )
          AND Semester = @Semester
      `);

    const data = result.recordset;

    const response = {
      excellent: data.filter(d => d.Category === 'excellent'),
      good1: data.filter(d => d.Category === 'good'),
      average: data.filter(d => d.Category === 'average'),
      poor1: data.filter(d => d.Category === 'poor'),
      studentattended: data.filter(d => d.Today_Status === 'Absent')
    };

    res.status(200).json(response);

  } catch (err) {
    res.status(500).send("Error while fetching attendance: " + err.message);
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
      .query(`SELECT * FROM Staff_To_DO WHERE Department = @dept`);
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
      .input('Class', sql.VarChar, `I ${dept}`)
      .query(`
        SELECT 
            sm.Reg_Number,
            sm.Name,
            CAST(
                100.0 * COUNT(CASE WHEN sa.att_date IS NULL OR sa.Att_Status != 'A' OR sa.Att_Status IS NULL THEN 1 END) 
                / COUNT(wd.Date1) 
                AS DECIMAL(5,2)
            ) AS attendance
        FROM 
            Student_Master sm
        CROSS JOIN 
            (SELECT Date1 
             FROM Academic_Calendar 
             WHERE Status = 'Working Day' 
               AND Date1 <= CAST(GETDATE() AS DATE)) wd
        LEFT JOIN 
            (SELECT Reg_Number, att_date, Att_Status
             FROM Student_Subject_Hour
             WHERE Period IS NOT NULL
             GROUP BY Reg_Number, att_date, Att_Status) sa
        ON sa.Reg_Number = sm.Reg_Number AND sa.att_date = wd.Date1
        WHERE 
            sm.Department = @department 
            or sm.Class = @Class
        GROUP BY 
            sm.Reg_Number, sm.Name
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
    }); } catch (err) {
    res.status(500).send('Error while fetching counts: ' + err.message);
  }
});


  

const mysql = require('mysql2/promise');

// Define connections for each DB
const dbConfigs = {
  nri1: {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'smartnri1'
  },
  nri2: {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'smartnri2'
  },
  nri3: {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'smartnri3'
  },
  nri4: {
    host: 'localhost',
    user: 'root',
    password: '12345',
    database: 'smartnri4'
  }
};

// Route: /hosteldata/:block
app.get('/allhosteldata/:block', async (req, res) => {
  const block = req.params.block;
  if (!dbConfigs[block]) return res.status(400).send('Invalid block');

  try {
    const pool = await mysql.createPool(dbConfigs[block]);
    const [rows] = await pool.query('SELECT * FROM staff_master'); // common table name in all DBs
    res.json(rows);
    await pool.end();
  } catch (err) {
    res.status(500).send('Database Error: ' + err.message);
  }
});


app.get('/allhostelleavedata/:block', async (req, res) => {
  try {
    const block = req.params.block;
    const pool = await poolPromise;

    // Step 1: Get Present Students (SQL Server)
    const result = await pool
      .request()
      .query(`
        SELECT v.Mobile
        FROM Student_Master v
        WHERE v.Reg_Number IN (
            SELECT Reg_Number
            FROM vw_Attendance_Stats
            WHERE Today_Status = 'Present'
        )
        AND v.Hosteler = 'yes'
      `);

    const mobileNumbers = result.recordset.map(row => row.Mobile);

    // Step 2: Get all students from MySQL block
    const mysqlPool = await mysql.createPool(dbConfigs[block]);
    const [allStudents] = await mysqlPool.query(`SELECT * FROM staff_master where Institutions='NEC'`);

    // Step 3: Filter matching (present) students
    const presentStudents = allStudents.filter(student =>
      mobileNumbers.includes(student.Mobile)
    );

    // Step 4: Calculate leave students
    const leaveCount = allStudents.length - presentStudents.length;

    // Step 5: Send both data and count
    res.status(200).json({
      totalStudents: allStudents.length,
      leaveCount: presentStudents.length,
      presentCount: leaveCount,
      LeaveStudents: allStudents.filter(student => mobileNumbers.includes(student.Mobile))
    });

    await mysqlPool.end();

  } catch (err) {
    console.error("Error fetching hostel data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.post('/wadernlogin', async (req, res) => {
  const { username, password } = req.body;
console.log(req.body)
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('username', username)
      .input('Password', password)
      .query('SELECT * FROM users WHERE username = @username AND password = @Password');

    const user = result.recordset[0]; // or use result.recordset.length > 0

    res
      .status(user ? 200 : 401)
      .send(user ? "Login success" : "Unauthorized");
    
  } catch (err) {
    res.status(500).send("Server error");
  }
});


app.get('/parentsem/:regno', async (req, res) => {
  try {
    const regno = req.params.regno;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('regno', regno)
      .query(`
        SELECT 
          Reg_Number,
          Name,
          Semester,
          AvgGradePoint 
        FROM dbo.semester_grade_average 
        WHERE Reg_Number = @regno
      `);

    const records = result.recordset;
    if (!records.length) {
      return res.status(404).json({ message: 'No data for ' + regno });
    }
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const studentData = [
  { regNumber: "R001", semester: "I", avgGradePoint: 7.8 },
  { regNumber: "R001", semester: "II", avgGradePoint: 8.5 },
  { regNumber: "R001", semester: "III", avgGradePoint: 9.2 },
  { regNumber: "R002", semester: "I", avgGradePoint: 8.0 },
  { regNumber: "R002", semester: "II", avgGradePoint: 8.9 },
];
// app.get('/api/semester-data', (req, res) => {
//   res.json(studentData);
// });

app.get('/api/semester-data/:regno', async (req, res) => {
  try {
    const regno = req.params.regno;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('regno', regno)  // bind the parameter
      .query(`
        SELECT 
          Reg_Number,
          Name,
          Semester,
          AvgGradePoint 
        FROM dbo.semester_grade_average 
        WHERE Reg_Number = @regno
      `);  // notice @regno here

    const records = result.recordset;
    if (!records.length) {
      return res.status(404).json({ message: 'No data for ' + regno });
    }
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.get('/api/semester-dat/:regno', async (req, res) => {
  try {
    const regno = req.params.regno;
    const semester = req.query.semester;  // e.g. ?semester=I
    const pool = await poolPromise;

    // First query: CA1
    const result1 = await pool
      .request()
      .input('regno', sql.VarChar, regno)
      .input('Semester', sql.VarChar, semester)
      .query(`
        SELECT ROUND(AVG(Mark), 2) AS AvgCAT1
        FROM Exam_Marks
        WHERE Exam_Name = 'CA1'
          AND Reg_Number = @regno
          AND Semester   = @Semester;
      `);

    // Second query: CA2
    const result2 = await pool
      .request()
      .input('regno', sql.VarChar, regno)
      .input('Semester', sql.VarChar, semester)
      .query(`
        SELECT ROUND(AVG(Mark), 2) AS AvgCAT2
        FROM Exam_Marks
        WHERE Exam_Name = 'CA2'
          AND Reg_Number = @regno
          AND Semester   = @Semester;
      `);

    // Query for semester data
    const sem = await pool
      .request()
      .input('regno', regno)
      .input('Semester', sql.VarChar, semester)  // bind the parameter
      .query(`
        SELECT 
          Reg_Number,
          Name,
          Semester,
          AvgGradePoint 
        FROM dbo.semester_grade_average 
        WHERE Reg_Number = @regno AND Semester   = @Semester;
      `);  // notice @regno here

    // If no CA1 data, return 404
    if (!result1.recordset.length) {
      return res
        .status(404)
        .json({ message: 'No data found for the given student and semester.' });
    }

    const ca1 = result1.recordset[0].AvgCAT1;
    const ca2 = (result2.recordset[0] || { AvgCAT2: 0 }).AvgCAT2;

    // Scale and round
    const avg1 = parseFloat(((ca1 / 75) * 10).toFixed(2));
    const avg2 = parseFloat(((ca2 / 75) * 10).toFixed(2));

    // Extract AvgGradePoint from the semester data (if exists)
    const avgGradePoint = sem.recordset.length ? sem.recordset[0].AvgGradePoint : 0;

    // Send as an array under AvgGradePoint
    res.json([
      { AvgGradePoint: avg1, Semester: 'cat1' },
      { AvgGradePoint: avg2, Semester: 'cat2' },
      { AvgGradePoint: avgGradePoint, Semester: 'sem' }
    ]);

  } catch (error) {
    console.error('Error fetching semester data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.get('/api/par-cgpaatt-data/:regno', async (req, res) => {
  try {
    const pool = await poolPromise;
    const regno = req.params.regno;
  
    // Step 1: Get CGPA and Arrear_Status
    const semResult = await pool
      .request()
      
      .input('regno', regno) // bind the parameter
      .query(`
        SELECT CGPA, Arrear_Status ,Name
        FROM Student_Master 
        WHERE Reg_Number = @regno
      `);

    // Step 2: Get attendance_percentage
    const attendanceResult = await pool
      .request()
      .input('regno', regno) // bind the parameter
      .query(`
        SELECT attendance_percentage 
        FROM vw_Attendance_Stats 
        WHERE Reg_Number = @regno
      `);

    // Check if data exists
    if (semResult.recordset.length > 0 && attendanceResult.recordset.length > 0) {
      const studentData = semResult.recordset[0];
      const attendanceData = attendanceResult.recordset[0];

      res.json({
        Name: studentData.Name,
        CGPA: studentData.CGPA,
        Arrear_Status: studentData.Arrear_Status,
        Attendance_Percentage: attendanceData.attendance_percentage
      });
    } else {
      res.status(404).json({ message: 'No data found for the given register number.' });
    }
  } catch (err) {
    console.error("Error fetching student data:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get('/api/subdata/:regno', async (req, res) => {
  try {
    const regno = req.params.regno;
    const pool = await poolPromise;
    const semester = req.query.semester;  // e.g. ?semester=I
    const result = await pool
      .request()
      .input('regno', regno)
      .input('Semester', sql.VarChar, semester)   // bind the parameter
      .query(`
        SELECT 
          Course_Title,
         Grade
          
        FROM Exam_Marks
        WHERE Reg_Number = @regno and Semester=@Semester
      `);  // notice @regno here

    const records = result.recordset;
    if (!records.length) {
      return res.status(404).json({ message: 'No data for ' + regno });
    }
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/studentfulldaywise/:regno", async (req, res) => {
  const regno = req.params.regno;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('regno', sql.VarChar, regno)
      .query(`
        WITH CalendarDays AS (
          SELECT Date1, Status 
          FROM Academic_Calendar
          WHERE Date1 <= CAST(GETDATE() AS DATE)
        ),
        StudentAttendance AS (
          SELECT Reg_Number, att_date, Att_Status
          FROM Student_Subject_Hour
          WHERE Period IS NOT NULL
          GROUP BY Reg_Number, att_date, Att_Status
        )
        SELECT 
          cd.Date1 AS AttendanceDate,
          CASE 
            WHEN cd.Status != 'Working Day' THEN 'Holiday'
            WHEN sa.Att_Status = 'A' THEN 'Absent'
            WHEN sa.Att_Status IS NOT NULL THEN 'Present'
            ELSE 'Present' 
          END AS Status
        FROM 
          CalendarDays cd
        LEFT JOIN 
          StudentAttendance sa 
        ON 
          sa.att_date = cd.Date1 AND sa.Reg_Number = @regno
        ORDER BY cd.Date1
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ message: "failed" });
  }
});
app.get('/studentdaywise1/:regno/:date', async (req, res) => {
  try {
    const { regno, date } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('regno', sql.VarChar, regno)
      .input('date', sql.VarChar, date)
      .query(`SELECT Period, Course_Title, Att_Status 
              FROM Student_Subject_Hour 
              WHERE Reg_Number = @regno AND Att_Date = @date`);

    res.json(result.recordset);
  } catch (err) {
    console.error("error:", err);
    res.status(500).json({ message: "failed" });
  }
});


app.get('/api/teacher-status/:dept', async (req, res) => {
  const dept = req.params.dept;
  const today = new Date().toISOString().split('T')[0];

  try {
    const sqlPool = await poolPromise;

    // 1. Get staff from SQL Server
    const staffQuery = `
      SELECT Staff_Name, Staff_Code, Department, Mobile
      FROM Staff_Master 
      WHERE Staff_Code IS NOT NULL
      ${dept ? `AND Department = '${dept}'` : ''}
    `;
    const staffResult = await sqlPool.request().query(staffQuery);

    // 2. Get today's attendance from MySQL
    const [attendanceData] = await mysqlPool.query(
      `SELECT dd.Punch_Date, dd.Remark, dd.Mobile
       FROM dd
       WHERE DATE(dd.Punch_Date) = CURDATE()
       ${dept ? `AND dd.Department = ?` : ''}`,
      [dept]
    );

    // 3. Create status map for attendance
    const statusMap = {};
    attendanceData.forEach(row => {
      const remark = row.Remark?.toLowerCase();
      if (remark !== 'not punched') {
        statusMap[row.Mobile] = 'Present';
      }
    });

    // 4. Get LOP data from MySQL
    const [lopResults] = await mysqlPool.query(
      `SELECT Staff_Name, LOP_Count 
       FROM staff_lop_count
       WHERE Department = ?`,
      [dept]
    );

    // 5. Categorize LOP
    const lopData = {
      poor1: lopResults.filter(r => r.LOP_Count > 5),
      average: lopResults.filter(r => r.LOP_Count > 3 && r.LOP_Count <= 5),
      good1: lopResults.filter(r => r.LOP_Count > 1 && r.LOP_Count <= 3),
      excellent: lopResults.filter(r => r.LOP_Count <= 1)
    };

    // 6. Prepare final report (staff + today's attendance)
    const report = staffResult.recordset.map(staff => ({
      Staff_Name: staff.Staff_Name,
      Staff_Code: staff.Staff_Code,
      Today_Status: statusMap[staff.Mobile] || '-'
    }));

    // 7. Return everything
    res.json({
      todayStatus: report,
      lopCategory: lopData
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});




app.get("/api/children/:regno", async (req, res) => {
  const regno = req.params.regno;

  try {
    const pool = await poolPromise;

    // Step 1: Get the parent's mobile number from the given register number
    const mobileResult = await pool
      .request()
      .input("regno", sql.VarChar, regno)
      .query("SELECT Father_Mobile FROM Student_Master WHERE Reg_Number = @regno");

    if (mobileResult.recordset.length === 0)
      return res.json({ siblings: [] });

    const mobile = mobileResult.recordset[0].Father_Mobile;

    // Step 2: Fetch all children with the same mobile number
    const siblingsResult = await pool
      .request()
      .input("regno", sql.VarChar, regno)
      .input("mobile", sql.VarChar, mobile)
      .query("SELECT Reg_Number, Name FROM Student_Master WHERE Father_Mobile = @mobile and Reg_Number!=@regno");

    res.json({ siblings: siblingsResult.recordset });
  } catch (err) {
    console.error("SQL Server Error:", err);
    res.status(500).send("Server Error");
  }
});







app.get("/api/siblingdata/:regno", async (req, res) => {
  const regno = req.params.regno;

  try {
    const pool = await poolPromise;

    // Step 1: Get the parent's mobile number from the given register number
    const siblingsResult = await pool
      .request()
      .input("regno", sql.VarChar, regno)
      .query("SELECT Reg_Number, Name FROM Student_Master WHERE Reg_Number = @regno");

    res.json(siblingsResult.recordset);
  } catch (err) {
    console.error("SQL Server Error:", err);
    res.status(500).send("Server Error");
  }
});



app.post('/parentlogin', async (req, res) => {
  const { regno, Password } = req.body;
console.log(req.body)
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('regno', regno)
      .input('Password', Password)
      .query('SELECT * FROM parentlogin WHERE Reg_Number = @regno AND Password = @Password');

    const user = result.recordset[0]; // or use result.recordset.length > 0

    res
      .status(user ? 200 : 401)
      .send(user ? "Login success" : "Unauthorized");
    
  } catch (err) {
    res.status(500).send("Server error");
  }
});


app.get('/api/incidents/:regno', async (req, res) => {
  const regno = req.params.regno;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('regno', sql.VarChar, regno)
      .query('SELECT * FROM student_incidents WHERE Reg_Number = @regno');

    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/work/assign', async (req, res) => {
  const { assignBy, statusSelect, workDetails, targetDate, assignedTo, dept } = req.body;

  try {
    const pool = await poolPromise;
    const now = new Date();
    const formattedDate = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });

    if (assignedTo === 'all') {
      // Assign to one staff per duplicate mobile within the department
      const staffList = await pool.request()
      .input('Dept', sql.VarChar(255), dept)
      .query(`
        SELECT Staff_Name, Mobile, Department
        FROM Staff_Master
        WHERE Department = @Dept
      `);
    

      for (const staff of staffList.recordset) {
        await pool.request()
          .input('Staff_Name', sql.VarChar(255), staff.Staff_Name)
          .input('Mobile', sql.VarChar(255), staff.Mobile)
          .input('Work_Assign_By', sql.VarChar(255), assignBy)
          .input('Work_Assign_Dt', sql.VarChar(255), formattedDate)
          .input('Work_Details', sql.VarChar(255), workDetails)
          .input('Completion_Status', sql.VarChar(255), statusSelect)
          .input('Target_Dt', sql.VarChar(255), targetDate)
          .input('dept', sql.VarChar(255), dept)
          .query(`
            INSERT INTO Staff_To_DO 
              (Staff_Name, Mobile, Work_Assign_By, Work_Assign_Dt, Work_Details, Completion_Status, Target_Dt,Department)
            VALUES 
              (@Staff_Name, @Mobile, @Work_Assign_By, @Work_Assign_Dt, @Work_Details, @Completion_Status, @Target_Dt,@dept)
          `);
      }

      return res.status(200).json({ message: 'Work assigned to one staff per duplicate mobile (filtered by department).' });

    } else {
      // Assign to specific staff based on mobile (and optional department check)
      const result = await pool.request()
        .input('Mobile', sql.VarChar(255), assignedTo)
        .query(`SELECT TOP 1 Staff_Name, Mobile FROM Staff_Master WHERE Mobile = @Mobile`);

      if (result.recordset.length === 0) {
        return res.status(404).json({ message: 'Staff with given mobile and department not found.' });
      }

      const staff = result.recordset[0];

      await pool.request()
          .input('Staff_Name', sql.VarChar(255), staff.Staff_Name)
          .input('Mobile', sql.VarChar(255), staff.Mobile)
          .input('Work_Assign_By', sql.VarChar(255), assignBy)
          .input('Work_Assign_Dt', sql.VarChar(255), formattedDate)
          .input('Work_Details', sql.VarChar(255), workDetails)
          .input('Completion_Status', sql.VarChar(255), statusSelect)
          .input('Target_Dt', sql.VarChar(255), targetDate)
          .input('dept', sql.VarChar(255), dept)
          .query(`
            INSERT INTO Staff_To_DO 
              (Staff_Name, Mobile, Work_Assign_By, Work_Assign_Dt, Work_Details, Completion_Status, Target_Dt,Department)
            VALUES 
              (@Staff_Name, @Mobile, @Work_Assign_By, @Work_Assign_Dt, @Work_Details, @Completion_Status, @Target_Dt,@dept)
          `);

      return res.status(200).json({ message: 'Work assigned to specific staff in selected department.' });
    }

  } catch (err) {
    res.status(500).json({ error: 'Error assigning work: ' + err.message });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});