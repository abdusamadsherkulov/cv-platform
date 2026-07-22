import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';

function AllCVs() {
  const [cvs, setCvs] = useState([]);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function loadCvs() {
    try {
      const data = await apiFetch('/cvs/all/published');
      setCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCvs();
  }, []);

  return (
    <div className="container mt-4">
      <h1>{t('allCvs.title')}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped table-borderless">
        <thead>
          <tr>
            <th>{t('allCvs.colCandidate')}</th>
            <th>{t('allCvs.colPosition')}</th>
            <th>{t('allCvs.colLikes')}</th>
          </tr>
        </thead>
        <tbody>
          {cvs.map((cv) => (
            <tr key={cv.id}>
              <td>{cv.user.name}</td>
              <td><Link to={`/cvs/${cv.id}`}>{cv.position.title}</Link></td>
              <td>{cv.likeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllCVs;