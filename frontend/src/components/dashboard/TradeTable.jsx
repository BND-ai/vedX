import React, { useState } from 'react';
import { TRADE_DATA } from '../../data/mockData';
import { Package, ArrowUpDown, Download } from 'lucide-react';
import './TradeTable.css';

const TradeTable = ({ selectedProducts, filteredCommodity, filteredCountry }) => {
    const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Filter trade data based on selected filters
    const filteredData = TRADE_DATA.filter(trade => {
        // Filter by commodity if specified
        if (filteredCommodity) {
            const commodityName = trade.commodity.toLowerCase();
            const filterName = filteredCommodity.toLowerCase();
            if (commodityName !== filterName) {
                return false;
            }
        }
        
        // Filter by country if specified (check both exporter and importer)
        if (filteredCountry) {
            const countryName = filteredCountry.toLowerCase();
            const exporterMatch = trade.exporter.toLowerCase().includes(countryName);
            const importerMatch = trade.importer.toLowerCase().includes(countryName);
            if (!exporterMatch && !importerMatch) {
                return false;
            }
        }
        
        return true;
    });

    const sortedData = [...filteredData].sort((a, b) => {
        if (sortConfig.direction === 'asc') {
            return a[sortConfig.key] > b[sortConfig.key] ? 1 : -1;
        }
        return a[sortConfig.key] < b[sortConfig.key] ? 1 : -1;
    });

    const getStatusColor = (status) => {
        const colors = {
            'Completed': 'success',
            'In Transit': 'info',
            'Scheduled': 'warning',
        };
        return colors[status] || 'default';
    };

    return (
        <div className="trade-table-container">
            <div className="table-header">
                <div className="table-title">
                    <Package size={20} />
                    <h3>Trade Intelligence</h3>
                </div>
                <button className="export-btn">
                    <Download size={16} />
                    Export
                </button>
            </div>

            <div className="table-wrapper">
                <table className="trade-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('date')}>
                                <div className="th-content">
                                    Date
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th onClick={() => handleSort('commodity')}>
                                <div className="th-content">
                                    Commodity
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th>Exporter</th>
                            <th>Importer</th>
                            <th onClick={() => handleSort('volume')}>
                                <div className="th-content">
                                    Volume
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th onClick={() => handleSort('value')}>
                                <div className="th-content">
                                    Value
                                    <ArrowUpDown size={14} />
                                </div>
                            </th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedData.map(trade => (
                            <tr key={trade.id}>
                                <td>{trade.date}</td>
                                <td>
                                    <span className="commodity-cell">{trade.commodity}</span>
                                </td>
                                <td>{trade.exporter}</td>
                                <td>{trade.importer}</td>
                                <td>{trade.volume}</td>
                                <td className="value-cell">{trade.value}</td>
                                <td>
                                    <span className={`status-badge ${getStatusColor(trade.status)}`}>
                                        {trade.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="table-footer">
                <span className="showing-count">
                    Showing {sortedData.length} of {TRADE_DATA.length} trades
                    {(filteredCommodity || filteredCountry) && (
                        <span className="filter-indicator">
                            {filteredCommodity && ` • ${filteredCommodity}`}
                            {filteredCountry && ` • ${filteredCountry}`}
                        </span>
                    )}
                </span>
                <div className="pagination">
                    <button className="pagination-btn" disabled>Previous</button>
                    <span className="page-indicator">Page 1 of 1</span>
                    <button className="pagination-btn" disabled>Next</button>
                </div>
            </div>
        </div>
    );
};

export default TradeTable;
