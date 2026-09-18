// components/TaskList.jsx
// Just maps over the tasks array and renders a TaskItem for each one.

import TaskItem from './TaskItem';

const TaskList = ({ tasks, onEdit, onDelete, onToggleStatus }) => {
  if (!tasks.length) {
    return <p className="empty-state">No tasks yet. Add one above.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
};

export default TaskList;
