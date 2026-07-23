import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, getCurrentRole } from '../api';
import { useTranslation } from 'react-i18next';


function CandidateProfile() {
  const { userId } = useParams();
  const [meFields, setMeFields] = useState({ firstName: '', lastName: '', location: '', name: '' });
  const [values, setValues] = useState([]);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  const role = getCurrentRole();
  const canEdit = role === 'admin';
  const { t } = useTranslation();

  async function loadAll() {
    try {
      const [me, vals, projs] = await Promise.all([
        apiFetch(`/profile/${userId}/me`),
        apiFetch(`/profile/${userId}/values`),
        apiFetch(`/projects/user/${userId}`),
      ]);
      setMeFields(me);
      setValues(vals);
      setProjects(projs);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAll();
  }, [userId]);

  async function handleMeSave() {
    try {
      await apiFetch(`/profile/${userId}/me`, {
        method: 'PUT',
        body: JSON.stringify(meFields),
      });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleValueSave(attributeId, value, version) {
    try {
      await apiFetch(`/profile/${userId}/values/${attributeId}`, {
        method: 'PUT',
        body: JSON.stringify({ value, version }),
      });
      loadAll();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1>{meFields.firstName && meFields.lastName ? `${meFields.firstName} ${meFields.lastName}` : meFields.name}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-2 mb-4" style={{ maxWidth: '600px' }}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.firstName')}
            value={meFields.firstName}
            disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, firstName: e.target.value }))}
            onBlur={handleMeSave}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.lastName')}
            value={meFields.lastName}
            disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, lastName: e.target.value }))}
            onBlur={handleMeSave}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.location')}
            value={meFields.location}
            disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, location: e.target.value }))}
            onBlur={handleMeSave}
          />
        </div>
      </div>

      <h2>{t('profile.info')}</h2>
      <table className="table" style={{ maxWidth: '600px' }}>
        <tbody>
          {values.map((v) => (
            <CandidateValueRow key={v.attributeId} value={v} canEdit={canEdit} onSave={handleValueSave} />
          ))}
        </tbody>
      </table>

      <h2>{t('profile.projects')}</h2>
      <ul className="list-group">
        {projects.map((proj) => (
          <li key={proj.id} className="list-group-item">
            <strong>{proj.name}</strong> — {proj.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

function CandidateValueRow({ value, canEdit, onSave }) {
  const [input, setInput] = useState(value.value);

  return (
    <tr>
      <td style={{ width: '200px' }}>{value.attribute.name}</td>
      <td>
        <input
          className="form-control"
          value={input}
          disabled={!canEdit}
          onChange={(e) => setInput(e.target.value)}
          onBlur={() => onSave(value.attributeId, input, value.version)}
        />
      </td>
    </tr>
  );
}

export default CandidateProfile;