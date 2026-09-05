"use client";

type PaginationProps = {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
};

function getPageNumbers(currentPage: number, totalPages: number): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemLabel = "items",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, currentPage), totalPages);

  if (totalItems <= 0) return null;

  const startIndex = (safePage - 1) * pageSize + 1;
  const endIndex = Math.min(safePage * pageSize, totalItems);
  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <nav className="pagination-dock card" aria-label="Table pagination">
      <div className="pagination-info">
        Showing <b>{startIndex}</b>–<b>{endIndex}</b> of <b>{totalItems}</b> {itemLabel}
      </div>

      <div className="pagination-controls">
        <div className="pagination-pagesize">
          <label htmlFor="page-size-select">Per page:</label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={(e) => {
              onPageSizeChange(Number(e.target.value));
              onPageChange(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div className="pagination-buttons">
          <button
            type="button"
            className="pagination-btn nav-btn"
            disabled={safePage <= 1}
            onClick={() => onPageChange(safePage - 1)}
            aria-label="Previous page"
          >
            ‹ Prev
          </button>

          {pageNumbers.map((page, idx) =>
            typeof page === "number" ? (
              <button
                key={page}
                type="button"
                className={`pagination-btn ${safePage === page ? "active" : ""}`}
                onClick={() => onPageChange(page)}
                aria-current={safePage === page ? "page" : undefined}
              >
                {page}
              </button>
            ) : (
              <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                …
              </span>
            )
          )}

          <button
            type="button"
            className="pagination-btn nav-btn"
            disabled={safePage >= totalPages}
            onClick={() => onPageChange(safePage + 1)}
            aria-label="Next page"
          >
            Next ›
          </button>
        </div>
      </div>
    </nav>
  );
}
