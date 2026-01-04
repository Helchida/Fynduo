import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import { ComptesProvider } from "./context/ComptesContext";
import RootNavigator from "./navigation/RootNavigator";
import { useAuth } from "./hooks/useAuth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { auth } from './services/firebase/config';
import * as Linking from 'expo-linking';
import { navigate } from "navigation/RootNavigation";

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();
  
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (url.includes('email-verified')) {
        if (auth.currentUser) await auth.currentUser.reload();

        navigate('Login');
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    const checkInitialUrl = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) handleUrl({ url: initialUrl });
    };
    checkInitialUrl();

    return () => subscription.remove();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2980b9" />
      </View>
    );
  }

  return <RootNavigator />;
};

const App: React.FC = () => {
  useEffect(() => {
    if (Platform.OS === "web") {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
      document.getElementsByTagName("head")[0].appendChild(meta);
      const style = document.createElement("style");
      style.textContent = `
        html, body {
          overflow: hidden;
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overscroll-behavior-y: contain;
          touch-action: pan-x pan-y; 
          -webkit-text-size-adjust: 100%;
        }

        input, textarea, select {
          font-size: 16px !important;
        }

        button, [role="button"] {
          touch-action: manipulation;
        }
      `;
      document.head.append(style);
      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      let lastTouchEnd = 0;
      const preventDoubleTap = (e: TouchEvent) => {
        const now = new Date().getTime();
        if (now - lastTouchEnd <= 300) {
          e.preventDefault();
        }
        lastTouchEnd = now;
      };

      document.addEventListener("touchstart", preventZoom, { passive: false });
      document.addEventListener("touchend", preventDoubleTap, {
        passive: false,
      });

      return () => {
        document.removeEventListener("touchstart", preventZoom);
        document.removeEventListener("touchend", preventDoubleTap);
      };
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" backgroundColor="#f4f7f9" translucent={false} />
      <AuthProvider>
        <ComptesProvider>
          <AppContent />
        </ComptesProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default App;
