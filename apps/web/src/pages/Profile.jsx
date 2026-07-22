import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';

function Profile() {
  const [values, setValues] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');

  const [attributeToAdd, setAttributeToAdd] = useState('');

  const { t } = useTranslation();

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

  useEffect(() => {
    loadValues();
    loadAttributesList();
  }, []);

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
      <h1>{t('profile.title')}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <h2>{t('profile.info')}</h2>
      <table className="table">
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
        <Link to="/projects" className="btn btn-outline-secondary">{t('profile.myProjects')}</Link>
        <Link to="/cvs" className="btn btn-outline-secondary">{t('profile.myCvs')}</Link>
      </div>
    </div>
  );
}

function ValueRow({ value, onRemove, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [input, setInput] = useState(value.value);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch(`/profile/${value.attributeId}`, {
        method: 'PUT',
        body: JSON.stringify({ value: input, version: value.version }),
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <tr>
      <td style={{ width: '200px' }}>{value.attribute.name}</td>
      <td>
        {editing ? (
          <form onSubmit={handleSave} className="d-flex gap-2">
            <input className="form-control" value={input} onChange={(e) => setInput(e.target.value)} autoFocus />
            <button className="btn btn-sm btn-primary" type="submit">{t('cvDetail.save')}</button>
            <button className="btn btn-sm btn-secondary" type="button" onClick={() => setEditing(false)}>{t('cvDetail.cancel')}</button>
          </form>
        ) : (
          <span onClick={() => setEditing(true)} style={{ cursor: 'pointer' }}>
            {value.value || '(empty - click to fill)'}
          </span>
        )}
        {error && <div className="text-danger small">{error}</div>}
      </td>
      <td>
        <button className="btn btn-sm btn-danger" onClick={() => onRemove(value.attributeId)}>{t('profile.remove')}</button>
      </td>
    </tr>
  );
}

export default Profile;