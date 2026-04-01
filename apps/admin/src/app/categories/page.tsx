'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/layout/admin-shell';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { StatusBadge } from '../../components/ui/status-badge';
import { adminApi } from '../../lib/api';
import { Category, CategoryPayload } from '../../types/catalog';

const initialForm: CategoryPayload = {
  name: '',
  slug: '',
  description: '',
  parentId: '',
  isActive: true,
  sortOrder: 0
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryPayload>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableParents = useMemo(
    () => categories.filter((category) => category.id !== editingId),
    [categories, editingId]
  );

  async function loadCategories() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm(initialForm);
    setModalOpen(true);
  }

  function openEditModal(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      parentId: category.parentId ?? '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: CategoryPayload = {
      ...form,
      parentId: form.parentId || undefined,
      description: form.description || undefined,
      sortOrder: Number(form.sortOrder ?? 0)
    };

    try {
      if (editingId) {
        await adminApi.updateCategory(editingId, payload);
      } else {
        await adminApi.createCategory(payload);
      }

      setModalOpen(false);
      await loadCategories();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await adminApi.deleteCategory(id);
      await loadCategories();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete category');
    }
  }

  return (
    <AdminShell
      title="Categories"
      subtitle="Manage catalog structure and nested parent categories."
      actions={
        <Button variant="primary" onClick={openCreateModal}>
          New category
        </Button>
      }
    >
      <div className="card table-wrap">
        {error ? <div className="alert error">{error}</div> : null}
        {isLoading ? (
          <p>Loading categories...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Parent</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name}</td>
                  <td>{category.slug}</td>
                  <td>{category.parent?.name ?? '—'}</td>
                  <td>
                    <StatusBadge active={category.isActive} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <Button variant="secondary" onClick={() => openEditModal(category)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(category.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal title={editingId ? 'Edit category' : 'Create category'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              className="input"
              placeholder="Category name"
              value={form.name ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Slug"
              value={form.slug ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
          </div>

          <textarea
            className="textarea"
            placeholder="Description"
            value={form.description ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />

          <div className="form-row">
            <select
              className="select"
              value={form.parentId ?? ''}
              onChange={(event) => setForm((prev) => ({ ...prev, parentId: event.target.value }))}
            >
              <option value="">No parent category</option>
              {availableParents.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            <input
              className="input"
              type="number"
              min={0}
              value={form.sortOrder ?? 0}
              onChange={(event) => setForm((prev) => ({ ...prev, sortOrder: Number(event.target.value) }))}
              placeholder="Sort order"
            />
          </div>

          <label>
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              style={{ marginRight: 8 }}
            />
            Active category
          </label>

          <div className="row-actions">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save category'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
