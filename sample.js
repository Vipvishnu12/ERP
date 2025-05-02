const internalExamData = [
    { student: "Ajay", subject: "Maths", mark: 75, semester: 1 },
    { student: "Ajay", subject: "Physics", mark: 80, semester: 2 },
    { student: "Ajay", subject: "English", mark: 85, semester: 3 },
    { student: "Ajay", subject: "Computer Science", mark: 90, semester: 4 },
  
    { student: "Divya", subject: "Maths", mark: 90, semester: 1 },
    { student: "Divya", subject: "Physics", mark: 91, semester: 2 },
    { student: "Divya", subject: "English", mark: 89, semester: 3 },
    { student: "Divya", subject: "Computer Science", mark: 95, semester: 4 }
  ];
function getLatestInternalData(data) {
    const grouped = {};
  
    data.forEach(entry => {
      if (!grouped[entry.student]) {
        grouped[entry.student] = [];
      }
      grouped[entry.student].push(entry);
    });
  
    const latestPerStudent = {};
    Object.keys(grouped).forEach(student => {
      const sorted = grouped[student].sort((a, b) => b.semester - a.semester);
      latestPerStudent[student] = sorted[0]; // latest semester entry
    });
  
    return latestPerStudent;
  }
  console.log(getLatestInternalData(internalExamData));