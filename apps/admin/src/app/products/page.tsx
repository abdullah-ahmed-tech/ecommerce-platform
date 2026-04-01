'use client';

import { useEffect, useMemo, useState } from 'react';
import { AdminShell } from '../../components/layout/admin-shell';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
import { StatusBadge } from '../../components/ui/status-badge';
import { adminApi } from '../../lib/api';
import { Category, Product, ProductImageInput, ProductPayload } from '../../types/catalog';

interface ProductFormState extends ProductPayload {
  compareAtPrice?: number;
  images: ProductImageInput[];
}

const emptyImage: ProductImageInput = {
  url: '',
  alt: '',
  sortOrder: 0,
  isPrimary: false
};

const initialForm: ProductFormState = {
  name: '',
  slug: '',
  shortDescription: '',
  description: '',
  sku: '',
  price: 0,
  compareAtPrice: undefined,
  stock: 0,
  isActive: true,
  categoryId: '',
  images: [emptyImage]
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories]
  );

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [productsData, categoriesData] = await Promise.all([adminApi.getProducts(), adminApi.getCategories()]);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  function openCreateModal() {
    setEditingId(null);
    setForm({ ...initialForm, categoryId: categories[0]?.id ?? '' });
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription ?? '',
      description: product.description ?? '',
      sku: product.sku,
      price: Number(product.price),
      compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : undefined,
      stock: product.stock,
      isActive: product.isActive,
      categoryId: product.categoryId,
      images:
        product.images.length > 0
          ? product.images.map((image) => ({
              url: image.url,
              alt: image.alt ?? '',
              sortOrder: image.sortOrder,
              isPrimary: image.isPrimary
            }))
          : [emptyImage]
    });
    setModalOpen(true);
  }

  function updateImage(index: number, partial: Partial<ProductImageInput>) {
    setForm((prev) => {
      const nextImages = [...prev.images];
      nextImages[index] = { ...nextImages[index], ...partial };
      return { ...prev, images: nextImages };
    });
  }

  function addImageRow() {
    setForm((prev) => ({ ...prev, images: [...prev.images, { ...emptyImage }] }));
  }

  function removeImageRow(index: number) {
    setForm((prev) => {
      const nextImages = prev.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...prev, images: nextImages.length > 0 ? nextImages : [{ ...emptyImage }] };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const payload: ProductPayload = {
      ...form,
      shortDescription: form.shortDescription || undefined,
      description: form.description || undefined,
      compareAtPrice: form.compareAtPrice || undefined,
      images: form.images
        .filter((image) => image.url.trim().length > 0)
        .map((image, index) => ({
          url: image.url,
          alt: image.alt || undefined,
          sortOrder: image.sortOrder ?? index,
          isPrimary: image.isPrimary ?? false
        }))
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setModalOpen(false);
      await loadData();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm('Delete this product?');
    if (!confirmed) {
      return;
    }

    setError(null);
    try {
      await adminApi.deleteProduct(id);
      await loadData();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete product');
    }
  }

  return (
    <AdminShell
      title="Products"
      subtitle="Manage product details, stock, category assignment, and images."
      actions={
        <Button variant="primary" onClick={openCreateModal}>
          New product
        </Button>
      }
    >
      <div className="card table-wrap">
        {error ? <div className="alert error">{error}</div> : null}
        {isLoading ? (
          <p>Loading products...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.stock}</td>
                  <td>{product.category?.name ?? categoryMap.get(product.categoryId) ?? '—'}</td>
                  <td>
                    <StatusBadge active={product.isActive} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <Button variant="secondary" onClick={() => openEditModal(product)}>
                        Edit
                      </Button>
                      <Button variant="danger" onClick={() => handleDelete(product.id)}>
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

      <Modal title={editingId ? 'Edit product' : 'Create product'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              className="input"
              placeholder="Product name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
            <input
              className="input"
              placeholder="Slug"
              value={form.slug}
              onChange={(event) => setForm((prev) => ({ ...prev, slug: event.target.value }))}
              required
            />
          </div>

          <div className="form-row">
            <input
              className="input"
              placeholder="SKU"
              value={form.sku}
              onChange={(event) => setForm((prev) => ({ ...prev, sku: event.target.value }))}
              required
            />
            <select
              className="select"
              value={form.categoryId}
              onChange={(event) => setForm((prev) => ({ ...prev, categoryId: event.target.value }))}
              required
            >
              <option value="">Select category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={form.price}
              onChange={(event) => setForm((prev) => ({ ...prev, price: Number(event.target.value) }))}
              placeholder="Price"
              required
            />
            <input
              className="input"
              type="number"
              min={0}
              step="0.01"
              value={form.compareAtPrice ?? ''}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  compareAtPrice: event.target.value ? Number(event.target.value) : undefined
                }))
              }
              placeholder="Compare at price"
            />
            <input
              className="input"
              type="number"
              min={0}
              value={form.stock ?? 0}
              onChange={(event) => setForm((prev) => ({ ...prev, stock: Number(event.target.value) }))}
              placeholder="Stock"
            />
          </div>

          <input
            className="input"
            placeholder="Short description"
            value={form.shortDescription ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, shortDescription: event.target.value }))}
          />

          <textarea
            className="textarea"
            placeholder="Description"
            value={form.description ?? ''}
            onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
          />

          <label>
            <input
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
              style={{ marginRight: 8 }}
            />
            Active product
          </label>

          <div className="card" style={{ padding: 12 }}>
            <div className="page-header">
              <h3 style={{ margin: 0 }}>Product images</h3>
              <Button type="button" variant="secondary" onClick={addImageRow}>
                Add image
              </Button>
            </div>

            <div className="form-grid">
              {form.images.map((image, index) => (
                <div key={`${index}-${image.url}`} className="form-row">
                  <input
                    className="input"
                    placeholder="Image URL"
                    value={image.url}
                    onChange={(event) => updateImage(index, { url: event.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Alt text"
                    value={image.alt ?? ''}
                    onChange={(event) => updateImage(index, { alt: event.target.value })}
                  />
                  <input
                    className="input"
                    type="number"
                    min={0}
                    value={image.sortOrder ?? index}
                    onChange={(event) => updateImage(index, { sortOrder: Number(event.target.value) })}
                    placeholder="Sort"
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={Boolean(image.isPrimary)}
                      onChange={(event) => updateImage(index, { isPrimary: event.target.checked })}
                      style={{ marginRight: 8 }}
                    />
                    Primary
                  </label>
                  <Button type="button" variant="danger" onClick={() => removeImageRow(index)}>
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="row-actions">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save product'}
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
