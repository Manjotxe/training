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
  const [currentYearData, setCurrentYearData] = useState(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/attendance');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const result = await response.json();
        
        const formattedData = [...(view === 'monthly' ? result.monthlyData : result.yearlyData)]
          .sort((a, b) => a.name.localeCompare(b.name));

        setData(formattedData);
        const currentData = result.currentYearData || null;
        setCurrentYearData(currentData);

        // Store the currentYearData in localStorage
        if (currentData) {
          localStorage.setItem('currentYearData', JSON.stringify(currentData));
        }
      } catch (error) {
        setError(error.message);
      } finally {
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

  const getChartType = () => chartType !== 'default' ? chartType : (view === 'monthly' ? 'bar' : 'line');

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;

  const renderChart = () => {
    const type = getChartType();

    const commonProps = {
      data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Bar dataKey="present" name="Present" fill="#0e7490" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="present" name="Present" stroke="#0e7490" strokeWidth={2} />
              <Line type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="present" name="Present" stroke="#0e7490" fill="#0e7490" fillOpacity={0.3} />
              <Area type="monotone" dataKey="absent" name="Absent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <motion.div 
      variants={chartVariants} 
      initial="hidden" 
      animate="visible" 
      style={{ width: '100%', height: '100%' }}
    >
      {renderChart()}
    </motion.div>
  );
};

export default AttendanceChart;
