import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';

function Profile() {
  const [values, setValues] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');

  const [attributeToAdd, setAttributeToAdd] = useState('');

  const { t } = useTranslation();

  const [meFields, setMeFields] = useState({ firstName: '', lastName: '', location: '' });
  const [meSaveStatus, setMeSaveStatus] = useState('');
  const meLoadedRef = useRef(false);

  async function loadValues() {
    try {
      const data = await apiFetch('/profile');
      setValues(data);
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

  async function loadMe() {
    try {
      const data = await apiFetch('/profile/me');
      setMeFields(data);
      meLoadedRef.current = true;
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadValues();
    loadAttributesList();
    loadMe();
  }, []);

  useEffect(() => {
    if (!meLoadedRef.current) return;

    const timer = setTimeout(async () => {
      setMeSaveStatus('saving');
      try {
        await apiFetch('/profile/me', {
          method: 'PUT',
          body: JSON.stringify(meFields),
        });
        setMeSaveStatus('saved');
        setTimeout(() => setMeSaveStatus(''), 3000);
      } catch (err) {
        setError(err.message);
        setMeSaveStatus('');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [meFields]);

  async function handleAddAttribute() {
    if (!attributeToAdd) return;
    setError('');
    try {
      await apiFetch(`/profile/${attributeToAdd}`, {
        method: 'PUT',
        body: JSON.stringify({ value: '' }),
      });
      setAttributeToAdd('');
      loadValues();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(attributeId) {
    setError('');
    try {
      await apiFetch(`/profile/${attributeId}`, { method: 'DELETE' });
      loadValues();
    } catch (err) {
      setError(err.message);
    }
  }

  const addedIds = values.map((v) => v.attributeId);
  const availableToAdd = attributesList.filter((a) => !addedIds.includes(a.id));

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{t('profile.title')}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <h2>{t('profile.me')}</h2>
      <div className="row g-2 mb-2" style={{ maxWidth: '600px' }}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.firstName')}
            value={meFields.firstName}
            onChange={(e) => setMeFields((f) => ({ ...f, firstName: e.target.value }))}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.lastName')}
            value={meFields.lastName}
            onChange={(e) => setMeFields((f) => ({ ...f, lastName: e.target.value }))}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.location')}
            value={meFields.location}
            onChange={(e) => setMeFields((f) => ({ ...f, location: e.target.value }))}
          />
        </div>
      </div>
      <div className="mb-4">
        {meSaveStatus === 'saving' && <small className="text-warning">{t('profile.saving')}</small>}
        {meSaveStatus === 'saved' && <small className="text-success">{t('profile.saved')}</small>}
      </div>

      <h2>{t('profile.info')}</h2>
      <table className="table" style={{ maxWidth: '600px' }}>
        <tbody>
          {values.map((v) => (
            <ValueRow key={v.attributeId} value={v} onRemove={handleRemove} onSaved={loadValues} />
          ))}
        </tbody>
      </table>

      <div className="d-flex gap-2 mb-4">
        <select className="form-select" value={attributeToAdd} onChange={(e) => setAttributeToAdd(e.target.value)}>
          <option value="">{t('profile.selectAttribute')}</option>
          {availableToAdd.map((attr) => (
            <option key={attr.id} value={attr.id}>{attr.name} ({attr.category.name})</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleAddAttribute}>{t('profile.add')}</button>
      </div>

      <div className="d-flex gap-3">
        <Link to="/projects" className="btn navbar-btn btn-sm">{t('profile.myProjects')}</Link>
        <Link to="/cvs" className="btn navbar-btn btn-sm">{t('profile.myCvs')}</Link>
      </div>
    </div>
  );
}

function ValueRow({ value, onRemove, onSaved }) {
  const [input, setInput] = useState(value.value);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (input === value.value) return;

    const timer = setTimeout(async () => {
      setSaveStatus('saving');
      setError('');
      try {
        await apiFetch(`/profile/${value.attributeId}`, {
          method: 'PUT',
          body: JSON.stringify({ value: input, version: value.version }),
        });
        setSaveStatus('saved');
        onSaved();
        setTimeout(() => setSaveStatus(''), 3000);
      } catch (err) {
        setError(err.message);
        setSaveStatus('');
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [input]);

  return (
    <tr>
      <td style={{ width: '200px' }}>{value.attribute.name}</td>
      <td>
        <input
          className="form-control"
          style={{ maxWidth: '300px' }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        {saveStatus === 'saving' && <small className="text-warning">{t('profile.saving')}</small>}
        {saveStatus === 'saved' && <small className="text-success">{t('profile.saved')}</small>}
        {error && <div className="text-danger small">{error}</div>}
      </td>
      <td>
        <button className="btn btn-sm btn-danger" onClick={() => onRemove(value.attributeId)}>{t('profile.remove')}</button>
      </td>
    </tr>
  );
}

export default Profile;