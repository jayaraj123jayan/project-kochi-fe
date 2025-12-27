import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Button, Box, Tabs, Tab, Paper, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, AppBar, Toolbar } from '@mui/material';
import axios from 'axios';
import { API_BASE_URL } from '../constants/api';
import HamburgerMenu from './HamburgerMenu';

const AdminDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const [tenants, setTenants] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tenantFilter, setTenantFilter] = useState('');
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [openTenantDialog, setOpenTenantDialog] = useState(false);
  const [openUserDialog, setOpenUserDialog] = useState(false);
  const [tenantName, setTenantName] = useState('');
  const [userForm, setUserForm] = useState({ email: '', password: '', username: '', role: 'customer', tenantId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('adminToken');
  const user = useMemo(() => JSON.parse(localStorage.getItem('adminUser') || '{}'), []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchTenants();
      fetchAllUsers();
    } else if (user && user.role === 'tenant_admin') {
      fetchUsers(user.tenantId);
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      if (tenantFilter) {
        allUsers && Array.isArray(allUsers) && setFilteredUsers(allUsers.filter(u => u.tenantId == tenantFilter));
      } else {
        allUsers && Array.isArray(allUsers) && setFilteredUsers(allUsers);
      }
    }
  }, [tenantFilter, allUsers, user]);

  const fetchTenants = async () => {
    try {
      const response = await axios.get(`/admin/tenants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTenants(response.data);
    } catch (err) {
      setError('Failed to fetch tenants');
    }
  };

  const fetchUsers = async (tenantId) => {
    try {
      const response = await axios.get(`/admin/users/${tenantId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(`/admin/all-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      response.data && Array.isArray(response.data) && setAllUsers(response.data);
      response.data && Array.isArray(response.data) && setFilteredUsers(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    }
  };

  const handleCreateTenant = async () => {
    setLoading(true);
    try {
      await axios.post(`/admin/tenants`, { name: tenantName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenTenantDialog(false);
      setTenantName('');
      fetchTenants();
    } catch (err) {
      setError('Failed to create tenant');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const tenantId = user.role === 'admin' ? userForm.tenantId : user.tenantId;
      await axios.post(`/admin/users`, { ...userForm, tenantId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOpenUserDialog(false);
      setUserForm({ email: '', password: '', username: '', role: 'customer', tenantId: '' });
      if (user.role === 'admin') {
        fetchAllUsers();
      } else {
        fetchUsers(user.tenantId);
      }
    } catch (err) {
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <AppBar position="static">
        <Toolbar>
          <HamburgerMenu onTabChange={handleTabChange} currentTab={tabValue} tabs={[]}/>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 4, mb: 2 }}>
        <Typography variant="h4">Admin Dashboard</Typography>
        <Typography>Welcome, {user.username} ({user.role})</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs">
        {user.role === 'admin' && <Tab label="Tenants" />}
        <Tab label="Users" />
      </Tabs>
      <Box sx={{ mt: 2 }}>
        {tabValue === 0 && user.role === 'admin' && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Tenants</Typography>
              <Button variant="outlined" onClick={fetchTenants}>Refresh</Button>
            </Box>
            <List>
              {tenants.map((tenant) => (
                <ListItem key={tenant.id}>
                  <ListItemText primary={tenant.name} />
                  <Button onClick={() => { setSelectedTenant(tenant.id); fetchUsers(tenant.id); setTabValue(1); }}>Manage Users</Button>
                </ListItem>
              ))}
            </List>
            <Button variant="contained" onClick={() => setOpenTenantDialog(true)}>Create Tenant</Button>
          </Paper>
        )}
        {tabValue === (user.role === 'admin' ? 1 : 0) && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Users</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {user.role === 'admin' && (
                  <TextField
                    select
                    label="Filter by Tenant"
                    value={tenantFilter}
                    onChange={(e) => setTenantFilter(e.target.value)}
                    size="small"
                    sx={{ minWidth: 150 }}
                    SelectProps={{ native: true }}
                  >
                    <option value="">All Tenants</option>
                    {tenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                    ))}
                  </TextField>
                )}
                <Button variant="outlined" onClick={() => user.role === 'admin' ? fetchAllUsers() : fetchUsers(user.tenantId)}>Refresh</Button>
              </Box>
            </Box>
            <List>
              {(user.role === 'admin' ? filteredUsers : users).map((u) => (
                <ListItem key={u.id}>
                  <ListItemText primary={`${u.username} (${u.email}) - ${u.role}${u.tenantId ? ` - Tenant: ${tenants.find(t => t.id === u.tenantId)?.name || u.tenantId}` : ''}`} />
                </ListItem>
              ))}
            </List>
            <Button variant="contained" onClick={() => setOpenUserDialog(true)}>Create User</Button>
          </Paper>
        )}
      </Box>

      {/* Create Tenant Dialog */}
      <Dialog open={openTenantDialog} onClose={() => setOpenTenantDialog(false)}>
        <DialogTitle>Create Tenant</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Tenant Name"
            fullWidth
            variant="standard"
            value={tenantName}
            onChange={(e) => setTenantName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTenantDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateTenant} disabled={loading}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Create User Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)}>
        <DialogTitle>Create User</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={userForm.email}
            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={userForm.password}
            onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Username"
            fullWidth
            value={userForm.username}
            onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Role"
            select
            fullWidth
            value={userForm.role}
            onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="customer">Customer</option>
            <option value="trainer">Trainer</option>
            {user.role === 'admin' && <option value="tenant_admin">Tenant Admin</option>}
          </TextField>
          {user.role === 'admin' && (
            <TextField
              margin="dense"
              label="Tenant"
              select
              fullWidth
              value={userForm.tenantId}
              onChange={(e) => setUserForm({ ...userForm, tenantId: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">Select Tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
              ))}
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUserDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateUser} disabled={loading}>Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;