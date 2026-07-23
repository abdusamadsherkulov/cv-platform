import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch, getCurrentRole } from '../api';
import { useTranslation } from 'react-i18next';

function CVDetail() {
  const { id } = useParams();
  const [cv, setCv] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const role = getCurrentRole();
  const canLike = role === 'recruiter' || role === 'admin';
  const canEdit = role === 'candidate' || role === 'admin';

  const { t } = useTranslation();

  async function loadCv() {
    try {
      const data = await apiFetch(`/cvs/${id}`);
      setCv(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCv();
  }, [id]);

  async function handleFieldSave(attributeId, newValue, version) {
    setError('');
    setMessage('');
    try {
      await apiFetch(`/cvs/${id}/attributes/${attributeId}`, {
        method: 'PUT',
        body: JSON.stringify({ value: newValue, version }),
      });
      loadCv(); // refresh so we get the new version number
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePublish() {
    setError('');
    setMessage('');
    try {
      await apiFetch(`/cvs/${id}/publish`, { method: 'POST' });
      setMessage('CV published successfully!');
      loadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleLike() {
    setError('');
    try {
      if (cv.userLiked) {
        await apiFetch(`/likes/${id}`, { method: 'DELETE' });
      } else {
        await apiFetch(`/likes/${id}`, { method: 'POST' });
      }
      loadCv();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!cv) return <div className="container mt-4">{t('nav.loading')}</div>;

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{cv.position.title}</h1>
      <p>{t('cvDetail.status')}: <strong>{cv.status}</strong></p>
      <p>{t('cvDetail.likes')}: {cv.likeCount}
        {canLike && (
          <button className="btn btn-sm btn-outline-primary ms-2" onClick={handleToggleLike}>
            {cv.userLiked ? t('cvDetail.unlike') : t('cvDetail.like')}
          </button>
        )}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <h2>{t('cvDetail.attributes')}</h2>
      <table className="table">
        <tbody>
          {cv.fields.map((field) => (
            <FieldRow key={field.attributeId} field={field} onSave={handleFieldSave} canEdit={canEdit} />
          ))}
        </tbody>
      </table>

      <h2>{t('cvDetail.projects')}</h2>
      <ul className="list-group mb-3">
        {cv.projects.map((proj) => (
          <li key={proj.id} className="list-group-item">
            <strong>{proj.name}</strong> — {proj.description}
          </li>
        ))}
      </ul>

      {cv.status === 'draft' && (
        <button className="btn btn-success" onClick={handlePublish}>
          {t('cvDetail.publish')}
        </button>
      )}
    </div>
  );
}

function FieldRow({ field, onSave, canEdit }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(field.value);

  const { t } = useTranslation();
  const isEmpty = !field.value?.trim();

  function handleSubmit(e) {
    e.preventDefault();
    onSave(field.attributeId, value, field.version);
    setEditing(false);
  }

  return (
    <tr style={isEmpty ? { color: 'red' } : undefined}>
      <td style={{ width: '200px' }}>{field.name}</td>
      <td>
        {editing ? (
          <form onSubmit={handleSubmit} className="d-flex gap-2">
            <input
              className="form-control"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              autoFocus
            />
            <button className="btn btn-sm btn-primary" type="submit">{t('cvDetail.save')}</button>
            <button className="btn btn-sm btn-secondary" type="button" onClick={() => setEditing(false)}>
              {t('cvDetail.cancel')}
            </button>
          </form>
        ) : (
          <span
            onClick={canEdit ? () => setEditing(true) : undefined}
            style={{ cursor: canEdit ? 'pointer' : 'default' }}
          >
            {isEmpty ? t('cvDetail.empty') : field.value}
          </span>
        )}
      </td>
    </tr>
  );
}

export default CVDetail;