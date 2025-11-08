import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const screenshotsDir = join(__dirname, '../screenshots');

// Create screenshots directory if it doesn't exist
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

test('test application UI', async () => {
  // Launch browser
  const browser = await chromium.launch({
    headless: false,
    slowMo: 100, // Slow down by 100ms for demo purposes
  });

  // Create a new browser context
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: {
      dir: 'videos/',
      size: { width: 1280, height: 800 }
    }
  });

  // Create a new page
  const page = await context.newPage();

  try {
    // Navigate to the application
    console.log('Navigating to the application...');
    await page.goto('http://localhost:3000');
    
    // Take a screenshot of the initial page
    await page.screenshot({ path: join(screenshotsDir, 'initial-page.png') });
    console.log('Screenshot saved: screenshots/initial-page.png');

    // Wait for the main content to load
    console.log('Waiting for main content to load...');
    await page.waitForSelector('h1, h2, h3, [role="button"]', { timeout: 10000 });

    // Take a screenshot of the loaded page
    await page.screenshot({ path: join(screenshotsDir, 'loaded-page.png') });
    console.log('Screenshot saved: screenshots/loaded-page.png');

    // Check for connect wallet button
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    if (await connectButton.isVisible()) {
      console.log('Found connect wallet button');
      await connectButton.click();
      console.log('Clicked connect wallet button');
      
      // Wait for wallet connection modal
      await page.waitForTimeout(2000);
      await page.screenshot({ path: join(screenshotsDir, 'wallet-modal.png') });
      console.log('Screenshot saved: screenshots/wallet-modal.png');
      
      // Look for Bitget wallet option
      const bitgetOption = page.getByText('Bitget', { exact: false }).first();
      if (await bitgetOption.isVisible()) {
        console.log('Found Bitget wallet option');
      } else {
        console.log('Bitget wallet option not found, available options:');
        const buttons = await page.$$('button');
        for (const button of buttons) {
          console.log(await button.textContent());
        }
      }
    } else {
      console.log('Connect wallet button not found');
      // Take a screenshot of the current state for debugging
      await page.screenshot({ path: join(screenshotsDir, 'no-connect-button.png') });
      console.log('Screenshot saved: screenshots/no-connect-button.png');
    }

    // Check for any error messages
    const errorMessages = await page.$$eval('div[role="alert"], .error, .error-message', 
      elements => elements.map(el => el.textContent)
    );
    
    if (errorMessages.length > 0) {
      console.log('Found error messages:', errorMessages);
      await page.screenshot({ path: join(screenshotsDir, 'error-messages.png') });
    }

    // Log the page content for debugging
    const pageContent = await page.content();
    console.log('Page content length:', pageContent.length);
    
    // Save the page content to a file for inspection
    fs.writeFileSync(join(screenshotsDir, 'page-content.html'), pageContent);
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: join(screenshotsDir, 'test-error.png') });
    console.log('Screenshot saved: screenshots/test-error.png');
  } finally {
    // Close the browser
    await browser.close();
    console.log('Test completed');
  }
});
