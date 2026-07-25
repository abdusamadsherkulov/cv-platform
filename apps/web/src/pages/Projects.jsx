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
            <th>{t('projects.colCandidate')}</th>
            <th>{t('projects.colName')}</th>
            <th>{t('projects.colPeriod')}</th>
            <th>{t('projects.colTags')}</th>
            <th>{t('projects.colDescription')}</th>
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
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState('');

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch(`/projects/${project.id}/admin`, {
        method: 'PUT',
        body: JSON.stringify({
          name,
          description,
          startDate: project.startDate,
          endDate: project.endDate,
          tags: project.tags,
        }),
      });
      setEditing(false);
      onSaved();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <tr>
      <td><Link to={`/candidates/${project.user.id}`}>{displayName(project.user)}</Link></td>
      <td>
        {editing ? (
          <input className="form-control form-control-sm" value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          project.name
        )}
      </td>
      <td>
        {new Date(project.startDate).toLocaleDateString()} -{' '}
        {project.endDate ? new Date(project.endDate).toLocaleDateString() : t('projects.ongoing')}
      </td>
      <td>{project.tags.join(', ')}</td>
      <td>
        {editing ? (
          <input className="form-control form-control-sm" value={description} onChange={(e) => setDescription(e.target.value)} />
        ) : (
          project.description
        )}
        {error && <div className="text-danger small">{error}</div>}
      </td>
      {isAdmin && (
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
      )}
    </tr>
  );
}

export default Projects;