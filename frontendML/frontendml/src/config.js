// API Configuration
// Update the API_BASE_URL if your backend runs on a different port or host

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    experiments: `${API_BASE_URL}/api/experiments`,
    status: `${API_BASE_URL}/api/status`,
};

// Helper function to make API calls
export async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`Fetch failed for ${endpoint}:`, error);
        throw error;
    }
}
