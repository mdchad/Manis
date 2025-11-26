import {
	View,
	Text,
	ScrollView,
	TouchableOpacity,
	ActivityIndicator,
	Image,
	Alert,
} from "react-native";
import { Container } from "@/components/container";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { SignIn } from "@/components/sign-in";
import { SignUp } from "@/components/sign-up";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Button } from "heroui-native";
import { Camera, X } from "lucide-react-native";

export default function Index() {
	const healthCheck = useQuery(api.healthCheck.get);
	const { isAuthenticated } = useConvexAuth();
	const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
	const [avatar, setAvatar] = useState<string | null>(null);
	const router = useRouter();

	const pickImage = async () => {
		// Request permission
		const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (status !== "granted") {
			Alert.alert(
				"Permission needed",
				"Sorry, we need camera roll permissions to upload your profile picture!"
			);
			return;
		}

		// Launch image picker
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: "images",
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setAvatar(result.assets[0].uri);
		}
	};

	const takePhoto = async () => {
		// Request permission
		const { status } = await ImagePicker.requestCameraPermissionsAsync();

		if (status !== "granted") {
			Alert.alert("Permission needed", "Sorry, we need camera permissions to take a photo!");
			return;
		}

		// Launch camera
		const result = await ImagePicker.launchCameraAsync({
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.8,
		});

		if (!result.canceled && result.assets[0]) {
			setAvatar(result.assets[0].uri);
		}
	};

	const showImageOptions = () => {
		Alert.alert("Change Profile Picture", "Choose an option", [
			{
				text: "Take Photo",
				onPress: takePhoto,
			},
			{
				text: "Choose from Library",
				onPress: pickImage,
			},
			{
				text: "Cancel",
				style: "cancel",
			},
		]);
	};

	const handleSave = () => {
		// TODO: Implement save functionality with Convex mutation
		console.log("Saving profile with avatar:", avatar);
		router.back();
	};

	return (
		<Container>
			<ScrollView>
				<View className="px-4">
					<Text className="font-mono text-foreground text-3xl font-bold mb-4">Edit Profile</Text>

					{/* Avatar Section */}
					<View className="items-center mb-8">
						<View className="relative">
							<Image
								source={{
									uri: avatar || user?.image || "https://i.pravatar.cc/150?img=1",
								}}
								className="w-32 h-32 rounded-full"
							/>
							{avatar && (
								<TouchableOpacity
									onPress={() => setAvatar(null)}
									className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1.5"
								>
									<X size={16} color="white" />
								</TouchableOpacity>
							)}
						</View>
						<Button variant="ghost" size="sm" onPress={showImageOptions} className="mt-4">
							<Camera size={18} color="white" />
							<Button.Label>Change Photo</Button.Label>
						</Button>
					</View>

					{/* User Info Section */}
					<View className="mb-6 p-4 bg-card rounded-lg border border-border">
						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">Name</Text>
							<View className="bg-surface border border-border rounded-lg p-3">
								<Text className="text-foreground">{user?.name || "Loading..."}</Text>
							</View>
						</View>

						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">Username</Text>
							<View className="bg-surface border border-border rounded-lg p-3">
								<Text className="text-foreground">{user?.username || "Loading..."}</Text>
							</View>
						</View>

						<View className="mb-4">
							<Text className="text-sm font-medium text-foreground mb-2">Email</Text>
							<View className="bg-surface border border-border rounded-lg p-3">
								<Text className="text-muted-foreground">{user?.email}</Text>
							</View>
						</View>

						{/* Save Button */}
						<Button variant="primary" size="lg" onPress={handleSave} className="mt-2">
							<Button.Label>Save Changes</Button.Label>
						</Button>
					</View>

					{/* Sign Out Section */}
					<View className="mb-6 p-4 bg-card rounded-lg border border-border">
						<TouchableOpacity
							className="bg-destructive py-2 px-4 rounded-md self-start"
							onPress={() => {
								authClient.signOut();
							}}
						>
							<Text className="text-black font-medium">Sign Out</Text>
						</TouchableOpacity>
					</View>

					{/* API Status */}
					<View className="mb-6 rounded-lg border border-border p-4">
						<Text className="mb-3 font-medium text-foreground">API Status</Text>
						<View className="flex-row items-center gap-2">
							<View
								className={`h-3 w-3 rounded-full ${healthCheck ? "bg-green-500" : "bg-red-500"}`}
							/>
							<Text className="text-muted-foreground">
								{healthCheck === undefined
									? "Checking..."
									: healthCheck === "OK"
										? "Connected to API"
										: "API Disconnected"}
							</Text>
						</View>
					</View>
				</View>
			</ScrollView>
		</Container>
	);
}
