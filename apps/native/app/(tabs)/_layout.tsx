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
import { Image } from "react-native";

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
					// padding: 0,
					backgroundColor: "#F2F2EA",
					borderColor: 'transparent'
				},
				headerRight: () => (
					<MessageCircleIcon />
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
					: "hsl(221.2 83.2% 53.3%)",
				tabBarInactiveTintColor: isDarkColorScheme
					? "hsl(215 20.2% 65.1%)"
					: "hsl(215.4 16.3% 46.9%)",
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
						<HouseIcon />
					),
				}}
			/>
			<Tabs.Screen
				name="two"
				options={{
					title: "Explore",
					tabBarIcon: ({ color }) => (
						<SearchIcon />
					),
				}}
			/>
			<Tabs.Screen
				name="add"
				options={{
					tabBarIcon: ({ color }) => (
						<PlusIcon />
					),
				}}
			/>
			<Tabs.Screen
				name="likes"
				options={{
					tabBarIcon: ({ color }) => (
						<HeartIcon />
					),
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					tabBarIcon: ({ color }) => (
						<ContactIcon />
					),
				}}
			/>
		</Tabs>
	);
}
