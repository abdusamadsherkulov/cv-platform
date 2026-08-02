import { useState, useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { apiFetch, getCurrentRole, getCurrentUserId, displayName } from '../api';
import { useToast, ToastContainer } from '../components/Toast';
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
  const meLoadedRef = useRef(false);
  const [cvs, setCvs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState('');
  const [projectStartDate, setProjectStartDate] = useState('');
  const [projectEndDate, setProjectEndDate] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTagsInput, setProjectTagsInput] = useState('');

  const [showSalesforceForm, setShowSalesforceForm] = useState(false);
  const [sfCompanyName, setSfCompanyName] = useState('');
  const [sfPhone, setSfPhone] = useState('');
  const [sfNotes, setSfNotes] = useState('');
  const [sfResult, setSfResult] = useState(null);


  const meUrl = isOwnProfile ? '/profile/me' : `/profile/${viewedUserId}/me`;
  const valuesUrl = isOwnProfile ? '/profile' : `/profile/${viewedUserId}/values`;
  const valueUrl = (attributeId) => isOwnProfile ? `/profile/${attributeId}` : `/profile/${viewedUserId}/values/${attributeId}`;
  const cvsUrl = isOwnProfile ? '/cvs' : `/cvs/user/${viewedUserId}`;
  const projectsUrl = isOwnProfile ? '/projects' : `/projects/user/${viewedUserId}`;
  const { toasts, showToast } = useToast();

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

  async function handleSalesforceSync(e) {
    e.preventDefault();
    setError('');
    setSfResult(null);
    try {
      const result = await apiFetch('/salesforce/sync', {
        method: 'POST',
        body: JSON.stringify({ companyName: sfCompanyName, phone: sfPhone, notes: sfNotes }),
      });
      setSfResult(result);
      setShowSalesforceForm(false);
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
      showToast(t('profile.saving'), 'saving');
      try {
        await apiFetch(meUrl, {
          method: 'PUT',
          body: JSON.stringify(meFields),
        });
        showToast(t('profile.saved'), 'saved');
      } catch (err) {
        setError(err.message);
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
      <ToastContainer toasts={toasts} />
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

      {canEdit && (
        <div className="mt-4 mb-4">
          <button className="btn btn-outline-primary btn-sm" onClick={() => setShowSalesforceForm((s) => !s)}>
            Sync to Salesforce
          </button>

          {sfResult && (
            <div className="alert alert-success mt-2">
              Synced! Account ID: {sfResult.accountId}, Contact ID: {sfResult.contactId}
            </div>
          )}

          {showSalesforceForm && (
            <form onSubmit={handleSalesforceSync} className="row g-2 mt-2" style={{ maxWidth: '600px' }}>
              <div className="col-md-4">
                <input className="form-control" placeholder="Company Name" value={sfCompanyName} onChange={(e) => setSfCompanyName(e.target.value)} />
              </div>
              <div className="col-md-4">
                <input className="form-control" placeholder="Phone" value={sfPhone} onChange={(e) => setSfPhone(e.target.value)} />
              </div>
              <div className="col-md-4">
                <input className="form-control" placeholder="Notes" value={sfNotes} onChange={(e) => setSfNotes(e.target.value)} />
              </div>
              <div className="col-12">
                <button type="submit" className="btn btn-primary btn-sm">Submit to Salesforce</button>
              </div>
            </form>
          )}
        </div>
      )}

      <h2 className='mt-5'>{t('profile.info')}</h2>
      <table className="table table-striped table-borderless">
        <tbody>
          {values.map((v) => (
            <ValueRow key={v.attributeId} value={v} canEdit={canEdit} onRemove={handleRemove} onSaved={loadValues} valueUrl={valueUrl} showToast={showToast} />
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

          <button className="btn btn-primary" onClick={handleAddAttribute}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 640 640">
              <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
            </svg>
          </button>
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
                      <span className="icon-btn icon-btn-delete mt-1" onClick={() => handleDeleteCv(cv.id)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-trash icon-default" viewBox="0 0 16 16">
                          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                        </svg>
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-trash-fill icon-hover" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
                        </svg>
                      </span>
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
              <form onSubmit={handleCreateProject} className="mb-4">
                <div className='d-flex gap-2 mb-2'>
                  <input className="form-control" placeholder={t('projects.namePlaceholder')} value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
                  <input className="form-control" type="date" value={projectStartDate} onChange={(e) => setProjectStartDate(e.target.value)} required />
                  <input className="form-control" type="date" value={projectEndDate} onChange={(e) => setProjectEndDate(e.target.value)} placeholder="End (optional)" />
                  <input className="form-control" placeholder={t('projects.tagsPlaceholder')} value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)} />
                  <button type="submit" className="btn btn-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" viewBox="0 0 640 640">
                      <path d="M352 128C352 110.3 337.7 96 320 96C302.3 96 288 110.3 288 128L288 288L128 288C110.3 288 96 302.3 96 320C96 337.7 110.3 352 128 352L288 352L288 512C288 529.7 302.3 544 320 544C337.7 544 352 529.7 352 512L352 352L512 352C529.7 352 544 337.7 544 320C544 302.3 529.7 288 512 288L352 288L352 128z" />
                    </svg>
                  </button>
                </div>
                <textarea className="form-control" placeholder={t('projects.descriptionPlaceholder')} value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} required />
              </form>
            </>
          )}
        </>
      )}
    </div>
  );
}

function ValueRow({ value, canEdit, onRemove, onSaved, valueUrl, showToast }) {
  const [input, setInput] = useState(value.value);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  async function saveNow() {
    setError('');
    showToast(t('profile.saving'), 'saving');
    try {
      await apiFetch(valueUrl(value.attributeId), {
        method: 'PUT',
        body: JSON.stringify({ value: input, version: value.version }),
      });
      showToast(t('profile.saved'), 'saved');
      onSaved();
    } catch (err) {
      setError(err.message);
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
        {error && <div className="text-danger small">{error}</div>}
      </td>
      {canEdit && (
        <td>
          <span className="icon-btn icon-btn-delete mt-2" onClick={() => onRemove(value.attributeId)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-trash icon-default" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
              <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
            </svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-trash-fill icon-hover" viewBox="0 0 16 16">
              <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0" />
            </svg>
          </span>
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
                <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" className="bi bi-trash-fill icon-hover" viewBox="0 0 16 16">
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

export default Profile;