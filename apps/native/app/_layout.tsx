import { ConvexReactClient, useConvexAuth } from "convex/react";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth-client";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import React, { useRef } from "react";
import { View, ImageBackground } from "react-native";
import "../global.css";
import { HeroUINativeProvider } from "heroui-native";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
	expectAuth: true,
	unsavedChangesWarning: false,
	// verbose: true, // Enable verbose logging to debug auth issues
});

function StackLayout() {
	const { isAuthenticated, isLoading } = useConvexAuth();

	// Show loading splash while auth initializes
	if (isLoading) {
		return (
			<>
				<StatusBar style="light" />
				<ImageBackground
					source={require("@/assets/images/splash-logo.png")}
					style={{ flex: 1, backgroundColor: "#e2296f" }}
					imageStyle={{ width: 200, height: "100%", left: "50%", marginLeft: -100 }}
					resizeMode="contain"
				>
					<View className="flex-1 items-center justify-center"></View>
				</ImageBackground>
			</>
		);
	}

	return (
		<>
			<StatusBar style={isAuthenticated ? "dark" : "light"} />
			<Stack screenOptions={{ headerShown: false }}>
				{/* Auth screens - only accessible when NOT authenticated */}
				<Stack.Protected guard={!isAuthenticated}>
					<Stack.Screen name="(auth)" options={{ headerShown: false }} />
				</Stack.Protected>

				{/* Protected screens - only accessible when authenticated */}
				<Stack.Protected guard={isAuthenticated}>
					<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
					<Stack.Screen
						name="listing"
						options={{
							headerShown: false,
							presentation: "card",
						}}
					/>
					<Stack.Screen
						name="post"
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
				</Stack.Protected>
			</Stack>
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
			<StatusBar style="dark" />
			<GestureHandlerRootView style={{ flex: 1 }}>
				<HeroUINativeProvider>
					<StackLayout />
				</HeroUINativeProvider>
			</GestureHandlerRootView>
		</ConvexBetterAuthProvider>
	);
}
