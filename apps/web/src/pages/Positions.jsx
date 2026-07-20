import { useState, useEffect } from 'react';
import { apiFetch } from '../api';
import { Link } from 'react-router-dom';

function Positions() {
  const [positions, setPositions] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);

  async function loadPositions() {
    try {
      const data = await apiFetch('/positions');
      setPositions(data);
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
    loadPositions();
    loadAttributesList();
  }, []);

  function toggleAttribute(id) {
    setSelectedAttributeIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/positions', {
        method: 'POST',
        body: JSON.stringify({ title, description, attributeIds: selectedAttributeIds }),
      });
      setTitle('');
      setDescription('');
      setSelectedAttributeIds([]);
      loadPositions();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1>Positions</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Attributes</th>
          </tr>
        </thead>
        <tbody>
          {positions.map((pos) => (
            <tr key={pos.id}>
              <td><Link to={`/positions/${pos.id}`}>{pos.title}</Link></td>
              <td>{pos.description}</td>
              <td>{pos.attributes.map((a) => a.attribute.name).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Create New Position</h2>
      <form onSubmit={handleCreate}>
        <div className="mb-2">
          <input className="form-control" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <input className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="form-label">Attributes:</label>
          {attributesList.map((attr) => (
            <div className="form-check" key={attr.id}>
              <input
                type="checkbox"
                className="form-check-input"
                checked={selectedAttributeIds.includes(attr.id)}
                onChange={() => toggleAttribute(attr.id)}
                id={`attr-${attr.id}`}
              />
              <label className="form-check-label" htmlFor={`attr-${attr.id}`}>
                {attr.name} ({attr.category.name})
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="btn btn-primary">Create Position</button>
      </form>
    </div>
  );
}

export default Positions;