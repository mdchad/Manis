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
import { Platform, View, ActivityIndicator, ImageBackground } from "react-native";
import "../global.css";
import { HeroUINativeProvider } from "heroui-native";
// import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";

export const unstable_settings = {
	initialRouteName: "(auth)",
};

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
	unsavedChangesWarning: false,
});

function StackLayout() {
	return (
		<>
			<AuthLoading>
				<ImageBackground
					source={require("@/assets/images/splash-logo.png")}
					style={{ flex: 1, backgroundColor: "#e2296f" }}
					imageStyle={{ width: 200, height: "100%", left: "50%", marginLeft: -100 }}
					resizeMode="contain"
				>
					<View className="flex-1 items-center justify-center"></View>
				</ImageBackground>
			</AuthLoading>
			<Unauthenticated>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				</Stack>
			</Unauthenticated>
			<Authenticated>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen
						name="listing"
						options={{
							headerShown: false,
							presentation: "card",
						}}
					/>
					<Stack.Screen
						name="edit-profile"
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
		</>
	);
}

export default function RootLayout() {
	// const hasMounted = useRef(false);
	// const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);
	//
	// useIsomorphicLayoutEffect(() => {
	// 	if (hasMounted.current) {
	// 		return;
	// 	}
	//
	// 	if (Platform.OS === "web") {
	// 		document.documentElement.classList.add("bg-background");
	// 	}
	// 	// setAndroidNavigationBar(colorScheme);
	// 	setIsColorSchemeLoaded(true);
	// 	hasMounted.current = true;
	// }, []);
	//
	// if (!isColorSchemeLoaded) {
	// 	return null;
	// }

	return (
		<ConvexBetterAuthProvider client={convex} authClient={authClient}>
			<StatusBar style="light" />
			<GestureHandlerRootView style={{ flex: 1 }}>
				<HeroUINativeProvider>
					<StackLayout />
				</HeroUINativeProvider>
			</GestureHandlerRootView>
		</ConvexBetterAuthProvider>
	);
}

const useIsomorphicLayoutEffect =
	Platform.OS === "web" && typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
