import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Search from './pages/Search';
import Tasks from './pages/Tasks';
import Documents from './pages/Documents';
import Sidebar from './components/Sidebar';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [activePage, setActivePage] = useState('dashboard');
  
  // Responsive sidebar state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile drawer
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(
    localStorage.getItem('sidebarCollapsed') === 'true'
  );

  const apiBase = "http://localhost:8000/api/v1";

  // Auto mobile detection and resize handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll on mobile when drawer is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isSidebarOpen]);

  const handleLogin = (data) => {
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // Ensure navigation closes mobile drawer
  const handlePageNavigation = (pageId) => {
    setActivePage(pageId);
    setIsSidebarOpen(false);
  };

  // Persist desktop toggle
  const toggleDesktopSidebar = () => {
    const newState = !isDesktopCollapsed;
    setIsDesktopCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', newState);
  };

  if (!token) {
    return <Login apiBase={apiBase} onLoginSuccess={handleLogin} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard user={user} token={token} apiBase={apiBase} setActivePage={handlePageNavigation} />;
      case 'search':
        return <Search user={user} token={token} apiBase={apiBase} />;
      case 'tasks':
      case 'admin-tasks':
        return <Tasks user={user} token={token} apiBase={apiBase} />;
      case 'documents':
        return <Documents user={user} token={token} apiBase={apiBase} />;
      default:
        return <Dashboard user={user} token={token} apiBase={apiBase} setActivePage={handlePageNavigation} />;
    }
  };

  return (
    <div className="app-container">
      {/* Mobile Header */}
      <header className="mobile-header">
        <button className="mobile-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          <Menu size={24} />
        </button>
        <h1>KnowledgeFlow</h1>
        <div style={{ width: 24 }}></div> {/* Spacer to center title */}
      </header>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <Sidebar 
        activePage={activePage} 
        setActivePage={handlePageNavigation} 
        onLogout={handleLogout} 
        user={user} 
        isDesktopCollapsed={isDesktopCollapsed}
        toggleDesktopSidebar={toggleDesktopSidebar}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <main className={`main-content ${isDesktopCollapsed ? 'collapsed' : ''}`}>
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
