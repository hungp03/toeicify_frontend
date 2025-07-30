export type Category = {
  categoryId: number
  categoryName: string
  description: string
}

export type CategoryState = {
  categories: Category[]
  setCategories: (categories: Category[]) => void
  fetchCategories: (page?: number, size?: number) => Promise<void>
}