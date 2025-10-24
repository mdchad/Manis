import { Stack } from "expo-router";
import React from "react";

export default function ListingLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false
			}}
		>
			<Stack.Screen name="[id]" options={{
				headerShown: true,
				headerTitle: "",
				headerShadowVisible: false,
				headerStyle: {
					backgroundColor: "#F2F2EA",
				}
			}} />
		</Stack>
	)
}
