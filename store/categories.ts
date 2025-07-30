import { create } from "zustand";
import { CategoryState } from "@/types";
import { getExamCategories } from "@/lib/api/exam";

export const useCategoryStore = create<CategoryState>((set) => ({
    categories: [],
    setCategories: (categories) => set({ categories }),
    fetchCategories: async (page = 0, size = 100) => {
        try {
            const res = await getExamCategories({ page, size });
            set({ categories: res.data.result });
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    },
}))
