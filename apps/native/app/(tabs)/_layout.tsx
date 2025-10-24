import { TabBarIcon } from "@/components/tabbar-icon";
import { useColorScheme } from "@/lib/use-color-scheme";
import { Tabs } from "expo-router";
import {
	BubblesIcon,
	ContactIcon,
	HeartIcon,
	HouseIcon,
	MessageCircleIcon,
	PlusIcon,
	SearchIcon
} from 'lucide-react-native';
import {Image, View} from "react-native";
import React from "react";

export default function TabLayout() {
	const { isDarkColorScheme } = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				sceneStyle: { backgroundColor: "#F2F2EA" },
				tabBarShowLabel: false,
				tabBarItemStyle: { paddingTop: 10 },
				headerShown: true,
				headerTitleAlign: "left",
				headerShadowVisible: false,
				headerStyle: {
					backgroundColor: "#F2F2EA",
					borderColor: 'transparent'
				},
				headerRight: () => (
					<View className="pr-4">
						<MessageCircleIcon />
					</View>
				),
				headerTitle: () => (
					<Image
						source={require('@/assets/images/app-header-logo.png')}
						style={{ width: 80, height: 80 }}
						resizeMode="contain"
					/>
				),
				tabBarActiveTintColor: isDarkColorScheme
					? "hsl(217.2 91.2% 59.8%)"
					: "#8cb700",
				tabBarInactiveTintColor: isDarkColorScheme
					? "hsl(215 20.2% 65.1%)"
					: "#e2296f",
				tabBarStyle: {
					backgroundColor: isDarkColorScheme
						? "hsl(222.2 84% 4.9%)"
						: "hsl(0 0% 100%)",
					borderTopColor: isDarkColorScheme
						? "hsl(217.2 32.6% 17.5%)"
						: "hsl(214.3 31.8% 91.4%)",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => (
						<HouseIcon color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Explore",
					tabBarIcon: ({ color }) => (
						<SearchIcon color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					tabBarIcon: ({ color }) => (
						<PlusIcon color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="likes"
				options={{
					tabBarIcon: ({ color }) => (
						<HeartIcon color={color} />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarIcon: ({ color }) => (
						<Image
							source={{ uri: "https://i.pravatar.cc/150?img=2" }}
							className="mt-1 w-8 h-8 rounded-full"
						/>
					)
				}}
			/>
		</Tabs>
	);
}
