import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { type } from "arktype";
import "../global.css";

const emailValidator = type("string.email");

export function SignIn() {
	const router = useRouter();
	const [emailOrUsername, setEmailOrUsername] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showEmailForm, setShowEmailForm] = useState(false);

	// Check if input is email using ArkType
	const isEmail = (input: string) => {
		const result = emailValidator(input);
		// ArkType returns the data itself if valid, or an object with problems if invalid
		// Check if result is an array (means validation failed and returned problems)
		return !Array.isArray(result);
	};

	const socialOpacity = useSharedValue(1);
	const socialTranslateX = useSharedValue(0);
	const emailOpacity = useSharedValue(0);
	const emailTranslateX = useSharedValue(50);

	useEffect(() => {
		if (showEmailForm) {
			socialOpacity.value = withTiming(0, { duration: 200 });
			socialTranslateX.value = withTiming(-20, { duration: 300 });
			emailOpacity.value = withTiming(1, { duration: 700 });
			emailTranslateX.value = withTiming(0, { duration: 300 });
		} else {
			socialOpacity.value = withTiming(1, { duration: 700 });
			socialTranslateX.value = withTiming(0, { duration: 300 });
			emailOpacity.value = withTiming(0, { duration: 200 });
			emailTranslateX.value = withTiming(20, { duration: 300 });
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

		// Determine if input is email or username
		const inputIsEmail = isEmail(emailOrUsername);

		if (inputIsEmail) {
			// Sign in with email
			await authClient.signIn.email(
				{
					email: emailOrUsername,
					password,
				},
				{
					onError: (error) => {
						setError(error.error?.message || "Failed to sign in");
						setIsLoading(false);
					},
					onSuccess: () => {
						setEmailOrUsername("");
						setPassword("");
						router.replace("/(tabs)");
					},
					onFinished: () => {
						setIsLoading(false);
					},
				}
			);
		} else {
			// Sign in with username
			await authClient.signIn.username(
				{
					username: emailOrUsername,
					password,
				},
				{
					onError: (error) => {
						console.log(error);
						setError(error.error?.message || "Failed to sign in");
						setIsLoading(false);
					},
					onSuccess: () => {
						setEmailOrUsername("");
						setPassword("");
						router.replace("/(tabs)");
					},
					onFinished: () => {
						setIsLoading(false);
					},
				}
			);
		}
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
		<View className="flex-1">
			{error && (
				<View className="mb-4 p-3 bg-destructive/10 rounded-md">
					<Text className="text-destructive text-sm">{error}</Text>
				</View>
			)}

			{!showEmailForm && (
				<Animated.View style={socialAnimatedStyle} className="justify-end flex-1 mb-2">
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
				<Animated.View style={emailAnimatedStyle} className="flex-1 justify-center bg-primary">
					<TouchableOpacity onPress={() => setShowEmailForm(false)} className="mb-4">
						<Text className="text-white text-sm">← Back to social login</Text>
					</TouchableOpacity>

					<Text className="text-lg font-semibold mb-4 text-white">Sign in with Email</Text>

					<TextInput
						className="mb-3 p-4 rounded-lg  bg-white text-foreground"
						placeholder="Email or Username"
						value={emailOrUsername}
						onChangeText={setEmailOrUsername}
						placeholderTextColor="#9CA3AF"
						autoCapitalize="none"
					/>

					<TextInput
						className="mb-4 p-4 rounded-lg bg-white text-foreground"
						placeholder="Password"
						value={password}
						onChangeText={setPassword}
						placeholderTextColor="#9CA3AF"
						secureTextEntry
					/>

					<TouchableOpacity
						onPress={handleLogin}
						disabled={isLoading}
						className="p-4 rounded-md flex-row justify-center items-center"
					>
						{isLoading ? (
							<ActivityIndicator size="small" color="#fff" />
						) : (
							<Text className="text-primary-foreground font-semibold text-lg">Sign In</Text>
						)}
					</TouchableOpacity>
				</Animated.View>
			)}
		</View>
	);
}
