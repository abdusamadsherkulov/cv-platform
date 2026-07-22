import { useTranslation } from 'react-i18next';

function Login() {
  const { t } = useTranslation();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center mt-5" style={{ minHeight: '70vh' }}>
      <h1 className="mb-4">{t('login.title')}</h1>

      <a
        href="https://cw-platform.onrender.com/auth/google"
        className="btn d-flex align-items-center gap-2 mb-3"
        style={{ width: '280px', backgroundColor: 'var(--navbar-btn-bg)', color: 'var(--navbar-btn-text)' }}
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 6 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
          <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.7l6.2 5.2C39.9 36.9 44 31.5 44 24c0-1.3-.1-2.7-.4-3.5z"/>
        </svg>
        {t('login.google')}
      </a>

      <a
        href="https://cw-platform.onrender.com/auth/github"
        className="btn btn-dark d-flex align-items-center gap-2"
        style={{ width: '280px', backgroundColor: 'var(--navbar-btn-bg)', color: 'var(--navbar-btn-text)'  }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.04-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.29 0 .32.22.7.82.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
        </svg>
        {t('login.github')}
      </a>
    </div>
  );
}

export default Login;