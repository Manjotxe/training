import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { motion } from 'framer-motion';

const AttendanceChart = ({ view, chartType = 'default' }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/attendance');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        // Selecting correct dataset based on the view prop
        let formattedData = view === 'monthly' ? result.monthlyData : result.yearlyData;
        
        // Sorting data in increasing order of year
        formattedData = formattedData.sort((a, b) => a.year - b.year);
        
        setData(formattedData);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [view]);

  const chartVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, when: "beforeChildren", staggerChildren: 0.1 }
    }
  };

  const getChartType = () => {
    if (chartType !== 'default') {
      return chartType;
    }
    return view === 'monthly' ? 'bar' : 'line';
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const renderChart = () => {
    const type = getChartType();
    
    if (type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Bar dataKey="present" name="Present" fill="#0e7490" radius={[4, 4, 0, 0]} animationDuration={1500} />
            <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} animationDuration={1500} />
          </BarChart>
        </ResponsiveContainer>
      );
    } else if (type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Line type="monotone" dataKey="present" name="Present" stroke="#0e7490" strokeWidth={2} animationDuration={1500} />
            <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} animationDuration={1500} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
            <XAxis dataKey="name" stroke="#666" />
            <YAxis stroke="#666" />
            <Tooltip contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
            <Legend />
            <Area type="monotone" dataKey="present" name="Present" stroke="#0e7490" fill="#0e7490" fillOpacity={0.3} animationDuration={1500} />
            <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} animationDuration={1500} />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <motion.div variants={chartVariants} initial="hidden" animate="visible" style={{ width: '100%', height: '100%' }}>
      {renderChart()}
    </motion.div>
  );
};

export default AttendanceChart;