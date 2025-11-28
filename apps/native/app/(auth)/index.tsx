import { View, Text, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";
import { useRouter } from "expo-router";
import { Button } from "heroui-native";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginScreen() {
	const StyledSafeAreaView = withUniwind(SafeAreaView);
	const router = useRouter();

	useEffect(() => {
		authClient.signOut();
	}, []);

	return (
		<ImageBackground
			source={require("@/assets/images/splash-logo.png")}
			style={{ flex: 1, backgroundColor: "#e2296f" }}
			imageStyle={{ width: 200, height: "100%", left: "50%", marginLeft: -100 }}
			resizeMode="contain"
		>
			<StyledSafeAreaView className="flex-1 px-6 justify-end pb-8">
				<View className="gap-3">
					<Button
						variant="primary"
						size="lg"
						onPress={() => router.push("/(auth)/sign-up")}
						className="bg-white"
					>
						<Button.Label className="text-primary">Get Started</Button.Label>
					</Button>

					<Button variant="ghost" size="lg" onPress={() => router.push("/(auth)/sign-in")}>
						<Button.Label>Login</Button.Label>
					</Button>
				</View>
			</StyledSafeAreaView>
		</ImageBackground>
	);
}
