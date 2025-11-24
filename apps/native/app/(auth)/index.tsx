import { SignIn } from "@/components/sign-in";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

export default function LoginScreen() {
	const StyledSafeAreaView = withUniwind(SafeAreaView);

	return (
		<StyledSafeAreaView className="flex-1 bg-primary justify-end px-6">
			<SignIn />
		</StyledSafeAreaView>
	);
}
