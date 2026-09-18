// server.js
// Entry point. Wires everything together:
// env vars -> DB connection -> middleware -> routes -> start listening.

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors());          // allow the React app (different port) to call this API
app.use(express.json());  // parse incoming JSON bodies into req.body

// Route mounting: every request to /api/auth/* goes to authRoutes,
// every request to /api/tasks/* goes to taskRoutes.
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));

app.get('/', (req, res) => {
  res.send('Task Manager API is running');
});

// Basic centralized error handler (catches anything thrown after this point)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
