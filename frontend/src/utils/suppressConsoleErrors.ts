// Suppress WalletConnect and other noisy console errors
export function suppressConsoleErrors() {
  if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;

    console.error = (...args) => {
      const message = args.join(' ');
      
      // Suppress WalletConnect relayer errors and ENS errors
      if (
        message.includes('relayer') ||
        message.includes('core/relayer') ||
        message.includes('WebSocket connection failed') ||
        message.includes('Failed to connect to relay server') ||
        message.includes('network does not support ENS') ||
        message.includes('UNSUPPORTED_OPERATION') ||
        message.includes('getResolver') ||
        message.includes('Error fetching token details')
      ) {
        return;
      }
      
      originalConsoleError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args.join(' ');
      
      // Suppress WalletConnect warnings
      if (
        message.includes('relayer') ||
        message.includes('core/relayer') ||
        message.includes('WalletConnect')
      ) {
        return;
      }
      
      originalConsoleWarn.apply(console, args);
    };
  }
}

// Call this on app initialization
if (typeof window !== 'undefined') {
  suppressConsoleErrors();
}
