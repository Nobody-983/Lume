import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  KeyRound,
  RefreshCw,
  Server,
  ShieldCheck,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { Button } from './Button.jsx';
import { Modal } from './Modal.jsx';

export function ApiStatusDialog({ open, onClose }) {
  const {
    status,
    loading,
    refreshing,
    error,
    refresh,
    configured,
    demoAvailable,
    docs,
    serverReachable,
  } = useConfig();
  const integration = status?.integrations?.youcam;
  const statusTone = error ? 'offline' : loading ? 'loading' : configured ? 'live' : 'preview';
  const StatusIcon = configured ? CheckCircle2 : error ? CircleAlert : Server;
  const apiConsole = docs?.apiKeys || 'https://yce.makeupar.com/api-console/en/api-keys/';
  const skinDocs = docs?.skinAnalysis || 'https://docs.perfectcorp.com/reference/ai_skin_analysis/v2.1';

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="Connection & privacy"
      title="Inside Lumé"
      description="How the live AI connection works, and what happens to your photos."
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="secondary"
            icon={RefreshCw}
            onClick={refresh}
            loading={refreshing}
            disabled={loading}
          >
            Check connection
          </Button>
        </>
      }
    >
      <div className={`connection-card connection-card--${statusTone}`}>
        <span className="connection-card__icon" aria-hidden="true">
          <StatusIcon size={21} strokeWidth={1.6} />
        </span>
        <div>
          <p className="connection-card__label">
            {error
              ? 'Local API unreachable'
              : loading
                ? 'Checking connection…'
                : configured
                  ? 'Live AI connected'
                  : 'Preview mode'}
          </p>
          <p>
            {error ||
              integration?.message ||
              (loading
                ? 'Lumé is checking the local service.'
                : 'Add a YouCam API key to enable live skin analysis and virtual try-on.')}
          </p>
          {serverReachable ? (
            <p className="connection-card__meta">Lumé API v{status?.version || '1.0.0'} · local service online</p>
          ) : null}
        </div>
      </div>

      {!configured ? (
        <section className="dialog-section">
          <div className="dialog-section__heading">
            <KeyRound size={18} strokeWidth={1.6} aria-hidden="true" />
            <h3>Connect the live APIs</h3>
          </div>
          <ol className="step-list">
            <li>
              <span>Create or open your Perfect Corp API key in the{' '}
                <a href={apiConsole} target="_blank" rel="noreferrer">
                  YouCam API console <ArrowUpRight size={13} aria-hidden="true" />
                </a>.
              </span>
            </li>
            <li>
              <span>Add the key to the server environment file:</span>
              <code className="code-block">YOUCAM_API_KEY=your_key_here</code>
            </li>
            <li>
              <span>
                Restart the Lumé server. Never prefix the key with <code>VITE_</code>; it must stay on the
                server.
              </span>
            </li>
          </ol>
          <p className="dialog-note">
            The key is read only by Express. Lumé never sends credentials to the browser.
          </p>
        </section>
      ) : (
        <section className="dialog-section">
          <div className="dialog-section__heading">
            <Server size={18} strokeWidth={1.6} aria-hidden="true" />
            <h3>Live engines</h3>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Skin analysis</dt>
              <dd>Perfect Corp YouCam Skin AI v2.1</dd>
            </div>
            <div>
              <dt>Virtual try-on</dt>
              <dd>Perfect Corp AI Clothes v4</dd>
            </div>
            <div>
              <dt>API host</dt>
              <dd>{integration?.hostValid ? 'Validated server-side' : 'Check YOUCAM_API_HOST'}</dd>
            </div>
          </dl>
          <p className="dialog-note">
            Live actions use provider units. Lumé asks before each paid request and never retries
            automatically without your input.
          </p>
        </section>
      )}

      <section className="dialog-section">
        <div className="dialog-section__heading">
          <ShieldCheck size={18} strokeWidth={1.6} aria-hidden="true" />
          <h3>Photo privacy</h3>
        </div>
        <p>
          Photos are held in server memory only for the duration of the request. Lumé does not write
          them to disk or save them in your browser. Perfect Corp documents a 24-hour processing
          retention window for AI results.
        </p>
        <a className="text-link" href={skinDocs} target="_blank" rel="noreferrer">
          Read the Skin AI documentation <ArrowUpRight size={13} aria-hidden="true" />
        </a>
      </section>

      {demoAvailable ? (
        <div className="dialog-demo-link">
          <p>A sample report is available to preview the interface without using a live scan.</p>
          <Button as={Link} to="/report?sample=1" variant="ghost" size="sm" onClick={onClose}>
            View sample report
          </Button>
        </div>
      ) : null}
    </Modal>
  );
}
