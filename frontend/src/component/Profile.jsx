import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { id } = useParams(); // Extract `id` from URL
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch profile data
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/student/${id}`);
        setProfile(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
      }
    };
    fetchProfile();
  }, [id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading...</div>;
  }


  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: '20px' }}>
      <h1>Student Profile</h1>
      <p><strong>Name:</strong> {profile.student_name}</p>
      <p><strong>Date of Birth:</strong> {profile.dob}</p>
      <h2>Course Details</h2>
      <p><strong>Course Name:</strong> {profile.courseName}</p>
      <p><strong>Duration:</strong> {profile.duration} months</p>
      <p><strong>Description:</strong> {profile.languages}</p>
    </div>
  );
};

export default Profile;
