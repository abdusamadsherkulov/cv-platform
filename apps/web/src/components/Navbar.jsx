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
            {theme === 'light' ? `${t("theme.dark")}` : `${t("theme.light")}`}
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