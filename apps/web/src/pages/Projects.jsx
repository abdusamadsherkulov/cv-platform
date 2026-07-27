import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch, getCurrentRole, displayName } from '../api';
import { useTranslation } from 'react-i18next';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  const role = getCurrentRole();
  const isAdmin = role === 'admin';

  async function loadProjects() {
    try {
      const data = await apiFetch('/projects/all');
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleDelete(id) {
    setError('');
    try {
      await apiFetch(`/projects/${id}/admin`, { method: 'DELETE' });
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
            <th style={{ minWidth: '250px' }}>{t('projects.colCandidate')}</th>
            <th style={{ minWidth: '150px' }}>{t('projects.colName')}</th>
            <th style={{ minWidth: '265px' }}>{t('projects.colPeriod')}</th>
            <th style={{ minWidth: '170px' }}>{t('projects.colTags')}</th>
            <th style={{ width: '100%' }}>{t('projects.colDescription')}</th>
            {isAdmin && <th></th>}
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <ProjectRow key={proj.id} project={proj} isAdmin={isAdmin} onDelete={handleDelete} onSaved={loadProjects} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectRow({ project, isAdmin, onDelete, onSaved }) {
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
      await apiFetch(`/projects/${project.id}/admin`, {
        method: 'PUT',
        body: JSON.stringify({ name, startDate, endDate: endDate || null, description, tags }),
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveTag(tagToRemove) {
    setError('');
    try {
      const newTags = project.tags.filter((t) => t !== tagToRemove);
      await apiFetch(`/projects/${project.id}/admin`, {
        method: 'PUT',
        body: JSON.stringify({
          name: project.name,
          startDate: project.startDate,
          endDate: project.endDate,
          description: project.description,
          tags: newTags,
        }),
      });
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <tr>
      <td><Link className='pos-user-link' to={`/profile/${project.user.id}`}>{displayName(project.user)}</Link></td>
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
          <td>
            {project.tags.map((tag) => (
              <span key={tag} className="badge bg-info text-dark me-1">
                {tag}
                {isAdmin && (
                  <span
                    onClick={() => handleRemoveTag(tag)}
                    style={{ cursor: 'pointer', marginLeft: '0.4rem' }}
                  >
                    ×
                  </span>
                )}
              </span>
            ))}
          </td>
          <td>{project.description}</td>
        </>
      )}
      {isAdmin && (
        <td className="d-flex gap-2">
          {editing ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={handleSave}>{t('cvDetail.save')}</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>{t('cvDetail.cancel')}</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline-primary" onClick={() => setEditing(true)}>{t('projects.edit')}</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(project.id)}>{t('projects.delete')}</button>
            </>
          )}
        </td>
      )}
    </tr>
  );
}

export default Projects;