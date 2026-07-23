import { Link, NavLink } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { getCurrentRole } from '../api';
import { useLocation } from 'react-router-dom';

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const { t, i18n } = useTranslation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();

  const role = getCurrentRole();

  const [showSignInOptions, setShowSignInOptions] = useState(false);

  const location = useLocation();
  const searchRef = useRef(null);
  

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
  function handleClickOutside(e) {
    if (searchRef.current && !searchRef.current.contains(e.target)) {
      setShowResults(false);
    }
  }
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  function toggleTheme() {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  }

  function handleLogout() {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    try {
      const data = await apiFetch(`/search?q=${encodeURIComponent(query)}`);
      setResults(data);
      setShowResults(true);
    } catch (err) {
      setResults(null);
    }
  }

  function goToPosition(id) {
    setResults(null);
    setQuery('');
    navigate(`/positions/${id}`);
  }

  if (location.pathname === '/login') return null;

  return (
    <nav className="navbar navbar-expand-lg mb-4" style={{ paddingLeft: '7rem', paddingRight: '7rem', backgroundColor: 'var(--navbar-bg)', color: 'var(--navbar-text)' }}>
        <Link className="navbar-brand" to="/" style={{ color: 'var(--navbar-text)' }}>
          CV Platform
        </Link>
        <form className="d-flex mx-3 position-relative" onSubmit={handleSearch} ref={searchRef}>
          <input
            className="form-control form-control-sm"
            placeholder={t('nav.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {if (results) setShowResults(true); }}
          />
          <button className="btn btn-sm navbar-btn ms-1" type="submit">
            {t('nav.searchButton')}
          </button>
          {/* btn navbar-btn btn-sm */}

          {showResults && results && (
            <div className="position-absolute bg-white text-dark p-2 shadow" style={{ top: '100%', left: 0, zIndex: 10, minWidth: '300px' }}>
              {results.positions.length === 0 && results.attributes.length === 0 && <p className="mb-0">{t('nav.noResults')}</p>}

              {results.positions.length > 0 && (
                <>
                  <strong>{t('nav.positions')}</strong>
                  <ul className="list-unstyled mb-2">
                    {results.positions.map((p) => (
                      <li key={p.id} onClick={() => goToPosition(p.id)} style={{ cursor: 'pointer' }}>{p.title}</li>
                    ))}
                  </ul>
                </>
              )}

              {results.attributes.length > 0 && (
                <>
                  <strong>{t('nav.attributes')}</strong>
                  <ul className="list-unstyled mb-0">
                    {results.attributes.map((a) => <li key={a.id}>{a.name}</li>)}
                  </ul>
                </>
              )}
            </div>
          )}
        </form>
        <div className="navbar-nav">
          <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/attributes" style={{ color: 'var(--navbar-text)' }}>{t('nav.attributes')}</NavLink>
          <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/positions" style={{ color: 'var(--navbar-text)' }}>{t('nav.positions')}</NavLink>
          {role === 'candidate' ? (
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/cvs" style={{ color: 'var(--navbar-text)' }}>{t('nav.myCvs')}</NavLink>
          ) : (
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/all-cvs" style={{ color: 'var(--navbar-text)' }}>{t('nav.allCvs')}</NavLink>
          )}
          <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/projects" style={{ color: 'var(--navbar-text)' }}>{t('nav.projects')}</NavLink>
          <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/profile" style={{ color: 'var(--navbar-text)' }}>{t('nav.profile')}</NavLink>
          {role === 'admin' && (
            <NavLink className={({isActive}) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/users" style={{ color: 'var(--navbar-text)' }}>{t('nav.users')}</NavLink>
          )}
        </div>

        <div className="ms-auto d-flex gap-2">
          <button className="btn navbar-btn btn-sm" onClick={toggleTheme}>
            {theme === 'light' ? <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-moon" viewBox="0 0 16 16">
              <path d="M6 .278a.77.77 0 0 1 .08.858 7.2 7.2 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277q.792-.001 1.533-.16a.79.79 0 0 1 .81.316.73.73 0 0 1-.031.893A8.35 8.35 0 0 1 8.344 16C3.734 16 0 12.286 0 7.71 0 4.266 2.114 1.312 5.124.06A.75.75 0 0 1 6 .278M4.858 1.311A7.27 7.27 0 0 0 1.025 7.71c0 4.02 3.279 7.276 7.319 7.276a7.32 7.32 0 0 0 5.205-2.162q-.506.063-1.029.063c-4.61 0-8.343-3.714-8.343-8.29 0-1.167.242-2.278.681-3.286"/>
            </svg> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-sun" viewBox="0 0 16 16">
              <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6m0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
            </svg>}
          </button>
          <button className="btn navbar-btn btn-sm" onClick={() => changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}>
            {i18n.language === 'en' ? 'RU' : 'EN'}
          </button>
          {isLoggedIn ? (
            <button className="btn navbar-btn btn-sm" onClick={handleLogout}>
              {t('nav.logout')}
            </button>
          ) : (
            <Link className="btn navbar-btn btn-sm" to="/login">
              {t('nav.login')}
            </Link>
          )}
        </div>
    </nav>
  );
}

export default Navbar;