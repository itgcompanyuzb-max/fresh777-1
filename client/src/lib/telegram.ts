// Telegram WebApp SDK integration
// This provides access to Telegram WebApp features

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: {
      id: number;
      is_bot: boolean;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      photo_url?: string;
    };
    auth_date?: number;
    hash?: string;
  };
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
  };
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  close: () => void;
  expand: () => void;
  ready: () => void;
  sendData: (data: string) => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  showPopup: (params: {
    title?: string;
    message: string;
    buttons?: Array<{
      id?: string;
      type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
      text?: string;
    }>;
  }, callback?: (buttonId: string) => void) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
}

export function getTelegramWebApp(): TelegramWebApp | null {
  // Try to get real Telegram WebApp
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    return window.Telegram.WebApp;
  }
  
  // Development/testing fallback: create a mock Telegram WebApp
  const mockWebApp = {
      initData: 'test',
      initDataUnsafe: {
        user: {
          id: 123456,
          is_bot: false,
          first_name: 'Test',
          username: 'testuser',
        },
      },
      version: '6.0',
      platform: 'web',
      colorScheme: 'light',
      themeParams: {},
      isExpanded: true,
      viewportHeight: 800,
      viewportStableHeight: 800,
      headerColor: '#FFFFFF',
      backgroundColor: '#FFFFFF',
      BackButton: {
        isVisible: false,
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
      },
      MainButton: {
        isVisible: false,
        isProgressVisible: false,
        text: '',
        color: '',
        textColor: '',
        isActive: true,
        readonly: false,
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
        setText: () => {},
        showProgress: () => {},
        hideProgress: () => {},
        enable: () => {},
        disable: () => {},
      },
      SettingsButton: {
        isVisible: false,
        onClick: () => {},
        offClick: () => {},
        show: () => {},
        hide: () => {},
      },
      HapticFeedback: {
        impactOccurred: () => {},
        notificationOccurred: () => {},
        selectionChanged: () => {},
      },
      CloudStorage: {
        getItem: async () => null,
        setItem: async () => {},
        removeItem: async () => {},
        getKeys: async () => [],
      },
      ready: () => {},
      expand: () => {},
      close: () => {},
      onViewportChanged: () => {},
      offViewportChanged: () => {},
      showPopup: async () => {},
      showAlert: () => {},
      showConfirm: () => {},
      openLink: () => {},
      openTelegramLink: () => {},
      sendData: () => {},
      switchInlineQuery: () => {},
      requestWriteAccess: () => {},
      requestContactAccess: () => {},
    } as any;

  return mockWebApp;
}

export function useTelegram() {
  const webApp = getTelegramWebApp();
  
  const user = webApp?.initDataUnsafe?.user;
  const colorScheme = webApp?.colorScheme || 'light';
  const isInTelegram = !!webApp;

  const hapticFeedback = {
    impact: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light') => {
      webApp?.HapticFeedback?.impactOccurred(style);
    },
    notification: (type: 'error' | 'success' | 'warning') => {
      webApp?.HapticFeedback?.notificationOccurred(type);
    },
    selection: () => {
      webApp?.HapticFeedback?.selectionChanged();
    },
  };

  const showBackButton = () => webApp?.BackButton?.show();
  const hideBackButton = () => webApp?.BackButton?.hide();
  const onBackButtonClick = (callback: () => void) => {
    webApp?.BackButton?.onClick(callback);
    return () => webApp?.BackButton?.offClick(callback);
  };

  const mainButton = {
    show: () => webApp?.MainButton?.show(),
    hide: () => webApp?.MainButton?.hide(),
    setText: (text: string) => webApp?.MainButton?.setText(text),
    onClick: (callback: () => void) => {
      webApp?.MainButton?.onClick(callback);
      return () => webApp?.MainButton?.offClick(callback);
    },
    showProgress: () => webApp?.MainButton?.showProgress(),
    hideProgress: () => webApp?.MainButton?.hideProgress(),
    enable: () => webApp?.MainButton?.enable(),
    disable: () => webApp?.MainButton?.disable(),
  };

  const ready = () => webApp?.ready();
  const expand = () => webApp?.expand();
  const close = () => webApp?.close();

  return {
    webApp,
    user,
    colorScheme,
    isInTelegram,
    hapticFeedback,
    showBackButton,
    hideBackButton,
    onBackButtonClick,
    mainButton,
    ready,
    expand,
    close,
  };
}

export function initTelegramApp() {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.ready();
    webApp.expand();
    
    // Apply Telegram theme to CSS variables if needed
    if (webApp.colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}
