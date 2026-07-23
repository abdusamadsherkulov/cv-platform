import { useState, useEffect } from 'react';
import { apiFetch, getCurrentRole } from '../api';
import { useTranslation } from 'react-i18next';

function Attributes() {
  const [attributes, setAttributes] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('string');
  const [categoryId, setCategoryId] = useState('');

  const role = getCurrentRole();
  const canManage = role === 'recruiter' || role === 'admin';

  const [categoriesList, setCategoriesList] = useState([]);

  const { t } = useTranslation();

  async function loadAttributes() {
    try {
      const query = search ? `?search=${encodeURIComponent(search)}` : '';
      const data = await apiFetch(`/attributes${query}`);
      setAttributes(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadCategories() {
    try {
      const data = await apiFetch('/categories');
      setCategoriesList(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    loadAttributes();
    loadCategories();
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
      <h1 className="mb-4">{t('attributes.title')}</h1>

      {error && <div className="alert alert-danger">{error}</div>}

      <input
        className="form-control mb-3"
        placeholder={t('attributes.searchPlaceholder')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <table className="table table-striped table-borderless">
        <thead>
          <tr>
            <th>{t('attributes.colName')}</th>
            <th>{t('attributes.colCategory')}</th>
            <th>{t('attributes.colType')}</th>
            <th>{t('attributes.colDescription')}</th>
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
      {canManage && (
        <>
          <h2>{t('attributes.addNew')}</h2>
          <form onSubmit={handleCreate} className="row g-2">
            <div className="col-md-3">
              <input className="form-control" placeholder={t('attributes.namePlaceholder')} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="col-md-3">
              <input className="form-control" placeholder={t('attributes.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} required />
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
              <select className="form-select" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">{t('attributes.selectCategory')}</option>
                {categoriesList.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <button type="submit" className="btn btn-primary w-100">{t('attributes.addButton')}</button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}

export default Attributes;