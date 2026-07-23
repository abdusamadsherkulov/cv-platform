import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';

function Projects() {
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
      <h1 className="mb-4">{t('projects.title')}</h1>
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
            <tr key={proj.id}>
              <td>{proj.name}</td>
              <td>
                {new Date(proj.startDate).toLocaleDateString()} -{' '}
                {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : `${t('projects.ongoing')}`}
              </td>
              <td>{proj.tags.join(', ')}</td>
              <td>{proj.description}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(proj.id)}>
                  {t('projects.delete')}
                </button>
              </td>
            </tr>
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

export default Projects;