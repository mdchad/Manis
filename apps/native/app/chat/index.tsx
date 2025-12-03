import { View, ScrollView, Text } from "react-native";
import { Container } from "@/components/container";

export default function Index() {
	return (
		<Container edges={["top"]}>
			<ScrollView>
				<View className="px-4 bg-brand-background">
					<Text className="text-3xl font-bold">Message</Text>
				</View>
			</ScrollView>
		</Container>
	);
}
