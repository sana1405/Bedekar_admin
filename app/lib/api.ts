import type { Entity, Product } from "../screens/types";

export type { Entity, Product };

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";
export type AdminAuthUser = { _id: string; name: string; mobile: string; role: "admin"; token: string };
export type RegisteredUser = { _id: string; name: string; mobile: string; email?: string; address?: string; createdAt?: string };
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "guz4qfnl";
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "jewellry";
const uploadFolder = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_FOLDER ?? "jewellryProducts";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("aurelia_admin_token") : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!response.ok) {
    const result = await response.json().catch(() => ({}));
    throw new Error(result.error ?? result.message ?? `Request failed (${response.status})`);
  }
  return response.status === 204 ? ({} as T) : response.json();
}

export function loginAdmin(mobile: string, password: string) {
  return api<AdminAuthUser>("/auth/admin/login", { method: "POST", body: JSON.stringify({ mobile, password }) });
}

export function getRegisteredUsers() {
  return api<RegisteredUser[]>("/auth/users");
}

export async function uploadProductImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);
  form.append("folder", uploadFolder);
  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: form });
  const result = await response.json();
  if (!response.ok || !result.secure_url) throw new Error(result.error?.message ?? "Image upload failed");
  return result.secure_url as string;
}

export type CategoryPayload = { name: string; description?: string; slug?: string };
export type SubCategoryPayload = { name: string; description?: string; image: string };
export type ProductPayload = {
  name: string;
  description?: string;
  size?: string;
  price: number;
  purity: string;
  netWeight: number;
  category: string;
  subCategory: string;
  filters?: string[];
  displayImage?: string;
  additionalImages?: string[];
};

export const getCategories = async (): Promise<Entity[]> => {
  const response = await api<unknown>("/categories");
  return unwrap<Entity>(response);
};

export const createCategory = async (payload: CategoryPayload): Promise<Entity> => {
  return api<Entity>("/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCategory = async (id: string, payload: CategoryPayload): Promise<Entity> => {
  return api<Entity>(`/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteCategory = async (id: string): Promise<{ message?: string }> => {
  return api<{ message?: string }>(`/categories/${id}`, { method: "DELETE" });
};

export const getSubCategories = async (): Promise<Entity[]> => {
  const response = await api<unknown>("/subcategories");
  return unwrap<Entity>(response);
};

export const createSubCategory = async (payload: SubCategoryPayload): Promise<Entity> => {
  return api<Entity>("/subcategories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateSubCategory = async (id: string, payload: SubCategoryPayload): Promise<Entity> => {
  return api<Entity>(`/subcategories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteSubCategory = async (id: string): Promise<{ message?: string }> => {
  return api<{ message?: string }>(`/subcategories/${id}`, { method: "DELETE" });
};

export const getProducts = async (): Promise<Product[]> => {
  const response = await api<unknown>("/products");
  return unwrap<Product>(response);
};

export const createProduct = async (payload: ProductPayload): Promise<Product> => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description ?? "");
  formData.append("size", payload.size ?? "");
  formData.append("price", String(payload.price));
  formData.append("purity", payload.purity);
  formData.append("netWeight", String(payload.netWeight));
  formData.append("category", payload.category);
  formData.append("subCategory", payload.subCategory);
  formData.append("filters", JSON.stringify(payload.filters ?? []));
  formData.append("displayImage", payload.displayImage ?? "");
  formData.append("additionalImages", JSON.stringify(payload.additionalImages ?? []));

  return api<Product>("/products", {
    method: "POST",
    body: formData,
  });
};

export const updateProduct = async (id: string, payload: ProductPayload): Promise<Product> => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description ?? "");
  formData.append("size", payload.size ?? "");
  formData.append("price", String(payload.price));
  formData.append("purity", payload.purity);
  formData.append("netWeight", String(payload.netWeight));
  formData.append("category", payload.category);
  formData.append("subCategory", payload.subCategory);
  formData.append("filters", JSON.stringify(payload.filters ?? []));
  formData.append("displayImage", payload.displayImage ?? "");
  formData.append("additionalImages", JSON.stringify(payload.additionalImages ?? []));

  return api<Product>(`/products/${id}`, {
    method: "PUT",
    body: formData,
  });
};

export const deleteProduct = async (id: string): Promise<{ message?: string }> => {
  return api<{ message?: string }>(`/products/${id}`, { method: "DELETE" });
};

export const unwrap = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as { data?: T[] }).data)) return (value as { data: T[] }).data;
  return [];
};
