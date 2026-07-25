import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';

function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const { t } = useTranslation();

  async function loadProjects() {
    try {
      const data = await apiFetch('/projects');
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, startDate, endDate: endDate || null, description, tags }),
      });
      setName('');
      setStartDate('');
      setEndDate('');
      setDescription('');
      setTagsInput('');
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{t('projects.myTitle')}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped table-borderless">
        <thead>
          <tr>
            <th>{t('projects.colName')}</th>
            <th>{t('projects.colPeriod')}</th>
            <th>{t('projects.colTags')}</th>
            <th>{t('projects.colDescription')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <MyProjectRow key={proj.id} project={proj} onDelete={handleDelete} onSaved={loadProjects} />
          ))}
        </tbody>
      </table>

      <h2>{t('projects.addNew')}</h2>
      <form onSubmit={handleCreate} className="row g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder={t('projects.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-2">
          <input className="form-control" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
        </div>
        <div className="col-md-2">
          <input className="form-control" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="End (optional)" />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder={t('projects.tagsPlaceholder')} value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">{t('projects.addButton')}</button>
        </div>
        <div className="col-12">
          <textarea className="form-control" placeholder={t('projects.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
      </form>
    </div>
  );
}

function MyProjectRow({ project, onDelete, onSaved }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(project.name);
  const [startDate, setStartDate] = useState(project.startDate.slice(0, 10));
  const [endDate, setEndDate] = useState(project.endDate ? project.endDate.slice(0, 10) : '');
  const [tagsInput, setTagsInput] = useState(project.tags.join(', '));
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await apiFetch(`/projects/${project.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name, startDate, endDate: endDate || null, description, tags }),
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <tr>
      {editing ? (
        <>
          <td><input className="form-control form-control-sm" value={name} onChange={(e) => setName(e.target.value)} /></td>
          <td className="d-flex gap-1">
            <input className="form-control form-control-sm" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <input className="form-control form-control-sm" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </td>
          <td><input className="form-control form-control-sm" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} /></td>
          <td>
            <input className="form-control form-control-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
            {error && <div className="text-danger small">{error}</div>}
          </td>
        </>
      ) : (
        <>
          <td>{project.name}</td>
          <td>
            {new Date(project.startDate).toLocaleDateString()} -{' '}
            {project.endDate ? new Date(project.endDate).toLocaleDateString() : t('projects.ongoing')}
          </td>
          <td>{project.tags.join(', ')}</td>
          <td>{project.description}</td>
        </>
      )}
      <td className="d-flex gap-2">
        {editing ? (
          <>
            <button className="btn btn-sm btn-primary" onClick={handleSave}>{t('cvDetail.save')}</button>
            <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>{t('cvDetail.cancel')}</button>
          </>
        ) : (
          <>
            <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>{t('positionDetail.editButton')}</button>
            <button className="btn btn-sm btn-danger" onClick={() => onDelete(project.id)}>{t('projects.delete')}</button>
          </>
        )}
      </td>
    </tr>
  );
}

export default MyProjects;