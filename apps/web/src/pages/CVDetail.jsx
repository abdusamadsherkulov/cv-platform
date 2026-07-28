import { useState, useEffect, useRef } from 'react';
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
      loadCv();
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

  if (!cv) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <span className="loading-ring"></span>
    </div>
  );

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{cv.position.title}</h1>
      <p>{t('cvDetail.status')}: <span className={`badge rounded-pill text-bg-${cv.status === 'published' ? 'success' : 'secondary'}`}>
        {t(`cvDetail.${cv.status}`)}
      </span></p>
      <p>{t('cvDetail.likes')}: {cv.likeCount}
        {canLike && (
          <span
            role="button"
            className='like-icon'
            onClick={handleToggleLike}
            style={{ cursor: 'pointer', marginLeft: '0.5rem', color: '#1a7dff' }}
          >
            {cv.userLiked ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-hand-thumbs-up-fill" viewBox="0 0 16 16">
                <path d="M6.956 1.745C7.021.81 7.908.087 8.864.325l.261.066c.463.116.874.456 1.012.965.22.816.533 2.511.062 4.51a10 10 0 0 1 .443-.051c.713-.065 1.669-.072 2.516.21.518.173.994.681 1.2 1.273.184.532.16 1.162-.234 1.733q.086.18.138.363c.077.27.113.567.113.856s-.036.586-.113.856c-.039.135-.09.273-.16.404.169.387.107.819-.003 1.148a3.2 3.2 0 0 1-.488.901c.054.152.076.312.076.465 0 .305-.089.625-.253.912C13.1 15.522 12.437 16 11.5 16H8c-.605 0-1.07-.081-1.466-.218a4.8 4.8 0 0 1-.97-.484l-.048-.03c-.504-.307-.999-.609-2.068-.722C2.682 14.464 2 13.846 2 13V9c0-.85.685-1.432 1.357-1.615.849-.232 1.574-.787 2.132-1.41.56-.627.914-1.28 1.039-1.639.199-.575.356-1.539.428-2.59z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" className="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
                <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2 2 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a10 10 0 0 0-.443.05 9.4 9.4 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a9 9 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.2 2.2 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.9.9 0 0 1-.121.416c-.165.288-.503.56-1.066.56z" />
              </svg>
            )}
          </span>
        )}
      </p>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-success">{message}</div>}

      <h2>{t('cvDetail.attributes')}</h2>
      <table className="table table-striped table-borderless">
        <tbody>
          {cv.fields.map((field) => (
            <FieldRow key={field.attributeId} field={field} onSave={handleFieldSave} canEdit={canEdit} />
          ))}
        </tbody>
      </table>

      <h2>{t('cvDetail.projects')}</h2>
      <table className="table table-striped table-borderless">
        <thead>
          <tr>
            <th style={{ minWidth: '320px' }}>{t('projects.colName')}</th>
            <th style={{ minWidth: '250px' }}>{t('projects.colPeriod')}</th>
            <th style={{ minWidth: '300px' }}>{t('projects.colTags')}</th>
            <th style={{ width: '100%' }}>{t('projects.colDescription')}</th>
          </tr>
        </thead>
        <tbody>
          {cv.projects.map((proj) => (
            <tr key={proj.id}>
              <td>{proj.name}</td>
              <td>
                {new Date(proj.startDate).toLocaleDateString()} -{' '}
                {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : t('projects.ongoing')}
              </td>
              <td>
                {proj.tags.map((tag) => (
                  <span key={tag} className="badge text-bg-secondary me-1" style={{ fontSize: '0.85rem' }}>
                    {tag}
                  </span>
                ))}
              </td>
              <td>{proj.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {cv.status === 'draft' && (
        <button className="btn btn-success" onClick={handlePublish}>
          {t('cvDetail.publish')}
        </button>
      )}
    </div>
  );
}

function FieldRow({ field, onSave, canEdit }) {
  const { t } = useTranslation();
  const [input, setInput] = useState(field.value);
  const [saveStatus, setSaveStatus] = useState('');

  const isEmpty = !field.value?.trim();

  const textareaRef = useRef(null);

  function autoResize(el) {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  useEffect(() => {
    if (input === field.value) return;
    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      await onSave(field.attributeId, input, field.version);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 3000);
    }, 5000);
    return () => clearTimeout(timer);
  }, [input]);

  useEffect(() => {
    autoResize(textareaRef.current);
  }, []);

  return (
    <tr style={isEmpty ? { color: 'red' } : undefined}>
      <td style={{ width: '200px' }}>{field.name}</td>
      <td>
        <div className="d-flex justify-content-center">
          {field.type === 'enum' ? (
            <select className="form-select" style={{ maxWidth: '400px' }} value={input} disabled={!canEdit} onChange={(e) => setInput(e.target.value)}>
              <option value="">{t('cvDetail.selectValue')}</option>
              {field.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : field.type === 'boolean' ? (
            <select className="form-select" style={{ maxWidth: '400px' }} value={input} disabled={!canEdit} onChange={(e) => setInput(e.target.value)}>
              <option value="">{t('cvDetail.selectValue')}</option>
              <option value="true">{t('cvDetail.yes')}</option>
              <option value="false">{t('cvDetail.no')}</option>
            </select>
          ) : field.type === 'text' ? (
            <textarea
              ref={textareaRef}
              className="form-control"
              style={{ maxWidth: '400px', overflow: 'hidden', resize: 'none' }}
              value={input}
              disabled={!canEdit}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
            />
          ) : field.type === 'period' ? (
            <div className="d-flex gap-2">
              <input className="form-control" type="date" disabled={!canEdit} value={input.split(',')[0] || ''} onChange={(e) => setInput(`${e.target.value},${input.split(',')[1] || ''}`)} />
              <input className="form-control" type="date" disabled={!canEdit} value={input.split(',')[1] || ''} onChange={(e) => setInput(`${input.split(',')[0] || ''},${e.target.value}`)} />
            </div>
          ) : (
            <input
              className="form-control"
              type={field.type === 'numeric' ? 'number' : field.type === 'date' ? 'date' : 'text'}
              style={{ maxWidth: '400px' }}
              value={input}
              disabled={!canEdit}
              onChange={(e) => setInput(e.target.value)}
            />
          )}
        </div>
        <div style={{ position: 'relative' }}>
          {saveStatus === 'saving' && <span className="save-toast save-toast-saving">{t('profile.saving')}</span>}
          {saveStatus === 'saved' && <span className="save-toast save-toast-saved">{t('profile.saved')}</span>}
        </div>
      </td>
    </tr>
  );
}
export default CVDetail;