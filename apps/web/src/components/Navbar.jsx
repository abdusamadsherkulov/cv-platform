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

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
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
      <div ref={menuRef} style={{ position: 'relative' }}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 16 16"
          onClick={() => setMenuOpen((m) => !m)}
          style={{ cursor: 'pointer', color: 'var(--navbar-text)', marginRight: '1rem', strokeWidth: menuOpen ? 1 : 0, stroke: 'currentColor' }}
        >
          <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5" />
        </svg>

        {menuOpen && (
          <div
            className="position-absolute d-flex flex-column shadow hamburger-menu"
            style={{ top: '100%', left: 0, backgroundColor: 'var(--navbar-bg)', zIndex: 20 }}
          >
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/attributes" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.attributes')}</NavLink>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/positions" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.positions')}</NavLink>
            {role === 'candidate' ? (
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/cvs" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.myCvs')}</NavLink>
            ) : (
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/all-cvs" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.allCvs')}</NavLink>
            )}
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/projects" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.projects')}</NavLink>
            <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/profile" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.profile')}</NavLink>
            {role === 'admin' && (
              <NavLink className={({ isActive }) => `nav-link ${isActive ? 'fw-bold' : ''}`} to="/users" style={{ color: 'var(--navbar-text)' }} onClick={() => setMenuOpen(false)}>{t('nav.users')}</NavLink>
            )}

            <hr className="my-2" style={{ borderColor: 'var(--navbar-text)', opacity: 0.3 }} />

            <div className="d-flex align-items-center justify-content-between px-2 mx-1">
              <span>{t('nav.theme')}</span>
              <label className="theme-swap" style={{ color: 'var(--navbar-text)' }}>
                <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                <svg className="swap-off" fill="currentColor" viewBox="0 0 27 27">
                  <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
                </svg>
                <svg className="swap-on" fill="currentColor" viewBox="0 0 27 27">
                  <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
                </svg>
              </label>
            </div>
          </div>
        )}
      </div>

      <Link className="navbar-brand" to="/" style={{ color: 'var(--navbar-text)', fontSize: '1.5rem'}}>
        CV Platform
      </Link>

      <div className="ms-auto d-flex align-items-center gap-2">
        <form className="d-flex position-relative" onSubmit={handleSearch} ref={searchRef}>
          <input
            className="form-control form-control-sm"
            placeholder={t('nav.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results) setShowResults(true); }}
          />

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