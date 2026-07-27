import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, getCurrentRole, getCurrentUserId, displayName } from '../api';
import { useTranslation } from 'react-i18next';

function Profile() {
  const { userId: paramUserId } = useParams();
  const myUserId = getCurrentUserId();
  const viewedUserId = paramUserId ? Number(paramUserId) : myUserId;

  const role = getCurrentRole();
  const isOwnProfile = viewedUserId === myUserId;
  const canEdit = isOwnProfile || role === 'admin';
  const showCandidateSections = isOwnProfile ? role === 'candidate' : true;

  const [values, setValues] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');
  const [attributeToAdd, setAttributeToAdd] = useState('');
  const [valueToAdd, setValueToAdd] = useState('');
  const selectedAttrToAdd = attributesList.find((a) => a.id === Number(attributeToAdd));
  const { t } = useTranslation();
  const [meFields, setMeFields] = useState({ firstName: '', lastName: '', location: '', name: '' });
  const [meSaveStatus, setMeSaveStatus] = useState('');
  const meLoadedRef = useRef(false);
  const [cvs, setCvs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTagsInput, setProjectTagsInput] = useState('');

  const meUrl = isOwnProfile ? '/profile/me' : `/profile/${viewedUserId}/me`;
  const valuesUrl = isOwnProfile ? '/profile' : `/profile/${viewedUserId}/values`;
  const valueUrl = (attributeId) => isOwnProfile ? `/profile/${attributeId}` : `/profile/${viewedUserId}/values/${attributeId}`;
  const cvsUrl = isOwnProfile ? '/cvs' : `/cvs/user/${viewedUserId}`;
  const projectsUrl = isOwnProfile ? '/projects' : `/projects/user/${viewedUserId}`;

  async function loadValues() {
    try {
      const data = await apiFetch(valuesUrl);
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
      const data = await apiFetch(meUrl);
      setMeFields(data);
      meLoadedRef.current = true;
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCvs() {
    if (!showCandidateSections) return;
    try {
      const data = await apiFetch(cvsUrl);
      setCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteCv(cvId) {
    setError('');
    try {
      await apiFetch(`/cvs/${cvId}`, { method: 'DELETE' });
      loadCvs();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadProjects() {
    if (!showCandidateSections) return;
    try {
      const data = await apiFetch(projectsUrl);
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateProject(e) {
    e.preventDefault();
    setError('');
    try {
      const tags = projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      await apiFetch('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: projectName, startDate: projectStartDate, endDate: projectEndDate || null, description: projectDescription, tags }),
      });
      setProjectName('');
      setProjectStartDate('');
      setProjectEndDate('');
      setProjectDescription('');
      setProjectTagsInput('');
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteProject(id) {
    setError('');
    try {
      await apiFetch(`/projects/${id}`, { method: 'DELETE' });
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    meLoadedRef.current = false; // reset the auto-save guard whenever we switch to viewing a different profile
    loadValues();
    loadAttributesList();
    loadMe();
    loadCvs();
    loadProjects();
  }, [viewedUserId]);

  // auto-save for the "Me" fields - only when it's your own profile (matches spec's auto-save requirement)
  useEffect(() => {
    if (!isOwnProfile || !meLoadedRef.current) return;

    const timer = setTimeout(async () => {
      setMeSaveStatus('saving');
      try {
        await apiFetch(meUrl, {
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

  // for viewing someone else's profile (admin editing), save immediately on blur instead of debouncing
  async function handleMeBlurSave() {
    if (isOwnProfile) return; // own profile already auto-saves via the effect above
    try {
      await apiFetch(meUrl, { method: 'PUT', body: JSON.stringify(meFields) });
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddAttribute() {
    if (!attributeToAdd) return;
    setError('');
    try {
      await apiFetch(valueUrl(attributeToAdd), {
        method: 'PUT',
        body: JSON.stringify({ value: valueToAdd }),
      });
      setAttributeToAdd('');
      setValueToAdd('');
      loadValues();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemove(attributeId) {
    setError('');
    try {
      await apiFetch(valueUrl(attributeId), { method: 'DELETE' });
      loadValues();
    } catch (err) {
      setError(err.message);
    }
  }

  const addedIds = values.map((v) => v.attributeId);
  const availableToAdd = attributesList.filter((a) => !addedIds.includes(a.id));

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{isOwnProfile ? t('profile.title') : displayName(meFields)}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      {isOwnProfile && <h2 className='mt-5'>{t('profile.me')}</h2>}
      <div className="row g-2 mb-2" style={{ maxWidth: '600px' }}>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.firstName')}
            value={meFields.firstName}
            disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, firstName: e.target.value }))}
            onBlur={handleMeBlurSave}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.lastName')}
            value={meFields.lastName}
            disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, lastName: e.target.value }))}
            onBlur={handleMeBlurSave}
          />
        </div>
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder={t('profile.location')}
            value={meFields.location}
            disabled={!canEdit}
            onChange={(e) => setMeFields((f) => ({ ...f, location: e.target.value }))}
            onBlur={handleMeBlurSave}
          />
        </div>
      </div>
      {isOwnProfile && (
        <div className="mb-4">
          {meSaveStatus === 'saving' && <small className="text-warning">{t('profile.saving')}</small>}
          {meSaveStatus === 'saved' && <small className="text-success">{t('profile.saved')}</small>}
        </div>
      )}

      <h2 className='mt-5'>{t('profile.info')}</h2>
      <table className="table table-striped table-borderless">
        <tbody>
          {values.map((v) => (
            <ValueRow key={v.attributeId} value={v} canEdit={canEdit} onRemove={handleRemove} onSaved={loadValues} valueUrl={valueUrl} />
          ))}
        </tbody>
      </table>

      {canEdit && (
        <div className="d-flex gap-2 mb-4">
          <select
            className="form-select"
            value={attributeToAdd}
            onChange={(e) => { setAttributeToAdd(e.target.value); setValueToAdd(''); }}
          >
            <option value="">{t('profile.selectAttribute')}</option>
            {availableToAdd.map((attr) => (
              <option key={attr.id} value={attr.id}>{attr.name} ({attr.category.name})</option>
            ))}
          </select>

          {selectedAttrToAdd && (
            <>
              {selectedAttrToAdd.type === 'enum' ? (
                <select className="form-select" value={valueToAdd} onChange={(e) => setValueToAdd(e.target.value)}>
                  <option value="">{t('profile.selectValue')}</option>
                  {selectedAttrToAdd.options.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              ) : selectedAttrToAdd.type === 'boolean' ? (
                <select className="form-select" value={valueToAdd} onChange={(e) => setValueToAdd(e.target.value)}>
                  <option value="">{t('profile.selectValue')}</option>
                  <option value="true">{t('profile.yes')}</option>
                  <option value="false">{t('profile.no')}</option>
                </select>
              ) : selectedAttrToAdd.type === 'text' ? (
                <textarea className="form-control" rows={1} value={valueToAdd} onChange={(e) => setValueToAdd(e.target.value)} />
              ) : selectedAttrToAdd.type === 'period' ? (
                <div className="d-flex gap-2">
                  <input
                    className="form-control"
                    type="date"
                    value={valueToAdd.split(',')[0] || ''}
                    onChange={(e) => setValueToAdd(`${e.target.value},${valueToAdd.split(',')[1] || ''}`)}
                  />
                  <input
                    className="form-control"
                    type="date"
                    value={valueToAdd.split(',')[1] || ''}
                    onChange={(e) => setValueToAdd(`${valueToAdd.split(',')[0] || ''},${e.target.value}`)}
                  />
                </div>
              ) : (
                <input
                  className="form-control"
                  type={selectedAttrToAdd.type === 'numeric' ? 'number' : selectedAttrToAdd.type === 'date' ? 'date' : 'text'}
                  value={valueToAdd}
                  onChange={(e) => setValueToAdd(e.target.value)}
                />
              )}
            </>
          )}

          <button className="btn btn-primary" onClick={handleAddAttribute}>{t('profile.add')}</button>
        </div>
      )}

      {showCandidateSections && (
        <>
          <h2 className='mt-5'>{isOwnProfile ? t('profile.myCvs') : t('profile.cvs')}</h2>
          <table className="table table-striped table-borderless">
            <thead>
              <tr>
                <th style={{ minWidth: '300px' }}>{t('cvs.colPosition')}</th>
                <th style={{ width: '100%' }} className='text-center'>{t('cvs.colStatus')}</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {cvs.map((cv) => (
                <tr key={cv.id}>
                  <td style={{ minWidth: '200px' }}><Link className='pos-user-link' to={`/cvs/${cv.id}`}>{cv.position.title}</Link></td>
                  <td style={{ width: '100%' }} className='text-center'>
                    <span className={`badge rounded-pill text-bg-${cv.status === 'published' ? 'success' : 'secondary'}`}>
                      {t(`cvDetail.${cv.status}`)}
                    </span>
                  </td>
                  {canEdit && (
                    <td>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteCv(cv.id)}>
                        {t('projects.delete')}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <h2 className="mt-5">{isOwnProfile ? t('profile.myProjects') : t('profile.projects')}</h2>
          <table className="table table-striped table-borderless">
            <thead>
              <tr>
                <th style={{ minWidth: '150px' }}>{t('projects.colName')}</th>
                <th style={{ minWidth: '265px' }} className='text-center'>{t('projects.colPeriod')}</th>
                <th style={{ minWidth: '170px' }} className='text-center'>{t('projects.colTags')}</th>
                <th style={{ width: "100%" }} className='text-center'>{t('projects.colDescription')}</th>
                {canEdit && <th></th>}
              </tr>
            </thead>
            <tbody>
              {projects.map((proj) => (
                <ProfileProjectRow key={proj.id} project={proj} canEdit={canEdit} isOwnProfile={isOwnProfile} onDelete={handleDeleteProject} onSaved={loadProjects} />
              ))}
            </tbody>
          </table>

          {canEdit && (
            <>
              <h3 className='mt-5'>{t('projects.addNew')}</h3>
              <form onSubmit={handleCreateProject} className="row g-2 mb-4">
                <div className="col-md-3">
                  <input className="form-control" placeholder={t('projects.namePlaceholder')} value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                </div>
                <div className="col-md-2">
                  <input className="form-control" type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} required />
                </div>
                <div className="col-md-2">
                  <input className="form-control" type="date" value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} placeholder="End (optional)" />
                </div>
                <div className="col-md-3">
                  <input className="form-control" placeholder={t('projects.tagsPlaceholder')} value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)} />
                </div>
                <div className="col-md-2">
                  <button type="submit" className="btn btn-primary w-100">{t('projects.addButton')}</button>
                </div>
                <div className="col-12">
                  <textarea className="form-control" placeholder={t('projects.descriptionPlaceholder')} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} required />
                </div>
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ValueRow({ value, canEdit, onRemove, onSaved, valueUrl }) {
  const [input, setInput] = useState(value.value);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const { t } = useTranslation();

  async function saveNow() {
    setSaveStatus('saving');
    setError('');
    try {
      await apiFetch(valueUrl(value.attributeId), {
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
  }

  // debounce only makes sense for your own live-typing profile; kept simple here for both cases
  useEffect(() => {
    if (input === value.value) return;
    const timer = setTimeout(saveNow, 5000);
    return () => clearTimeout(timer);
  }, [input]);

  return (
    <tr>
      <td style={{ width: '200px', minWidth: '200px' }}>{value.attribute.name}</td>
      <td style={{ width: '100%' }}>
        <div className="d-flex justify-content-center">
          {value.attribute.type === 'enum' ? (
            <select className="form-select" style={{ maxWidth: '300px' }} value={input} disabled={!canEdit} onChange={(e) => setInput(e.target.value)}>
              <option value="">{t('profile.selectValue')}</option>
              {value.attribute.options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : value.attribute.type === 'boolean' ? (
            <select className="form-select" style={{ maxWidth: '300px' }} value={input} disabled={!canEdit} onChange={(e) => setInput(e.target.value)}>
              <option value="">{t('profile.selectValue')}</option>
              <option value="true">{t('profile.yes')}</option>
              <option value="false">{t('profile.no')}</option>
            </select>
          ) : value.attribute.type === 'text' ? (
            <textarea className="form-control" style={{ maxWidth: '300px' }} rows={3} value={input} disabled={!canEdit} onChange={(e) => setInput(e.target.value)} />
          ) : value.attribute.type === 'period' ? (
            <div className="d-flex gap-2">
              <input className="form-control" type="date" disabled={!canEdit} value={input.split(',')[0] || ''} onChange={(e) => setInput(`${e.target.value},${input.split(',')[1] || ''}`)} />
              <input className="form-control" type="date" disabled={!canEdit} value={input.split(',')[1] || ''} onChange={(e) => setInput(`${input.split(',')[0] || ''},${e.target.value}`)} />
            </div>
          ) : (
            <input
              className="form-control"
              type={value.attribute.type === 'numeric' ? 'number' : value.attribute.type === 'date' ? 'date' : 'text'}
              style={{ maxWidth: '300px' }}
              value={input}
              disabled={!canEdit}
              onChange={(e) => setInput(e.target.value)}
            />
          )}
        </div>
        {saveStatus === 'saving' && <small className="text-warning">{t('profile.saving')}</small>}
        {saveStatus === 'saved' && <small className="text-success">{t('profile.saved')}</small>}
        {error && <div className="text-danger small">{error}</div>}
      </td>
      {canEdit && (
        <td>
          <button className="btn btn-sm btn-danger" onClick={() => onRemove(value.attributeId)}>{t('profile.remove')}</button>
        </td>
      )}
    </tr>
  );
}

function ProfileProjectRow({ project, canEdit, isOwnProfile, onDelete, onSaved }) {
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
      const url = isOwnProfile ? `/projects/${project.id}` : `/projects/${project.id}/admin`;
      await apiFetch(url, {
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
      const url = isOwnProfile ? `/projects/${project.id}` : `/projects/${project.id}/admin`;
      await apiFetch(url, {
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
          <td style={{ minWidth: '150px' }}>{project.name}</td>
          <td style={{ minWidth: '265px' }} className='text-center'>
            {new Date(project.startDate).toLocaleDateString()} -{' '}
            {project.endDate ? new Date(project.endDate).toLocaleDateString() : t('projects.ongoing')}
          </td>
          <td style={{ minWidth: '350px' }} className='text-center'>
            {project.tags.map((tag) => (
              <span key={tag} className="badge text-bg-secondary me-1" style={{ fontSize: '0.85rem' }}>
                {tag}
                {canEdit && (
                  <span onClick={() => handleRemoveTag(tag)} style={{ cursor: 'pointer', marginLeft: '0.4rem' }}>
                    ×
                  </span>
                )}
              </span>
            ))}
          </td>
          <td style={{ width: '100%' }} className='text-center'>{project.description}</td>
        </>
      )}
      {canEdit && (
        <td className="gap-2">
          {editing ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={handleSave}>{t('cvDetail.save')}</button>
              <button className="btn btn-sm btn-secondary" onClick={() => setEditing(false)}>{t('cvDetail.cancel')}</button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-outline-primary mb-2" onClick={() => setEditing(true)}>{t('projects.edit')}</button>
              <button className="btn btn-sm btn-danger" onClick={() => onDelete(project.id)}>{t('projects.delete')}</button>
            </>
          )}
        </td>
      )}
    </tr>
  );
}

export default Profile;