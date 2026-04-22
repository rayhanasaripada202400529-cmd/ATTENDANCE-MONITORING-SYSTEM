const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

function readData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({
        users: [],
        students: [],
        attendance: [],
      })
    );
  }
  return JSON.parse(fs.readFileSync(DATA_FILE));
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return Date.now().toString();
}

app.post('/api/students', (req, res) => {
  const data = readData();
  const newStudent = { id: generateId(), ...req.body };
  data.students.push(newStudent);
  writeData(data);
  res.json(newStudent);
});

app.get('/api/students', (req, res) => {
  res.json(readData().students);
});

app.put('/api/students/:id', (req, res) => {
  const data = readData();
  const index = data.students.findIndex((s) => s.id === req.params.id);

  if (index !== -1) {
    data.students[index] = { ...data.students[index], ...req.body };
    writeData(data);
    res.json(data.students[index]);
  } else {
    res.status(404).json({ message: 'Student not found' });
  }
});

app.delete('/api/students/:id', (req, res) => {
  const data = readData();
  data.students = data.students.filter((s) => s.id !== req.params.id);
  writeData(data);
  res.json({ message: 'Deleted' });
});

app.post('/api/attendance', (req, res) => {
  const data = readData();
  const record = { id: generateId(), ...req.body };
  data.attendance.push(record);
  writeData(data);
  res.json(record);
});

app.get('/api/attendance', (req, res) => {
  res.json(readData().attendance);
});

app.get('/api/attendance/summary/:studentId', (req, res) => {
  const data = readData();
  const records = data.attendance.filter(
    (a) => a.student_id === req.params.studentId
  );

  let present = 0;
  let absent = 0;

  records.forEach((r) => {
    if (r.status === 'present') present++;
    else absent++;
  });

  const percentage = records.length
    ? ((present / records.length) * 100).toFixed(2)
    : 0;

  let alert = null;
  if (absent >= 3) {
    alert = 'Warning: Frequent absences detected!';
  }

  res.json({
    total_present: present,
    total_absent: absent,
    attendance_percentage: percentage,
    alert,
  });
});

const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Attendance API (path-based) is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
