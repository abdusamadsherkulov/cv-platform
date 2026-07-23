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
        <button className="btn btn-sm btn-outline-primary ms-2 d-inline-flex align-items-center gap-1" onClick={handleToggleLike}>
          {cv.userLiked ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
            </svg>
          )}
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