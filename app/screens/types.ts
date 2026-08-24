export type Entity = { _id?: string; id?: string; name?: string; description?: string; category?: string | { _id?: string; name?: string }; categoryName?: string; slug?: string; image?: string };
export type Product = { _id?: string; id?: string; name: string; price?: number; category?: Entity | string; subCategory?: Entity | string; purity?: string; netWeight?: number; size?: string; description?: string; filters?: (string | Entity)[]; displayImage?: string; additionalImages?: string[] };
export type Rates = { gold24K?: number; silverPerGram?: number; date?: string | Date; createdAt?: string | Date };

export const money = (value?: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value ?? 0);
export const idOf = (item?: { _id?: string; id?: string } | string) => typeof item === "string" ? item : item?._id ?? item?.id ?? "";
export const labelOf = (item?: Entity | string) => typeof item === "string" ? item : item?.name ?? "Unassigned";
export const slugify = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

