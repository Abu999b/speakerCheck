import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pageAPI } from '../services/api';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddPage, setShowAddPage] = useState(false);
  const [newPageName, setNewPageName] = useState('');

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await pageAPI.getAll();
      setPages(response.data);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPage = async (e) => {
    e.preventDefault();
    try {
      await pageAPI.create({ name: newPageName, order: pages.length });
      setNewPageName('');
      setShowAddPage(false);
      fetchPages();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add page');
    }
  };

  const handleDeletePage = async (pageId) => {
    if (window.confirm('Are you sure? This will delete the page if it has no speakers.')) {
      try {
        await pageAPI.delete(pageId);
        fetchPages();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete page');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Speaker Availability Management</h1>
        <div className="user-info">
          <span>Welcome, {user?.username}</span>
          {isAdmin && <span className="admin-badge">Admin</span>}
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="pages-header">
          <h2>Speaker Categories</h2>
          {isAdmin && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAddPage(true)}
            >
              Add Category
            </button>
          )}
        </div>

        {pages.length === 0 ? (
          <div className="no-pages">
            <p>No categories available.</p>
            {isAdmin && <p>Click "Add Category" to create one.</p>}
          </div>
        ) : (
          <div className="pages-grid">
            {pages.map(page => (
              <div key={page._id} className="page-card">
                <h3>{page.name}</h3>
                <div className="page-actions">
                  <Link to={`/speakers/${page._id}`} className="btn btn-primary">
                    View Speakers
                  </Link>
                  {isAdmin && (
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDeletePage(page._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="disclaimer">
          <p><strong>⚠️ Important Guidelines:</strong></p>
          <p>• Update speaker availability ONLY when they are confirmed for a program</p>
          <p>• Do NOT misuse the system by updating your own name to avoid being a speaker</p>
          <p>• All changes are tracked and logged</p>
          <p>• Violations may result in disciplinary action</p>
        </div>
      </div>

      {showAddPage && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Category</h3>
            <form onSubmit={handleAddPage}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  value={newPageName}
                  onChange={(e) => setNewPageName(e.target.value)}
                  placeholder="e.g., Weekly Speakers, ICA Speakers"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn btn-primary">
                  Add Category
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowAddPage(false);
                    setNewPageName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;