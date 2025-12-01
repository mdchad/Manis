import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { type } from "arktype";
import { Button, TextField } from "heroui-native";

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

	const socialOpacity = useSharedValue(0);
	const socialTranslateX = useSharedValue(0);
	const emailOpacity = useSharedValue(0);
	const emailTranslateX = useSharedValue(50);

	// Fade in social buttons on mount
	useEffect(() => {
		socialOpacity.value = withTiming(1, { duration: 500 });
	}, []);

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
			{/*{error && (*/}
			{/*	<View className="mb-4 p-3 bg-destructive/10 rounded-md">*/}
			{/*		<Text className="text-destructive text-sm">{error}</Text>*/}
			{/*	</View>*/}
			{/*)}*/}

			{!showEmailForm && (
				<Animated.View style={socialAnimatedStyle} className="justify-end flex-1 mb-2">
					<Button size="md" className="bg-white mb-2" onPress={handleGoogleSignIn}>
						<Button.Label className="text-foreground text-sm">Continue with Google</Button.Label>
					</Button>

					<Button size="md" className="bg-black" onPress={handleAppleSignIn}>
						<Button.Label className="text-white text-sm">Continue with Apple</Button.Label>
					</Button>

					<View className="mt-4 flex-row items-center">
						<View className="flex-1 h-px bg-border" />
						<Text className="mx-4 text-sm text-white">OR</Text>
						<View className="flex-1 h-px bg-border" />
					</View>

					<Button variant="ghost" size="md" onPress={() => setShowEmailForm(true)}>
						<Button.Label className="text-white text-sm">Continue with Email</Button.Label>
					</Button>
				</Animated.View>
			)}

			{showEmailForm && (
				<Animated.View
					style={emailAnimatedStyle}
					className="flex-1 gap-2 justify-center bg-primary"
				>
					<Button
						variant="ghost"
						size="md"
						className="mb-4"
						onPress={() => setShowEmailForm(false)}
					>
						<Button.Label className="text-white text-sm">← Back to social login</Button.Label>
					</Button>

					<Text className="text-lg font-semibold mb-4 text-white">Sign in with Email</Text>

					<TextField isRequired isInvalid={!!error}>
						<TextField.Input
							placeholder="Email or Username"
							value={emailOrUsername}
							onChangeText={setEmailOrUsername}
							keyboardType="email-address"
							autoCapitalize="none"
							autoComplete="off"
						/>
					</TextField>

					<TextField isRequired isInvalid={!!error}>
						<TextField.Input
							placeholder="Password"
							value={password}
							onChangeText={setPassword}
							secureTextEntry
						/>
						<TextField.ErrorMessage>{error}</TextField.ErrorMessage>
					</TextField>

					<Button
						variant="ghost"
						size="lg"
						onPress={handleLogin}
						isIconOnly={isLoading}
						className="self-center w-full"
						feedbackVariant="highlight"
					>
						{isLoading ? <ActivityIndicator size="small" color="#fff" /> : "Sign In"}
					</Button>
				</Animated.View>
			)}
		</View>
	);
}
