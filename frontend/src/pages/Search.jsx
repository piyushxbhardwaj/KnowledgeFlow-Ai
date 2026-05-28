import React, { useState } from 'react';
import { Search, Sparkles, AlertCircle, FileText, Compass } from 'lucide-react';

export default function SearchPage({ user, token, apiBase }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return;

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const response = await fetch(`${apiBase}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: trimmedQuery })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Search query failed.');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-container">
      <div className="dashboard-header">
        <div>
          <h1 className="page-title">AI-Powered Semantic Search</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Find precise answers across all uploaded documents using local embeddings and vector database search.
          </p>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <form onSubmit={handleSearchSubmit} className="search-box-wrapper">
          <div className="search-input-wrapper">
            <Search size={20} className="search-icon-left" />
            <input
              type="text"
              className="form-input search-input"
              style={{ paddingLeft: '2.75rem', height: '48px', fontSize: '1rem', borderRadius: '0.85rem' }}
              placeholder="Ask anything (e.g. How do I configure password reset workflows?)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ borderRadius: '0.85rem', height: '48px', minWidth: '130px' }}
            disabled={loading || !query.trim()}
          >
            {loading ? (
              <span>Searching...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Search</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass-card" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', padding: '1rem' }}>
          {error}
        </div>
      )}

      {/* Search Results */}
      <div style={{ marginTop: '1rem' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0', gap: '1rem', color: 'var(--text-secondary)' }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '3px solid var(--glass-border)', 
              borderTopColor: 'var(--primary)', 
              borderRadius: '50%',
              animation: 'spin 1s linear infinite' 
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <span>Analyzing embeddings and querying FAISS vector database...</span>
          </div>
        ) : hasSearched && results.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
            <AlertCircle size={40} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <h3>No matching information found</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              We couldn't find any relevant snippets in the knowledge base. Try refining your keywords or uploading more documents.
            </p>
          </div>
        ) : !hasSearched ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 0', color: 'var(--text-muted)', gap: '1rem' }}>
            <Compass size={48} style={{ opacity: 0.5 }} />
            <p style={{ fontSize: '0.9rem', textAlign: 'center', maxWidth: '360px' }}>
              Enter a search query above. The system will encode your query into a vector and retrieve the closest context chunks.
            </p>
          </div>
        ) : (
          <div className="search-results-list">
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', paddingLeft: '0.25rem', marginBottom: '0.5rem' }}>
              Found {results.length} relevant matches sorted by vector similarity distance:
            </div>
            
            {results.map((result, index) => (
              <div key={index} className="glass-card search-result-card">
                <div className="search-result-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={16} style={{ color: '#3B82F6' }} />
                    <span className="search-result-title">{result.title}</span>
                  </div>
                  <span className="search-result-score">
                    Match Confidence: {(result.score * 100).toFixed(1)}%
                  </span>
                </div>
                
                <p className="search-result-text">
                  {result.text}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
