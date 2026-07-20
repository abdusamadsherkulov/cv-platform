import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiFetch } from '../api';

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

  if (!position) return <div className="container mt-4">Loading...</div>;

  const attachedIds = position.attributes.map((a) => a.attributeId);
  const attributesNotYetAdded = attributesList.filter((a) => !attachedIds.includes(a.id));

  return (
    <div className="container mt-4">
      <Link to="/positions">&larr; Back to Positions</Link>

      {error && <div className="alert alert-danger mt-3">{error}</div>}
      {message && <div className="alert alert-success mt-3">{message}</div>}

      {editingInfo ? (
        <form onSubmit={handleSaveInfo} className="mt-3">
          <input className="form-control mb-2" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="form-control mb-2" value={description} onChange={(e) => setDescription(e.target.value)} />
          <button className="btn btn-primary btn-sm" type="submit">Save</button>
          <button className="btn btn-secondary btn-sm ms-2" type="button" onClick={() => setEditingInfo(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <div className="mt-3">
          <h1>{position.title}</h1>
          <p>{position.description}</p>
          <button className="btn btn-sm btn-outline-primary" onClick={() => setEditingInfo(true)}>
            Edit Title/Description
          </button>
        </div>
      )}

      <h2 className="mt-4">Attributes</h2>
      <ul className="list-group mb-3">
        {position.attributes.map((posAttr) => (
          <li key={posAttr.attributeId} className="list-group-item d-flex justify-content-between align-items-center">
            {posAttr.attribute.name}
            <button className="btn btn-sm btn-danger" onClick={() => handleRemoveAttribute(posAttr.attributeId)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="d-flex gap-2">
        <select className="form-select" value={attributeToAdd} onChange={(e) => setAttributeToAdd(e.target.value)}>
          <option value="">Select an attribute to add...</option>
          {attributesNotYetAdded.map((attr) => (
            <option key={attr.id} value={attr.id}>{attr.name}</option>
          ))}
        </select>
        <button className="btn btn-primary" onClick={handleAddAttribute}>Add</button>
      </div>
    </div>
  );
}

export default PositionDetail;