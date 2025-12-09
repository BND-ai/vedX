import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Search, TrendingUp } from 'lucide-react';
import { COMMODITIES } from '../data/mockData';
import './ProductSelection.css';

const ProductSelection = ({ onComplete }) => {
    const navigate = useNavigate();
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const categories = ['All', ...new Set(COMMODITIES.map(c => c.category))];

    const filteredCommodities = COMMODITIES.filter(commodity => {
        const matchesSearch = commodity.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || commodity.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const toggleProduct = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleContinue = () => {
        if (selectedProducts.length > 0) {
            onComplete(selectedProducts);
            navigate('/dashboard/home');
        }
    };

    return (
        <div className="product-selection-overlay">
            <div className="product-selection-container">
                <div className="selection-header">
                    <div className="header-icon">
                        <TrendingUp size={32} />
                    </div>
                    <h1>Welcome to Ananta AI</h1>
                    <p>Select the commodities you want to track</p>
                </div>

                <div className="selection-controls">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search commodities..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="category-filters">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="commodities-grid">
                    {filteredCommodities.map(commodity => {
                        const isSelected = selectedProducts.includes(commodity.id);
                        return (
                            <div
                                key={commodity.id}
                                className={`commodity-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleProduct(commodity.id)}
                            >
                                <div className="commodity-icon">{commodity.icon}</div>
                                <div className="commodity-info">
                                    <div className="commodity-name">{commodity.name}</div>
                                    <div className="commodity-ticker">{commodity.ticker}</div>
                                </div>
                                {isSelected && (
                                    <div className="check-icon">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="selection-footer">
                    <div className="selected-count">
                        {selectedProducts.length} commodit{selectedProducts.length !== 1 ? 'ies' : 'y'} selected
                    </div>
                    <button
                        className="continue-btn"
                        onClick={handleContinue}
                        disabled={selectedProducts.length === 0}
                    >
                        Continue to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductSelection;
