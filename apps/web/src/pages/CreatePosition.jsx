import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';
import { useTranslation } from 'react-i18next';

function CreatePosition() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attributesList, setAttributesList] = useState([]);
  const [selectedAttributeIds, setSelectedAttributeIds] = useState([]);
  const [projectTagsInput, setProjectTagsInput] = useState('');
  const [maxProjects, setMaxProjects] = useState(3);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { t } = useTranslation();

  async function loadAttributesList() {
    try {
      const data = await apiFetch('/attributes');
      setAttributesList(data);
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
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
      const tags = projectTagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const position = await apiFetch('/positions', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          attributeIds: selectedAttributeIds,
          projectTags: tags,
          maxProjects: Number(maxProjects),
        }),
      });
      // access rules are added as a follow-up step, straight on the new position's detail page
      navigate(`/positions/${position.id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="container mt-4">
      <h1 className="mb-4">{t('positions.createNew')}</h1>
      {error && <div className="alert alert-danger">{error}</div>}

      <form onSubmit={handleCreate}>
        <div className="mb-2">
          <input className="form-control" placeholder={t('positions.titlePlaceholder')} value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <input className="form-control" placeholder={t('positions.descriptionPlaceholder')} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>
        <div className="mb-2">
          <input className="form-control" placeholder={t('positionDetail.projectTagsLabel')} value={projectTagsInput} onChange={(e) => setProjectTagsInput(e.target.value)} />
        </div>
        <div className="mb-2">
          <input className="form-control" type="number" placeholder={t('positionDetail.maxProjectsLabel')} value={maxProjects} onChange={(e) => setMaxProjects(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="form-label">{t('positions.attributesLabel')}</label>
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
        <button type="submit" className="btn btn-primary">{t('positions.createButton')}</button>
      </form>
    </div>
  );
}

export default CreatePosition;