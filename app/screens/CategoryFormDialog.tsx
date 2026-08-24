"use client";

import { useEffect, useState } from "react";
import { slugify } from "./types";
import type { Entity } from "./types";

type FormValues = { name: string; description: string; slug: string };

type CategoryFormDialogProps = {
  open: boolean;
  category?: Entity | null;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; description: string; slug: string }) => void;
};

const emptyValues = (): FormValues => ({ name: "", description: "", slug: "" });

export default function CategoryFormDialog({ open, category, loading = false, onClose, onSubmit }: CategoryFormDialogProps) {
  const [formValues, setFormValues] = useState<FormValues>(emptyValues());
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setFormValues(category ? {
      name: category.name ?? "",
      description: category.description ?? "",
      slug: category.slug ?? slugify(category.name ?? ""),
    } : emptyValues());
  }, [category, open]);

  useEffect(() => {
    if (!open) return;
    setFormValues(prev => ({ ...prev, slug: slugify(prev.name) }));
  }, [formValues.name, open]);

  const handleChange = (field: keyof FormValues, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value }));
    if (field in errors || errors.name) {
      setErrors(prev => ({ ...prev, [field]: undefined, name: undefined }));
    }
  };

  const validate = () => {
    const nextErrors: { name?: string } = {};
    if (!formValues.name.trim()) nextErrors.name = "Category name is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSubmit({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      slug: formValues.slug.trim() || slugify(formValues.name),
    });
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={event => event.stopPropagation()}>
        <div className="modal-header">
          <div>
            <p className="eyebrow">CATEGORY</p>
            <h2>{category ? "Edit category" : "Add new category"}</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          <label className="field">
            <span>Category Name</span>
            <input
              type="text"
              value={formValues.name}
              onChange={event => handleChange("name", event.target.value)}
              disabled={loading}
              placeholder="Gold"
            />
            {errors.name && <small className="form-error">{errors.name}</small>}
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              value={formValues.description}
              onChange={event => handleChange("description", event.target.value)}
              rows={4}
              disabled={loading}
              placeholder="Fine gold jewellery"
            />
          </label>

          <label className="field">
            <span>Slug</span>
            <input
              type="text"
              value={formValues.slug}
              onChange={event => handleChange("slug", event.target.value)}
              disabled={loading}
              placeholder="gold"
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="gold" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : category ? "Update" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}
