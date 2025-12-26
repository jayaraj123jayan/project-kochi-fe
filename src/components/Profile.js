import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { Typography, Box, Paper, Rating } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';


const Profile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const fetchProfile = async () => {
      const response = await axios.get(`${API_BASE_URL}/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(response.data);
    }
    fetchProfile();
  }, [user, token]);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6">Profile Information</Typography>
      <Box sx={{ mt: 2 }}>
        <Typography><strong>Email:</strong> {user.email}</Typography>
        <Typography><strong>Username:</strong> {user.username}</Typography>
        <Typography><strong>Goal:</strong> {user.goal}</Typography>
      </Box>
      {user.role === 'trainer' && profile && <Box>
        <Typography><strong>Bio:</strong> {profile.bio}</Typography>
        <Typography><strong>Experience:</strong> {profile.experience_years} years</Typography>
        <Typography><strong>Specializations:</strong> {profile.specializations}</Typography>
        <Typography><strong>Price per session:</strong> ${profile.price_per_session}</Typography>
        <Typography><strong>Availability:</strong> {profile.availability}</Typography>
        <Typography variant="body2">{profile.bio}</Typography>
        <Typography variant="body2">Followers: {profile.followers_count}</Typography>
        <Rating value={parseFloat(profile.average_rating) || 0} readOnly size="small" />
        <Typography variant="body2">${profile.price_per_session}/session</Typography>
      </Box>}
    </Paper>
  );
};

export default Profile;