import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Typography, Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const TraineesList = ({ setTabValue, setSelectedTrainerForChat }) => {
  const { user, token } = useAuth();
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [planDialog, setPlanDialog] = useState(false);
  const [currentPlan, setCurrentPlan] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTrainees = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/trainer/trainees`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        response && Array.isArray(response.data) && setTrainees(response.data);
      } catch (err) {
        console.error('Failed to fetch trainees:', err);
      }
    };
    if (token) fetchTrainees();
  }, [token]);

  const handleUpdatePlan = async (trainee) => {
    setSelectedTrainee(trainee);
    try {
      const response = await axios.get(`${API_BASE_URL}/trainer/workouts/${trainee.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPlan(response.data);
    } catch (err) {
      console.error('Failed to fetch plan:', err);
      setCurrentPlan([]); // Default empty
    }
    setPlanDialog(true);
  };

  const handleSavePlan = async () => {
    try {
      await axios.put(`${API_BASE_URL}/trainer/workouts/${selectedTrainee.id}`, { plans: currentPlan }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlanDialog(false);
      alert('Plan updated successfully');
    } catch (err) {
      console.error('Failed to update plan:', err);
      alert('Failed to update plan');
    }
  };

  const handlePlanChange = (index, field, value) => {
    const newPlan = [...currentPlan];
    newPlan[index] = { ...newPlan[index], [field]: value };
    setCurrentPlan(newPlan);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Your Trainees</Typography>
      <TextField
        label="Search Trainees"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        fullWidth
        margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      <List>
        {trainees.filter(trainee =>
          trainee.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
          trainee.email.toLowerCase().includes(searchQuery.toLowerCase())
        ).map((trainee) => (
          <ListItem key={trainee.id}>
            <ListItemAvatar>
              <Avatar>{trainee.username[0]}</Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={trainee.username}
              secondary={trainee.email}
            />
            <Button onClick={() => { setSelectedTrainerForChat(trainee); setTabValue(2); }} sx={{ mr: 1 }}>
              Chat
            </Button>
            <Button onClick={() => handleUpdatePlan(trainee)}>
              Update Plan
            </Button>
          </ListItem>
        ))}
      </List>
      <Dialog open={planDialog} onClose={() => setPlanDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Update Workout Plan for {selectedTrainee?.username}</DialogTitle>
        <DialogContent>
          {currentPlan.map((item, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <TextField
                select
                label="Day"
                value={item.day || ''}
                onChange={(e) => handlePlanChange(index, 'day', e.target.value)}
                fullWidth
                margin="normal"
              >
                <MenuItem value="Monday">Monday</MenuItem>
                <MenuItem value="Tuesday">Tuesday</MenuItem>
                <MenuItem value="Wednesday">Wednesday</MenuItem>
                <MenuItem value="Thursday">Thursday</MenuItem>
                <MenuItem value="Friday">Friday</MenuItem>
                <MenuItem value="Saturday">Saturday</MenuItem>
                <MenuItem value="Sunday">Sunday</MenuItem>
              </TextField>
              <TextField
                label="Exercises"
                value={item.exercises || ''}
                onChange={(e) => handlePlanChange(index, 'exercises', e.target.value)}
                fullWidth
                margin="normal"
                multiline
                placeholder="e.g., Cardio 30 min, Squats 3x10"
              />
            </Box>
          ))}
          <Button onClick={() => setCurrentPlan([...currentPlan, { day: '', exercises: '' }])}>
            Add Day
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialog(false)}>Cancel</Button>
          <Button onClick={handleSavePlan} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TraineesList;