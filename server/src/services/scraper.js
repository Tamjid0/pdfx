import puppeteer from "puppeteer";
import logger from "../utils/logger.js";

export async function scrapeHtml(url) {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();

  try {
    // ⭐ Fake a real browser – avoids Cloudflare detection
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36"
    );

    await page.setViewport({ width: 1400, height: 900 });

    await page.setExtraHTTPHeaders({
      "accept-language": "en-US,en;q=0.9",
    });

    // ⭐ Remove headless fingerprint
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    });

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 120000,
    });

    // ⭐ Auto-scroll to load all dynamic content
    await autoScroll(page);

    await page.waitForSelector(".prose, .markdown, article, main", {
      timeout: 120000,
    });


    // ⭐ Extract the BEST relevant rich-text content
    const chatHtml = await page.evaluate(() => {
      const selectors = [".prose", ".markdown", "article", "main", "[role='main']", "[role='document']", "[role='feed']"]; // Added more semantic roles
      let bestElement = null;
      let maxScore = -1;

      document.querySelectorAll(selectors.join(', ')).forEach(el => {
        const text = el.innerText || '';
        // Ignore elements that are likely part of the site's chrome or have very little content
        if (el.closest('header, footer, nav, aside') || text.trim().split(/\s+/).length < 20) { // Added min word count
          return;
        }

        let score = text.length;

        // Boost score for semantic tags and roles
        if (el.tagName === 'ARTICLE' || el.getAttribute('role') === 'article') score *= 2.0; // Increased boost
        if (el.tagName === 'MAIN' || el.getAttribute('role') === 'main') score *= 1.8; // Increased boost
        if (el.getAttribute('role') === 'document') score *= 1.5;
        if (el.getAttribute('role') === 'feed') score *= 1.5;


        // Penalize for containing common unwanted phrases (e.g., legal disclaimers)
        const lowerText = text.toLowerCase();
        if (lowerText.includes('terms and conditions') || lowerText.includes('privacy policy') || lowerText.includes('cookie policy')) {
          score *= 0.1; // Heavy penalty
        }
        if (lowerText.includes('button') || lowerText.includes('attach') || lowerText.includes('search') || lowerText.includes('study') || lowerText.includes('voice')) {
          score *= 0.5; // Moderate penalty for UI words
        }


        if (score > maxScore) {
          maxScore = score;
          bestElement = el;
        }
      });

      return bestElement ? bestElement.outerHTML : '<p>No suitable content found.</p>';
    });

    return chatHtml || "<p>No content found.</p>";
  } catch (err) {
    logger.error(`Scrape error: ${err.message}`);
    throw err;
  } finally {
    await browser.close();
  }
}

// ⭐ Smooth scroll to bottom — required for lazy loading pages
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 300;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight - window.innerHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150);
    });
  });
}
