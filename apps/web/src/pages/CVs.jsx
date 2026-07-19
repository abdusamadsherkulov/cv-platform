import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

function CVs() {
  const [cvs, setCvs] = useState([]);
  const [positions, setPositions] = useState([]);
  const [error, setError] = useState('');

  async function loadData() {
    try {
      const [cvData, posData] = await Promise.all([
        apiFetch('/cvs'),
        apiFetch('/positions'),
      ]);
      setCvs(cvData);
      setPositions(posData);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleCreate(positionId) {
    setError('');
    try {
      await apiFetch('/cvs', {
        method: 'POST',
        body: JSON.stringify({ positionId }),
      });
      loadData();
    } catch (err) {
      setError(err.message);
    }
  }

  // positions that don't already have a CV from this candidate
  const availablePositions = positions.filter(
    (pos) => !cvs.some((cv) => cv.positionId === pos.id)
  );

  return (
    <div className="container mt-4">
      <h1>My CVs</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Position</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {cvs.map((cv) => (
            <tr key={cv.id}>
              <td><Link to={`/cvs/${cv.id}`}>{cv.position.title}</Link></td>
              <td>{cv.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Create CV for a Position</h2>
      <ul className="list-group">
        {availablePositions.map((pos) => (
          <li key={pos.id} className="list-group-item d-flex justify-content-between align-items-center">
            {pos.title}
            <button className="btn btn-sm btn-primary" onClick={() => handleCreate(pos.id)}>
              Create CV
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CVs;