import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { speakerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SpeakerCard from './SpeakerCard';
import AddSpeakerModal from './AddSpeakerModal';
import '../styles/SpeakerList.css';

const SpeakerList = () => {
  const { pageId } = useParams();
  const { isAdmin } = useAuth();
  const [speakers, setSpeakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Wrap fetchSpeakers with useCallback
  const fetchSpeakers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await speakerAPI.getAll(pageId);
      setSpeakers(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load speakers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [pageId]); // Add pageId as dependency

  useEffect(() => {
    fetchSpeakers();
  }, [fetchSpeakers]); // Now fetchSpeakers is included

  const handleSpeakerAdded = () => {
    setShowAddModal(false);
    fetchSpeakers();
  };

  const handleSpeakerUpdated = () => {
    fetchSpeakers();
  };

  const handleSpeakerDeleted = async (speakerId) => {
    if (window.confirm('Are you sure you want to delete this speaker?')) {
      try {
        await speakerAPI.delete(speakerId);
        fetchSpeakers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete speaker');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading speakers...</div>;
  }

  return (
    <div className="speaker-list-container">
      <div className="speaker-list-header">
        <h2>Speakers</h2>
        {isAdmin && (
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Add Speaker
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {speakers.length === 0 ? (
        <div className="no-speakers">
          <p>No speakers available in this category.</p>
          {isAdmin && <p>Click "Add Speaker" to create one.</p>}
        </div>
      ) : (
        <div className="speakers-grid">
          {speakers.map(speaker => (
            <SpeakerCard
              key={speaker._id}
              speaker={speaker}
              onUpdate={handleSpeakerUpdated}
              onDelete={handleSpeakerDeleted}
            />
          ))}
        </div>
      )}

      <div className="disclaimer">
        <p><strong>⚠️ Important Notice:</strong></p>
        <p>• Update availability ONLY if the speaker is confirmed for the program</p>
        <p>• Do NOT update your own name to avoid being assigned as a speaker</p>
        <p>• Misuse of this system may result in disciplinary action</p>
      </div>

      {showAddModal && (
        <AddSpeakerModal
          pageId={pageId}
          onClose={() => setShowAddModal(false)}
          onSuccess={handleSpeakerAdded}
        />
      )}
    </div>
  );
};

export default SpeakerList;