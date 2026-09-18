// pages/Dashboard.jsx
// The "main app" page. Owns the tasks state and all CRUD handlers,
// then passes data + callbacks down to TaskForm / TaskList / TaskItem.
// This is the classic React pattern: state lives at the lowest common
// parent, children are mostly "dumb" and just call the functions given to them.

import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch tasks once when the Dashboard mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/tasks');
      setTasks(data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // CREATE or UPDATE depending on whether editingTask is set
  const handleSubmit = async (formData) => {
    try {
      if (editingTask) {
        const { data } = await api.put(`/tasks/${editingTask._id}`, formData);
        setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
        setEditingTask(null);
      } else {
        const { data } = await api.post('/tasks', formData);
        setTasks([data, ...tasks]);
      }
    } catch (err) {
      setError('Failed to save task');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      setError('Failed to delete task');
    }
  };

  const handleToggleStatus = async (task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    try {
      const { data } = await api.put(`/tasks/${task._id}`, { status: newStatus });
      setTasks(tasks.map((t) => (t._id === data._id ? data : t)));
    } catch (err) {
      setError('Failed to update status');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {error && <p className="error">{error}</p>}

      <TaskForm
        onSubmit={handleSubmit}
        editingTask={editingTask}
        onCancelEdit={() => setEditingTask(null)}
      />

      {loading ? (
        <p>Loading tasks...</p>
      ) : (
        <TaskList
          tasks={tasks}
          onEdit={setEditingTask}
          onDelete={handleDelete}
          onToggleStatus={handleToggleStatus}
        />
      )}
    </div>
  );
};

export default Dashboard;
