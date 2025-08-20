import React, { useState, useEffect } from 'react';
import { 
  FaMoneyBillWave as MoneyIcon,
  FaChartLine as RevenueIcon,
  FaChartBar as ExpenseIcon,
  FaChartLine as LineChartIcon,
  FaChartBar as BarChartIcon,
  FaChartPie as PieChartIcon
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import api from '../../services/api';
import './FinanceChart.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const FinanceChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');
  const [chartType, setChartType] = useState('bar');
  const [activeTab, setActiveTab] = useState('revenue');

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/financials?range=${timeRange}`);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [timeRange]);

  const processChartData = () => {
    if (!data || data.length === 0) return [];

    if (activeTab === 'revenue') {
      return data.map(item => ({
        name: item.period,
        value: item.revenue,
        type: 'Revenue'
      }));
    } else if (activeTab === 'expenses') {
      return data.map(item => ({
        name: item.period,
        value: item.expenses,
        type: 'Expenses'
      }));
    } else {
      return data.map(item => ({
        name: item.period,
        revenue: item.revenue,
        expenses: item.expenses,
        profit: item.revenue - item.expenses
      }));
    }
  };

  const renderChart = () => {
    const chartData = processChartData();

    if (loading) {
      return (
        <div className="chart-loading">
          <div className="spinner"></div>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="chart-empty">
          No financial data available
        </div>
      );
    }

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {activeTab === 'overview' ? (
                <>
                  <Bar dataKey="revenue" fill="#4CAF50" name="Revenue" />
                  <Bar dataKey="expenses" fill="#F44336" name="Expenses" />
                  <Bar dataKey="profit" fill="#2196F3" name="Profit" />
                </>
              ) : (
                <Bar 
                  dataKey="value" 
                  fill={activeTab === 'revenue' ? '#4CAF50' : '#F44336'} 
                  name={activeTab === 'revenue' ? 'Revenue' : 'Expenses'}
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {activeTab === 'overview' ? (
                <>
                  <Line type="monotone" dataKey="revenue" stroke="#4CAF50" name="Revenue" />
                  <Line type="monotone" dataKey="expenses" stroke="#F44336" name="Expenses" />
                  <Line type="monotone" dataKey="profit" stroke="#2196F3" name="Profit" />
                </>
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={activeTab === 'revenue' ? '#4CAF50' : '#F44336'} 
                  name={activeTab === 'revenue' ? 'Revenue' : 'Expenses'}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={150}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const calculateTotals = () => {
    if (!data || data.length === 0) return { revenue: 0, expenses: 0, profit: 0 };

    const totals = data.reduce(
      (acc, curr) => {
        acc.revenue += curr.revenue || 0;
        acc.expenses += curr.expenses || 0;
        return acc;
      },
      { revenue: 0, expenses: 0 }
    );

    return {
      revenue: totals.revenue,
      expenses: totals.expenses,
      profit: totals.revenue - totals.expenses
    };
  };

  const totals = calculateTotals();

  return (
    <div className="finance-container">
      <div className="finance-header">
        <MoneyIcon className="header-icon" />
        <h2>Financial Overview</h2>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card revenue-card">
          <div className="card-header">
            <RevenueIcon className="card-icon" />
            <h3>Total Revenue</h3>
          </div>
          <div className="card-value">${totals.revenue.toLocaleString()}</div>
        </div>
        
        <div className="summary-card expense-card">
          <div className="card-header">
            <ExpenseIcon className="card-icon" />
            <h3>Total Expenses</h3>
          </div>
          <div className="card-value">${totals.expenses.toLocaleString()}</div>
        </div>
        
        <div className={`summary-card ${totals.profit >= 0 ? 'profit-card' : 'loss-card'}`}>
          <h3>Net Profit</h3>
          <div className={`card-value ${totals.profit >= 0 ? 'positive' : 'negative'}`}>
            ${totals.profit.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-grid">
        <div className="control-group">
          <label>Time Range</label>
          <select 
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
        
        <div className="control-group">
          <label>Chart Type</label>
          <select 
            value={chartType} 
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">
              <BarChartIcon /> Bar Chart
            </option>
            <option value="line">
              <LineChartIcon /> Line Chart
            </option>
            <option value="pie">
              <PieChartIcon /> Pie Chart
            </option>
          </select>
        </div>
        
        <div className="tab-controls">
          <button 
            className={`tab-button ${activeTab === 'revenue' ? 'active' : ''}`}
            onClick={() => setActiveTab('revenue')}
          >
            <RevenueIcon className="tab-icon" />
            Revenue
          </button>
          <button 
            className={`tab-button ${activeTab === 'expenses' ? 'active' : ''}`}
            onClick={() => setActiveTab('expenses')}
          >
            <ExpenseIcon className="tab-icon" />
            Expenses
          </button>
          <button 
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <MoneyIcon className="tab-icon" />
            Overview
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="chart-container">
        {renderChart()}
      </div>

      {/* Data Table */}
      {!loading && data.length > 0 && (
        <div className="data-table-container">
          <h3>Detailed Financial Data</h3>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Period</th>
                  <th>Revenue</th>
                  <th>Expenses</th>
                  <th>Profit</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.period}>
                    <td>{row.period}</td>
                    <td>${row.revenue.toLocaleString()}</td>
                    <td>${row.expenses.toLocaleString()}</td>
                    <td className={row.revenue - row.expenses >= 0 ? 'positive' : 'negative'}>
                      ${(row.revenue - row.expenses).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceChart;