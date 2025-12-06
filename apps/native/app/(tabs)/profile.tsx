import { ScrollView, Text, View, Image, TouchableOpacity, Dimensions } from "react-native";
import { useState } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { Skeleton, Button, Avatar } from "heroui-native";
import { Pencil, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { withUniwind } from "uniwind";

const { width } = Dimensions.get("window");
const imageSize = (width - 8) / 3; // 3 columns with 2px gaps

export default function ProfileScreen() {
	const [activeTab, setActiveTab] = useState<"posts" | "listings">("posts");

	const { isAuthenticated } = useConvexAuth();

	const currentUser = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");

	const followCounts = useQuery(
		api.follows.getFollowCounts,
		currentUser?._id ? { userId: currentUser._id } : "skip"
	);
	const userPosts = useQuery(
		api.posts.getUserPosts,
		currentUser?._id ? { userId: currentUser._id } : "skip"
	);

	const userListings = useQuery(
		api.listings.getUserListings,
		currentUser?._id ? { userId: currentUser._id } : "skip"
	);

	// Extract first image from each post for grid display
	const postsImages = userPosts?.map((post) => post.imageUrls[0]).filter(Boolean) ?? [];
	const listingsImages = userListings?.map((listing) => listing.imageUrl).filter(Boolean) ?? [];

	const images = activeTab === "posts" ? postsImages : listingsImages;

	const handlePostPress = (index: number) => {
		if (activeTab === "posts" && userPosts && userPosts[index]) {
			router.push({ pathname: "/post/[id]", params: { id: userPosts[index]._id } });
		} else if (activeTab === "listings" && userListings && userListings[index]) {
			router.push({ pathname: "/listing/[id]", params: { id: userListings[index]._id } });
		}
	};

	const router = useRouter();
	const StyledPlus = withUniwind(Plus);

	return (
		<ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
			{/* Profile Header */}
			<View className="px-6 pt-6">
				{/* Avatar and Stats */}
				<View className="flex-row items-center mb-6">
					<Avatar size="lg" alt={"avatar"} variant="soft" color="success">
						<Avatar.Image source={{ uri: profile?.avatarUrl as string }} />
						<Avatar.Fallback />
					</Avatar>
					<View className="flex-1 flex-row justify-around ml-8">
						<View className="items-center">
							<Text className="text-2xl font-bold text-foreground">
								{followCounts?.followerCount ?? 0}
							</Text>
							<Text className="text-sm text-muted-foreground">followers</Text>
						</View>
						<View className="items-center">
							<Text className="text-2xl font-bold text-foreground">
								{followCounts?.followingCount ?? 0}
							</Text>
							<Text className="text-sm text-muted-foreground">following</Text>
						</View>
						<View className="items-center">
							<Text className="text-2xl font-bold text-foreground">{userPosts?.length ?? 0}</Text>
							<Text className="text-sm text-muted-foreground">posts</Text>
						</View>
					</View>
				</View>

				{/* Username and Bio */}
				<View className="mb-4">
					<View className="flex-row items-center mb-1">
						<Skeleton isLoading={!currentUser?.username} className="h-4 w-32 rounded-md">
							<Text className="text-2xl font-bold text-foreground">{currentUser?.username}</Text>
						</Skeleton>
						<Button
							variant="ghost"
							size="sm"
							isIconOnly
							onPress={() => router.push("/edit-profile")}
						>
							<Pencil size={18} color="black" />
						</Button>
					</View>
					<Skeleton isLoading={!currentUser?.username} className="h-4 w-32 rounded-md">
						<Text className="text-sm text-gray-700">{profile?.bio}</Text>
					</Skeleton>
				</View>
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
				{/* Add Listing Button (only show in listings tab, always first) */}
				{activeTab === "listings" && (
					<TouchableOpacity
						onPress={() => router.push("/listing/create")}
						style={{
							width: imageSize,
							height: imageSize,
						}}
						className="bg-gray-200 items-center justify-center"
					>
						<View className="items-center">
							<StyledPlus size={32} strokeWidth={2} className="text-primary " />
						</View>
					</TouchableOpacity>
				)}

				{images.map((image, index) => (
					<TouchableOpacity key={index} onPress={() => handlePostPress(index)}>
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
