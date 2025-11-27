import { SignUp } from "@/components/sign-up";
import { ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

export default function SignUpScreen() {
	const StyledSafeAreaView = withUniwind(SafeAreaView);

	return (
		<ImageBackground
			source={require("@/assets/images/splash-logo.png")}
			style={{ flex: 1, backgroundColor: "#e2296f" }}
			imageStyle={{ width: 200, height: "100%", left: "50%", marginLeft: -100 }}
			resizeMode="contain"
		>
			<StyledSafeAreaView className="flex-1 px-6">
				<SignUp />
			</StyledSafeAreaView>
		</ImageBackground>
	);
}
