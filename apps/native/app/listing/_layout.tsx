import { Stack } from "expo-router";

export default function ListingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: true,
				headerShadowVisible: false,
				headerStyle: {
					backgroundColor: "#F2F2EA",
				},
				headerTitle: "OI BRUV"
			}}
		/>
	);
}
