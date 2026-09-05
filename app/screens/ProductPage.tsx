"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Pagination from "../components/Pagination";
import AdminIcon from "../components/AdminIcon";

type Entity = { _id?: string; id?: string; name?: string; category?: string | { _id?: string; name?: string } };
type Product = { _id?: string; id?: string; name: string; price?: number; category?: Entity | string; subCategory?: Entity | string; purity?: string; netWeight?: number; displayImage?: string; createdAt?: string | Date };
const money = (value?: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value ?? 0);
const idOf = (item?: { _id?: string; id?: string } | string) => typeof item === "string" ? item : item?._id ?? item?.id ?? "";
const labelOf = (item?: Entity | string) => typeof item === "string" ? item : item?.name ?? "Unassigned";
const PRICE_RANGES = [{ value: "0-5k", label: "Rs 0 - Rs 5k", min: 0, max: 5000 }, { value: "5k-10k", label: "Rs 5k - Rs 10k", min: 5000, max: 10000 }, { value: "10k-25k", label: "Rs 10k - Rs 25k", min: 10000, max: 25000 }, { value: "25k-50k", label: "Rs 25k - Rs 50k", min: 25000, max: 50000 }, { value: "50k-100k", label: "Rs 50k - Rs 100k", min: 50000, max: 100000 }, { value: "100k+", label: "Rs 100k+", min: 100000, max: Infinity }];

type Props = { products: Product[]; categories?: Entity[]; subcategories?: Entity[]; search: string; setSearch: (value: string) => void; categoryFilter: string; setCategoryFilter: (value: string) => void; subcategoryFilter: string; setSubcategoryFilter: (value: string) => void; dateSort: string; setDateSort: (value: string) => void; priceRange: string; setPriceRange: (value: string) => void; purityFilter: string; setPurityFilter: (value: string) => void; onAdd: () => void; onView: (product: Product) => void; onEdit: (product: Product) => void; onDelete: (product: Product) => void };

