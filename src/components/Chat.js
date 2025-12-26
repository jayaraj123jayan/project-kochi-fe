import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { Box, Paper, TextField, Button, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Divider, InputAdornment, IconButton, useMediaQuery } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import io from 'socket.io-client';
import { API_BASE_URL } from '../constants/api';
import axios from 'axios';

const Chat = ({ selectedTrainer }) => {
  const { user, token } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagesMap, setMessagesMap] = useState({});
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const messagesEndRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const isMobile = useMediaQuery('(max-width:600px)');

  useEffect(() => {
    if (token) {
      const newSocket = io(API_BASE_URL, {
        auth: { token }
      });
      setSocket(newSocket);

      newSocket.on('receiveMessage', (msg) => {
        if (selectedConversation && msg.conversationId === selectedConversation.id) {
          setMessages((prev) => [...prev, msg]);
        }
        // Update messagesMap
        setMessagesMap(prev => ({
          ...prev,
          [msg.conversationId]: [...(prev[msg.conversationId] || []), msg]
        }));
        // Update conversations list
        fetchConversations();
      });

      return () => {
        newSocket.off('receiveMessage');
        newSocket.disconnect();
      };
    }
  }, [token, selectedConversation]);
  useEffect(() => {fetchConversations();}, [token]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (selectedTrainer && token) {
      // Create or find conversation with the trainer
      const createConversationWithTrainer = async () => {
        try {
          const response = await axios.post(`${API_BASE_URL}/conversations`, {
            participantId: selectedTrainer.userId || selectedTrainer.id
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setSelectedConversation(response.data);
          setMessages(messagesMap[response.data.id] || []);
        } catch (err) {
          console.error('Failed to create conversation:', err);
        }
      };
      createConversationWithTrainer();
    }
  }, [selectedTrainer, token]);

  const fetchConversations = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data);
      // Fetch messages for all conversations
      const newMessagesMap = {};
      for (const conv of response.data) {
        try {
          const msgResponse = await axios.get(`${API_BASE_URL}/conversations/${conv.id}/messages`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          newMessagesMap[conv.id] = msgResponse.data;
        } catch (err) {
          console.error('Failed to fetch messages for conversation:', conv.id, err);
          newMessagesMap[conv.id] = [];
        }
      }
      setMessagesMap(newMessagesMap);
      // Automatically select the most recent conversation if none is selected
      if (!selectedConversation && response.data.length > 0) {
        const mostRecent = response.data[0];
        setSelectedConversation(mostRecent);
        setMessages(newMessagesMap[mostRecent.id] || []);
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!token) return;
    // Check if messages are already in map
    if (messagesMap[conversationId]) {
      setMessages(messagesMap[conversationId]);
      return;
    }
    // Otherwise, fetch
    try {
      const response = await axios.get(`${API_BASE_URL}/conversations/${conversationId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      setMessagesMap(prev => ({ ...prev, [conversationId]: response.data }));
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const handleSearch = async (query) => {
    if (!query || !token) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(`${API_BASE_URL}/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const startConversation = async (participantId) => {
    if (!token) return;
    try {
      const response = await axios.post(`${API_BASE_URL}/conversations`, { participantId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const conversationId = response.data.conversationId;
      fetchConversations();
      // Find the new conversation and select it
      const newConv = conversations.find(c => c.id === conversationId) || { id: conversationId };
      setSelectedConversation(newConv);
      fetchMessages(conversationId);
      setSearchQuery('');
      setSearchResults([]);
      setShowSearch(false);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  const sendMessage = () => {
    if (message.trim() && selectedConversation && token && user && socket) {
      socket.emit('sendMessage', { conversationId: selectedConversation.id, text: message, type: 'text', senderId: user.id });
      setMessage('');
      // Optimistically add to messages and map
      const newMsg = { conversationId: selectedConversation.id, text: message, type: 'text', senderId: user.id, username: user.username, timestamp: new Date() };
      setMessages(prev => [...prev, newMsg]);
      setMessagesMap(prev => ({
        ...prev,
        [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg]
      }));
    }
  };

  const sendFile = () => {
    if (file && selectedConversation && socket) {
      const reader = new FileReader();
      reader.onload = () => {
        socket.emit('sendMessage', { conversationId: selectedConversation.id, text: reader.result, type: 'image', filename: file.name, senderId: user.id });
        // Optimistically add to messages and map
        const newMsg = { conversationId: selectedConversation.id, text: reader.result, type: 'image', filename: file.name, senderId: user.id, username: user.username, timestamp: new Date() };
        setMessages(prev => [...prev, newMsg]);
        setMessagesMap(prev => ({
          ...prev,
          [selectedConversation.id]: [...(prev[selectedConversation.id] || []), newMsg]
        }));
      };
      reader.readAsDataURL(file);
      setFile(null);
    }
  };

  if (!user || !token) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Typography variant="h6">Please log in to access chat</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '70vh' }}>
      {/* Conversations Sidebar - Hidden on mobile when conversation selected */}
      {(!isMobile || !selectedConversation) && (
        <Paper sx={{ width: isMobile ? '100%' : '30%', p: 2, overflowY: 'auto' }}>
          <Typography variant="h6">Chats</Typography>
          {!showSearch && (
            <Button fullWidth variant="outlined" onClick={() => setShowSearch(true)} sx={{ mb: 2 }}>
              New Chat
            </Button>
          )}
          {showSearch && (
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          )}
          {showSearch && searchResults.length > 0 && (
            <List>
              {searchResults.map((u) => (
                <ListItem button key={u.id} onClick={() => startConversation(u.id)}>
                  <ListItemAvatar>
                    <Avatar>{u.username[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={u.username} secondary={u.email} />
                </ListItem>
              ))}
              <Divider sx={{ my: 1 }} />
            </List>
          )}
          {!showSearch && (
            <List>
              {conversations.map((conv) => (
                <ListItem
                  button
                  key={conv.id}
                  selected={selectedConversation?.id === conv.id}
                  onClick={() => handleConversationClick(conv)}
                >
                  <ListItemAvatar>
                    <Avatar>{conv.participants?.split(',')[0][0] || 'U'}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conv.participants}
                    secondary={conv.lastMessage || 'No messages yet'}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      )}

      {/* Messages Area - Full width on mobile */}
      {(!isMobile || selectedConversation) && (
        <Paper sx={{ flex: 1, p: 2, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <>
              {isMobile && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <IconButton onClick={() => setSelectedConversation(null)}>
                    <ArrowBackIcon />
                  </IconButton>
                  <Typography variant="h6" sx={{ ml: 1 }}>{selectedConversation.participants}</Typography>
                </Box>
              )}
              {!isMobile && <Typography variant="h6">{selectedConversation.participants}</Typography>}
              <Box sx={{ flex: 1, overflowY: 'auto', mb: 2 }}>
                <List>
                  {messages.map((msg) => (
                    <ListItem key={msg.id}>
                      <ListItemText
                        primary={
                          <Box>
                            <Typography variant="body2" color="textSecondary">{msg.username}</Typography>
                            {msg.type === 'image' ? (
                              <img src={msg.text} alt={msg.filename} style={{ maxWidth: '200px' }} />
                            ) : (
                              <Typography>{msg.text}</Typography>
                            )}
                          </Box>
                        }
                        secondary={new Date(msg.timestamp).toLocaleString()}
                      />
                    </ListItem>
                  ))}
                </List>
                <div ref={messagesEndRef} />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ display: 'none' }}
                  id="file-input"
                />
                <label htmlFor="file-input">
                  <IconButton component="span">
                    <AttachFileIcon />
                  </IconButton>
                  </label>
                <IconButton onClick={sendMessage} disabled={!message.trim()}>
                  <SendIcon />
                </IconButton>
              </Box>
              {file && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">File: {file.name}</Typography>
                  <Button onClick={sendFile}>Send File</Button>
                  <Button onClick={() => setFile(null)}>Cancel</Button>
                </Box>
              )}
            </>
          ) : (
            !isMobile && (
              <Typography variant="h6" sx={{ textAlign: 'center', mt: 4 }}>
                Select a conversation to start chatting
              </Typography>
            )
          )}
        </Paper>
      )}
    </Box>
  );
};

export default Chat;