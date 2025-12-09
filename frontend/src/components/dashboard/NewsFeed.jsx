import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { api } from '../../services/api';
import { COMMODITIES, NEWS_FEED } from '../../data/mockData';
import './NewsFeed.css';

const NewsFeed = ({ selectedProducts, fullView = false }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [news, setNews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [usingMockData, setUsingMockData] = useState(false);

    const categories = ['All', 'Trade', 'Price', 'Supply', 'Climate', 'Geopolitics'];

    // Fetch news from FastAPI backend
    useEffect(() => {
        const fetchNews = async () => {
            if (!selectedProducts || selectedProducts.length === 0) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                setUsingMockData(false);

                // Get commodity names from IDs
                const productNames = selectedProducts.map(id => {
                    const commodity = COMMODITIES.find(c => c.id === id);
                    return commodity ? commodity.name.toLowerCase() : id;
                });

                console.log('Fetching news for products:', productNames);

                // Fetch news for all selected products
                const category = selectedCategory === 'All' ? null : selectedCategory.toLowerCase();
                const newsData = await api.batchFetchProductNews(productNames, category, fullView ? 50 : 10);

                console.log('Fetched news data:', newsData);

                if (newsData && newsData.length > 0) {
                    setNews(newsData);
                } else {
                    // Fallback to mock data if no real data
                    console.log('No data from API, using mock data');
                    setUsingMockData(true);
                    const mockFiltered = NEWS_FEED.filter(item => {
                        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory.toLowerCase();
                        const matchesProduct = item.commodities && item.commodities.some(c => selectedProducts.includes(c));
                        return matchesCategory && matchesProduct;
                    });
                    setNews(mockFiltered);
                }
            } catch (err) {
                console.error('Error fetching news:', err);
                setError(err.message);
                
                // Fallback to mock data on error
                console.log('API error, using mock data');
                setUsingMockData(true);
                const mockFiltered = NEWS_FEED.filter(item => {
                    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory.toLowerCase();
                    const matchesProduct = item.commodities && item.commodities.some(c => selectedProducts.includes(c));
                    return matchesCategory && matchesProduct;
                });
                setNews(mockFiltered);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [selectedProducts, selectedCategory, fullView]);

    const displayedNews = fullView ? news : news.slice(0, 5);

    const getCategoryColor = (category) => {
        const colors = {
            trade: '#00d4ff',
            price: '#00ff00',
            supply_demand: '#ffa500',
            climate: '#0066ff',
            geopolitics: '#ff4444',
        };
        return colors[category] || '#94a3b8';
    };

    return (
        <div className="news-feed-container">
            <div className="news-header">
                <h3 className="news-title">
                    News Feed
                    {usingMockData && <span style={{fontSize: '0.7rem', color: '#f57c00', marginLeft: '0.5rem'}}>(Demo Data)</span>}
                </h3>
                <div className="news-filters">
                    {categories.map(cat => (
                        <button 
                            key={cat}
                            className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {loading && (
                <div className="news-loading">
                    <p>Loading news...</p>
                </div>
            )}

            {error && !usingMockData && (
                <div className="news-error">
                    <p>Using demo data - API: {error}</p>
                </div>
            )}

            {!loading && (
                <div className="news-list">
                    {displayedNews.length > 0 ? (
                        displayedNews.map((article, idx) => {
                            // Handle both API and mock data formats
                            const title = article.title || article.headline;
                            const description = article.snippet || article.summary || article.description;
                            const source = article.source;
                            const category = article.category || 'general';
                            const date = article.published_date || article.time;
                            const region = article.country || article.region;
                            const url = article.url || article.link;

                            return (
                                <div key={idx} className={`news-item ${category}`}>
                                    <div className="news-item-header">
                                        <span className={`news-category ${category}`}>
                                            {category}
                                        </span>
                                        <span className="news-time">
                                            {date ? (typeof date === 'string' && date.includes('-') ? 
                                                new Date(date).toLocaleDateString() : date) : 'Recent'}
                                        </span>
                                    </div>
                                    <div className="news-content">
                                        <h4>{title}</h4>
                                        <p>{description}</p>
                                        <div className="news-meta">
                                            <span className="news-source">{source}</span>
                                            {region && (
                                                <span className="news-region">{region}</span>
                                            )}
                                        </div>
                                        {url && (
                                            <a 
                                                href={url} 
                                                target="_blank" 
                                                rel="noopener noreferrer" 
                                                className="read-more-btn"
                                            >
                                                Read more
                                                <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="no-news">
                            <p>No news found for your selection</p>
                        </div>
                    )}
                </div>
            )}

            {!fullView && news.length > 5 && !loading && (
                <button className="view-all-btn">
                    View All News ({news.length})
                </button>
            )}
        </div>
    );
};

export default NewsFeed;