export default function ProductPage({ products, categories = [], subcategories = [], search, setSearch, categoryFilter, setCategoryFilter, subcategoryFilter, setSubcategoryFilter, dateSort, setDateSort, priceRange, setPriceRange, purityFilter, setPurityFilter, onAdd, onView, onEdit, onDelete }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const uniquePurities = useMemo(() => Array.from(new Set(products.map(product => product.purity).filter((purity): purity is string => Boolean(purity)))).sort(), [products]);
  
  const displayedProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const range = PRICE_RANGES.find(item => item.value === priceRange);
    const min = range?.min ?? 0;
    const max = range?.max ?? Infinity;
    const result = products.filter(product => (!query || [product.name, labelOf(product.category), labelOf(product.subCategory)].some(value => value.toLowerCase().includes(query))) && (!categoryFilter || idOf(product.category) === categoryFilter) && (!subcategoryFilter || idOf(product.subCategory) === subcategoryFilter) && (product.price ?? 0) >= min && (product.price ?? 0) <= max && (!purityFilter || product.purity === purityFilter));
    return dateSort === "newest" ? result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()) : dateSort === "oldest" ? result.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()) : result;
  }, [products, search, categoryFilter, subcategoryFilter, priceRange, purityFilter, dateSort]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, subcategoryFilter, priceRange, purityFilter, dateSort]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return displayedProducts.slice(start, start + pageSize);
  }, [displayedProducts, currentPage, pageSize]);

  const activeFilterCount = [
    Boolean(categoryFilter),
    Boolean(subcategoryFilter),
    Boolean(priceRange),
    Boolean(purityFilter),
    Boolean(dateSort),
  ].filter(Boolean).length;

  const hasActiveFilters = Boolean(search || activeFilterCount > 0);

  return (
    <PageTop title="Product catalogue" text="Create, edit and curate every piece in your storefront." action="Add product" onAction={onAdd}>
      <div className={`product-filters card ${showMobileFilters ? "mobile-expanded" : ""}`}>
        <div className="filter-main-row">
          <div className="filter-search-box">
            <svg className="filter-search-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="product-search"
              type="search"
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Search products, category..."
            />
            {search && (
              <button
                type="button"
                className="filter-clear-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <button
            type="button"
            className={`mobile-filter-toggle-btn ${activeFilterCount > 0 ? "active" : ""}`}
            onClick={() => setShowMobileFilters(prev => !prev)}
            aria-expanded={showMobileFilters}
            aria-label="Toggle filters"
          >
            <AdminIcon name="filter" size={14} />
            <span>Filters</span>
            {activeFilterCount > 0 && <span className="mobile-filter-badge">{activeFilterCount}</span>}
          </button>
        </div>

        <div className={`filter-pills-wrap ${showMobileFilters ? "open" : ""}`}>
          <div className="mobile-filter-header">
            <div className="mobile-filter-title">
              <span>Filter products</span>
              {activeFilterCount > 0 && <small>{activeFilterCount} active</small>}
            </div>
            <button
              type="button"
              className="mobile-filter-close-btn"
              onClick={() => setShowMobileFilters(false)}
              aria-label="Close filters"
            >
              ×
            </button>
          </div>

          <div className="filter-pills-grid">
            <div className={`filter-select-pill ${categoryFilter ? "active" : ""}`}>
              <label htmlFor="product-category">Category</label>
              <select id="product-category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)}>
                <option value="">All</option>
                {categories.map(category => <option key={idOf(category)} value={idOf(category)}>{labelOf(category)}</option>)}
              </select>
            </div>

            {subcategories.length > 0 && (
              <div className={`filter-select-pill ${subcategoryFilter ? "active" : ""}`}>
                <label htmlFor="product-subcategory">Subcategory</label>
                <select id="product-subcategory" value={subcategoryFilter} onChange={event => setSubcategoryFilter(event.target.value)}>
                  <option value="">All</option>
                  {subcategories.map(subcategory => <option key={idOf(subcategory)} value={idOf(subcategory)}>{labelOf(subcategory)}</option>)}
                </select>
              </div>
            )}

            <div className={`filter-select-pill ${priceRange ? "active" : ""}`}>
              <label htmlFor="product-price">Price</label>
              <select id="product-price" value={priceRange} onChange={event => setPriceRange(event.target.value)}>
                <option value="">All</option>
                {PRICE_RANGES.map(range => <option key={range.value} value={range.value}>{range.label}</option>)}
              </select>
            </div>

            {uniquePurities.length > 0 && (
              <div className={`filter-select-pill ${purityFilter ? "active" : ""}`}>
                <label htmlFor="product-purity">Purity</label>
                <select id="product-purity" value={purityFilter} onChange={event => setPurityFilter(event.target.value)}>
                  <option value="">All</option>
                  {uniquePurities.map(purity => <option key={purity} value={purity}>{purity}</option>)}
                </select>
              </div>
            )}

            <div className={`filter-select-pill ${dateSort ? "active" : ""}`}>
              <label htmlFor="product-date">Sort</label>
              <select id="product-date" value={dateSort} onChange={event => setDateSort(event.target.value)}>
                <option value="">Default</option>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="filter-reset-btn"
                type="button"
                onClick={() => {
                  setSearch("");
                  setCategoryFilter("");
                  setSubcategoryFilter("");
                  setPriceRange("");
                  setPurityFilter("");
                  setDateSort("");
                }}
                title="Clear all active filters"
              >
                <span>×</span> Reset
              </button>
            )}
          </div>

          <div className="mobile-filter-footer">
            <button
              type="button"
              className="gold mobile-filter-apply-btn"
              onClick={() => setShowMobileFilters(false)}
            >
              Show results
            </button>
          </div>
        </div>
      </div>

      <div className="table-top-bar">
        <span className="table-count-tag">
          <b>{displayedProducts.length}</b> {displayedProducts.length === 1 ? "product" : "products"} found
        </span>
      </div>

      <section className="card data-table products-table">
        <div className="thead">
          <span>PRODUCT</span>
          <span>CATEGORY</span>
          <span>PRICE</span>
          <span>DETAILS</span>
          <span />
        </div>
        {paginatedProducts.length ? paginatedProducts.map(product => (
          <div className="trow" key={idOf(product)}>
            <ProductLine product={product} />
            <span className="tag">{labelOf(product.category)}</span>
            <b>{money(product.price)}</b>
            <span>{product.purity || "-"} · {product.netWeight || "-"}g</span>
            <span className="actions">
              <button className="icon-button" title="View product" onClick={() => onView(product)}>View</button>
              <button onClick={() => onEdit(product)}>Edit</button>
              <button onClick={() => onDelete(product)}>Delete</button>
            </span>
          </div>
        )) : <Empty label="No products match your search." />}
      </section>

      <Pagination
        totalItems={displayedProducts.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        itemLabel="products"
      />
    </PageTop>
  );
}
function ProductLine({ product }: { product: Product }) { return <div className="product-name"><div className="thumbnail">{product.displayImage ? <img src={product.displayImage} alt="" /> : <span>✦</span>}</div><span><b>{product.name}</b><small>{labelOf(product.category)} · {labelOf(product.subCategory)}</small></span></div>; }
function PageTop({ title, text, action, onAction, children }: { title: string; text: string; action?: string; onAction?: () => void; children: ReactNode }) { return <><div className="welcome page-title"><div><p className="eyebrow">STORE MANAGEMENT</p><h1>{title}</h1><p className="muted">{text}</p></div>{action && <button className="gold" onClick={onAction}>{action}</button>}</div>{children}</>; }
function Empty({ label }: { label: string }) { return <div className="empty">◇<p>{label}</p></div>; }
