"use client";

import type { Product } from "./types";
import { idOf, labelOf, money } from "./types";

export default function ProductDetailPage({ product, onBack }: { product: Product; onBack: () => void }) {
  if (!product) return null;

  const filterNames = (product.filters ?? [])
    .map(item => (typeof item === "string" ? item : item?.name ?? ""))
    .filter(Boolean);

  const gallery = product.additionalImages ?? [];
  const categoryName = labelOf(product.category);
  const subCategoryName = labelOf(product.subCategory);

  return (
    <div className="product-detail-shell">
      <div className="welcome page-title">
        <div>
          <p className="eyebrow">PRODUCT DETAIL</p>
          <h1>{product.name}</h1>
          <p className="muted">Complete product information and media preview.</p>
        </div>
        <button className="secondary-button" type="button" onClick={onBack}>Back to catalogue</button>
      </div>

      <section className="product-detail-card card">
        <div className="product-detail-hero">
          <div className="product-detail-image-wrap">
            {product.displayImage ? (
              <img src={product.displayImage} alt={product.name} className="detail-main-image" />
            ) : (
              <div className="detail-placeholder">✦</div>
            )}
          </div>

          <div className="product-detail-summary">
            <div className="summary-price-row">
              <span className="detail-tag">{categoryName}</span>
              <span className="detail-tag muted-tag">{subCategoryName}</span>
            </div>
            <h2>{product.name}</h2>
            <p className="summary-price">{money(product.price)}</p>
            <div className="summary-meta">
              <div>
                <label>Purity</label>
                <strong>{product.purity || "—"}</strong>
              </div>
              <div>
                <label>Net weight</label>
                <strong>{product.netWeight ? `${product.netWeight}g` : "—"}</strong>
              </div>
              <div>
                <label>Size</label>
                <strong>{product.size || "—"}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-panel">
            <h3>Overview</h3>
            <div className="info-list">
              <div><span>Product ID</span><b>{idOf(product) || "—"}</b></div>
              <div><span>Category</span><b>{categoryName}</b></div>
              <div><span>Subcategory</span><b>{subCategoryName}</b></div>
              <div><span>Price</span><b>{money(product.price)}</b></div>
              <div><span>Purity</span><b>{product.purity || "—"}</b></div>
              <div><span>Net weight</span><b>{product.netWeight ? `${product.netWeight}g` : "—"}</b></div>
              <div><span>Size</span><b>{product.size || "—"}</b></div>
            </div>
          </div>

          <div className="detail-panel">
            <h3>Description</h3>
            <p className="description-copy">{product.description || "No description added for this product yet."}</p>

            <div className="chip-wrap">
              {filterNames.length ? (
                filterNames.map((filter, index) => (
                  <span key={`${filter}-${index}`} className="detail-chip">{filter}</span>
                ))
              ) : (
                <span className="detail-chip muted-chip">No filters assigned</span>
              )}
            </div>
          </div>
        </div>

        <div className="detail-panel gallery-panel">
          <h3>Gallery</h3>
          {gallery.length ? (
            <div className="gallery-grid">
              {[product.displayImage, ...gallery.filter(image => image !== product.displayImage)].filter(Boolean).map((image, index) => (
                <div key={`${image}-${index}`} className="gallery-item">
                  <img src={image} alt={`${product.name} gallery ${index + 1}`} />
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-copy">No additional images available.</p>
          )}
        </div>
      </section>
    </div>
  );
}
