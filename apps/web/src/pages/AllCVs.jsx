import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

function AllCVs() {
  const [cvs, setCvs] = useState([]);
  const [error, setError] = useState('');

  async function loadCvs() {
    try {
      const data = await apiFetch('/cvs/all/published');
      setCvs(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadCvs();
  }, []);

  return (
    <div className="container mt-4">
      <h1>All Published CVs</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Position</th>
            <th>Likes</th>
          </tr>
        </thead>
        <tbody>
          {cvs.map((cv) => (
            <tr key={cv.id}>
              <td>{cv.user.name}</td>
              <td><Link to={`/cvs/${cv.id}`}>{cv.position.title}</Link></td>
              <td>{cv.likeCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AllCVs;