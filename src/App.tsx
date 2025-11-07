import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { config } from './lib/wallet';
import { Vault } from './components/vault/Vault';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, useTheme } from '@/components/theme-provider';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import '@rainbow-me/rainbowkit/styles.css';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  const { theme } = useTheme();
  
  return (
    <RainbowKitProvider
      theme={
        theme === 'dark' 
          ? darkTheme({
              accentColor: '#7c3aed',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })
          : lightTheme({
              accentColor: '#7c3aed',
              accentColorForeground: 'white',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })
      }
    >
      <BrowserRouter>
        <div className="min-h-screen bg-background text-foreground">
          <Vault />
          <SonnerToaster position="top-center" />
        </div>
      </BrowserRouter>
    </RainbowKitProvider>
  );
}

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <AppContent />
        </ThemeProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
