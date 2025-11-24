import { SignIn } from "@/components/sign-in";
import { View, Text, ScrollView } from "react-native";

export default function LoginScreen() {
	return (
		<ScrollView className="flex-1 bg-background">
			<View className="flex-1 justify-center px-6 py-12">
				<View className="mb-8">
					<Text className="text-3xl font-bold text-foreground text-center mb-2">Welcome Back</Text>
					<Text className="text-muted-foreground text-center">
						Sign in to continue to your account
					</Text>
				</View>
				<SignIn />
			</View>
		</ScrollView>
	);
}
