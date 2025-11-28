import { TabBarIcon } from "@/components/tabbar-icon";
// import { useColorScheme } from "@/lib/use-color-scheme";
import { Tabs } from "expo-router";
import {
	BubblesIcon,
	ContactIcon,
	HeartIcon,
	HouseIcon,
	MessageCircleIcon,
	PlusIcon,
	SearchIcon,
	UserIcon,
} from "lucide-react-native";
import { Image, View } from "react-native";
import React from "react";
import { Avatar } from "heroui-native";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { cn } from "tailwind-variants";

export default function TabLayout() {
	// const { isDarkColorScheme } = useColorScheme();
	const { isAuthenticated } = useConvexAuth();
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");

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
					borderColor: "transparent",
				},
				headerRight: () => (
					<View className="pr-4">
						<MessageCircleIcon />
					</View>
				),
				headerTitle: () => (
					<Image
						source={require("@/assets/images/app-header-logo.png")}
						style={{ width: 80, height: 80 }}
						resizeMode="contain"
					/>
				),
				tabBarActiveTintColor: "#8cb700",
				tabBarInactiveTintColor: "#e2296f",
				tabBarStyle: {
					backgroundColor: "hsl(0 0% 100%)",
					borderTopColor: "hsl(214.3 31.8% 91.4%)",
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color }) => <HouseIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Explore",
					tabBarIcon: ({ color }) => <SearchIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					tabBarIcon: ({ color }) => <PlusIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="likes"
				options={{
					tabBarIcon: ({ color }) => <HeartIcon color={color} />,
				}}
			/>
			<Tabs.Screen
				name="profile"
				options={{
					tabBarIcon: ({ color, focused }) => (
						<Avatar
							size="sm"
							className={cn("size-8", focused && "outline-2 outline-secondary-500")}
							alt={"avatar"}
							variant="soft"
							color="success"
						>
							<Avatar.Image source={{ uri: profile?.avatarUrl as string }} />
							<Avatar.Fallback />
						</Avatar>
					),
				}}
			/>
		</Tabs>
	);
}
