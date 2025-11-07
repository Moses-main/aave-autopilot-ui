import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { Vault } from './components/vault/Vault';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { config } from './lib/web3modal';
import './App.css';

const queryClient = new QueryClient();

function AppContent() {
  // const { theme } = useTheme();
  
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Vault />
        <SonnerToaster position="top-center" />
      </div>
    </BrowserRouter>
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
