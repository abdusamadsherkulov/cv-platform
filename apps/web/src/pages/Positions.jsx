import { useState, useEffect } from 'react';
import { apiFetch, getCurrentRole } from '../api';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Positions() {
  const [positions, setPositions] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
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

  async function loadAttributesList() {
    try {
      const data = await apiFetch('/attributes');
      setAttributesList(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadPositions();
    loadAttributesList();
    loadMyCvs();
  }, []);

  function toggleAttribute(id) {
    setSelectedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/positions', {
        method: 'POST',
        body: JSON.stringify({ title, description, attributeIds: selectedAttributeIds }),
      });
      setTitle('');
      setDescription('');
      setSelectedAttributeIds([]);
      loadPositions();
    } catch (err) {
      setError(err.message);
    }
  }

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
        <>
          <h2>{t('positions.createNew')}</h2>
          <form onSubmit={handleCreate}>
            <div className="mb-2">
              <input className="form-control" placeholder={t('positions.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="mb-2">
              <input className="form-control" placeholder={t('positions.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <div className="mb-2">
              <label className="form-label">{t('positions.attributesLabel')}</label>
              {attributesList.map((attr) => (
                <div className="form-check" key={attr.id}>
                  <input
                    type="checkbox"
                    className="form-check-input"
                    checked={selectedAttributeIds.includes(attr.id)}
                    onChange={() => toggleAttribute(attr.id)}
                    id={`attr-${attr.id}`}
                  />
                  <label className="form-check-label" htmlFor={`attr-${attr.id}`}>
                    {attr.name} ({attr.category.name})
                  </label>
                </div>
              ))}
            </div>
            <button type="submit" className="btn btn-primary">{t('positions.createButton')}</button>
          </form>
        </>
      )}
    </div>
  );
}

export default Positions;