#!/usr/bin/env node
import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer';

interface SearchResult {
  videoId: string;
  title: string;
  channelTitle: string;
  description: string;
}

class YouTubeMusicAPI {
  private async searchYouTube(query: string, maxResults: number = 10): Promise<SearchResult[]> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();

      // Set user agent to avoid bot detection
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query + ' music')}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Wait for video results to load
      await page.waitForSelector('ytd-video-renderer', { timeout: 10000 });

      const results = await page.evaluate((maxResults) => {
        const videos = Array.from(document.querySelectorAll('ytd-video-renderer')).slice(0, maxResults);
        return videos.map(video => {
          const titleEl = video.querySelector('#video-title');
          const channelEl = video.querySelector('#channel-name #text');
          const href = titleEl?.getAttribute('href') || '';
          const videoId = href.split('v=')[1]?.split('&')[0] || '';

          return {
            videoId: videoId,
            title: titleEl?.textContent?.trim() || '',
            channelTitle: channelEl?.textContent?.trim() || '',
            description: '', // Description not easily available in search results
          };
        });
      }, maxResults);

      return results;
    } catch (error) {
      console.error('Search error:', error);
      throw new Error('Failed to search YouTube');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  private getStreamUrl(videoId: string): { videoId: string; url: string; note: string } {
    if (!videoId) {
      throw new Error('Invalid video ID');
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;
    return {
      videoId: videoId,
      url: url,
      note: 'Use this URL for playback. Direct stream extraction is not supported due to YouTube restrictions.',
    };
  }

  createApp(): express.Express {
    const app = express();
    app.use(cors());
    app.use(express.json());

    const api = this;

    // Search endpoint
    app.get('/api/search', async (req, res) => {
      try {
        const query = req.query.q as string;
        const maxResults = parseInt(req.query.max as string) || 10;

        if (!query) {
          return res.status(400).json({ error: 'Query parameter required' });
        }

        const results = await api.searchYouTube(query, maxResults);
        res.json(results);
      } catch (error) {
        res.status(500).json({ error: 'Search failed' });
      }
    });

    // Stream URL endpoint
    app.get('/api/stream/:videoId', (req, res) => {
      try {
        const videoId = req.params.videoId;
        const result = api.getStreamUrl(videoId);
        res.json(result);
      } catch (error) {
        res.status(400).json({ error: 'Invalid video ID' });
      }
    });

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'YouTube Music API' });
    });

    return app;
  }
}

// For Vercel deployment
const api = new YouTubeMusicAPI();
const app = api.createApp();

export default app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 3001;
  app.listen(port, () => {
    console.log(`YouTube Music API running on port ${port}`);
  });
}
