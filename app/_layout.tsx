import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Slot, Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import { useAuthStore } from "@/store/auth-store";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
  });
  
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (error) {
      console.error(error);
      throw error;
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);
  
  // Auth protection
  useEffect(() => {
    if (!loaded) return;
    
    const inAuthGroup = segments[0] === "(auth)";
    
    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to the sign-in page
      router.replace("/(auth)/login");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to the home page
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="game/[id]" 
          options={{ 
            title: "Game Details",
            headerBackTitle: "Games",
          }} 
        />
        <Stack.Screen 
          name="game/new" 
          options={{ 
            title: "New Game",
            headerBackTitle: "Games",
          }} 
        />
        <Stack.Screen 
          name="game/edit/[id]" 
          options={{ 
            title: "Edit Game",
            headerBackTitle: "Details",
          }} 
        />
        <Stack.Screen 
          name="player/[id]" 
          options={{ 
            title: "Player Details",
            headerBackTitle: "Players",
          }} 
        />
        <Stack.Screen 
          name="player/new" 
          options={{ 
            title: "New Player",
            headerBackTitle: "Players",
          }} 
        />
        <Stack.Screen 
          name="player/edit/[id]" 
          options={{ 
            title: "Edit Player",
            headerBackTitle: "Details",
          }} 
        />
        <Stack.Screen 
          name="team/[id]" 
          options={{ 
            title: "Team Details",
            headerBackTitle: "Teams",
          }} 
        />
        <Stack.Screen 
          name="team/edit/[id]" 
          options={{ 
            title: "Edit Team",
            headerBackTitle: "Details",
          }} 
        />
        <Stack.Screen 
          name="admin/users" 
          options={{ 
            title: "User Management",
            headerBackTitle: "Admin",
          }} 
        />
      </Stack>
    </ErrorBoundary>
  );
}