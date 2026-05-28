import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Search, 
  BarChart2, 
  LogOut,
  FolderOpen
} from 'lucide-react';

export default function Sidebar({ user, activePage, setActivePage, onLogout }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'User'] },
    { id: 'tasks', label: 'My Tasks', icon: CheckSquare, roles: ['User'] },
    { id: 'admin-tasks', label: 'Manage Tasks', icon: CheckSquare, roles: ['Admin'] },
    { id: 'documents', label: 'Documents', icon: FileText, roles: ['Admin', 'User'] },
    { id: 'search', label: 'AI Search', icon: Search, roles: ['Admin', 'User'] },
    { id: 'analytics', label: 'Analytics', icon: BarChart2, roles: ['Admin'] },
  ];

  const userRole = user?.role?.name || (user?.role_id === 1 ? 'Admin' : 'User');
  const filteredItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <div className="sidebar">
      <div className="logo-container">
        <FolderOpen size={28} style={{ color: '#8B5CF6' }} />
        <span className="logo-text">KnowledgeFlow AI</span>
      </div>
      
      <ul className="nav-links">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id || (item.id === 'dashboard' && activePage === '');
          return (
            <li key={item.id}>
              <a 
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActivePage(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      
      <div className="user-profile-section">
        <div className="user-info">
          <div className="user-avatar">
            {user?.username?.substring(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="user-meta">
            <span className="user-name">{user?.username || 'User'}</span>
            <span className="user-role">{userRole}</span>
          </div>
        </div>
        
        <button className="btn-logout" onClick={onLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
