import React from 'react';
import { useAuth } from '../AuthContext';
import { Container, Typography, Box, AppBar, Toolbar } from '@mui/material';
import Profile from './Profile';
import WorkoutPlans from './WorkoutPlans';
import Chat from './Chat';
import TraineesList from './TraineesList';
import HamburgerMenu from './HamburgerMenu';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';

const TenantPage = () => {
  const { user, token } = useAuth();
  const isTrainer = user?.role === 'trainer';
  const tabs = isTrainer ? ['Your Trainees', 'Profile', 'Chat'] : ['Profile', 'Workout Plans', 'Chat'];
  const [tabValue, setTabValue] = React.useState(isTrainer ? 0 : 1); // Default to Trainees for trainer, Workout Plans for user
  const [tenantName, setTenantName] = React.useState('Kochi Fitness');
  const [selectedTrainerForChat, setSelectedTrainerForChat] = React.useState(null);

  React.useEffect(() => {
    if (user?.tenantId && token) {
      axios.get(`/tenant`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        setTenantName(response.data.name);
      })
      .catch(err => console.error('Failed to fetch tenant name:', err));
    }
  }, [user, token]);

  const handleTabChange = (newValue) => {
    setTabValue(newValue);
  };

  const renderContent = () => {
    if (isTrainer) {
      switch (tabValue) {
        case 0:
          return <TraineesList setTabValue={setTabValue} setSelectedTrainerForChat={setSelectedTrainerForChat} />;
        case 1:
          return <Profile />;
        case 2:
          return <Chat selectedTrainer={selectedTrainerForChat} />;
        default:
          return <TraineesList setTabValue={setTabValue} setSelectedTrainerForChat={setSelectedTrainerForChat} />;
      }
    } else {
      switch (tabValue) {
        case 0:
          return <Profile />;
        case 1:
          return <WorkoutPlans setTabValue={setTabValue} setSelectedTrainerForChat={setSelectedTrainerForChat} />;
        case 2:
          return <Chat selectedTrainer={selectedTrainerForChat} />;
        default:
          return <WorkoutPlans setTabValue={setTabValue} setSelectedTrainerForChat={setSelectedTrainerForChat} />;
      }
    }
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static">
        <Toolbar>
          <HamburgerMenu onTabChange={handleTabChange} currentTab={tabValue} tabs={tabs} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {tenantName}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 2 }}>
        {renderContent()}
      </Box>
    </Container>
  );
};

export default TenantPage;