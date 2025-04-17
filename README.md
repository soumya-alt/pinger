# URL Pinger

A simple web application that pings a URL every minute and displays the logs. Built with HTML, CSS, and JavaScript.

## Features

- Automatically pings https://discord-welcome-bot-4ssw.onrender.com/ every minute
- Real-time status updates
- Response time measurement
- Error logging
- Clean, modern interface
- Mobile-responsive design
- **Background pinging** - continues to ping even when the browser tab is closed (as long as the browser is running)
- Persistent logs using IndexedDB
- Progressive Web App (PWA) support

## How Background Pinging Works

This application uses Service Workers to continue pinging URLs even when the browser tab is closed. The Service Worker runs in the background and:

1. Stores ping results in IndexedDB for persistence
2. Continues pinging at the specified interval
3. Updates the UI when the tab is reopened
4. Works across browser sessions (as long as the browser is running)

**Note:** Due to browser security restrictions, background pinging will stop if:
- The browser is completely closed
- The system goes to sleep
- The browser terminates the Service Worker due to inactivity

## Deployment to Vercel

1. Create a Vercel account if you don't have one
2. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```
3. Deploy using one of these methods:

   **Method 1: Using Vercel Dashboard**
   - Push your code to a GitHub repository
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your repository
   - Deploy

   **Method 2: Using Vercel CLI**
   ```bash
   vercel
   ```

## Usage

1. The application automatically starts pinging https://discord-welcome-bot-4ssw.onrender.com/ when loaded
2. View the logs in real-time
3. Click "Stop Pinging" to stop the process
4. **For best background pinging experience:**
   - Install the app as a PWA (click the install prompt when available)
   - Keep your browser running
   - The app will continue pinging even when the tab is closed

## Note

Due to CORS restrictions, some URLs might not be accessible for pinging. The application uses the `no-cors` mode to handle this limitation. 