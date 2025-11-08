import { chromium } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

(async () => {
  // Create a new browser instance
  const browser = await chromium.launch({
    headless: false,
    args: ['--start-maximized'],
    executablePath: '/usr/bin/brave-browser'
  });

  // Create a new context with viewport size
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: {
      dir: 'videos/'
    }
  });

  // Create a new page
  const page = await context.newPage();

  try {
    console.log('Navigating to the application...');
    await page.goto('http://localhost:3000');
    
    // Take a screenshot of the initial page
    await page.screenshot({ path: 'screenshots/initial-page.png' });
    console.log('Screenshot saved: screenshots/initial-page.png');
    
    // Wait for the connect wallet button
    console.log('Looking for connect wallet button...');
    const connectButton = page.getByRole('button', { name: /connect wallet/i });
    await connectButton.waitFor({ state: 'visible', timeout: 10000 });
    
    await page.screenshot({ path: 'screenshots/before-connect.png' });
    console.log('Screenshot saved: screenshots/before-connect.png');
    
    console.log('Clicking connect wallet button...');
    await connectButton.click();
    
    // Wait for the wallet connection modal
    console.log('Waiting for wallet connection modal...');
    const walletModal = page.locator('[role="dialog"]');
    await walletModal.waitFor({ state: 'visible', timeout: 10000 });
    
    await page.screenshot({ path: 'screenshots/wallet-modal.png' });
    console.log('Screenshot saved: screenshots/wallet-modal.png');
    
    // Look for Bitget wallet option
    console.log('Looking for Bitget wallet option...');
    const bitgetOption = page.getByText('Bitget', { exact: false }).first();
    
    if (await bitgetOption.isVisible()) {
      console.log('Clicking Bitget wallet option...');
      await bitgetOption.click();
      await page.screenshot({ path: 'screenshots/bitget-selected.png' });
      console.log('Screenshot saved: screenshots/bitget-selected.png');
      
      console.log('Please complete the wallet connection in the browser...');
      
      // Wait for the wallet connection to complete or for manual intervention
      await page.waitForTimeout(30000); // 30 seconds to complete the connection
      
      // Check if connected
      const isConnected = await page.getByText('Connected', { exact: false }).isVisible();
      
      if (isConnected) {
        console.log('Wallet connected successfully!');
        await page.screenshot({ path: 'screenshots/wallet-connected.png' });
        console.log('Screenshot saved: screenshots/wallet-connected.png');
      } else {
        console.log('Wallet connection may require manual intervention.');
      }
    } else {
      console.error('Bitget wallet option not found');
      await page.screenshot({ path: 'screenshots/bitget-not-found.png' });
      console.log('Screenshot saved: screenshots/bitget-not-found.png');
    }
    
  } catch (error) {
    console.error('Error during test:', error);
    await page.screenshot({ path: 'screenshots/error.png' });
    console.log('Screenshot saved: screenshots/error.png');
  } finally {
    console.log('Test completed. Keeping the browser open for inspection...');
    // Keep the browser open for inspection
    // await browser.close();
  }
})();
