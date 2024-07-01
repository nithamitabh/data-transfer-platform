const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Ensure the "uploads" directory exists
if (!fs.existsSync('uploads')){
    fs.mkdirSync('uploads');
}

// Handle incoming socket connections
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendText', (data) => {
    io.emit('receiveText', data);
  });

  socket.on('sendFile', (data) => {
    const { fileName, fileContent } = data;
    const filePath = path.join(__dirname, 'uploads', fileName);
    fs.writeFile(filePath, fileContent, 'base64', (err) => {
      if (err) throw err;
      io.emit('receiveFile', { fileName, filePath: `/uploads/${fileName}` });
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
