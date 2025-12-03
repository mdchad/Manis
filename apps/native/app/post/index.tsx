import { View, ScrollView } from "react-native";
import { Container } from "@/components/container";

export default function Index() {
	return (
		<Container edges={["top"]}>
			<ScrollView>
				<View className="px-4 bg-brand-background"></View>
			</ScrollView>
		</Container>
	);
}
