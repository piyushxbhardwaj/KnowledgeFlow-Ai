import React from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  FileText, 
  Search, 
  BarChart2, 
  LogOut,
  FolderOpen,
  X,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';

export default function Sidebar({ 
  user, 
  activePage, 
  setActivePage, 
  onLogout,
  isDesktopCollapsed,
  toggleDesktopSidebar,
  isSidebarOpen,
  setIsSidebarOpen
}) {
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

  const sidebarClasses = `sidebar ${isDesktopCollapsed ? 'collapsed' : ''} ${isSidebarOpen ? 'mobile-open' : ''}`;

  return (
    <div className={sidebarClasses}>
      
      {/* Desktop Toggle Button - Hidden on mobile via CSS */}
      <button className="sidebar-toggle-btn" onClick={toggleDesktopSidebar} title={isDesktopCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}>
        {isDesktopCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
      </button>

      <div className="logo-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FolderOpen size={28} style={{ color: '#8B5CF6' }} />
          <span className="logo-text">KnowledgeFlow AI</span>
        </div>
        
        {/* Mobile Close Button - Only renders when mobile drawer is open */}
        {isSidebarOpen && (
          <button 
            style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex' }} 
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        )}
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
                title={isDesktopCollapsed ? item.label : undefined}
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
        
        <button className="btn-logout" onClick={onLogout} title={isDesktopCollapsed ? "Logout" : undefined}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
