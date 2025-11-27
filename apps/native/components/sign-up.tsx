import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { TextField } from "heroui-native";
import { type } from "arktype";

const Email = type("string.email").configure({ actual: () => "" });
const Password = type("string >= 8").configure({ actual: () => "" });
const UserSchema = type({
	email: Email,
	password: Password,
});

export function SignUp() {
	const [user, setUser] = useState<any>({});
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [displayUsername, setDisplayUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const validation = UserSchema(user);
	const errors = validation instanceof type.errors ? validation : null;

	// Helper to get error for a specific field
	const getFieldError = (field: string) => {
		if (!errors) return null;
		const fieldError = errors.find((e) => e.path[0] === field);
		return fieldError?.message ?? null;
	};

	const handleSignUp = async () => {
		setIsLoading(true);
		setError(null);

		await authClient.signUp.email(
			{
				name,
				email,
				password,
				username,
				displayUsername: displayUsername || undefined,
			},
			{
				onError: (error) => {
					setError(error.error?.message || "Failed to sign up");
					setIsLoading(false);
				},
				onSuccess: () => {
					setName("");
					setEmail("");
					setPassword("");
					setUsername("");
					setDisplayUsername("");
				},
				onFinished: () => {
					setIsLoading(false);
				},
			}
		);
	};

	return (
		<View className="mt-6 p-4 bg-gray-100 rounded-xl">
			<Text className="text-lg font-semibold text-white mb-4">Create Account</Text>

			{error && (
				<View className="mb-4 p-3 bg-destructive/10 rounded-md">
					<Text className="text-destructive text-sm">{error}</Text>
				</View>
			)}

			<TextInput
				className="mb-3 p-4 rounded-md bg-input text-foreground border border-input"
				placeholder="Name"
				autoCorrect={false}
				value={name}
				onChangeText={setName}
				placeholderTextColor="#9CA3AF"
			/>

			<TextInput
				className="mb-3 p-4 rounded-md bg-input text-foreground border border-input"
				placeholder="Username"
				value={username}
				onChangeText={setUsername}
				placeholderTextColor="#9CA3AF"
				autoCapitalize="none"
			/>

			{/*<TextInput*/}
			{/*	className="mb-3 p-4 rounded-md bg-input text-foreground border border-input"*/}
			{/*	placeholder="Display Username (optional)"*/}
			{/*	value={displayUsername}*/}
			{/*	onChangeText={setDisplayUsername}*/}
			{/*	placeholderTextColor="#9CA3AF"*/}
			{/*/>*/}

			<TextField isRequired isInvalid={!!getFieldError("email")}>
				<TextField.Label>Email</TextField.Label>
				<TextField.Input
					placeholder="Enter your email"
					value={user.email}
					onChangeText={(value) => setUser({ ...user, email: value })}
					keyboardType="email-address"
					autoCapitalize="none"
					autoComplete="off"
				/>
				<TextField.Description>We'll never share your email</TextField.Description>
				<TextField.ErrorMessage>{getFieldError("email")}</TextField.ErrorMessage>
			</TextField>

			{/*<TextInput*/}
			{/*	className="mb-3 p-4 rounded-md bg-input text-foreground border border-input"*/}
			{/*	placeholder="Email"*/}
			{/*	value={email}*/}
			{/*	onChangeText={setEmail}*/}
			{/*	placeholderTextColor="#9CA3AF"*/}
			{/*	keyboardType="email-address"*/}
			{/*	autoCapitalize="none"*/}
			{/*/>*/}

			<TextField isRequired isInvalid={!!getFieldError("password")}>
				<TextField.Label>Password</TextField.Label>
				<TextField.Input
					placeholder="Enter your password"
					value={user.password}
					onChangeText={(value) => setUser({ ...user, password: value })}
					secureTextEntry
				/>
				<TextField.ErrorMessage>{getFieldError("password")}</TextField.ErrorMessage>
			</TextField>

			{/*<TextInput*/}
			{/*	className="mb-4 p-4 rounded-md bg-input text-foreground border border-input"*/}
			{/*	placeholder="Password"*/}
			{/*	value={password}*/}
			{/*	onChangeText={setPassword}*/}
			{/*	placeholderTextColor="#9CA3AF"*/}
			{/*	secureTextEntry*/}
			{/*/>*/}

			<TouchableOpacity
				onPress={handleSignUp}
				disabled={isLoading}
				className="bg-primary p-4 rounded-md flex-row justify-center items-center"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="#fff" />
				) : (
					<Text className="text-primary-foreground font-medium">Sign Up</Text>
				)}
			</TouchableOpacity>
		</View>
	);
}
