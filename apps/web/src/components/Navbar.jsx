import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

function Navbar() {
  const isLoggedIn = !!localStorage.getItem('token');

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  const { t, i18n } = useTranslation();

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

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 mb-4">
      <Link className="navbar-brand" to="/">CV Platform</Link>
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