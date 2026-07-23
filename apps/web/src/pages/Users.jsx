import { useState, useEffect } from 'react';
import { apiFetch, displayName } from '../api';
import { useTranslation } from 'react-i18next';

function Users() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  const { t } = useTranslation();

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
      <h1 className="mb-4">{t('users.title')}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <table className="table table-striped table-borderless">
        <thead>
          <tr>
            <th>{t('users.colName')}</th>
            <th>{t('users.colEmail')}</th>
            <th>{t('users.colRole')}</th>
            <th>{t('users.colStatus')}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{displayName(u)}</td>
              <td>{u.email}</td>
              <td>
                <select
                  className="form-select form-select-sm"
                  value={u.role}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                >
                  <option value="candidate">{t('users.candidate')}</option>
                  <option value="recruiter">{t('users.recruiter')}</option>
                  <option value="admin">{t('users.admin')}</option>
                </select>
              </td>
              <td>{u.isBlocked ? t('users.blocked') : t('users.active')}</td>
              <td className="d-flex gap-2">
                <button className="btn btn-sm btn-outline-warning" onClick={() => handleToggleBlock(u.id, u.isBlocked)}>
                  {u.isBlocked ? t('users.unblock') : t('users.block')}
                </button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(u.id)}>
                  {t('users.delete')}
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