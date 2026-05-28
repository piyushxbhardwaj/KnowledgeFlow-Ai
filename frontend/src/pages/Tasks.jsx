import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  CheckCircle, 
  AlertCircle, 
  Filter, 
  User, 
  FileText, 
  X,
  PlusCircle
} from 'lucide-react';
import Modal from '../components/Modal';

export default function Tasks({ user, token, apiBase }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newAssignee, setNewAssignee] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userRole = user?.role?.name || (user?.role_id === 1 ? 'Admin' : 'User');
  const isAdmin = userRole === 'Admin';

  const fetchTasks = async () => {
    setLoading(true);
    try {
      let url = `${apiBase}/tasks?`;
      if (filterStatus) url += `status=${filterStatus}&`;
      if (filterAssignee) url += `assigned_to=${filterAssignee}&`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch tasks.');
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${apiBase}/tasks/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchTasks();
    if (isAdmin) {
      fetchUsers();
    }
  }, [filterStatus, filterAssignee, apiBase, token, isAdmin]);

  const handleCompleteTask = async (taskId) => {
    try {
      const response = await fetch(`${apiBase}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Completed' })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to update task.');
      }
      
      // Update local state
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: 'Completed' } : t));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTitle || !newAssignee) {
      alert('Please provide a title and assign the task to a user.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${apiBase}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          assigned_to: parseInt(newAssignee)
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Failed to create task.');
      }

      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewAssignee('');
      fetchTasks(); // Reload task list
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">{isAdmin ? 'Manage System Tasks' : 'My Assigned Tasks'}</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isAdmin ? 'Create, assign, and track all tasks.' : 'View and update your assigned tasks.'}
          </p>
        </div>
        
        {isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Filters Row */}
      <div className="filter-row glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '1rem', color: 'var(--text-secondary)' }}>
          <Filter size={16} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filters:</span>
        </div>
        
        <select 
          className="form-select filter-select"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        {isAdmin && (
          <select 
            className="form-select filter-select"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
          >
            <option value="">All Assignees</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.username} ({u.role?.name || (u.role_id === 1 ? 'Admin' : 'User')})</option>
            ))}
          </select>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Task Cards Grid */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading tasks...
        </div>
      ) : tasks.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
          <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
          <h3>No tasks found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            No tasks match your current filters.
          </p>
        </div>
      ) : (
        <div className="cards-grid">
          {tasks.map(task => (
            <div key={task.id} className="glass-card task-card">
              <div className="task-card-header">
                <h4 className="task-card-title">{task.title}</h4>
                <span className={`badge ${task.status === 'Completed' ? 'badge-completed' : 'badge-pending'}`}>
                  {task.status}
                </span>
              </div>
              <p className="task-card-desc">{task.description || 'No description provided.'}</p>
              
              <div style={{ flex: 1 }} />

              {task.status === 'Pending' && (
                <button 
                  className="btn btn-secondary"
                  style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.2)', color: 'var(--secondary)', background: 'rgba(16, 185, 129, 0.05)' }}
                  onClick={() => handleCompleteTask(task.id)}
                >
                  <CheckCircle size={16} />
                  <span>Mark as Completed</span>
                </button>
              )}

              <div className="task-card-footer">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <User size={12} />
                  <span>Assigned: {task.assignee?.username || `User #${task.assigned_to}`}</span>
                </div>
                <span>{new Date(task.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Creation Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Create & Assign New Task"
      >
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Verify password hashing functions"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              disabled={submitting}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description (Optional)</label>
            <textarea
              className="form-textarea"
              placeholder="Provide context or instructions for completing this task..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.75rem' }}>
            <label className="form-label">Assign To</label>
            <select
              className="form-select"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              disabled={submitting}
              required
            >
              <option value="">Select a user...</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.username} ({u.role?.name || (u.role_id === 1 ? 'Admin' : 'User')})</option>
              ))}
            </select>
          </div>

          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
