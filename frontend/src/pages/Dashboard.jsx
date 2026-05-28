import React, { useEffect, useState } from 'react';
import { 
  CheckSquare, 
  FileText, 
  Search, 
  BarChart2,
  FilePlus, 
  ArrowRight,
  TrendingUp,
  Clock
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function Dashboard({ user, token, apiBase, setActivePage }) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalDocs: 0
  });
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const userRole = user?.role?.name || (user?.role_id === 1 ? 'Admin' : 'User');
  const isAdmin = userRole === 'Admin';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // 1. Fetch documents metadata
        const docsRes = await fetch(`${apiBase}/documents`, { headers });
        const docsData = await docsRes.ok ? await docsRes.json() : [];
        setRecentDocs(docsData.slice(-5).reverse()); // get last 5 uploaded
        
        // 2. Fetch tasks for counts
        const tasksRes = await fetch(`${apiBase}/tasks`, { headers });
        const tasksData = await tasksRes.ok ? await tasksRes.json() : [];
        
        if (isAdmin) {
          // If Admin, fetch system-wide analytics
          const analyticsRes = await fetch(`${apiBase}/analytics`, { headers });
          if (analyticsRes.ok) {
            const analyticsData = await analyticsRes.json();
            setStats({
              totalTasks: analyticsData.total_tasks,
              completedTasks: analyticsData.completed_tasks,
              pendingTasks: analyticsData.pending_tasks,
              totalDocs: docsData.length
            });
          }
        } else {
          // If User, count their own tasks
          const total = tasksData.length;
          const completed = tasksData.filter(t => t.status === 'Completed').length;
          setStats({
            totalTasks: total,
            completedTasks: completed,
            pendingTasks: total - completed,
            totalDocs: docsData.length
          });
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [apiBase, token, isAdmin]);

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Welcome back, {user?.username}!</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Here is what's happening with your workspace today.
          </p>
        </div>
        <div className="badge badge-role-admin" style={{ 
          background: isAdmin ? 'rgba(139, 92, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
          color: isAdmin ? 'var(--primary)' : 'var(--secondary)',
          borderColor: isAdmin ? 'rgba(139, 92, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)'
        }}>
          {userRole} Portal
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <StatsCard 
          label={isAdmin ? "Total System Tasks" : "My Total Tasks"} 
          value={stats.totalTasks} 
          icon={CheckSquare} 
          color="#8B5CF6" 
        />
        <StatsCard 
          label="Completed Tasks" 
          value={stats.completedTasks} 
          icon={CheckSquare} 
          color="#10B981" 
        />
        <StatsCard 
          label="Pending Tasks" 
          value={stats.pendingTasks} 
          icon={Clock} 
          color="#F59E0B" 
        />
        <StatsCard 
          label="Knowledge Base Docs" 
          value={stats.totalDocs} 
          icon={FileText} 
          color="#3B82F6" 
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', marginTop: '2.5rem' }}>
        {/* Quick Launchpad */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '1rem' }}
              onClick={() => setActivePage('search')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Search size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem' }}>AI Semantic Search</span>
              </div>
              <ArrowRight size={16} />
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '1rem' }}
              onClick={() => setActivePage(isAdmin ? 'admin-tasks' : 'tasks')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckSquare size={18} style={{ color: 'var(--secondary)' }} />
                <span style={{ fontSize: '0.9rem' }}>{isAdmin ? 'Manage System Tasks' : 'Complete Assigned Tasks'}</span>
              </div>
              <ArrowRight size={16} />
            </button>

            {isAdmin && (
              <button 
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '1rem' }}
                onClick={() => setActivePage('documents')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FilePlus size={18} style={{ color: '#3B82F6' }} />
                  <span style={{ fontSize: '0.9rem' }}>Upload Knowledge Document</span>
                </div>
                <ArrowRight size={16} />
              </button>
            )}

            {isAdmin && (
              <button 
                className="btn btn-secondary" 
                style={{ justifyContent: 'space-between', padding: '1rem' }}
                onClick={() => setActivePage('analytics')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <BarChart2 size={18} style={{ color: '#EC4899' }} />
                  <span style={{ fontSize: '0.9rem' }}>View Search Analytics</span>
                </div>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Recent Knowledge Base Uploads */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem' }}>
            Recent Knowledge Documents
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)' }}>
                Loading recent uploads...
              </div>
            ) : recentDocs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--text-muted)', gap: '0.5rem', padding: '1.5rem 0' }}>
                <FileText size={32} />
                <span style={{ fontSize: '0.85rem' }}>No documents uploaded yet.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {recentDocs.map((doc) => (
                  <div key={doc.id} className="doc-card glass-card" style={{ padding: '0.85rem 1.25rem', borderRadius: '0.75rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifycontent: 'center', border: '1px solid rgba(59, 130, 246, 0.2)', flexShrink: 0 }}>
                      <FileText size={18} style={{ color: '#3B82F6' }} />
                    </div>
                    <div className="doc-info">
                      <span className="doc-title" style={{ maxWidth: '180px' }}>{doc.title}</span>
                      <span className="doc-meta">
                        {(doc.file_size / 1024).toFixed(1)} KB • {new Date(doc.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
