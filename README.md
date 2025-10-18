# VedWeb

A real-time video conferencing application built with React and Socket.IO that enables peer-to-peer video calls, screen sharing, and text chat.

## Features

- 🎥 **Video Conferencing**: Real-time peer-to-peer video calling using WebRTC
- 💬 **Live Chat**: Text messaging within video rooms
- 🖥️ **Screen Sharing**: Share your screen with other participants
- 🔇 **Audio Controls**: Mute/unmute your microphone
- 📹 **Video Controls**: Turn your camera on/off
- 🔗 **Room-based**: Join meetings using unique room IDs

## Tech Stack

### Frontend
- **React** 19.2.0
- **React Router DOM** 7.9.4 - Client-side routing
- **Socket.IO Client** 4.8.1 - Real-time communication
- **WebRTC** - Peer-to-peer video/audio streaming
- **UUID** 13.0.0 - Unique identifier generation

### Backend
- **Node.js** with Express 5.1.0
- **Socket.IO** 4.8.1 - WebSocket server
- **HTTP** - Server creation

## Project Structure

```
VedWeb/
├── Client/
│   └── client/
│       ├── public/
│       │   ├── index.html
│       │   ├── manifest.json
│       │   └── robots.txt
│       ├── src/
│       │   ├── components/
│       │   │   ├── ChatWindow.js
│       │   │   ├── HomePage.js
│       │   │   ├── MeetingPage.js
│       │   │   └── MeetingPage.css
│       │   ├── App.js
│       │   ├── App.css
│       │   ├── index.js
│       │   └── index.css
│       └── package.json
└── Server/
    ├── index.js
    ├── package.json
    └── .gitignore
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Clone the Repository
```bash
git clone https://github.com/yashsinghal14/VedWeb.git
cd VedWeb
```

### Install Server Dependencies
```bash
cd Server
npm install
```

### Install Client Dependencies
```bash
cd ../Client/client
npm install
```

## Running the Application

### Start the Server
```bash
cd Server
node index.js
```
The server will run on `http://localhost:5000` (or the port specified in your environment)

### Start the Client
Open a new terminal window:
```bash
cd Client/client
npm start
```
The client will run on `http://localhost:3000` and automatically open in your browser

## Usage

1. **Start a Meeting**: 
   - Open the application in your browser
   - Enter a room name or use the generated room ID
   - Click "Join Meeting"

2. **Invite Others**:
   - Share the room ID/URL with participants
   - They can join by entering the same room ID

3. **During the Meeting**:
   - Toggle microphone using the mute button
   - Toggle camera using the video button
   - Share your screen using the share screen button
   - Send text messages using the chat panel

## Configuration

### Server Configuration
The server runs on port 5000 by default. To change this, set the `PORT` environment variable:
```bash
# Windows PowerShell
$env:PORT=3001; node index.js

# Linux/Mac
PORT=3001 node index.js
```

### CORS Settings
By default, the server allows connections from any origin. To restrict this in production, modify the CORS settings in `Server/index.js`:
```javascript
const io = new Server(server, {
    cors: {
        origin: "https://your-production-domain.com",
        methods: ["GET", "POST"]
    }
});
```

### Client Socket Connection
Update the socket connection URL in `Client/client/src/components/MeetingPage.js`:
```javascript
socketRef.current = io.connect("http://localhost:5000");
```

## Development

### Available Scripts

#### Client
- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

#### Server
- `node index.js` - Starts the server
- `npm test` - Placeholder for tests

## Deployment

### Deploy Server
The server can be deployed to platforms like:
- Render
- Heroku
- AWS EC2
- DigitalOcean

Ensure you set the appropriate environment variables and update CORS settings.

### Deploy Client
The React client can be deployed to:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

Build the production version:
```bash
cd Client/client
npm run build
```

## Known Issues & Typos

- Line 10 in `Server/index.js`: `methids` should be `methods`
- Line 27 in `Server/index.js`: `tareget` should be `target`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

Yash Singhal ([@yashsinghal14](https://github.com/yashsinghal14))

## Acknowledgments

- WebRTC for peer-to-peer communication
- Socket.IO for real-time bidirectional communication
- React team for the amazing framework
