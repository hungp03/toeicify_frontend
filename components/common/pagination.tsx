import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; 
};

const DOTS = '...';

const range = (start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, i) => start + i);

function getPaginationRange(totalPages: number, currentPage: number, siblingCount: number): (number | typeof DOTS)[] {
  const totalPageNumbers = siblingCount * 2 + 5;
// => 2 sibling + current page + first/last + 2 dots

  if (totalPages <= totalPageNumbers) {
    return range(0, totalPages - 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - 2);

  const shouldShowLeftDots = leftSiblingIndex > 1;
  const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

  const firstPageIndex = 0;
  const lastPageIndex = totalPages - 1;

  const pagination: (number | typeof DOTS)[] = [];

  pagination.push(firstPageIndex);

  if (shouldShowLeftDots) {
    pagination.push(DOTS);
  }

  const middleRange = range(leftSiblingIndex, rightSiblingIndex);
  pagination.push(...middleRange);

  if (shouldShowRightDots) {
    pagination.push(DOTS);
  }

  pagination.push(lastPageIndex);

  return pagination;
}

export const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
  siblingCount = 1,
}: Props) => {
  const paginationRange = getPaginationRange(totalPages, currentPage, siblingCount);

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        Trước
      </Button>

      {paginationRange.map((page, index) => {
        if (page === DOTS) {
          return (
            <span key={index} className="px-2 text-gray-500">
              ...
            </span>
          );
        }

        return (
          <Button
            key={page}
            variant={page === currentPage ? 'default' : 'outline'}
            size="sm"
            className={cn('w-9 h-9 p-0', page === currentPage && 'bg-blue-600 text-white')}
            onClick={() => onPageChange(Number(page))}
          >
            {Number(page) + 1}
          </Button>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage + 1 === totalPages}
      >
        Tiếp
      </Button>
    </div>
  );
};
