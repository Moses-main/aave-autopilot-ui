import { test, expect } from '@playwright/test';

test('connect wallet and interact with the app', async ({ page }) => {
  // Navigate to the application
  await page.goto('http://localhost:3000');

  // Wait for the connect wallet button to be visible
  const connectButton = page.getByRole('button', { name: /connect wallet/i });
  await connectButton.waitFor({ state: 'visible', timeout: 10000 });
  
  // Click the connect wallet button
  await connectButton.click();
  
  // Wait for the wallet connection modal to appear
  const walletModal = page.locator('[role="dialog"]');
  await walletModal.waitFor({ state: 'visible', timeout: 5000 });
  
  // Click on Bitget wallet option
  const bitgetOption = page.getByText('Bitget Wallet');
  await bitgetOption.click();
  
  // Here the test will pause to allow manual interaction
  // You'll need to enter your password when prompted by the Bitget wallet
  
  // Wait for the wallet to be connected
  await page.waitForSelector('text=Connected', { timeout: 30000 });
  
  // Now you can interact with the application
  // For example, check if the deposit form is visible
  const depositForm = page.getByRole('form', { name: /deposit form/i });
  await expect(depositForm).toBeVisible();
  
  // You can add more interactions here as needed
});
