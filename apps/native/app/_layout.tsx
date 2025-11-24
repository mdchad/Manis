import { ConvexReactClient, Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { Stack } from "expo-router";
import { DarkTheme, DefaultTheme, type Theme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { NAV_THEME } from "@/lib/constants";
import React, { useRef } from "react";
// import { useColorScheme } from "@/lib/use-color-scheme";
import { Platform, View, ActivityIndicator } from "react-native";
import "../global.css";
// import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";

const LIGHT_THEME: Theme = {
	...DefaultTheme,
	colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
	...DarkTheme,
	colors: NAV_THEME.dark,
};

export const unstable_settings = {
	initialRouteName: "(auth)",
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
	unsavedChangesWarning: false,
});

export default function RootLayout() {
	const hasMounted = useRef(false);
	const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

	useIsomorphicLayoutEffect(() => {
		if (hasMounted.current) {
			return;
		}

		if (Platform.OS === "web") {
			document.documentElement.classList.add("bg-background");
		}
		// setAndroidNavigationBar(colorScheme);
		setIsColorSchemeLoaded(true);
		hasMounted.current = true;
	}, []);

	if (!isColorSchemeLoaded) {
		return null;
	}
	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			<StatusBar />
			<GestureHandlerRootView style={{ flex: 1 }}>
				<AuthLoading>
					<View className="flex-1 items-center justify-center bg-primary">
						{/*<ActivityIndicator size="large" />*/}
					</View>
				</AuthLoading>
				<Unauthenticated>
					<Stack>
						<Stack.Screen name="(auth)" options={{ headerShown: false }} />
					</Stack>
				</Unauthenticated>
				<Authenticated>
					<Stack>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen
							name="listing"
							options={{
								headerShown: false,
								presentation: "card",
							}}
						/>
						<Stack.Screen
							name="chat"
							options={{
								headerShown: false,
								presentation: "card",
							}}
						/>
						<Stack.Screen name="modal" options={{ title: "Modal", presentation: "modal" }} />
					</Stack>
				</Authenticated>
			</GestureHandlerRootView>
		</ConvexBetterAuthProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
