import { useState, useEffect } from 'react';
import { apiFetch, getCurrentRole } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Positions() {
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState('');
  const role = getCurrentRole();
  const canManage = role === 'recruiter' || role === 'admin';
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isCandidate = role === 'candidate';
  const [myCvs, setMyCvs] = useState([]);
  const positionIdsWithCv = myCvs.map((cv) => cv.positionId);

  async function loadPositions() {
    try {
      const data = await apiFetch('/positions');
      setPositions(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMyCvs() {
    if (!isCandidate) return;
    try {
      const data = await apiFetch('/cvs');
      setMyCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPositions();
    loadMyCvs();
  }, []);

  async function handleCreateCv(positionId) {
    setError('');
    try {
      const cv = await apiFetch('/cvs', {
        method: 'POST',
        body: JSON.stringify({ positionId }),
      });
      navigate(`/cvs/${cv.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{t('positions.title')}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped table-borderless">
        <thead>
          <tr>
            <th>{t('positions.colTitle')}</th>
            <th>{t('positions.colDescription')}</th>
            <th>{t('positions.colAttributes')}</th>
            <th style={{ whiteSpace: 'nowrap' }}>{t('positions.colProjectTags')}</th>
            <th style={{ whiteSpace: 'nowrap' }}>{t('positions.colMaxProjects')}</th>
            {isCandidate && <th></th>}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id}>
              <td><Link className='pos-user-link' to={`/positions/${pos.id}`}>{pos.title}</Link></td>
              <td>{pos.description}</td>
              <td>{pos.attributes.map((a) => a.attribute.name).join(', ')}</td>
              <td>{pos.projectTags.length > 0 ? pos.projectTags.join(', ') : '—'}</td>
              <td>{pos.maxProjects}</td>
              {isCandidate && (
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    disabled={positionIdsWithCv.includes(pos.id)}
                    onClick={() => handleCreateCv(pos.id)}
                  >
                    {t('positions.createCv')}
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {canManage && (
        <Link to="/positions/new" className="btn btn-primary mb-3">
          {t('positions.addPosition')}
        </Link>
      )}
    </div>
  );
}

export default Positions;