import { Container } from "@/components/container";
import { ScrollView, Text, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

const { width } = Dimensions.get("window");
const imageSize = (width - 8) / 3; // 3 columns with 2px gaps

// Mock data for the profile
const mockProfile = {
	avatar: "https://i.pravatar.cc/150?img=1",
	username: "fadhilahyacob",
	bio: "modest fashion, preppy aesthetic",
	followers: 1342,
	posts: 35,
	listings: 128,
	postsImages: [
		"https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400",
		"https://images.unsplash.com/photo-1467043237213-65f2da53396f?w=400",
		"https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400",
		"https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400",
		"https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?w=400",
		// "https://images.unsplash.com/photo-1558769132-cb1aea3c8565?w=400",
		"https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400",
		"https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400",
		"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400",
		"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
		"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
		"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
	],
	listingsImages: [
		"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
		"https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400",
		"https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=400",
		"https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400",
		"https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400",
		"https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=400",
		"https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400",
		"https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400",
		"https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400",
	],
};

export default function ProfileScreen() {
	const [activeTab, setActiveTab] = useState<"posts" | "listings">("posts");
	const images = activeTab === "posts" ? mockProfile.postsImages : mockProfile.listingsImages;
	const currentUser = useQuery(api.auth.getCurrentUser);

	return (
		<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
			{/* Profile Header */}
			<View className="px-6 pt-6">
				{/* Avatar and Stats */}
				<View className="flex-row items-center mb-6">
					<Image source={{ uri: mockProfile.avatar }} className="w-24 h-24 rounded-full" />
					<View className="flex-1 flex-row justify-around ml-8">
						<View className="items-center">
							<Text className="text-2xl font-bold text-foreground">{mockProfile.followers}</Text>
							<Text className="text-sm text-muted-foreground">followers</Text>
						</View>
						<View className="items-center">
							<Text className="text-2xl font-bold text-foreground">{mockProfile.posts}</Text>
							<Text className="text-sm text-muted-foreground">posts</Text>
						</View>
						<View className="items-center">
							<Text className="text-2xl font-bold text-foreground">{mockProfile.listings}</Text>
							<Text className="text-sm text-muted-foreground">listings</Text>
						</View>
					</View>
				</View>

				{/* Username and Bio */}
				<View className="mb-4">
					<Text className="text-2xl font-bold text-foreground mb-1">{currentUser?.username}</Text>
					<Text className="text-sm text-blue-600">{mockProfile.bio}</Text>
				</View>

				{/* Follow Button */}
				<TouchableOpacity className="bg-transparent border border-gray-300 rounded-md py-2 mb-6">
					<Text className="text-primary text-center font-semibold text-base">FOLLOW</Text>
				</TouchableOpacity>
			</View>

			{/* Tabs */}
			<View className="flex-row border-b border-gray-200">
				<TouchableOpacity
					className={`flex-1 py-3 ${activeTab === "posts" ? "border-b-2 border-foreground" : ""}`}
					onPress={() => setActiveTab("posts")}
				>
					<Text
						className={`text-center font-semibold ${
							activeTab === "posts" ? "text-foreground" : "text-gray-400"
						}`}
					>
						POSTS
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					className={`flex-1 py-3 ${activeTab === "listings" ? "border-b-2 border-foreground" : ""}`}
					onPress={() => setActiveTab("listings")}
				>
					<Text
						className={`text-center font-semibold ${
							activeTab === "listings" ? "text-foreground" : "text-gray-400"
						}`}
					>
						LISTINGS
					</Text>
				</TouchableOpacity>
			</View>

			{/* Image Grid */}
			<View className="flex-row flex-wrap gap-[2px]">
				{images.map((image, index) => (
					<TouchableOpacity key={index}>
						<Image
							source={{ uri: image }}
							style={{
								width: imageSize,
								height: imageSize,
							}}
							resizeMode="cover"
						/>
					</TouchableOpacity>
				))}
			</View>
		</ScrollView>
	);
}
