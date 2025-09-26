# YouTube Music Server

A simple Express.js API server for searching YouTube music and retrieving stream URLs.

## Features

- **YouTube Music Search**: Search for music videos on YouTube using Puppeteer for web scraping
- **Stream URL Retrieval**: Get YouTube video URLs for playback
- **RESTful API**: Clean endpoints for search and stream operations
- **Health Check**: Endpoint to verify server status
- **Vercel Deployment Ready**: Configured for easy deployment to Vercel

## API Endpoints

### GET /api/search
Search for music videos on YouTube.

**Query Parameters:**
- `q` (required): Search query string
- `max` (optional): Maximum number of results (default: 10)

**Example:**
```
GET /api/search?q=lofi%20hip%20hop&max=5
```

**Response:**
```json
[
  {
    "videoId": "dQw4w9WgXcQ",
    "title": "Song Title",
    "channelTitle": "Artist Name",
    "description": ""
  }
]
```

### GET /api/stream/:videoId
Get the YouTube URL for a specific video.

**Parameters:**
- `videoId`: YouTube video ID

**Example:**
```
GET /api/stream/dQw4w9WgXcQ
```

**Response:**
```json
{
  "videoId": "dQw4w9WgXcQ",
  "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "note": "Use this URL for playback. Direct stream extraction is not supported due to YouTube restrictions."
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "YouTube Music API"
}
```

## Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Build
```bash
npm run build
```

### Development Server
```bash
npm run watch
```

### Local Development
```bash
node build/index.js
```

The server will run on `http://localhost:3001` by default, or the port specified in `PORT` environment variable.

## Deployment

### Vercel
This project is configured for Vercel deployment. Simply connect your repository to Vercel and deploy.

The `vercel.json` file handles the configuration for serverless functions.

## Dependencies

- **@distube/ytdl-core**: YouTube downloader (not currently used in main functionality)
- **express**: Web framework
- **puppeteer**: Headless browser for YouTube scraping
- **cors**: Cross-origin resource sharing
- **googleapis**: Google APIs (not currently used)

## Notes

- This server uses Puppeteer to scrape YouTube search results, which may be subject to YouTube's terms of service.
- Direct stream extraction is not implemented due to YouTube restrictions. The API provides YouTube URLs for client-side playback.
- For production use, consider implementing proper error handling and rate limiting.
