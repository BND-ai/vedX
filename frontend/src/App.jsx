import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ProductSelection from './components/ProductSelection';
import Dashboard from './components/Dashboard';
import './styles/App.css';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [hasSelectedProducts, setHasSelectedProducts] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState([]);

    const handleLogin = () => {
        setIsLoggedIn(true);
    };

    const handleProductSelection = (products) => {
        setSelectedProducts(products);
        setHasSelectedProducts(true);
    };

    const handleProductsUpdate = (products) => {
        setSelectedProducts(products);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setHasSelectedProducts(false);
        setSelectedProducts([]);
    };

    return (
        <BrowserRouter>
            <div className="app">
                <Routes>
                    <Route path="/" element={<LandingPage onLogin={handleLogin} />} />
                    <Route 
                        path="/products" 
                        element={
                            isLoggedIn ? 
                            <ProductSelection onComplete={handleProductSelection} /> : 
                            <Navigate to="/" replace />
                        } 
                    />
                    <Route 
                        path="/dashboard/*" 
                        element={
                            isLoggedIn && hasSelectedProducts ? 
                            <Dashboard 
                                selectedProducts={selectedProducts} 
                                onLogout={handleLogout}
                                onProductsUpdate={handleProductsUpdate}
                            /> : 
                            <Navigate to="/products" replace />
                        } 
                    />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default App;
