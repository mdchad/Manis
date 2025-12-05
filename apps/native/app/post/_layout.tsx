import { Stack } from "expo-router";

export default function PostLayout() {
	return (
		<Stack
			screenOptions={{
				headerShown: false,
			}}
		>
			<Stack.Screen name="[id]" />
			<Stack.Screen name="edit" />
			<Stack.Screen
				name="select-listings"
				options={{
					presentation: "modal",
					animation: "slide_from_bottom",
				}}
			/>
		</Stack>
	);
}
