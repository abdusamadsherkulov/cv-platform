import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  async function loadUsers() {
    try {
      const data = await apiFetch('/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleRoleChange(userId, newRole) {
    setError('');
    try {
      await apiFetch(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggleBlock(userId, currentlyBlocked) {
    setError('');
    try {
      await apiFetch(`/users/${userId}/block`, {
        method: 'PUT',
        body: JSON.stringify({ isBlocked: !currentlyBlocked }),
      });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(userId) {
    setError('');
    try {
      await apiFetch(`/users/${userId}`, { method: 'DELETE' });
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1>User Management</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="candidate">Candidate</option>
                  <option value="recruiter">Recruiter</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
              <td className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggleBlock(u.id, u.isBlocked)}>
                  {u.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Users;