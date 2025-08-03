export type Category = {
  categoryId: number
  categoryName: string
  description: string,
  examCount: number
}

export type CategoryState = {
  categories: Category[]
  paginationMeta: PaginationMeta | null
  setCategories: (categories: Category[]) => void
  setPaginationMeta: (meta: PaginationMeta) => void;
  fetchCategories: (page?: number, size?: number) => Promise<void>
  createCategory: (data: { categoryName: string; description: string }) => Promise<void>
  updateCategory: (id: number, data: { categoryName: string; description: string }) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
}