const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

/**
 * Fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
}

export const api = {
    /**
     * Health check
     */
    checkHealth: async () => {
        return fetchAPI('/health');
    },

    /**
     * Fetch aggregated news from all sources
     * @param {Object} params - Query parameters
     */
    getNews: async (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('query', params.query);
        if (params.country) queryParams.append('country', params.country);
        if (params.state) queryParams.append('state', params.state);
        if (params.commodity) queryParams.append('commodity', params.commodity);
        if (params.ticker) queryParams.append('ticker', params.ticker);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.deduplicate !== undefined) queryParams.append('deduplicate', params.deduplicate);

        const query = queryParams.toString();
        return fetchAPI(`/news${query ? '?' + query : ''}`);
    },

    /**
     * Fetch news for a specific product/commodity
     * @param {string} product - Product name
     * @param {Object} params - Query parameters
     */
    getProductNews: async (product, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.category) queryParams.append('category', params.category);
        if (params.country) queryParams.append('country', params.country);
        if (params.state) queryParams.append('state', params.state);
        if (params.limit) queryParams.append('limit', params.limit);
        if (params.refresh) queryParams.append('refresh', params.refresh);

        const query = queryParams.toString();
        return fetchAPI(`/news/product/${product}${query ? '?' + query : ''}`);
    },

    /**
     * Batch fetch news for multiple products
     */
    batchFetchProductNews: async (products, category = null, limit = 10) => {
        const promises = products.map(product => 
            api.getProductNews(product, { category, limit }).catch(err => {
                console.error(`Failed to fetch news for ${product}:`, err);
                return { status: 'error', data: [] };
            })
        );
        
        const results = await Promise.all(promises);
        return results.flatMap(result => result.data || []);
    },

    /**
     * Get news by source
     */
    getSourceNews: async (source, params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.query) queryParams.append('query', params.query);
        if (params.country) queryParams.append('country', params.country);
        if (params.state) queryParams.append('state', params.state);
        if (params.commodity) queryParams.append('commodity', params.commodity);
        if (params.limit) queryParams.append('limit', params.limit);

        const query = queryParams.toString();
        return fetchAPI(`/news/source/${source}${query ? '?' + query : ''}`);
    },

    /**
     * Get available sources
     */
    getSources: async () => {
        return fetchAPI('/news/sources');
    },

    /**
     * Get cache stats
     */
    getCacheStats: async () => {
        return fetchAPI('/cache/stats');
    },

    /**
     * Clear cache
     */
    clearCache: async () => {
        return fetchAPI('/cache/clear', { method: 'POST' });
    }
};

export default api;
