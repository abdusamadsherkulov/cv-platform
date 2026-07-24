import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CountUp from '../src/components/CountUp';

const API_URL = 'https://cw-platform.onrender.com';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError('Could not load stats'));
  }, []);

  if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  if (!data) return <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
    <span className="loading-ring"></span>
  </div>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">{t('home.title')}</h2>

      <div className="row mb-4">
        <div className="col"><div className="card text-center p-3"><h3><CountUp end={data.stats.totalPositions} /></h3><p>{t('home.positions')}</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3><CountUp end={data.stats.totalCandidates} /></h3><p>{t('home.candidates')}</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3><CountUp end={data.stats.totalRecruiters} /></h3><p>{t('home.recruiters')}</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3><CountUp end={data.stats.totalCVs} /></h3><p>{t('home.totalCvs')}</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3><CountUp end={data.stats.recentCVs} /></h3><p>{t('home.CVsLast24h')}</p></div></div>
      </div>

      <h2>{t('home.latestPositions')}</h2>
      <table className="table table-striped table-borderless mb-4">
        <thead><tr><th>{t('home.latestTitle')}</th><th>{t('home.latestDescription')}</th></tr></thead>
        <tbody>
          {data.latestPositions.map((pos) => (
            <tr key={pos.id}>
              <td><Link to={`/positions/${pos.id}`} className="text-decoration-none" style={{ color: 'var(--text-color)' }}>{pos.title}</Link></td>
              <td>{pos.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>{t('home.popularPositions')}</h2>
      <table className="table table-striped table-borderless">
        <thead><tr><th>{t('home.popularTitle')}</th><th>{t('home.CvsSubmitted')}</th></tr></thead>
        <tbody>
          {data.popularPositions.map((pos) => (
            <tr key={pos.id}>
              <td><Link to={`/positions/${pos.id}`} className="text-decoration-none" style={{ color: 'var(--text-color)' }}>{pos.title}</Link></td>
              <td>{pos._count.cvs}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="mt-4">{t('home.tagCloud')}</h2>
      <div className="mb-4">
        {data.tagCloud.map(({ tag, count }) => (
          <Link
            key={tag}
            to={`/positions`}
            className="badge bg-secondary text-decoration-none me-2 mb-2"
            style={{ fontSize: `${0.8 + count * 0.15}rem`, display: 'inline-block' }}
          >
            {tag} ({count})
          </Link>
        ))}
      </div>
    </div>
  );
}

export default App;