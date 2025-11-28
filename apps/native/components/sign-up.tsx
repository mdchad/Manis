import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Button, TextField } from "heroui-native";
import { type } from "arktype";
import { Camera } from "lucide-react-native";

const Name = type("string > 0").configure({ actual: () => "" });
const Email = type("string.email").configure({ actual: () => "" });
const Password = type("string >= 8").configure({ actual: () => "" });
const UserSchema = type({
	name: Name,
	username: Name,
	email: Email,
	password: Password,
});

export function SignUp() {
	const [user, setUser] = useState<any>({ name: "", email: "", password: "", username: "" });
	const [displayUsername, setDisplayUsername] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [submitted, setSubmitted] = useState(false);

	const validation = UserSchema(user);
	const errors = validation instanceof type.errors ? validation : null;

	// Helper to get error for a specific field
	const getFieldError = (field: string) => {
		if (!touched[field] && !submitted) return null;
		if (!errors) return null;
		const fieldError = errors.find((e) => e.path[0] === field);
		return fieldError?.message ?? null;
	};

	const handleBlur = (field: string) => {
		setTouched((prev) => ({ ...prev, [field]: true }));
	};

	const handleSignUp = async () => {
		setIsLoading(true);
		setSubmitted(true);

		await authClient.signUp.email(
			{
				...user,
				displayUsername: displayUsername || undefined,
			},
			{
				onError: (error) => {
					setIsLoading(false);
				},
				onSuccess: () => {
					setUser({ name: "", email: "", password: "", username: "" });
					setDisplayUsername("");
				},
				onFinished: () => {
					setIsLoading(false);
				},
			}
		);
	};

	return (
		<View className="mt-6 p-4 bg-gray-100 rounded-2xl gap-4">
			<Text className="text-lg font-semibold mb-4">Create Account</Text>

			<TextField isRequired isInvalid={!!getFieldError("name")}>
				<TextField.Label>Name</TextField.Label>
				<TextField.Input
					placeholder="Enter your name"
					value={user.name}
					onChangeText={(value) => setUser({ ...user, name: value })}
					autoCapitalize="none"
					autoComplete="off"
					onBlur={() => handleBlur("name")}
				/>
				{/*<TextField.Description>We'll never share your email</TextField.Description>*/}
				<TextField.ErrorMessage>{getFieldError("name")}</TextField.ErrorMessage>
			</TextField>

			<TextField isRequired isInvalid={!!getFieldError("username")}>
				<TextField.Label>Username</TextField.Label>
				<TextField.Input
					placeholder="Enter your username"
					value={user.username}
					onChangeText={(value) => setUser({ ...user, username: value })}
					autoCapitalize="none"
					autoComplete="off"
					onBlur={() => handleBlur("username")}
				/>
				<TextField.Description>
					This will be your handle {`@${user.username}`}
				</TextField.Description>
				<TextField.ErrorMessage>{getFieldError("username")}</TextField.ErrorMessage>
			</TextField>

			<TextField isRequired isInvalid={!!getFieldError("email")}>
				<TextField.Label>Email</TextField.Label>
				<TextField.Input
					placeholder="Enter your email"
					value={user.email}
					onChangeText={(value) => setUser({ ...user, email: value })}
					keyboardType="email-address"
					autoCapitalize="none"
					autoComplete="off"
					onBlur={() => handleBlur("email")}
				/>
				<TextField.Description>We'll never share your email</TextField.Description>
				<TextField.ErrorMessage>{getFieldError("email")}</TextField.ErrorMessage>
			</TextField>

			<TextField isRequired isInvalid={!!getFieldError("password")}>
				<TextField.Label>Password</TextField.Label>
				<TextField.Input
					placeholder="Enter your password"
					value={user.password}
					onChangeText={(value) => setUser({ ...user, password: value })}
					secureTextEntry
					onBlur={() => handleBlur("password")}
				/>
				<TextField.ErrorMessage>{getFieldError("password")}</TextField.ErrorMessage>
			</TextField>

			<Button variant="primary" size="lg" onPress={handleSignUp} className="bg-primary">
				{isLoading ? <ActivityIndicator /> : "Sign Up"}
				{/*<Button.Label>Sign Up</Button.Label>*/}
			</Button>

			{/*	<TouchableOpacity*/}
			{/*		onPress={handleSignUp}*/}
			{/*		disabled={isLoading}*/}
			{/*		className="bg-primary p-4 rounded-md flex-row justify-center items-center"*/}
			{/*	>*/}
			{/*		{isLoading ? (*/}
			{/*			<ActivityIndicator size="small" color="#fff" />*/}
			{/*		) : (*/}
			{/*			<Text className="text-primary-foreground font-medium">Sign Up</Text>*/}
			{/*		)}*/}
			{/*	</TouchableOpacity>*/}
		</View>
	);
}
