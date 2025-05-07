
const nodemailer = require('nodemailer');


require('dotenv').config();
// Ensure mssql is installed





// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

let otpStore = {};


// Send OTP based on department
app.post('/send-otp', async (req, res) => {
  const { dept } = req.body;
  if (!dept) return res.status(400).json({ message: 'Department is required' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('Department', sql.VarChar, dept)
      .input('Designation', sql.VarChar, 'Professor and Head of the Department')
      .query('SELECT E_Mail FROM Staff_Master WHERE Department = @Department AND Designation = @Designation');

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: 'HoD not found' });

    const email = user.E_Mail;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[dept] = otp;

    console.log(otp);
  
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your 6 digit login OTP - Do not share',
      text: `Your OTP is ${otp}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error('Error sending OTP:', err);
        return res.status(500).json({ message: 'Failed to send OTP' });
      }
     
      res.json({ message: 'OTP sent successfully', email });
    });

  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send("Server error");
  }
});

// Verify OTP and reset password
app.post('/verify-otp', async (req, res) => { 
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required' });
  }
  console.log(newPassword);
  
  if (otpStore[email] !== otp) {
    return res.status(400).json({ success: false, message: 'Inva1lid OTP' });
  }

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('dept', sql.VarChar, email)
      .input('NewPassword', sql.VarChar, newPassword)
      .query(`UPDATE login2 SET Password = @NewPassword WHERE Department = @dept`);

    delete otpStore[email];
    return res.json({ success: true, message: 'Password reset successful' });

  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ success: false, message: 'Server error during password update' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
