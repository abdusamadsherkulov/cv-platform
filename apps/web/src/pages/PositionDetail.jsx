import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch, getCurrentRole, displayName } from '../api';
import { useTranslation } from 'react-i18next';

function PositionDetail() {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingInfo, setEditingInfo] = useState(false);

  const [attributeToAdd, setAttributeToAdd] = useState('');

  const [ruleAttributeId, setRuleAttributeId] = useState('');
  const [ruleOperator, setRuleOperator] = useState('gt');
  const [ruleValue, setRuleValue] = useState('');

  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');

  const role = getCurrentRole();
  const canManage = role === 'recruiter' || role === 'admin';

  const { t } = useTranslation();

  async function loadPosition() {
    try {
      const data = await apiFetch(`/positions/${id}`);
      setPosition(data);
      setTitle(data.title);
      setDescription(data.description);
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
    loadPosition();
    loadAttributesList();
    loadPosts();
  }, [id]);

  async function handleSaveInfo(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await apiFetch(`/positions/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title,
          description,
          projectTags: position.projectTags,
          maxProjects: position.maxProjects,
          version: position.version,
        }),
      });
      setMessage('Saved!');
      setEditingInfo(false);
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddAttribute() {
    if (!attributeToAdd) return;
    setError('');
    try {
      await apiFetch(`/positions/${id}/attributes`, {
        method: 'POST',
        body: JSON.stringify({ attributeId: Number(attributeToAdd) }),
      });
      setAttributeToAdd('');
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveAttribute(attributeId) {
    setError('');
    try {
      await apiFetch(`/positions/${id}/attributes/${attributeId}`, { method: 'DELETE' });
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddRule() {
    if (!ruleAttributeId || !ruleValue) return;
    setError('');
    try {
      await apiFetch(`/positions/${id}/access-rules`, {
        method: 'POST',
        body: JSON.stringify({
          attributeId: Number(ruleAttributeId),
          operator: ruleOperator,
          value: ruleValue,
        }),
      });
      setRuleAttributeId('');
      setRuleValue('');
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveRule(ruleId) {
    setError('');
    try {
      await apiFetch(`/positions/${id}/access-rules/${ruleId}`, { method: 'DELETE' });
      loadPosition();
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadPosts() {
    try {
      const data = await apiFetch(`/discussions/${id}`);
      setPosts(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handlePostSubmit(e) {
    e.preventDefault();
    if (!newPost.trim()) return;
    setError('');
    try {
      await apiFetch(`/discussions/${id}`, {
        method: 'POST',
        body: JSON.stringify({ content: newPost }),
      });
      setNewPost('');
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  }

  if (!position) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <span className="loading-ring"></span>
    </div>
  );

  const attachedIds = position.attributes.map((a) => a.attributeId);
  const attributesNotYetAdded = attributesList.filter((a) => !attachedIds.includes(a.id));

  return (
    <div className="container mt-4">
      <Link to="/positions">&larr; {t('positionDetail.back')}</Link>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {message && <div className="alert alert-success mt-3">{message}</div>}

      {editingInfo ? (
        <form onSubmit={handleSaveInfo} className="mt-3">
          <input className="form-control mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="form-control mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="submit">{t('positionDetail.save')}</button>
          <button className="btn btn-secondary btn-sm ms-2" type="button" onClick={() => setEditingInfo(false)}>{t('positionDetail.cancel')}</button>
        </form>
      ) : (
        <div className="mt-3">
          <h1>{position.title}</h1>
          <p>{position.description}</p>
          {canManage && (
            <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingInfo(true)}>{t('positionDetail.editButton')}</button>
          )}
        </div>
      )}

      <h2 className="mt-4">{t('positionDetail.attributes')}</h2>
      <ul className="list-group mb-3">
        {position.attributes.map((posAttr) => (
          <li key={posAttr.attributeId} className="list-group-item d-flex justify-content-between align-items-center">
            {posAttr.attribute.name}
            {canManage && (
              <button className="btn btn-sm btn-danger" onClick={() => handleRemoveAttribute(posAttr.attributeId)}>{t('positionDetail.remove')}</button>
            )}
          </li>
        ))}
      </ul>

      {canManage && (
        <div className="d-flex gap-2">
          <select className="form-select" value={attributeToAdd} onChange={(e) => setAttributeToAdd(e.target.value)}>
            <option value="">{t('positionDetail.selectAttribute')}</option>
            {attributesNotYetAdded.map((attr) => (
              <option key={attr.id} value={attr.id}>{attr.name}</option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={handleAddAttribute}>{t('positionDetail.add')}</button>
        </div>
      )}

      {canManage && (
        <>
          <h2 className="mt-4">{t('positionDetail.accessRules')}</h2>
          <ul className="list-group mb-3">
            {position.accessRules?.map((rule) => (
              <li key={rule.id} className="list-group-item d-flex justify-content-between align-items-center">
                {rule.attribute.name} {rule.operator} {rule.value}
                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveRule(rule.id)}>{t('positionDetail.remove')}</button>
              </li>
            ))}
          </ul>

          <div className="d-flex gap-2">
            <select className="form-select" value={ruleAttributeId} onChange={(e) => setRuleAttributeId(e.target.value)}>
              <option value="">{t('positionDetail.selectAttribute')}</option>
              {attributesList.map((attr) => (
                <option key={attr.id} value={attr.id}>{attr.name}</option>
              ))}
            </select>
            <select className="form-select" value={ruleOperator} onChange={(e) => setRuleOperator(e.target.value)}>
              <option value="gt">{t('positionDetail.greaterThan')}</option>
              <option value="lt">{t('positionDetail.lessThan')}</option>
              <option value="eq">{t('positionDetail.equals')}</option>
            </select>
            <input className="form-control" placeholder={t('positionDetail.valuePlaceholder')} value={ruleValue} onChange={(e) => setRuleValue(e.target.value)} />
            <button className="btn btn-primary" onClick={handleAddRule}>{t('positionDetail.addRule')}</button>
          </div>
        </>
      )}
      <h2 className="mt-4">{t('positionDetail.discussion')}</h2>
      <ul className="list-group mb-3">
        {posts.map((post) => (
          <li key={post.id} className="list-group-item">
            <strong>{displayName(post.author)}</strong>{' '}
            <small className="text-muted">{new Date(post.createdAt).toLocaleString()}</small>
            <p className="mb-0">{post.content}</p>
          </li>
        ))}
      </ul>

      <form onSubmit={handlePostSubmit} className="d-flex gap-2 mb-4">
        <input
          className="form-control"
          placeholder={t('positionDetail.postPlaceholder')}
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <button className="btn btn-primary" type="submit">{t('positionDetail.post')}</button>
      </form>
    </div>
  );
}

export default PositionDetail;