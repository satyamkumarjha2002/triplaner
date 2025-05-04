import { api } from './api';

export interface BudgetSummary {
  tripId: string;
  totalBudget: number;
  spentAmount: number;
  remainingAmount: number;
  categories: {
    [key: string]: {
      allocated: number;
      spent: number;
    }
  }
}

export interface CategoryBudget {
  tripId: string;
  category: string;
  amount: number;
}

export const budgetService = {
  // Get budget summary for a trip
  async getBudgetSummary(tripId: string): Promise<BudgetSummary> {
    return api.get<BudgetSummary>(`/trips/${tripId}/budget`);
  },

  // Set budget for a trip
  async setTripBudget(tripId: string, amount: number): Promise<void> {
    return api.put(`/trips/${tripId}/budget`, { amount });
  },

  // Allocate budget to a category
  async allocateCategoryBudget(data: CategoryBudget): Promise<void> {
    return api.post(`/trips/${data.tripId}/budget/categories`, { 
      category: data.category, 
      amount: data.amount 
    });
  },

  // Update category budget allocation
  async updateCategoryBudget(data: CategoryBudget): Promise<void> {
    return api.put(`/trips/${data.tripId}/budget/categories/${data.category}`, { 
      amount: data.amount 
    });
  },

  // Get budget breakdown (for visualizations)
  async getBudgetBreakdown(tripId: string): Promise<{category: string, allocated: number, spent: number}[]> {
    return api.get(`/trips/${tripId}/budget/breakdown`);
  }
}; 