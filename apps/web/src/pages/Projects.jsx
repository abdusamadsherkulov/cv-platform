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
            <th style={{ minWidth: '220px' }}>{t('projects.colCandidate')}</th>
            <th style={{ minWidth: '150px' }}>{t('projects.colName')}</th>
            <th style={{ minWidth: '250px' }}>{t('projects.colPeriod')}</th>
            <th style={{ minWidth: '300px' }}>{t('projects.colTags')}</th>
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
              <span key={tag} className="badge text-bg-secondary me-1" style={{ fontSize: "0.85rem" }}>
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
        <td className="gap-2">
          {editing ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={handleSave}>{t('cvDetail.save')}</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>{t('cvDetail.cancel')}</button>
            </>
          ) : (
            <div className="d-flex gap-3 align-items-center mt-1">
              <span className="icon-btn icon-btn-edit" onClick={() => setEditing(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-pencil-square" viewBox="0 0 16 16">
                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                  <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z" />
                </svg>
              </span>
              <span className="icon-btn icon-btn-delete" onClick={() => onDelete(project.id)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-trash icon-default" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-trash-fill icon-hover" viewBox="0 0 16 16">
                  <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                </svg>
              </span>
            </div>
          )}
        </td>
      )}
    </tr>
  );
}

export default Projects;