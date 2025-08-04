import { create } from "zustand";
import { CategoryState } from "@/types";
import { getExamCategories, createExamCategory, updateExamCategory, deleteExamCategory} from "@/lib/api/exam";

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    paginationMeta: null,
    
    setCategories: (categories) => set({ categories }),
    
    setPaginationMeta: (meta) => set({ paginationMeta: meta }),
    
    fetchCategories: async (page = 0, size = 10) => {
        try {
            const res = await getExamCategories({ page, size });
            set({ 
                categories: res.data.result,
                paginationMeta: res.data.meta 
            });
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },
    
    createCategory: async (data: { categoryName: string; description: string }) => {
        try {
            await createExamCategory(data);
            // Refresh categories after creation
            get().fetchCategories();
        } catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    },
    
    updateCategory: async (id: number, data: { categoryName: string; description: string }) => {
        try {
            await updateExamCategory(id, data);
            // Refresh categories after update
            get().fetchCategories();
        } catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    },
    
    deleteCategory: async (id: number) => {
        try {
            await deleteExamCategory(id);
            // Remove from local state immediately
            const categories = get().categories.filter(cat => cat.categoryId !== id);
            set({ categories });
        } catch (error) {
            console.error('Error deleting category:', error);
            // Refresh categories to revert optimistic update
            get().fetchCategories();
            throw error;
        }
    },
}));
