"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { uploadProductImage } from "../lib/api";
import type { Entity } from "./types";

type FormValues = { name: string; description: string; image: string };
type Props = { open: boolean; subCategory?: Entity | null; loading?: boolean; onClose: () => void; onSubmit: (payload: FormValues) => void };
const emptyValues = (): FormValues => ({ name: "", description: "", image: "" });

export default function SubCategoryFormDialog({ open, subCategory, loading = false, onClose, onSubmit }: Props) {
  const [formValues, setFormValues] = useState<FormValues>(emptyValues());
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  useEffect(() => { if (open) { setError(""); setFormValues({ name: subCategory?.name ?? "", description: subCategory?.description ?? "", image: subCategory?.image ?? "" }); } }, [open, subCategory]);
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; setUploading(true); setError(""); try { const image = await uploadProductImage(file); setFormValues(prev => ({ ...prev, image })); } catch (uploadError) { setError(uploadError instanceof Error ? uploadError.message : "Unable to upload image."); } finally { setUploading(false); event.target.value = ""; } };
  const submit = () => { if (!formValues.name.trim()) { setError("Subcategory name is required."); return; } if (!formValues.image) { setError("Subcategory image is required."); return; } onSubmit({ name: formValues.name.trim(), description: formValues.description.trim(), image: formValues.image }); };
  if (!open) return null;
  return <div className="modal-backdrop" onClick={onClose}><div className="modal-card" onClick={event => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">SUBCATEGORY</p><h2>{subCategory ? "Edit Jewellery Type" : "Add New Jewellery Type"}</h2></div><button className="close-button" type="button" onClick={onClose} aria-label="Close">×</button></div><div className="modal-body"><label className="field"><span>Jewellery Type</span><input value={formValues.name} onChange={event => setFormValues(prev => ({ ...prev, name: event.target.value }))} disabled={loading || uploading} placeholder="Ear ring, Mangalsutra, Bracelet, etc." /></label><label className="field"><span>Description</span><textarea value={formValues.description} onChange={event => setFormValues(prev => ({ ...prev, description: event.target.value }))} rows={4} disabled={loading || uploading} placeholder="Describe this jewellery type" /></label><div className="field"><span>Subcategory Image</span><div className="image-upload-box"><input id="subcategory-image" type="file" accept="image/*" onChange={uploadImage} disabled={loading || uploading} />{formValues.image ? <div className="image-preview-wrap"><img src={formValues.image} alt="Subcategory preview" /><button type="button" className="mini-remove" onClick={() => setFormValues(prev => ({ ...prev, image: "" }))} disabled={loading || uploading}>Remove</button></div> : <label className="upload-label" htmlFor="subcategory-image">{uploading ? "Uploading image..." : "Click to upload image"}</label>}</div></div>{error && <small className="form-error">{error}</small>}</div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose} disabled={loading || uploading}>Cancel</button><button type="button" className="gold" onClick={submit} disabled={loading || uploading}>{loading ? "Saving..." : subCategory ? "Update" : "Add"}</button></div></div></div>;
}


