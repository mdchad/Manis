import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import "../global.css";

export function SignIn() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showEmailForm, setShowEmailForm] = useState(false);

	const socialOpacity = useSharedValue(1);
	const socialTranslateX = useSharedValue(0);
	const emailOpacity = useSharedValue(0);
	const emailTranslateX = useSharedValue(50);

	useEffect(() => {
		if (showEmailForm) {
			socialOpacity.value = withTiming(0, { duration: 200 });
			socialTranslateX.value = withTiming(-50, { duration: 300 });
			emailOpacity.value = withTiming(1, { duration: 300 });
			emailTranslateX.value = withTiming(0, { duration: 300 });
		} else {
			socialOpacity.value = withTiming(1, { duration: 300 });
			socialTranslateX.value = withTiming(0, { duration: 300 });
			emailOpacity.value = withTiming(0, { duration: 200 });
			emailTranslateX.value = withTiming(50, { duration: 300 });
		}
	}, [showEmailForm]);

	const socialAnimatedStyle = useAnimatedStyle(() => ({
		opacity: socialOpacity.value,
		transform: [{ translateX: socialTranslateX.value }],
	}));

	const emailAnimatedStyle = useAnimatedStyle(() => ({
		opacity: emailOpacity.value,
		transform: [{ translateX: emailTranslateX.value }],
	}));

	const handleLogin = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.email(
			{
				email,
				password,
			},
			{
				onError: (error) => {
					setError(error.error?.message || "Failed to sign in");
					setIsLoading(false);
				},
				onSuccess: () => {
					setEmail("");
					setPassword("");
					router.replace("/(tabs)");
				},
				onFinished: () => {
					setIsLoading(false);
				},
			}
		);
	};

	const handleGoogleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.social(
			{
				provider: "google",
			},
			{
				onError: (error) => {
					setError(error.error?.message || "Failed to sign in with Google");
					setIsLoading(false);
				},
				onSuccess: () => {
					setIsLoading(false);
					router.replace("/(tabs)");
				},
			}
		);
	};

	const handleAppleSignIn = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signIn.social(
			{
				provider: "apple",
			},
			{
				onError: (error) => {
					setError(error.error?.message || "Failed to sign in with Apple");
					setIsLoading(false);
				},
				onSuccess: () => {
					setIsLoading(false);
					router.replace("/(tabs)");
				},
			}
		);
	};

	return (
		<View className="mb-2">
			{error && (
				<View className="mb-4 p-3 bg-destructive/10 rounded-md">
					<Text className="text-destructive text-sm">{error}</Text>
				</View>
			)}

			{!showEmailForm && (
				<Animated.View style={socialAnimatedStyle}>
					<TouchableOpacity
						onPress={handleGoogleSignIn}
						disabled={isLoading}
						className="bg-white p-4 rounded-full flex-row justify-center items-center"
					>
						<Text className="text-foreground font-medium">Continue with Google</Text>
					</TouchableOpacity>

					<TouchableOpacity
						onPress={handleAppleSignIn}
						disabled={isLoading}
						className="mt-3 bg-black p-4 rounded-full flex-row justify-center items-center"
					>
						<Text className="text-white font-medium">Continue with Apple</Text>
					</TouchableOpacity>

					<View className="mt-4 flex-row items-center">
						<View className="flex-1 h-px bg-border" />
						<Text className="mx-4 text-muted-foreground text-sm text-white">OR</Text>
						<View className="flex-1 h-px bg-border" />
					</View>

					<TouchableOpacity
						onPress={() => setShowEmailForm(true)}
						className="p-4 flex-row justify-center items-center"
					>
						<Text className="text-foreground font-medium text-white">Continue with Email</Text>
					</TouchableOpacity>
				</Animated.View>
			)}

			{showEmailForm && (
				<Animated.View style={emailAnimatedStyle}>
					<TouchableOpacity onPress={() => setShowEmailForm(false)} className="mb-4">
						<Text className="text-muted-foreground text-sm">← Back to social login</Text>
					</TouchableOpacity>

					<Text className="text-lg font-semibold text-foreground mb-4">Sign in with Email</Text>

					<TextInput
						className="mb-3 p-4 rounded-md bg-input text-foreground border border-input"
						placeholder="Email"
						value={email}
						onChangeText={setEmail}
						placeholderTextColor="#9CA3AF"
						keyboardType="email-address"
						autoCapitalize="none"
					/>

					<TextInput
						className="mb-4 p-4 rounded-md bg-input text-foreground border border-input"
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						placeholderTextColor="#9CA3AF"
						secureTextEntry
					/>

					<TouchableOpacity
						onPress={handleLogin}
						disabled={isLoading}
						className="bg-primary p-4 rounded-md flex-row justify-center items-center"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Text className="text-primary-foreground font-medium">Sign In</Text>
						)}
					</TouchableOpacity>
				</Animated.View>
			)}
		</View>
	);
}
