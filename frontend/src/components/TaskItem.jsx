// components/TaskItem.jsx
// Renders a single task row plus its Edit/Delete/status-toggle buttons.
// Pure presentational component — all state lives in the parent (Dashboard).

const TaskItem = ({ task, onEdit, onDelete, onToggleStatus }) => {
  return (
    <div className={`task-item priority-${task.priority}`}>
      <div className="task-main">
        <h4 style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
          {task.title}
        </h4>
        {task.description && <p>{task.description}</p>}
        <div className="task-meta">
          <span className={`badge status-${task.status}`}>{task.status}</span>
          <span className={`badge priority-badge-${task.priority}`}>{task.priority}</span>
          {task.dueDate && <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>}
        </div>
      </div>

      <div className="task-actions">
        <button onClick={() => onToggleStatus(task)}>
          {task.status === 'done' ? 'Reopen' : 'Mark Done'}
        </button>
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task._id)} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
};

export default TaskItem;
