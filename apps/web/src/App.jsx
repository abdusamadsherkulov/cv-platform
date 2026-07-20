import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'https://cw-platform.onrender.com';

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/stats`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => setError('Could not load stats'));
  }, []);

  if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  if (!data) return <div className="container mt-4">Loading...</div>;

  return (
    <div className="container mt-4">
      <h1>CV Management Platform</h1>

      <div className="row mb-4">
        <div className="col"><div className="card text-center p-3"><h3>{data.stats.totalPositions}</h3><p>Positions</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3>{data.stats.totalCandidates}</h3><p>Candidates</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3>{data.stats.totalRecruiters}</h3><p>Recruiters</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3>{data.stats.totalCVs}</h3><p>Total CVs</p></div></div>
        <div className="col"><div className="card text-center p-3"><h3>{data.stats.recentCVs}</h3><p>CVs (last 24h)</p></div></div>
      </div>

      <h2>Latest Positions</h2>
      <table className="table table-striped mb-4">
        <thead><tr><th>Title</th><th>Description</th></tr></thead>
        <tbody>
          {data.latestPositions.map((pos) => (
            <tr key={pos.id}>
              <td><Link to={`/positions/${pos.id}`}>{pos.title}</Link></td>
              <td>{pos.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Most Popular Positions</h2>
      <table className="table table-striped">
        <thead><tr><th>Title</th><th>CVs Submitted</th></tr></thead>
        <tbody>
          {data.popularPositions.map((pos) => (
            <tr key={pos.id}>
              <td><Link to={`/positions/${pos.id}`}>{pos.title}</Link></td>
              <td>{pos._count.cvs}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;