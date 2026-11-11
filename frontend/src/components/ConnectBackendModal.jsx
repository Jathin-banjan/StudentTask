import React, { useState } from 'react';
import { X, Link2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { getGraphqlEndpoint, saveCustomEndpoint, testBackendConnection } from '../services/graphqlService';

const ConnectBackendModal = ({ isOpen, onClose, onConnected }) => {
  const currentEndpoint = getGraphqlEndpoint();
  const [inputUrl, setInputUrl] = useState(
    currentEndpoint.startsWith('http') ? currentEndpoint.replace('/graphql', '') : ''
  );
  const [isTesting, setIsTesting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text }

  if (!isOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setStatus({ type: 'error', text: 'Please enter your Render backend URL.' });
      return;
    }

    try {
      setIsTesting(true);
      setStatus(null);

      await testBackendConnection(inputUrl);

      saveCustomEndpoint(inputUrl);
      setStatus({ type: 'success', text: 'Successfully connected to Render backend!' });

      setTimeout(() => {
        onConnected();
        onClose();
      }, 1200);
    } catch (err) {
      setStatus({
        type: 'error',
        text: `Connection failed: ${err.message}. Make sure the backend is live on Render.`,
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleReset = () => {
    saveCustomEndpoint(null);
    setInputUrl('');
    setStatus({ type: 'success', text: 'Reset to default relative endpoint.' });
    setTimeout(() => {
      onConnected();
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <div className="modal-icon-badge">
              <Link2 size={20} />
            </div>
            <div>
              <h2 className="modal-title">Connect Render Backend</h2>
              <p className="modal-subtitle">Paste your live Render URL to connect the frontend instantly</p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleTestAndSave} className="task-form">
          <div className="form-group">
            <label className="form-label">
              Render Backend URL <span className="required-star">*</span>
            </label>
            <input
              type="url"
              className="form-input"
              placeholder="https://student-task-backend.onrender.com"
              value={inputUrl}
              onChange={(e) => {
                setInputUrl(e.target.value);
                setStatus(null);
              }}
              autoFocus
            />
            <span className="optional-tag" style={{ marginTop: '0.25rem' }}>
              Current active endpoint: <code>{currentEndpoint}</code>
            </span>
          </div>

          {status && (
            <div className={`toast-notification toast-${status.type}`} style={{ margin: 0 }}>
              {status.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span className="toast-text">{status.text}</span>
            </div>
          )}

          <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReset}
              disabled={isTesting}
            >
              Reset
            </button>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={isTesting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <RefreshCw size={14} className="spin-icon" /> Testing...
                  </>
                ) : (
                  <>
                    <Link2 size={15} /> Connect Now
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectBackendModal;
