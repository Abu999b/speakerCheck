import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { speakerAPI } from '../services/api';
import '../styles/SpeakerCard.css';

const SpeakerCard = ({ speaker, onUpdate, onDelete }) => {
  const { isAdmin } = useAuth();
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formData, setFormData] = useState({
    programDate: '',
    programTime: ''
  });
  const [updating, setUpdating] = useState(false);

  const isAvailable = speaker.availability.isAvailable;

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await speakerAPI.updateAvailability(speaker._id, {
        programDate: formData.programDate,
        programTime: formData.programTime,
        makeAvailable: false
      });
      setShowUpdateModal(false);
      setFormData({ programDate: '', programTime: '' });
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setUpdating(false);
    }
  };

  const handleMakeAvailable = async () => {
    if (window.confirm('Are you sure you want to make this speaker available again?')) {
      try {
        await speakerAPI.updateAvailability(speaker._id, { makeAvailable: true });
        onUpdate();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to update availability');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className={`speaker-card ${!isAvailable ? 'unavailable' : ''}`}>
        <div className="speaker-info">
          <h3>{speaker.name}</h3>
          <p><strong>Area:</strong> {speaker.area}</p>
          <p><strong>Phone:</strong> {speaker.phoneNumber}</p>
          
          <div className="availability-status">
            {isAvailable ? (
              <span className="status-badge available">Available</span>
            ) : (
              <>
                <span className="status-badge unavailable">Scheduled</span>
                <div className="program-details">
                  <p><strong>Date:</strong> {formatDate(speaker.availability.programDate)}</p>
                  <p><strong>Time:</strong> {speaker.availability.programTime}</p>
                  {speaker.availability.lockedBy && (
                    <p className="locked-by">
                      <strong>Assigned by:</strong> {speaker.availability.lockedBy.username}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="speaker-actions">
          {isAvailable ? (
            <button
              className="btn btn-warning"
              onClick={() => setShowUpdateModal(true)}
            >
              Schedule Program
            </button>
          ) : (
            <button
              className="btn btn-success"
              onClick={handleMakeAvailable}
            >
              Mark Available
            </button>
          )}

          {isAdmin && (
            <button
              className="btn btn-danger"
              onClick={() => onDelete(speaker._id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Schedule Program for {speaker.name}</h3>
            <form onSubmit={handleUpdateAvailability}>
              <div className="form-group">
                <label>Program Date</label>
                <input
                  type="date"
                  value={formData.programDate}
                  onChange={(e) => setFormData({ ...formData, programDate: e.target.value })}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div className="form-group">
                <label>Program Time</label>
                <input
                  type="time"
                  value={formData.programTime}
                  onChange={(e) => setFormData({ ...formData, programTime: e.target.value })}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Confirm Schedule'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowUpdateModal(false)}
                  disabled={updating}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default SpeakerCard;