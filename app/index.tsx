import { Redirect } from 'expo-router';

export default function Index() {
  // Simply redirect to tabs or login without checking auth state initially
  // This prevents the navigation before mounting error
  return <Redirect href="/(tabs)" />;
}