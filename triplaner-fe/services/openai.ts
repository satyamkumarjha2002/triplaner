import { api } from './api';

export interface TripPlanResponse {
  success: boolean;
  data: {
    role: string;
    content: string;
  };
}

export interface TripJsonResponse {
  success: boolean;
  data: {
    role: string;
    content: string;
  };
}

export const openaiService = {
  // Plan a trip using OpenAI
  async planTrip(prompt: string): Promise<TripPlanResponse> {
    return api.post<TripPlanResponse>('/openai/plan-trip', { prompt });
  },

  // Generate JSON for a trip plan
  async generateTripJson(conversation: string): Promise<TripJsonResponse> {
    return api.post<TripJsonResponse>('/openai/generate-trip-json', { conversation });
  }
}; 