import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    TrendingUp, 
    Globe, 
    Zap, 
    Shield, 
    BarChart3, 
    Brain,
    ArrowRight,
    Check,
    Star,
    Sparkles,
    Activity,
    Database,
    Users,
    Clock,
    ChevronRight,
    X,
    Menu
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = ({ onLogin }) => {
    const navigate = useNavigate();
    const [isScrolled, setIsScrolled] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login', 'signup', 'demo'
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAuth = (mode) => {
        setAuthMode(mode);
        setShowAuthModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (authMode === 'login' || authMode === 'signup') {
            setShowAuthModal(false);
            onLogin();
            navigate('/products');
        }
    };

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                <div className="container">
                    <div className="nav-content">
                        <div className="nav-logo">
                            <Sparkles className="logo-icon" />
                            <span className="logo-text">Ananta<span className="logo-accent">AI</span></span>
                        </div>
                        
                        <div className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                            <a href="#features">Features</a>
                            <a href="#platform">Platform</a>
                            <a href="#use-cases">Use Cases</a>
                            <a href="#pricing">Pricing</a>
                        </div>

                        <div className="nav-actions">
                            <button className="btn-secondary" onClick={() => handleAuth('login')}>
                                Log In
                            </button>
                            <button className="btn-primary" onClick={() => handleAuth('demo')}>
                                Request Demo
                            </button>
                            <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                    <div className="grid-overlay"></div>
                </div>
                
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <Sparkles size={16} />
                            <span>Powered by Advanced AI & Multi-Source Intelligence</span>
                        </div>
                        
                        <h1 className="hero-title">
                            Real-Time Intelligence for
                            <span className="gradient-text"> Agricultural Commodities</span>
                        </h1>
                        
                        <p className="hero-description">
                            Ananta aggregates billions of data points from global sources to deliver 
                            unparalleled insights into commodity markets, climate risks, supply chain 
                            dynamics, and price movements—all in one unified platform.
                        </p>

                        <div className="hero-cta">
                            <button className="btn-primary btn-large" onClick={() => handleAuth('demo')}>
                                Get Instant Access
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn-secondary btn-large">
                                Watch Demo
                                <Activity size={20} />
                            </button>
                        </div>

                        <div className="hero-stats">
                            <div className="stat">
                                <Database className="stat-icon" />
                                <div>
                                    <div className="stat-value">50+</div>
                                    <div className="stat-label">Data Sources</div>
                                </div>
                            </div>
                            <div className="stat">
                                <Globe className="stat-icon" />
                                <div>
                                    <div className="stat-value">150+</div>
                                    <div className="stat-label">Countries Tracked</div>
                                </div>
                            </div>
                            <div className="stat">
                                <Clock className="stat-icon" />
                                <div>
                                    <div className="stat-value">Real-Time</div>
                                    <div className="stat-label">Updates 24/7</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hero-visual">
                        <div className="dashboard-preview">
                            <div className="preview-card card-1">
                                <TrendingUp size={24} />
                                <div className="preview-content">
                                    <div className="preview-title">Wheat Prices</div>
                                    <div className="preview-value">+12.5%</div>
                                </div>
                            </div>
                            <div className="preview-card card-2">
                                <Activity size={24} />
                                <div className="preview-content">
                                    <div className="preview-title">Supply Risk</div>
                                    <div className="preview-value">Medium</div>
                                </div>
                            </div>
                            <div className="preview-card card-3">
                                <Globe size={24} />
                                <div className="preview-content">
                                    <div className="preview-title">Active Alerts</div>
                                    <div className="preview-value">8 Regions</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section" id="features">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Why Choose <span className="gradient-text">Ananta</span>
                        </h2>
                        <p className="section-description">
                            Your comprehensive platform for commodity intelligence and market foresight
                        </p>
                    </div>

                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">
                                <Brain />
                            </div>
                            <h3>AI-Powered Analysis</h3>
                            <p>
                                Advanced machine learning algorithms analyze patterns across multiple 
                                data sources to provide predictive insights you can trust.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Database />
                            </div>
                            <h3>Multi-Source Aggregation</h3>
                            <p>
                                Seamlessly combines data from Google Search, Perplexity AI, Baidu News, 
                                Zee Business, and specialized agricultural portals.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <BarChart3 />
                            </div>
                            <h3>Smart Categorization</h3>
                            <p>
                                Automatically classifies news into trade, pricing, supply & demand, 
                                climate, and geopolitical categories for faster decision-making.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Globe />
                            </div>
                            <h3>Global Coverage</h3>
                            <p>
                                Track commodities across 150+ countries with region-specific insights, 
                                state-level data, and localized market intelligence.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Zap />
                            </div>
                            <h3>Real-Time Alerts</h3>
                            <p>
                                Get instant notifications on price movements, supply disruptions, 
                                weather events, and policy changes that impact your business.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">
                                <Shield />
                            </div>
                            <h3>Risk Monitoring</h3>
                            <p>
                                Proactively identify and mitigate risks with comprehensive tracking 
                                of climate, economic, and geopolitical factors.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Platform Overview */}
            <section className="platform-section" id="platform">
                <div className="container">
                    <div className="platform-content">
                        <div className="platform-text">
                            <div className="section-badge">The Ananta Platform</div>
                            <h2 className="section-title">
                                Everything You Need to Stay <span className="gradient-text">Ahead of the Market</span>
                            </h2>
                            <p className="section-description">
                                Ananta delivers comprehensive market intelligence through an intuitive 
                                platform designed for commodity professionals. Make informed decisions 
                                with confidence using our suite of powerful tools.
                            </p>

                            <div className="platform-features">
                                <div className="platform-feature">
                                    <div className="feature-check">
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <h4>Unified Dashboard</h4>
                                        <p>Monitor all your commodities in one centralized view with customizable widgets and real-time updates</p>
                                    </div>
                                </div>

                                <div className="platform-feature">
                                    <div className="feature-check">
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <h4>Advanced Filtering</h4>
                                        <p>Filter by commodity type, country, region, category, and ticker symbols to focus on what matters most</p>
                                    </div>
                                </div>

                                <div className="platform-feature">
                                    <div className="feature-check">
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <h4>Historical Analysis</h4>
                                        <p>Access comprehensive historical data and trend analysis to understand long-term market patterns</p>
                                    </div>
                                </div>

                                <div className="platform-feature">
                                    <div className="feature-check">
                                        <Check size={20} />
                                    </div>
                                    <div>
                                        <h4>Export & Integration</h4>
                                        <p>Seamlessly integrate with your existing tools via REST API and export data in multiple formats</p>
                                    </div>
                                </div>
                            </div>

                            <button className="btn-primary btn-large" onClick={() => handleAuth('demo')}>
                                Explore the Platform
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="platform-visual">
                            <div className="floating-card card-animated">
                                <div className="card-header">
                                    <div className="card-title">Live Market Feed</div>
                                    <div className="card-badge">Real-time</div>
                                </div>
                                <div className="market-items">
                                    <div className="market-item">
                                        <div className="item-info">
                                            <div className="item-name">Wheat</div>
                                            <div className="item-region">India, Maharashtra</div>
                                        </div>
                                        <div className="item-price positive">+12.5%</div>
                                    </div>
                                    <div className="market-item">
                                        <div className="item-info">
                                            <div className="item-name">Rice</div>
                                            <div className="item-region">Global</div>
                                        </div>
                                        <div className="item-price negative">-3.2%</div>
                                    </div>
                                    <div className="market-item">
                                        <div className="item-info">
                                            <div className="item-name">Cotton</div>
                                            <div className="item-region">USA, Texas</div>
                                        </div>
                                        <div className="item-price positive">+8.1%</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="use-cases-section" id="use-cases">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Built for <span className="gradient-text">Industry Leaders</span>
                        </h2>
                        <p className="section-description">
                            Whether you're sourcing, trading, or manufacturing, Ananta empowers your team with actionable intelligence
                        </p>
                    </div>

                    <div className="use-cases-grid">
                        <div className="use-case-card">
                            <div className="use-case-number">01</div>
                            <h3>Commodity Traders</h3>
                            <p>
                                Anticipate market movements with multi-dimensional analysis covering 
                                trade flows, pricing trends, and geopolitical developments. Maximize 
                                alpha with early signals and comprehensive risk assessment.
                            </p>
                            <a href="#" className="use-case-link">
                                Learn more <ArrowRight size={16} />
                            </a>
                        </div>

                        <div className="use-case-card">
                            <div className="use-case-number">02</div>
                            <h3>Procurement Teams</h3>
                            <p>
                                Secure the best prices and ensure supply continuity by predicting 
                                disruptions before they happen. Our platform helps you negotiate 
                                contracts with confidence and maintain optimal inventory levels.
                            </p>
                            <a href="#" className="use-case-link">
                                Learn more <ArrowRight size={16} />
                            </a>
                        </div>

                        <div className="use-case-card">
                            <div className="use-case-number">03</div>
                            <h3>Food Manufacturers</h3>
                            <p>
                                Monitor raw material availability and pricing across your entire 
                                supply chain. Identify alternative sources, mitigate risks, and 
                                ensure production continuity with real-time intelligence.
                            </p>
                            <a href="#" className="use-case-link">
                                Learn more <ArrowRight size={16} />
                            </a>
                        </div>

                        <div className="use-case-card">
                            <div className="use-case-number">04</div>
                            <h3>Retailers & Distributors</h3>
                            <p>
                                Stay ahead of price volatility and supply constraints. Plan inventory 
                                strategically, optimize pricing strategies, and maintain customer 
                                satisfaction with predictive supply chain insights.
                            </p>
                            <a href="#" className="use-case-link">
                                Learn more <ArrowRight size={16} />
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="testimonials-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">
                            Trusted by <span className="gradient-text">Global Leaders</span>
                        </h2>
                    </div>

                    <div className="testimonials-grid">
                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Ananta has transformed how we approach commodity sourcing. The real-time 
                                alerts helped us avoid a major supply disruption last quarter, saving us 
                                millions in potential losses."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">SK</div>
                                <div>
                                    <div className="author-name">Sarah Kumar</div>
                                    <div className="author-title">Global Procurement Director, FoodCorp International</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "The AI-powered insights are incredibly accurate. We've consistently beaten 
                                market expectations by acting on Ananta's early warnings about price movements 
                                and supply shifts."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">MR</div>
                                <div>
                                    <div className="author-name">Michael Rodriguez</div>
                                    <div className="author-title">Head of Trading, AgriCommodities Group</div>
                                </div>
                            </div>
                        </div>

                        <div className="testimonial-card">
                            <div className="testimonial-stars">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={16} fill="currentColor" />
                                ))}
                            </div>
                            <p className="testimonial-text">
                                "Having all market intelligence in one platform has streamlined our operations. 
                                The categorized news feed and regional insights help our team make faster, 
                                more informed decisions."
                            </p>
                            <div className="testimonial-author">
                                <div className="author-avatar">LC</div>
                                <div>
                                    <div className="author-name">Lisa Chen</div>
                                    <div className="author-title">VP Supply Chain, Global Grains Ltd</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">
                            Ready to Transform Your Commodity Intelligence?
                        </h2>
                        <p className="cta-description">
                            Join leading organizations worldwide who trust Ananta for market-leading insights
                        </p>
                        <div className="cta-buttons">
                            <button className="btn-primary btn-large" onClick={() => handleAuth('demo')}>
                                Request a Demo
                                <ArrowRight size={20} />
                            </button>
                            <button className="btn-secondary btn-large" onClick={() => handleAuth('signup')}>
                                Sign Up Free
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <Sparkles className="logo-icon" />
                                <span className="logo-text">Ananta<span className="logo-accent">AI</span></span>
                            </div>
                            <p className="footer-tagline">
                                Real-time intelligence for agricultural commodity markets
                            </p>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Product</h4>
                                <a href="#">Platform Overview</a>
                                <a href="#">Features</a>
                                <a href="#">Pricing</a>
                                <a href="#">API Documentation</a>
                            </div>

                            <div className="footer-column">
                                <h4>Use Cases</h4>
                                <a href="#">Commodity Traders</a>
                                <a href="#">Procurement Teams</a>
                                <a href="#">Manufacturers</a>
                                <a href="#">Retailers</a>
                            </div>

                            <div className="footer-column">
                                <h4>Company</h4>
                                <a href="#">About Us</a>
                                <a href="#">Blog</a>
                                <a href="#">Careers</a>
                                <a href="#">Contact</a>
                            </div>

                            <div className="footer-column">
                                <h4>Resources</h4>
                                <a href="#">Documentation</a>
                                <a href="#">Case Studies</a>
                                <a href="#">Support</a>
                                <a href="#">Status</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <div className="footer-copyright">
                            © 2025 Ananta AI. All rights reserved.
                        </div>
                        <div className="footer-legal">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Auth Modal */}
            {showAuthModal && (
                <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowAuthModal(false)}>
                            <X size={24} />
                        </button>

                        <div className="modal-header">
                            <h2>
                                {authMode === 'login' && 'Welcome Back'}
                                {authMode === 'signup' && 'Get Started with Ananta'}
                                {authMode === 'demo' && 'Request a Demo'}
                            </h2>
                            <p>
                                {authMode === 'login' && 'Log in to access your dashboard'}
                                {authMode === 'signup' && 'Create your account in seconds'}
                                {authMode === 'demo' && 'See Ananta in action - schedule your personalized demo'}
                            </p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            {authMode === 'demo' && (
                                <>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input type="text" placeholder="John" />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input type="text" placeholder="Doe" />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Company</label>
                                        <input type="text" placeholder="Your Company" />
                                    </div>
                                    <div className="form-group">
                                        <label>Job Title</label>
                                        <input type="text" placeholder="e.g., Procurement Manager" />
                                    </div>
                                </>
                            )}

                            {authMode === 'signup' && (
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="John Doe" />
                                </div>
                            )}

                            <div className="form-group">
                                <label>Email Address</label>
                                <input type="email" placeholder="you@company.com" />
                            </div>

                            {authMode !== 'demo' && (
                                <div className="form-group">
                                    <label>Password</label>
                                    <input type="password" placeholder="••••••••" />
                                </div>
                            )}

                            {authMode === 'demo' && (
                                <div className="form-group">
                                    <label>Message (Optional)</label>
                                    <textarea placeholder="Tell us about your use case..." rows="3"></textarea>
                                </div>
                            )}

                            <button type="submit" className="btn-primary btn-full">
                                {authMode === 'login' && 'Log In'}
                                {authMode === 'signup' && 'Create Account'}
                                {authMode === 'demo' && 'Submit Request'}
                            </button>

                            {authMode !== 'demo' && (
                                <div className="form-footer">
                                    {authMode === 'login' ? (
                                        <p>
                                            Don't have an account?{' '}
                                            <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('signup'); }}>
                                                Sign up
                                            </a>
                                        </p>
                                    ) : (
                                        <p>
                                            Already have an account?{' '}
                                            <a href="#" onClick={(e) => { e.preventDefault(); setAuthMode('login'); }}>
                                                Log in
                                            </a>
                                        </p>
                                    )}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage;
