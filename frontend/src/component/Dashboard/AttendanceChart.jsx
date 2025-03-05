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
        setCurrentYearData(result.currentYearData || null);
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
      <br/>
      {currentYearData && (
 <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
 <div style={{ 
   flex: 1, margin: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', 
   backgroundColor: '#d4edda', textAlign: 'center',
   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
   transition: 'transform 0.3s, box-shadow 0.3s'
 }}
 onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 128, 0, 0.5)'}
 onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'}
 >
   <h4>Present</h4>
   <p>{currentYearData.presentPercent}%</p>
 </div>

 <div style={{ 
   flex: 1, margin: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', 
   backgroundColor: '#f8d7da', textAlign: 'center',
   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
   transition: 'transform 0.3s, box-shadow 0.3s'
 }}
 onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(255, 0, 0, 0.5)'}
 onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'}
 >
   <h4>Absent</h4>
   <p>{currentYearData.absentPercent}%</p>
 </div>

 <div style={{ 
   flex: 1, margin: '10px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', 
   backgroundColor: '#f9f9f9', textAlign: 'center',
   boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
   transition: 'transform 0.3s, box-shadow 0.3s'
 }}
 onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 255, 0.5)'}
 onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)'}
 >
   <h4>Current Year <br/>({currentYearData.name})</h4>
 </div>
</div>

     
      )}
    </motion.div>
  );
};
// Styles for the statistic boxes
const statBoxStyle = {
  flex: 1,
  background: '#fff',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  textAlign: 'center'
};

const statTitleStyle = {
  fontSize: '16px',
  color: '#34495E',
  marginBottom: '10px'
};

const statValueStyle = {
  fontSize: '24px',
  fontWeight: 'bold',
  color: '#2980B9'
};

export default AttendanceChart;
