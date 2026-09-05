"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { Entity, Product } from "./types";

type FormValues = {
  name: string;
  description: string;
  size: string;
  price: string;
  category: string;
  subCategory: string;
  purity: string;
  netWeight: string;
  filters: string[];
  displayImage: string | null;
  additionalImages: string[];
};

type ProductFormDialogProps = {
  open: boolean;
  product?: Product | null;
  pageMode?: boolean;
  categories: Entity[];
  subcategories: Entity[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    name: string;
    description: string;
    size: string;
    price: number;
    category: string;
    subCategory: string;
    purity: string;
    netWeight: number;
    filters: string[];
    displayImage: string;
    additionalImages: string[];
  }) => void;
};

const FILTTER_OPTIONS = ["Male", "Female", "Kids", "Devotional"];
const PURITY_OPTIONS = ["24K", "22K", "18K", "14K", "92.5 Sterling Silver", "Other"];

const emptyValues = (): FormValues => ({
  name: "",
  description: "",
  size: "",
  price: "",
  category: "",
  subCategory: "",
  purity: "",
  netWeight: "",
  filters: [],
  displayImage: null,
  additionalImages: [],
});

const fileToDataUrl = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result));
  reader.onerror = () => reject(new Error("Unable to read file"));
  reader.readAsDataURL(file);
});

