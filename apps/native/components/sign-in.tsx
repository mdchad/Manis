import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import "../global.css";

export function SignIn() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

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
		<View className="mt-6 p-4 bg-card rounded-lg border border-border">
			<Text className="text-lg font-semibold text-foreground mb-4">Sign In</Text>

			{error && (
				<View className="mb-4 p-3 bg-destructive/10 rounded-md">
					<Text className="text-destructive text-sm">{error}</Text>
				</View>
			)}

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

			<View className="mt-4 flex-row items-center">
				<View className="flex-1 h-px bg-border" />
				<Text className="mx-4 text-muted-foreground text-sm">OR</Text>
				<View className="flex-1 h-px bg-border" />
			</View>

			<TouchableOpacity
				onPress={handleGoogleSignIn}
				disabled={isLoading}
				className="mt-4 bg-white border border-border p-4 rounded-md flex-row justify-center items-center"
			>
				<Text className="text-foreground font-medium">Continue with Google</Text>
			</TouchableOpacity>

			<TouchableOpacity
				onPress={handleAppleSignIn}
				disabled={isLoading}
				className="mt-3 bg-black p-4 rounded-md flex-row justify-center items-center"
			>
				<Text className="text-white font-medium">Continue with Apple</Text>
			</TouchableOpacity>
		</View>
	);
}
