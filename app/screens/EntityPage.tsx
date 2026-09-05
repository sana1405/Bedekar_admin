"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Entity } from "./types";
import { idOf, labelOf } from "./types";
import Pagination from "../components/Pagination";

type Props = { title: string; subtitle: string; items: Entity[]; related?: Entity[]; categoryMode?: boolean; onAdd?: (category?: Entity | null) => void; onEdit?: (item: Entity) => void; onDelete?: (item: Entity) => void };

export default function EntityPage({ title, subtitle, items, related, categoryMode = false, onAdd, onEdit, onDelete }: Props) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const actionLabel = useMemo(() => `Add ${title.slice(0, -1).toLowerCase()}`, [title]);
  const filteredItems = useMemo(() => {
    const value = search.trim().toLowerCase();
    return items.filter(item => !value || [item.name, item.description].some(itemValue => (itemValue ?? "").toLowerCase().includes(value)));
  }, [items, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  return (
    <>
      <div className="welcome page-title">
        <div>
          <p className="eyebrow">STORE MANAGEMENT</p>
          <h1>{title}</h1>
          <p className="muted">{subtitle}</p>
        </div>
        <button className="gold" onClick={() => onAdd?.(null)}>{actionLabel}</button>
      </div>

      <div className="entity-toolbar card">
        <div className="toolbar-field toolbar-search">
          <label htmlFor="entity-search">Search</label>
          <input id="entity-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={categoryMode ? "Search subcategories" : "Search categories"} />
        </div>
        {search && (
          <button className="secondary-button compact" type="button" onClick={() => setSearch("")}>
            Reset
          </button>
        )}
      </div>

      <section className="entity-grid">
        {paginatedItems.map(item => (
          <article className="card entity" key={idOf(item)}>
            {item.image ? (
              <img className="entity-image" src={item.image} alt="" />
            ) : (
              <div className="entity-symbol">{(item.name ?? "•").charAt(0)}</div>
            )}
            <div>
              <h3>{item.name}</h3>
              <p>{item.description || "Jewellery collection"}</p>
              {!categoryMode && <small>{related?.filter(x => idOf(x.category) === idOf(item)).length ?? 0} subcategories</small>}
            </div>
            <div className="entity-actions">
              <button onClick={() => onEdit?.(item)}>Edit</button>
              <button onClick={() => onDelete?.(item)}>×</button>
            </div>
          </article>
        ))}
        {!filteredItems.length && <Empty label={`No ${title.toLowerCase()} available.`} />}
      </section>

      <Pagination
        totalItems={filteredItems.length}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[6, 12, 24, 48]}
        itemLabel={title.toLowerCase()}
      />
    </>
  );
}

function PageTop({ title, text, action, onAction, children }: { title: string; text: string; action?: string; onAction?: () => void; children: ReactNode }) { return <><div className="welcome page-title"><div><p className="eyebrow">STORE MANAGEMENT</p><h1>{title}</h1><p className="muted">{text}</p></div>{action && <button className="gold" onClick={onAction}>{action}</button>}</div>{children}</>; }
function Empty({ label }: { label: string }) { return <div className="empty">◇<p>{label}</p></div>; }
