// components/TaskForm.jsx
// Controlled form used for BOTH creating a new task and editing an
// existing one. `editingTask` prop decides which mode it's in.

import { useState, useEffect } from 'react';

const emptyForm = { title: '', description: '', status: 'todo', priority: 'medium', dueDate: '' };

const TaskForm = ({ onSubmit, editingTask, onCancelEdit }) => {
  const [form, setForm] = useState(emptyForm);

  // When "editingTask" changes (user clicked Edit), pre-fill the form
  useEffect(() => {
    if (editingTask) {
      setForm({
        title: editingTask.title || '',
        description: editingTask.description || '',
        status: editingTask.status || 'todo',
        priority: editingTask.priority || 'medium',
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingTask]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
    setForm(emptyForm);
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h3>{editingTask ? 'Edit Task' : 'New Task'}</h3>

      <input
        name="title"
        placeholder="Task title"
        value={form.title}
        onChange={handleChange}
        required
      />

      <textarea
        name="description"
        placeholder="Description (optional)"
        value={form.description}
        onChange={handleChange}
      />

      <div className="form-row">
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>

        <select name="priority" value={form.priority} onChange={handleChange}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} />
      </div>

      <div className="form-actions">
        <button type="submit">{editingTask ? 'Update' : 'Add Task'}</button>
        {editingTask && (
          <button type="button" onClick={onCancelEdit}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default TaskForm;
