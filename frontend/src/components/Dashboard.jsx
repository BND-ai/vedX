import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import {
    LayoutDashboard,
    TrendingUp,
    Newspaper,
    BarChart3,
    Calendar,
    CloudRain,
    Menu,
    Sparkles,
    Plus,
    RefreshCw,
    Download,
    Bell,
    MapPin,
    Settings,
    GitCompare
} from 'lucide-react';
import { COMMODITIES, getCountriesForCommodity, COUNTRY_ALERTS } from '../data/mockData';
import MarketPulse from './dashboard/MarketPulse';
import CommodityDetail from './dashboard/CommodityDetail';
import CountryAnalysis from './dashboard/CountryAnalysis';
import Compare from './dashboard/Compare';
import ClimateChange from './dashboard/ClimateChange';
import NewsFeed from './dashboard/NewsFeed';
import PriceChart from './dashboard/PriceChart';
import TradeTable from './dashboard/TradeTable';
import OverviewCards from './dashboard/OverviewCards';
import Seasonality from './dashboard/Seasonality';
import ClimateImpact from './dashboard/ClimateImpact';
import './Dashboard.css';

const Dashboard = ({ selectedProducts, onLogout, onProductsUpdate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [selectedCommodity, setSelectedCommodity] = useState(null);
    const [filteredCommodity, setFilteredCommodity] = useState(null); // For dropdown filter
    const [tempFilteredCommodity, setTempFilteredCommodity] = useState(null); // Temporary selection
    const [filteredCountry, setFilteredCountry] = useState(null); // For country dropdown filter
    const [tempFilteredCountry, setTempFilteredCountry] = useState(null); // Temporary country selection
    const [showCountryFilterSaveBtn, setShowCountryFilterSaveBtn] = useState(false);
    const [showFilterSaveBtn, setShowFilterSaveBtn] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
    const [showToast, setShowToast] = useState(false);

    // Derive active view from URL
    const getActiveView = () => {
        const path = location.pathname.split('/dashboard/')[1] || 'home';
        // Check if it's a country detail route
        if (path.startsWith('commodity/')) {
            return 'country-detail';
        }
        return path;
    };

    const activeView = getActiveView();

    // Redirect to home if no specific route
    useEffect(() => {
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            navigate('/dashboard/home', { replace: true });
        }
    }, [location, navigate]);

    const selectedCommodities = COMMODITIES.filter(c => selectedProducts.includes(c.id));
    
    // Get products to display based on filter
    const displayedProducts = filteredCommodity ? [filteredCommodity] : selectedProducts;

    // Handle add commodities modal
    const handleOpenAddModal = () => {
        setTempSelectedProducts([...selectedProducts]);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setTempSelectedProducts([]);
    };

    const handleToggleCommodity = (commodityId) => {
        setTempSelectedProducts(prev => 
            prev.includes(commodityId)
                ? prev.filter(id => id !== commodityId)
                : [...prev, commodityId]
        );
    };

    const handleSaveCommodities = () => {
        if (onProductsUpdate) {
            onProductsUpdate(tempSelectedProducts);
        }
        setShowAddModal(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Handle dropdown filter change
    const handleDropdownChange = (e) => {
        const value = e.target.value === 'all' ? null : e.target.value;
        setTempFilteredCommodity(value);
        setShowFilterSaveBtn(true);
    };

    const handleSaveFilter = () => {
        setFilteredCommodity(tempFilteredCommodity);
        setShowFilterSaveBtn(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Handle country dropdown filter
    const handleCountryDropdownChange = (e) => {
        const value = e.target.value === 'all' ? null : e.target.value;
        setTempFilteredCountry(value);
        setShowCountryFilterSaveBtn(true);
    };

    const handleSaveCountryFilter = () => {
        setFilteredCountry(tempFilteredCountry);
        setShowCountryFilterSaveBtn(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    // Get available countries for selected commodity (including temp selection)
    const availableCountries = (filteredCommodity || tempFilteredCommodity) ? 
        getCountriesForCommodity(filteredCommodity || tempFilteredCommodity) : [];

    const menuItems = [
        { id: 'home', icon: LayoutDashboard, label: 'Home' },
        { id: 'climate', icon: TrendingUp, label: 'Climate' },
        { id: 'compare', icon: GitCompare, label: 'Compare' },
        { id: 'price', icon: BarChart3, label: 'Price' },
        { id: 'seasonality', icon: Calendar, label: 'Price - Seasonality' },
        { id: 'climate-change', icon: CloudRain, label: 'Climate Change' },
        { id: 'news', icon: Newspaper, label: 'News' },
    ];

    const handleCommodityClick = (commodityId) => {
        setSelectedCommodity(commodityId);
        navigate('/dashboard/detail');
    };

    const handleBackToMarket = () => {
        setSelectedCommodity(null);
        navigate('/dashboard/climate');
    };

    const handleNavigation = (view) => {
        navigate(`/dashboard/${view}`);
    };

    // Combined save function for both filters
    const handleSaveAllFilters = () => {
        setFilteredCommodity(tempFilteredCommodity);
        setFilteredCountry(tempFilteredCountry);
        setShowFilterSaveBtn(false);
        setShowCountryFilterSaveBtn(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className="dashboard">
            {/* Left Icon Sidebar */}
            <aside className="icon-sidebar">
                <div className="icon-nav">
                    <button className="icon-nav-item active">
                        <LayoutDashboard size={24} />
                    </button>
                    <button className="icon-nav-item">
                        <BarChart3 size={24} />
                    </button>
                    <button className="icon-nav-item">
                        <Sparkles size={24} />
                    </button>
                    <button className="icon-nav-item">
                        <MapPin size={24} />
                    </button>
                    <button className="icon-nav-item">
                        <Settings size={24} />
                    </button>
                    <button className="icon-nav-item">
                        <Newspaper size={24} />
                    </button>
                </div>
            </aside>

            {/* Main Dashboard Container */}
            <div className="dashboard-container">
                {/* Header */}
                <header className="dashboard-header">
                    <div className="header-left">
                        <button 
                            className="mobile-menu-toggle"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        >
                            <Menu size={24} />
                        </button>
                        <div className="dashboard-logo">
                            <Sparkles size={24} />
                            <span>Ananta<span className="logo-accent">AI</span></span>
                        </div>
                    </div>

                    <div className="header-center">
                        <div className="selected-products">
                            {selectedCommodities.slice(0, 3).map(commodity => (
                                <div key={commodity.id} className="product-pill">
                                    <span className="pill-icon">{commodity.icon}</span>
                                    <span className="pill-name">{commodity.name}</span>
                                </div>
                            ))}
                            {selectedCommodities.length > 3 && (
                                <div className="product-pill more">
                                    +{selectedCommodities.length - 3} more
                                </div>
                            )}
                            <button className="add-product-btn" onClick={handleOpenAddModal}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="header-right">
                        <button className="icon-btn">
                            <RefreshCw size={18} />
                        </button>
                        <button className="icon-btn">
                            <Download size={18} />
                        </button>
                        <button className="icon-btn">
                            <Bell size={18} />
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="user-menu">
                            <div className="user-avatar">JD</div>
                            <span className="user-name">John Doe</span>
                        </div>
                    </div>
                </header>

                {/* Body */}
                <div className="dashboard-body">
                    {/* Left Sidebar - Navigation */}
                    <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`}>
                        <button className="edit-commodities-btn">
                            Edit Commodities
                        </button>

                        {/* Filter Section */}
                        <div className="filter-section">
                            <h3 className="filter-title">Filters</h3>
                            
                            {/* Commodity Filter */}
                            <div className="filter-group">
                                <label className="filter-label">Commodity</label>
                                <select 
                                    className={`filter-dropdown ${filteredCommodity ? 'filtered' : ''}`}
                                    value={tempFilteredCommodity || filteredCommodity || 'all'}
                                    onChange={handleDropdownChange}
                                >
                                    <option value="all">All Commodities</option>
                                    {selectedCommodities.map(commodity => (
                                        <option key={commodity.id} value={commodity.id}>
                                            {commodity.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Country Filter */}
                            <div className="filter-group">
                                <label className="filter-label">Country</label>
                                <select 
                                    className={`filter-dropdown ${filteredCountry ? 'filtered' : ''}`}
                                    value={tempFilteredCountry || filteredCountry || 'all'}
                                    onChange={handleCountryDropdownChange}
                                    disabled={!filteredCommodity && !tempFilteredCommodity}
                                >
                                    <option value="all">All Countries</option>
                                    {availableCountries.map(country => (
                                        <option key={country.country} value={country.country}>
                                            {country.country}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Save Filter Button */}
                            {(showFilterSaveBtn || showCountryFilterSaveBtn) && (
                                <button className="save-filter-btn" onClick={handleSaveAllFilters}>
                                    Save Filters
                                </button>
                            )}
                        </div>

                        <nav className="sidebar-nav">
                            {menuItems.map(item => (
                                <div
                                    key={item.id}
                                    className={`nav-item ${activeView === item.id || (activeView === 'detail' && item.id === 'climate') ? 'active' : ''}`}
                                    onClick={() => navigate(`/dashboard/${item.id}`)}
                                >
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                </div>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="dashboard-main">
                    {activeView === 'home' && (
                        <div className="dashboard-content">
                            <OverviewCards selectedProducts={displayedProducts} />
                            
                            <div className="dashboard-grid-single">
                                <div className="grid-item-full">
                                    <PriceChart selectedProducts={displayedProducts} />
                                </div>
                            </div>

                            <div className="dashboard-grid-two">
                                <div className="grid-item-half">
                                    <NewsFeed selectedProducts={displayedProducts} />
                                </div>
                                
                                <div className="grid-item-half">
                                    <div className="alerts-section">
                                        <h3 className="section-title">Active Alerts</h3>
                                        <div className="alerts-list">
                                            <div className="alert-item high">
                                                <div className="alert-header">
                                                    <span className="alert-badge high">High Risk</span>
                                                    <span className="alert-time">2 hours ago</span>
                                                </div>
                                                <h4>Wheat Supply Disruption</h4>
                                                <p>Black Sea export corridor issues affecting global wheat supply</p>
                                            </div>
                                            <div className="alert-item medium">
                                                <div className="alert-header">
                                                    <span className="alert-badge medium">Medium Risk</span>
                                                    <span className="alert-time">5 hours ago</span>
                                                </div>
                                                <h4>Corn Price Volatility</h4>
                                                <p>Weather concerns in Midwest driving price fluctuations</p>
                                            </div>
                                            <div className="alert-item low">
                                                <div className="alert-header">
                                                    <span className="alert-badge low">Monitor</span>
                                                    <span className="alert-time">1 day ago</span>
                                                </div>
                                                <h4>Rice Export Increase</h4>
                                                <p>India announces new export quotas for basmati rice</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {activeView === 'overview' && (
                        <>
                            <div className="dashboard-overview">
                                <h2 className="section-title">Dashboard Overview</h2>
                                <p className="section-subtitle">Comprehensive view of all your commodities and market positions</p>
                                
                                <div className="overview-metrics">
                                    <div className="metric-card">
                                        <h3>Total Portfolio Value</h3>
                                        <div className="metric-value">$2.4M</div>
                                        <div className="metric-change positive">+5.2% from last week</div>
                                    </div>
                                    <div className="metric-card">
                                        <h3>Active Commodities</h3>
                                        <div className="metric-value">{displayedProducts.length}</div>
                                        <div className="metric-change neutral">Tracking globally</div>
                                    </div>
                                    <div className="metric-card">
                                        <h3>Total Alerts</h3>
                                        <div className="metric-value">8</div>
                                        <div className="metric-change warning">3 critical</div>
                                    </div>
                                    <div className="metric-card">
                                        <h3>Open Positions</h3>
                                        <div className="metric-value">12</div>
                                        <div className="metric-change positive">+2 this week</div>
                                    </div>
                                </div>

                                <PriceChart selectedProducts={displayedProducts} />
                                <NewsFeed selectedProducts={displayedProducts} />
                            </div>
                        </>
                    )}
                    
                    {activeView === 'climate' && (
                        <ClimateChange />
                    )}
                    
                    {activeView === 'compare' && (
                        <Compare />
                    )}
                    
                    {activeView === 'detail' && selectedCommodity && (
                        <CommodityDetail 
                            commodityId={selectedCommodity} 
                            onBack={handleBackToMarket}
                        />
                    )}
                    
                    {activeView === 'price' && (
                        <div className="dashboard-content">
                            <PriceChart selectedProducts={displayedProducts} />
                        </div>
                    )}
                    
                    {activeView === 'seasonality' && (
                        <Seasonality />
                    )}
                    
                    {activeView === 'climate-change' && (
                        <ClimateImpact selectedProducts={displayedProducts} />
                    )}
                    
                    {activeView === 'news' && (
                        <div className="dashboard-content">
                            <div className="news-page-header">
                                <h2>Intelligence Feed</h2>
                                <p>Latest news and insights for your tracked commodities</p>
                            </div>
                            <NewsFeed selectedProducts={displayedProducts} fullView={true} />
                        </div>
                    )}
                    
                    {activeView === 'country-detail' && (
                        <CountryAnalysis />
                    )}
                </main>

                {/* Right Panel */}
                <aside className="dashboard-right">
                    <div className="right-section">
                        <h3>Quick Stats</h3>
                        <div className="quick-stat">
                            <span>Portfolio Value</span>
                            <strong>$2.4M</strong>
                        </div>
                        <div className="quick-stat">
                            <span>Active Positions</span>
                            <strong>12</strong>
                        </div>
                        <div className="quick-stat">
                            <span>Today's P&L</span>
                            <strong className="positive">+$18.5K</strong>
                        </div>
                    </div>

                    <div className="right-section">
                        <h3>Country Alerts</h3>
                        {COUNTRY_ALERTS
                            .filter(alert => {
                                // Filter by selected commodity if any
                                if (filteredCommodity) {
                                    return alert.commodity === filteredCommodity;
                                }
                                // Show alerts for all selected commodities
                                return displayedProducts.includes(alert.commodity);
                            })
                            .slice(0, 3)
                            .map(alert => (
                                <div 
                                    key={alert.id}
                                    className="alert-item country-alert clickable" 
                                    onClick={() => {
                                        setSelectedCommodity(alert.commodity);
                                        navigate('/dashboard/detail');
                                    }}
                                >
                                    <div className="alert-header">
                                        <span className="country-flag">{alert.flag}</span>
                                        <span className="alert-title">{alert.title}</span>
                                        <span className={`alert-badge ${alert.severity}`}>
                                            {alert.severity === 'high' ? 'Critical' : alert.severity === 'medium' ? 'Warning' : 'Info'}
                                        </span>
                                    </div>
                                    <p className="alert-text">{alert.description}</p>
                                    <p className="alert-time">{alert.timestamp}</p>
                                </div>
                            ))
                        }
                    </div>

                    <div className="right-section">
                        <h3>Recent Activity</h3>
                        <div 
                            className="activity-item clickable"
                            onClick={() => {
                                setSelectedCommodity('gold');
                                navigate('/dashboard/detail');
                            }}
                        >
                            <div className="activity-header">
                                <div className="activity-icon">
                                    <TrendingUp size={14} />
                                </div>
                                <span className="activity-title">Position Update</span>
                            </div>
                            <p className="activity-desc">Gold position up 3.2%</p>
                            <p className="activity-time">1 hour ago</p>
                        </div>

                        <div 
                            className="activity-item clickable"
                            onClick={() => {
                                setSelectedCommodity('crude-oil');
                                navigate('/dashboard/detail');
                            }}
                        >
                            <div className="activity-header">
                                <div className="activity-icon">
                                    <Bell size={14} />
                                </div>
                                <span className="activity-title">Alert Triggered</span>
                            </div>
                            <p className="activity-desc">Crude oil reached target</p>
                            <p className="activity-time">2 hours ago</p>
                        </div>
                    </div>
                </aside>
            </div>
            </div>

            {/* Add Commodities Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Add Commodities</h2>
                            <button className="modal-close" onClick={handleCloseModal}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="commodities-grid">
                                {COMMODITIES.map(commodity => (
                                    <div 
                                        key={commodity.id}
                                        className={`commodity-card ${tempSelectedProducts.includes(commodity.id) ? 'selected' : ''}`}
                                        onClick={() => handleToggleCommodity(commodity.id)}
                                    >
                                        <span className="commodity-icon">{commodity.icon}</span>
                                        <span className="commodity-name">{commodity.name}</span>
                                        {tempSelectedProducts.includes(commodity.id) && (
                                            <span className="checkmark">✓</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button className="btn-primary" onClick={handleSaveCommodities}>
                                Save ({tempSelectedProducts.length} selected)
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && (
                <div className="toast-notification">
                    ✓ Commodities saved successfully
                </div>
            )}
        </div>
    );
};

export default Dashboard;
