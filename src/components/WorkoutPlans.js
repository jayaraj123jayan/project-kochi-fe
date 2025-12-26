import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { Typography, Box, Paper, Button, TextField, List, ListItem, ListItemText, ListItemAvatar, Avatar, Rating, Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const WorkoutPlans = ({ setTabValue, setSelectedTrainerForChat }) => {
  const { user, token } = useAuth();
  const [step, setStep] = useState('loading');
  const [profile, setProfile] = useState({});
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [plan, setPlan] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [assignedTrainer, setAssignedTrainer] = useState(null);
  const [assignedPlan, setAssignedPlan] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
        if (!response.data.height || !response.data.weight || !response.data.goal) {
          setStep('profile');
        } else if (response.data.assignedTrainerId) {
          // Fetch assigned trainer
          try {
            const trainerResponse = await axios.get(`/trainer`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAssignedTrainer(trainerResponse.data);
            // Fetch assigned plan
            const planResponse = await axios.get(`/workouts`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            setAssignedPlan(planResponse.data);
            setStep('assigned_trainer');
          } catch (err) {
            console.error('Failed to fetch assigned trainer:', err);
            setStep('trainer_choice');
          }
        } else {
          setStep('trainer_choice');
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleSaveProfile = async () => {
    try {
      await axios.put(`/profile`, { goal, height: parseFloat(height), weight: parseFloat(weight) }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile({ ...profile, goal, height: parseFloat(height), weight: parseFloat(weight) });
      setStep('trainer_choice');
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleAssignTrainer = async () => {
    if (!selectedTrainer) return;
    try {
      await axios.post(`/trainer`, { trainerId: selectedTrainer.id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConfirmDialog(false);
      // Perhaps show success and go back or to profile
      alert('Trainer assigned successfully!');
      setStep('trainer_choice');
    } catch (err) {
      console.error('Failed to assign trainer:', err);
      alert('Failed to assign trainer');
    }
  };

  const handleTrainerChoice = async (wantsTrainer) => {
    if (wantsTrainer) {
      try {
        const response = await axios.get(`/trainers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTrainers(response.data);
        setStep('trainers');
      } catch (err) {
        console.error('Failed to fetch trainers:', err);
      }
    } else {
      // Fetch plan from API
      try {
        const response = await axios.get(`/workout-plans?goal=${goal}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPlan(response.data);
        // Save to DB
        await axios.put(`/workouts`, { plans: response.data }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStep('plan');
      } catch (err) {
        console.error('Failed to fetch plan:', err);
      }
    }
  };


  if (step === 'loading') {
    return <Typography>Loading...</Typography>;
  }

  if (step === 'profile') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Complete Your Profile</Typography>
        <TextField
          label="Height (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
        <TextField
          label="Weight (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          fullWidth
          margin="normal"
          type="number"
        />
        <TextField
          label="Goal"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          fullWidth
          margin="normal"
          select
          SelectProps={{ native: true }}
        >
          <option value="">Select Goal</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Muscle Gain">Muscle Gain</option>
          <option value="General Fitness">General Fitness</option>
        </TextField>
        <Button variant="contained" onClick={handleSaveProfile} sx={{ mt: 2 }}>
          Save and Continue
        </Button>
      </Box>
    );
  }

  if (step === 'trainer_choice') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Do you want a personal trainer?</Typography>
        <Button variant="contained" onClick={() => handleTrainerChoice(false)} sx={{ mr: 2 }}>
          No, generate a plan for me
        </Button>
        <Button variant="outlined" onClick={() => handleTrainerChoice(true)}>
          Yes, show me trainers
        </Button>
      </Box>
    );
  }

  if (step === 'plan') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Your Workout Plan</Typography>
        <List>
          {plan.map((item, index) => (
            <ListItem key={index}>
              <ListItemText primary={item.day} secondary={item.exercises} />
            </ListItem>
          ))}
        </List>
        <Button onClick={() => setStep('trainer_choice')}>Back</Button>
      </Box>
    );
  }

  if (step === 'assigned_trainer') {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Your Assigned Trainer</Typography>
        {assignedTrainer && (
          <Box>
            <Typography><strong>Name:</strong> {assignedTrainer.username}</Typography>
            <Typography><strong>Bio:</strong> {assignedTrainer.bio}</Typography>
            <Typography><strong>Experience:</strong> {assignedTrainer.experience_years} years</Typography>
            <Typography><strong>Specializations:</strong> {assignedTrainer.specializations}</Typography>
            <Typography><strong>Price per session:</strong> ${assignedTrainer.price_per_session}</Typography>
            <Typography><strong>Availability:</strong> {assignedTrainer.availability}</Typography>
            <Button onClick={() => { setSelectedTrainerForChat(assignedTrainer); setTabValue(3); }} sx={{ mt: 2, mr: 2 }}>
              Chat with Trainer
            </Button>
            <Button onClick={() => setStep('trainer_choice')} sx={{ mt: 2 }}>
              Change Trainer
            </Button>
          </Box>
        )}
        {assignedPlan.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h5" gutterBottom>Your Personalized Workout Plan</Typography>
            <List>
              {assignedPlan.map((item, index) => (
                <ListItem key={index}>
                  <ListItemText primary={item.day} secondary={item.exercises} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Box>
    );
  }

  if (step === 'trainers') {
    const filteredTrainers = trainers.filter(trainer =>
      trainer.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trainer.specializations?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>Choose a Trainer</Typography>
        <TextField
          label="Search Trainers"
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
          {filteredTrainers.map((trainer) => (
            <ListItem key={trainer.id} button onClick={() => { setSelectedTrainer(trainer); setConfirmDialog(true); }}>
              <ListItemAvatar>
                <Avatar>{trainer.username[0]}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={trainer.username}
                secondary={
                  <Box>
                    <Typography variant="body2">{trainer.bio}</Typography>
                    <Typography variant="body2">Followers: {trainer.followers_count}</Typography>
                    <Rating value={parseFloat(trainer.average_rating) || 0} readOnly size="small" />
                    <Typography variant="body2">${trainer.price_per_session}/session</Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
        <Button onClick={() => setStep('trainer_choice')}>Back</Button>
        <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
          <DialogTitle>Confirm Trainer Selection</DialogTitle>
          <DialogContent>
            {selectedTrainer && (
              <Typography>
                Are you sure you want to select {selectedTrainer.username} as your trainer? 
                Price: ${selectedTrainer.price_per_session}/session
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
            <Button onClick={handleAssignTrainer} variant="contained">Confirm</Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return null;
};

export default WorkoutPlans;