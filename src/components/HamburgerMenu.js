import React, { useState } from 'react';
import { IconButton, Drawer, List, ListItem, ListItemText, Divider, ListItemIcon } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

const HamburgerMenu = ({ onTabChange, currentTab, tabs }) => {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    const loginPath = user?.role === 'admin' || user?.role === 'tenant_admin' ? '/admin/login' : '/login';
    navigate(loginPath);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setOpen(open);
  };

  const handleTabSelect = (tabIndex) => {
    onTabChange(tabIndex);
    setOpen(false);
  };

  const menuItems = tabs.map((label, index) => {
    let icon;
    if (label === 'Profile') icon = <PersonIcon />;
    else if (label === 'Workout Plans' || label === 'Your Workout') icon = <EventNoteIcon />;
    else if (label === 'Chat') icon = <ChatIcon />;
    else if (label === 'Your Trainees') icon = <FitnessCenterIcon />;
    else icon = <PersonIcon />;
    return { label, icon, index };
  });

  return (
    <>
      <IconButton edge="start" color="inherit" onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer anchor="left" open={open} onClose={toggleDrawer(false)}>
        <List sx={{ width: 250 }}>
          <ListItem>
            <ListItemText primary={`Welcome, ${user?.username}`} secondary={user?.role} />
          </ListItem>
          <Divider />
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.index}
              selected={currentTab === item.index}
              onClick={() => handleTabSelect(item.index)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItem>
          ))}
          <Divider />
          <ListItem button onClick={handleLogout}>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default HamburgerMenu;