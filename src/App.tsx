import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wallet';
import { Vault } from './components/vault/Vault';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Vault />
                <SonnerToaster position="top-right" />
              </div>
            </BrowserRouter>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
