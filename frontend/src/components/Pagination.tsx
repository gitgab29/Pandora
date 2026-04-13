import { ChevronLeft, ChevronRight } from 'lucide-react';
import { colors } from '../theme';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }

  return [1, '...', current - 1, current, current + 1, '...', total];
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '32px',
    borderRadius: '6px',
    border: '1px solid rgba(70, 98, 145, 0.2)',
    backgroundColor: '#ffffff',
    fontFamily: "'Archivo', sans-serif",
    fontSize: '13px',
    color: colors.textPrimary,
    cursor: 'pointer',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        padding: '16px 0 4px',
      }}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          ...btnBase,
          padding: '0 12px',
          gap: '4px',
          opacity: currentPage === 1 ? 0.45 : 1,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft size={14} />
        Previous
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...' ? (
          <span
            key={`ellipsis-${i}`}
            style={{
              width: '32px',
              textAlign: 'center',
              fontFamily: "'Archivo', sans-serif",
              fontSize: '13px',
              color: colors.blueGrayMd,
            }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            style={{
              ...btnBase,
              width: '32px',
              backgroundColor: currentPage === page ? colors.primary : '#ffffff',
              color: currentPage === page ? '#ffffff' : colors.textPrimary,
              fontWeight: currentPage === page ? 600 : 400,
              border: currentPage === page ? 'none' : '1px solid rgba(70, 98, 145, 0.2)',
            }}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          ...btnBase,
          padding: '0 12px',
          gap: '4px',
          opacity: currentPage === totalPages ? 0.45 : 1,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        Next
        <ChevronRight size={14} />
      </button>
    </div>
  );
}
