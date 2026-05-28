import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  UploadCloud, 
  AlertCircle,
  Database,
  Calendar,
  Layers
} from 'lucide-react';

export default function Documents({ user, token, apiBase }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Upload Form states
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');

  const userRole = user?.role?.name || (user?.role_id === 1 ? 'Admin' : 'User');
  const isAdmin = userRole === 'Admin';

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiBase}/documents`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to load documents.');
      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [apiBase, token]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.name.endsWith('.txt')) {
        alert('Only plain text (.txt) files are supported.');
        e.target.value = null;
        return;
      }
      setFile(selectedFile);
      // Auto fill title if empty
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert('Please choose a file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setUploadSuccess('');

    const formData = new FormData();
    formData.append('file', file);
    if (title) {
      formData.append('title', title);
    }

    try {
      const response = await fetch(`${apiBase}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Upload failed.');
      }

      setUploadSuccess('Document successfully uploaded and indexed!');
      setFile(null);
      setTitle('');
      // Reset input element
      e.target.reset();
      
      // Reload documents list
      fetchDocuments();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">Knowledge Base Documents</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            {isAdmin ? 'Upload text documents and build the AI semantic search knowledge base.' : 'View reference documents in the knowledge repository.'}
          </p>
        </div>
      </div>

      {/* Admin Upload Section */}
      {isAdmin && (
        <div className="glass-card" style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={20} style={{ color: 'var(--primary)' }} />
            <span>Upload Knowledge Document (.txt)</span>
          </h3>
          
          <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Document Title (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Password Reset Standard Operating Procedure"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Select Text File</label>
              <input
                type="file"
                className="form-input"
                accept=".txt"
                onChange={handleFileChange}
                disabled={uploading}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ height: '43px' }}
              disabled={uploading}
            >
              <span>{uploading ? 'Uploading & Indexing...' : 'Upload Document'}</span>
            </button>
          </form>

          {uploadSuccess && (
            <div style={{ marginTop: '1rem', color: 'var(--secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
              {uploadSuccess}
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && !uploading && (
        <div className="glass-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '1rem', marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      {/* Documents List */}
      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={20} style={{ color: '#3B82F6' }} />
          <span>Knowledge Repository ({documents.length})</span>
        </h3>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            Loading document library...
          </div>
        ) : documents.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No documents found</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {isAdmin ? 'Upload a plain text file above to get started.' : 'The administrator has not uploaded any files yet.'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="glass-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Uploaded Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 600 }}>
                      <FileText size={18} style={{ color: '#3B82F6' }} />
                      <span>{doc.title}</span>
                    </td>
                    <td>{doc.filename}</td>
                    <td>{(doc.file_size / 1024).toFixed(2)} KB</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                        <Calendar size={12} />
                        <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
