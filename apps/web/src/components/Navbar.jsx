import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const { t, i18n } = useTranslation();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  function changeLanguage(lang) {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    } catch (err) {
      setResults(null);
    }
  }

  function goToPosition(id) {
    setResults(null);
    setQuery('');
    navigate(`/positions/${id}`);
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 mb-4">
      <Link className="navbar-brand" to="/">CV Platform</Link>
      <form className="d-flex mx-3 position-relative" onSubmit={handleSearch}>
        <input
          className="form-control form-control-sm"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-sm btn-outline-light ms-1" type="submit">Search</button>

        {results && (
          <div className="position-absolute bg-white text-dark p-2 shadow" style={{ top: '100%', left: 0, zIndex: 10, minWidth: '300px' }}>
            {results.positions.length === 0 && results.attributes.length === 0 && <p className="mb-0">No results found</p>}

            {results.positions.length > 0 && (
              <>
                <strong>Positions</strong>
                <ul className="list-unstyled mb-2">
                  {results.positions.map((p) => (
                    <li key={p.id} onClick={() => goToPosition(p.id)} style={{ cursor: 'pointer' }}>{p.title}</li>
                  ))}
                </ul>
              </>
            )}

            {results.attributes.length > 0 && (
              <>
                <strong>Attributes</strong>
                <ul className="list-unstyled mb-0">
                  {results.attributes.map((a) => <li key={a.id}>{a.name}</li>)}
                </ul>
              </>
            )}
          </div>
        )}
      </form>
      <div className="navbar-nav">
        <Link className="nav-link text-white" to="/attributes">{t('nav.attributes')}</Link>
        <Link className="nav-link text-white" to="/positions">{t('nav.positions')}</Link>
        <Link className="nav-link text-white" to="/cvs">{t('nav.myCvs')}</Link>
        <Link className="nav-link text-white" to="/projects">{t('nav.projects')}</Link>
        <Link className="nav-link text-white" to="/profile">{t('nav.profile')}</Link>
      </div>

      <div className="ms-auto d-flex gap-2">
        <button className="btn btn-outline-light btn-sm" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <button className="btn btn-outline-light btn-sm" onClick={() => changeLanguage(i18n.language === 'en' ? 'ru' : 'en')}>
          {i18n.language === 'en' ? 'RU' : 'EN'}
        </button>
        {isLoggedIn ? (
          <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
            {t('nav.logout')}
          </button>
        ) : (
          <a className="btn btn-outline-light btn-sm" href="https://cw-platform.onrender.com/auth/google">
            {t('nav.login')}
          </a>
        )}
      </div>
    </nav>
  );
}

export default Navbar;