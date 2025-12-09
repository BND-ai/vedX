import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Hook for fetching news for multiple products
 */
export const useNews = (initialParams = {}) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState(null);

    const fetchNews = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const mergedParams = { ...initialParams, ...params };
            const response = await api.getNews(mergedParams);
            setNews(response.data || []);
            setMetadata(response.metadata);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch news:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchNews();
    }, [fetchNews]);

    return { news, loading, error, metadata, refetch: fetchNews };
};

/**
 * Hook for fetching news for single product
 */
export const useProductNews = (product, initialParams = {}) => {
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [metadata, setMetadata] = useState(null);

    const fetchProductNews = useCallback(async (params = {}) => {
        if (!product) return;

        setLoading(true);
        setError(null);
        try {
            const mergedParams = { ...initialParams, ...params };
            const response = await api.getProductNews(product, mergedParams);
            setNews(response.data || []);
            setMetadata(response.metadata);
        } catch (err) {
            setError(err.message);
            console.error('Failed to fetch product news:', err);
        } finally {
            setLoading(false);
        }
    }, [product]);

    useEffect(() => {
        fetchProductNews();
    }, [fetchProductNews]);

    return { news, loading, error, metadata, refetch: fetchProductNews };
};
