import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  CircleAlert,
  PersonStanding,
  ScanFace,
  Shirt,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { useConfig } from '../contexts/ConfigContext.jsx';
import { useScan } from '../contexts/ScanContext.jsx';
import { ApiStatusDialog } from './ApiStatusDialog.jsx';
import { Button } from './Button.jsx';
import { Logo } from './Logo.jsx';

const NAV_ITEMS = [
  { to: '/', label: 'Scan', icon: ScanFace, end: true },
  { to: '/report', label: 'Report', icon: Sparkles },
  { to: '/looks', label: 'Looks', icon: Shirt },
  { to: '/try-on', label: 'Try-On', icon: PersonStanding },
  { to: '/planner', label: 'Planner', icon: CalendarDays },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function StatusButton({ onClick }) {
  const { loading, error, configured } = useConfig();
  const tone = error ? 'offline' : loading ? 'loading' : configured ? 'live' : 'preview';
  const label = error ? 'Service offline' : loading ? 'Connecting' : configured ? 'Live AI' : 'Preview mode';
  return (
    <button
      type="button"
      className={`status-pill status-pill--${tone}`}
      onClick={onClick}
      aria-label={`${label}. Open connection details.`}
    >
      <span className="status-pill__dot" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}

function ConfigBanner({ onDetails }) {
  const { loading, error, configured, demoAvailable } = useConfig();
  if (loading || configured) return null;

  if (error) {
    return (
      <div className="config-banner config-banner--error" role="status">
        <div className="shell config-banner__inner">
          <WifiOff size={17} strokeWidth={1.7} aria-hidden="true" />
          <p>
            <strong>Local API offline.</strong> Start the Lumé server to reconnect live AI.
          </p>
          <button type="button" className="config-banner__link" onClick={onDetails}>
            Details
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="config-banner" role="status">
      <div className="shell config-banner__inner">
        <CircleAlert size={17} strokeWidth={1.7} aria-hidden="true" />
        <p>
          <strong>Live AI is paused.</strong> Add a YouCam API key to scan or try on. The rest of
          Lumé works without it.
        </p>
        <div className="config-banner__actions">
          <button type="button" className="config-banner__link" onClick={onDetails}>
            Connect
          </button>
          {demoAvailable ? (
            <Link to="/report?sample=1" className="config-banner__link config-banner__link--quiet">
              Sample report
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  const { docs, privacy } = useConfig();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>
            Considered dressing, a calmer routine, and skin insight you can actually use.
          </p>
        </div>
        <nav className="footer-nav" aria-label="Footer">
          <p className="eyebrow">Explore</p>
          <Link to="/">Skin scan</Link>
          <Link to="/report">Your report</Link>
          <Link to="/looks">The looks</Link>
          <Link to="/try-on">Virtual try-on</Link>
          <Link to="/planner">Seven-day planner</Link>
        </nav>
        <div className="footer-privacy">
          <p className="eyebrow">A note on care</p>
          <p>
            Skin scores are cosmetic observations from your photo, not a medical diagnosis.{' '}
            {privacy?.lumeStoresPhotos === false ? 'Lumé does not store your photos.' : ''}
          </p>
          <a href={docs?.skinAnalysis || 'https://docs.perfectcorp.com/'} target="_blank" rel="noreferrer">
            Powered by Perfect Corp YouCam
          </a>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {year} Lumé</span>
        <span>Photography sourced from Unsplash.</span>
        <span>Made for considered routines.</span>
      </div>
    </footer>
  );
}

export function Layout() {
  const [infoState, setInfoState] = useState({ open: false, pathname: '' });
  const { pathname } = useLocation();
  const { prepareNewScan } = useScan();
  const infoOpen = infoState.open && infoState.pathname === pathname;

  function setInfoOpen(open) {
    setInfoState({ open, pathname });
  }

  return (
    <div className="app-shell">
      <ScrollToTop />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <header className="site-header">
        <div className="shell site-header__inner">
          <Logo />
          <nav className="desktop-nav" aria-label="Primary">
            {NAV_ITEMS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => `desktop-nav__link ${isActive ? 'is-active' : ''}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="site-header__actions">
            <StatusButton onClick={() => setInfoOpen(true)} />
            <Button
              as={Link}
              to="/"
              variant="primary"
              size="sm"
              className="header-cta"
              onClick={prepareNewScan}
            >
              New scan
            </Button>
          </div>
        </div>
      </header>

      <ConfigBanner onDetails={() => setInfoOpen(true)} />

      <main id="main" className="site-main">
        <Outlet />
      </main>

      <Footer />

      <nav className="mobile-nav" aria-label="Primary mobile">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) => `mobile-nav__link ${isActive ? 'is-active' : ''}`}
          >
            <Icon size={20} strokeWidth={1.6} aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <ApiStatusDialog open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
}
