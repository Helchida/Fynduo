import "react-native-gesture-handler";
import React, { useEffect } from "react";
import { View, StyleSheet, ActivityIndicator, Platform } from "react-native";
import { AuthProvider } from "./context/AuthContext";
import { ComptesProvider } from "./context/ComptesContext";
import RootNavigator from "./navigation/RootNavigator";
import { useAuth } from "./hooks/useAuth";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

const AppContent: React.FC = () => {
  const { isLoading } = useAuth();

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

      const style = document.createElement("style");
      style.textContent = `
      body {
        overscroll-behavior-y: contain;
        /* pan-x pan-y autorise le scroll mais interdit le zoom tactile */
        touch-action: pan-x pan-y; 
        -webkit-text-size-adjust: 100%;
      }
      input, textarea, select {
        font-size: 16px !important;
      }
      /* Supprime le délai de clic sur les boutons pour une sensation plus fluide */
      button, [role="button"] {
        touch-action: manipulation;
      }
    `;
      document.head.append(style);

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
