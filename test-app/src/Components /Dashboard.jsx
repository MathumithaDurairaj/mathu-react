import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Table, Select, Card } from 'antd';
import { format } from 'date-fns';
import './Dashboard.css';
import { DashboradTable } from './DashboardTable';
const API_URL = 'https://fakestoreapi.com/products';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cachedData = localStorage.getItem('products');
        if (cachedData) {
          const parsedData = JSON.parse(cachedData);
          setData(parsedData);
          setFilteredData(parsedData);
        } else {
          const res = await fetch(API_URL);
          const result = await res.json();
          localStorage.setItem('products', JSON.stringify(result));
          setData(result);
          setFilteredData(result);
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...data];

    if (category !== 'all') {
      filtered = filtered.filter(item => item.category === category);
    }

    // Date filtering skipped as mock data lacks date info

    setFilteredData(filtered);
  }, [category, startDate, endDate, data]);

  const categories = [...new Set(data.map(item => item.category))];

  const summary = {
    totalProducts: filteredData.length,
    averagePrice: filteredData.reduce((acc, item) => acc + item.price, 0) / (filteredData.length || 1),
    averageRating: filteredData.reduce((acc, item) => acc + item.rating.rate, 0) / (filteredData.length || 1),
  };

  return (
    <div className="p-4">
      <div className="flex justify-between gap-8">
        <Card className="bg-white rounded shadow p-4 border border-solid border-[#bfbdba] w-[33%]">
          <p className="text-lg font-semibold">Total Products</p>
          <p>{summary.totalProducts}</p>
        </Card>
        <Card className="bg-white rounded shadow p-4 border border-solid border-[#bfbdba] w-[33%]">
          <p className="text-lg font-semibold">Average Price</p>
          <p>${summary.averagePrice.toFixed(2)}</p>
        </Card>
        <Card className="bg-white rounded shadow p-4 border border-solid border-[#bfbdba] w-[33%]">
          <p className="text-lg font-semibold">Average Rating</p>
          <p>{summary.averageRating.toFixed(1)}</p>
        </Card>
      </div>

      <div className='flex justify-end align-center gap-8 mt-4 mb-4'>
        <div className='mr-4'>
          <label className="text-sm font-medium">Category: {' '}</label>
          <Select
            value={category}
            onChange={value => setCategory(value)}
            options={[
              { value: 'all', label: 'All' },
              ...categories.map(cat => ({
                value: cat,
                label: cat
              }))
            ]}
            className='w-[150px]'
          />
        </div>
        <div className='mr-4'>
          <label className="text-sm font-medium">Start Date: {' '}</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        </div>
        <div className='mr-4'>
          <label className="text-sm font-medium">End Date: {' '}</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Price Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="title" hide />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="overflow-auto mt-4">
        <DashboradTable categories={categories} filteredData={filteredData} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;
