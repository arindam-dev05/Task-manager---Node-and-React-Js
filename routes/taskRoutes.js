// routes/taskRoutes.js
// Every route here passes through `protect` first — meaning a valid
// JWT is required before the request ever reaches taskController.

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');

router.use(protect); // applies to all routes below

router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