export default function ProductFormDialog({
  open,
  product,
  pageMode = false,
  categories,
  subcategories,
  loading = false,
  onClose,
  onSubmit,
}: ProductFormDialogProps) {
  const [formValues, setFormValues] = useState<FormValues>(emptyValues());
  const [errors, setErrors] = useState<{ name?: string; category?: string; subCategory?: string; purity?: string; price?: string; netWeight?: string; displayImage?: string }>({});

  const filteredSubCategories = useMemo(() => subcategories, [subcategories]);

  useEffect(() => {
    if (!open) return;
    setErrors({});

    if (product) {
      const selectedCategory = typeof product.category === "string" ? product.category : product.category?._id ?? "";
      const selectedSubCategory = typeof product.subCategory === "string" ? product.subCategory : product.subCategory?._id ?? "";
      const filterValues = (product.filters ?? []).map(item => typeof item === "string" ? item : item?._id ?? item?.name ?? "").filter(Boolean);

      setFormValues({
        name: product.name ?? "",
        description: product.description ?? "",
        size: product.size ?? "",
        price: product.price ? String(product.price) : "",
        category: selectedCategory,
        subCategory: selectedSubCategory,
        purity: product.purity ?? "",
        netWeight: product.netWeight ? String(product.netWeight) : "",
        filters: filterValues,
        displayImage: product.displayImage ?? null,
        additionalImages: product.additionalImages ?? [],
      });
      return;
    }

    setFormValues(emptyValues());
  }, [open, product]);

  useEffect(() => {
    if (!formValues.category) {
      setFormValues(prev => ({ ...prev, subCategory: "" }));
    }
  }, [formValues.category]);

  const handleFieldChange = (field: keyof Omit<FormValues, "filters" | "additionalImages" | "displayImage">, value: string) => {
    setFormValues(prev => ({ ...prev, [field]: value, ...(field === "category" ? { subCategory: "" } : {}) }));
    if (field in errors) {
      setErrors(prevErrors => ({ ...prevErrors, [field]: undefined }));
    }
  };

  const handleCheckboxToggle = (value: string) => {
    setFormValues(prev => ({
      ...prev,
      filters: prev.filters.includes(value)
        ? prev.filters.filter(item => item !== value)
        : [...prev.filters, value],
    }));
  };

  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>, kind: "display" | "additional") => {
    const fileList = Array.from(event.target.files ?? []);
    if (!fileList.length) return;

    if (kind === "display") {
      const [file] = fileList;
      const dataUrl = await fileToDataUrl(file);
      setFormValues(prev => ({ ...prev, displayImage: dataUrl }));
      setErrors(prev => ({ ...prev, displayImage: undefined }));
    } else {
      const dataUrls = await Promise.all(fileList.map(file => fileToDataUrl(file)));
      setFormValues(prev => ({ ...prev, additionalImages: [...prev.additionalImages, ...dataUrls] }));
    }

    event.target.value = "";
  };

  const removeAdditionalImage = (index: number) => {
    setFormValues(prev => ({
      ...prev,
      additionalImages: prev.additionalImages.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const validate = () => {
    const nextErrors: { name?: string; category?: string; subCategory?: string; purity?: string; price?: string; netWeight?: string; displayImage?: string } = {};
    if (!formValues.name.trim()) nextErrors.name = "Product name is required.";
    if (!formValues.category) nextErrors.category = "Category is required.";
    if (!formValues.subCategory) nextErrors.subCategory = "Subcategory is required.";
    if (!formValues.purity) nextErrors.purity = "Purity is required.";
    if (!Number(formValues.price) || Number(formValues.price) <= 0) nextErrors.price = "Valid price is required.";
    if (!Number(formValues.netWeight) || Number(formValues.netWeight) <= 0) nextErrors.netWeight = "Valid net weight is required.";
    if (!formValues.displayImage) nextErrors.displayImage = "Display image is required.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submit = () => {
    if (!validate()) return;

    onSubmit({
      name: formValues.name.trim(),
      description: formValues.description.trim(),
      size: formValues.size.trim(),
      price: Number(formValues.price),
      category: formValues.category,
      subCategory: formValues.subCategory,
      purity: formValues.purity,
      netWeight: Number(formValues.netWeight),
      filters: formValues.filters,
      displayImage: formValues.displayImage ?? "",
      additionalImages: formValues.additionalImages,
    });
  };

  if (!open) return null;

  if (pageMode) {
    return (
      <div className="product-page-shell">
        <div className="welcome page-title">
          <div>
            <p className="eyebrow">STORE MANAGEMENT</p>
            <h1>Add new product</h1>
            <p className="muted">Create a new jewellery item with category, pricing, media and filters.</p>
          </div>
        </div>

        <section className="product-form-page card">
          <div className="form-grid">
            <label className="field">
              <span>Product Name</span>
              <input type="text" value={formValues.name} onChange={event => handleFieldChange("name", event.target.value)} disabled={loading} placeholder="Eternal Bloom Necklace" />
              {errors.name && <small className="form-error">{errors.name}</small>}
            </label>

            <label className="field">
              <span>Price</span>
              <input type="number" min="0" step="0.01" value={formValues.price} onChange={event => handleFieldChange("price", event.target.value)} disabled={loading} placeholder="142680" />
              {errors.price && <small className="form-error">{errors.price}</small>}
            </label>

            <label className="field">
              <span>Category</span>
              <select value={formValues.category} onChange={event => handleFieldChange("category", event.target.value)} disabled={loading || !categories.length}>
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category._id ?? category.name} value={category._id ?? ""}>{category.name}</option>
                ))}
              </select>
              {errors.category && <small className="form-error">{errors.category}</small>}
            </label>

            <label className="field">
              <span>Subcategory</span>
              <select value={formValues.subCategory} onChange={event => handleFieldChange("subCategory", event.target.value)} disabled={loading || !formValues.category || !filteredSubCategories.length}>
                <option value="">Select subcategory</option>
                {filteredSubCategories.map(subcategory => (
                  <option key={subcategory._id ?? subcategory.name} value={subcategory._id ?? ""}>{subcategory.name}</option>
                ))}
              </select>
              {errors.subCategory && <small className="form-error">{errors.subCategory}</small>}
            </label>

            <label className="field">
              <span>Purity</span>
              <select value={formValues.purity} onChange={event => handleFieldChange("purity", event.target.value)} disabled={loading}>
                <option value="">Select purity</option>
                {PURITY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.purity && <small className="form-error">{errors.purity}</small>}
            </label>

            <label className="field">
              <span>Net Weight (g)</span>
              <input type="number" min="0" step="0.01" value={formValues.netWeight} onChange={event => handleFieldChange("netWeight", event.target.value)} disabled={loading} placeholder="18.42" />
              {errors.netWeight && <small className="form-error">{errors.netWeight}</small>}
            </label>

            <label className="field">
              <span>Size</span>
              <input type="text" value={formValues.size} onChange={event => handleFieldChange("size", event.target.value)} disabled={loading} placeholder="Adjustable / 18 / Standard" />
            </label>

            <div className="field field-span-2">
              <span>Applicable Filters</span>
              <div className="checkbox-grid">
                {FILTTER_OPTIONS.map(option => (
                  <label key={option} className={`checkbox-pill ${formValues.filters.includes(option) ? "active" : ""}`}>
                    <input type="checkbox" checked={formValues.filters.includes(option)} onChange={() => handleCheckboxToggle(option)} disabled={loading} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea value={formValues.description} onChange={event => handleFieldChange("description", event.target.value)} rows={4} disabled={loading} placeholder="Fine gold necklace with a heirloom-inspired finish." />
            </label>

            <div className="field field-span-2">
              <span>Display Image</span>
              <div className="image-upload-box">
                <input id="product-display-image-page" type="file" accept="image/*" onChange={event => handleFileSelect(event, "display")} disabled={loading} />
                {formValues.displayImage ? (
                  <div className="image-preview-wrap">
                    <img src={formValues.displayImage} alt="Display preview" />
                    <button type="button" className="mini-remove" onClick={() => setFormValues(prev => ({ ...prev, displayImage: null }))}>Remove</button>
                  </div>
                ) : (
                  <label htmlFor="product-display-image-page" className="upload-label">Click to upload main image</label>
                )}
              </div>
              {errors.displayImage && <small className="form-error">{errors.displayImage}</small>}
            </div>

            <div className="field field-span-2">
              <span>Additional Images</span>
              <div className="image-upload-box multi-upload">
                <input id="product-additional-images-page" type="file" accept="image/*" multiple onChange={event => handleFileSelect(event, "additional")} disabled={loading} />
                <label htmlFor="product-additional-images-page" className="upload-label">Add more gallery images</label>
                {formValues.additionalImages.length > 0 && (
                  <div className="preview-grid">
                    {formValues.additionalImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="image-preview-wrap small">
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <button type="button" className="mini-remove" onClick={() => removeAdditionalImage(index)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-actions page-actions">
            <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="button" className="gold" onClick={submit} disabled={loading}>
              {loading ? "Saving…" : "Add product"}
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card product-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">PRODUCT</p>
            <h2>Add new product</h2>
          </div>
          <button className="close-button" type="button" onClick={onClose} aria-label="Close">Ã—</button>
        </div>

        <div className="modal-body product-modal-body">
          <div className="form-grid">
            <label className="field">
              <span>Product Name</span>
              <input type="text" value={formValues.name} onChange={event => handleFieldChange("name", event.target.value)} disabled={loading} placeholder="Eternal Bloom Necklace" />
              {errors.name && <small className="form-error">{errors.name}</small>}
            </label>

            <label className="field">
              <span>Price</span>
              <input type="number" min="0" step="0.01" value={formValues.price} onChange={event => handleFieldChange("price", event.target.value)} disabled={loading} placeholder="142680" />
              {errors.price && <small className="form-error">{errors.price}</small>}
            </label>

            <label className="field">
              <span>Category</span>
              <select value={formValues.category} onChange={event => handleFieldChange("category", event.target.value)} disabled={loading || !categories.length}>
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category._id ?? category.name} value={category._id ?? ""}>{category.name}</option>
                ))}
              </select>
              {errors.category && <small className="form-error">{errors.category}</small>}
            </label>

            <label className="field">
              <span>Subcategory</span>
              <select value={formValues.subCategory} onChange={event => handleFieldChange("subCategory", event.target.value)} disabled={loading || !formValues.category || !filteredSubCategories.length}>
                <option value="">Select subcategory</option>
                {filteredSubCategories.map(subcategory => (
                  <option key={subcategory._id ?? subcategory.name} value={subcategory._id ?? ""}>{subcategory.name}</option>
                ))}
              </select>
              {errors.subCategory && <small className="form-error">{errors.subCategory}</small>}
            </label>

            <label className="field">
              <span>Purity</span>
              <select value={formValues.purity} onChange={event => handleFieldChange("purity", event.target.value)} disabled={loading}>
                <option value="">Select purity</option>
                {PURITY_OPTIONS.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {errors.purity && <small className="form-error">{errors.purity}</small>}
            </label>

            <label className="field">
              <span>Net Weight (g)</span>
              <input type="number" min="0" step="0.01" value={formValues.netWeight} onChange={event => handleFieldChange("netWeight", event.target.value)} disabled={loading} placeholder="18.42" />
              {errors.netWeight && <small className="form-error">{errors.netWeight}</small>}
            </label>

            <label className="field">
              <span>Size</span>
              <input type="text" value={formValues.size} onChange={event => handleFieldChange("size", event.target.value)} disabled={loading} placeholder="Adjustable / 18 / Standard" />
            </label>

            <div className="field field-span-2">
              <span>Applicable Filters</span>
              <div className="checkbox-grid">
                {FILTTER_OPTIONS.map(option => (
                  <label key={option} className={`checkbox-pill ${formValues.filters.includes(option) ? "active" : ""}`}>
                    <input type="checkbox" checked={formValues.filters.includes(option)} onChange={() => handleCheckboxToggle(option)} disabled={loading} />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="field field-span-2">
              <span>Description</span>
              <textarea value={formValues.description} onChange={event => handleFieldChange("description", event.target.value)} rows={4} disabled={loading} placeholder="Fine gold necklace with a heirloom-inspired finish." />
            </label>

            <div className="field field-span-2">
              <span>Display Image</span>
              <div className="image-upload-box">
                <input id="product-display-image" type="file" accept="image/*" onChange={event => handleFileSelect(event, "display")} disabled={loading} />
                {formValues.displayImage ? (
                  <div className="image-preview-wrap">
                    <img src={formValues.displayImage} alt="Display preview" />
                    <button type="button" className="mini-remove" onClick={() => setFormValues(prev => ({ ...prev, displayImage: null }))}>Remove</button>
                  </div>
                ) : (
                  <label htmlFor="product-display-image" className="upload-label">Click to upload main image</label>
                )}
              </div>
              {errors.displayImage && <small className="form-error">{errors.displayImage}</small>}
            </div>

            <div className="field field-span-2">
              <span>Additional Images</span>
              <div className="image-upload-box multi-upload">
                <input id="product-additional-images" type="file" accept="image/*" multiple onChange={event => handleFileSelect(event, "additional")} disabled={loading} />
                <label htmlFor="product-additional-images" className="upload-label">Add more gallery images</label>
                {formValues.additionalImages.length > 0 && (
                  <div className="preview-grid">
                    {formValues.additionalImages.map((image, index) => (
                      <div key={`${image}-${index}`} className="image-preview-wrap small">
                        <img src={image} alt={`Preview ${index + 1}`} />
                        <button type="button" className="mini-remove" onClick={() => removeAdditionalImage(index)}>Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="button" className="gold" onClick={submit} disabled={loading}>
            {loading ? "Saving…" : "Add product"}
          </button>
        </div>
      </div>
    </div>
  );
}


