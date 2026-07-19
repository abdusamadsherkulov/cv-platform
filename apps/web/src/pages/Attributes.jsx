import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('string');
  const [categoryId, setCategoryId] = useState('');

  async function loadAttributes() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/attributes${query}`);
      setAttributes(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAttributes();
  }, [search]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/attributes', {
        method: 'POST',
        body: JSON.stringify({ name, description, type, categoryId: Number(categoryId) }),
      });
      setName('');
      setDescription('');
      setCategoryId('');
      loadAttributes();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1>Attribute Library</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <input
        className="form-control mb-3"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Category</th>
            <th>Type</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {attributes.map((attr) => (
            <tr key={attr.id}>
              <td>{attr.name}</td>
              <td>{attr.category.name}</td>
              <td>{attr.type}</td>
              <td>{attr.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Add New Attribute</h2>
      <form onSubmit={handleCreate} className="row g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-md-3">
          <input className="form-control" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="col-md-2">
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="string">String</option>
            <option value="text">Text</option>
            <option value="numeric">Numeric</option>
            <option value="date">Date</option>
            <option value="period">Period</option>
            <option value="boolean">Boolean</option>
            <option value="enum">One of many</option>
            <option value="image">Image</option>
          </select>
        </div>
        <div className="col-md-2">
          <input className="form-control" placeholder="Category ID" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required />
        </div>
        <div className="col-md-2">
          <button type="submit" className="btn btn-primary w-100">Add</button>
        </div>
      </form>
    </div>
  );
}

export default Attributes;