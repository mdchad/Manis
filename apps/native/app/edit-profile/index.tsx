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
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Avatar, Button, TextField } from "heroui-native";
import { ArrowLeft, Camera, X } from "lucide-react-native";
import { useUploadFile } from "@convex-dev/r2/react";
import { withUniwind } from "uniwind";

export default function Index() {
	const router = useRouter();
	const { isAuthenticated } = useConvexAuth();

	const healthCheck = useQuery(api.healthCheck.get);
	const user = useQuery(api.auth.getCurrentUser, isAuthenticated ? {} : "skip");
	const uploadFile = useUploadFile(api.r2);
	const updateProfile = useMutation(api.userProfiles.updateProfile);
	const profile = useQuery(api.userProfiles.getProfile, isAuthenticated ? {} : "skip");

	const [avatar, setAvatar] = useState<string | null>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [bio, setBio] = useState(profile?.bio || "");

	const convertUriToFile = async (uri: string, fileName: string): Promise<File> => {
		console.log("URI:", uri);
		const response = await fetch(uri);
		const blob = await response.blob();
		return new File([blob], fileName, { type: blob.type });
	};

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
			const asset = result.assets[0];
			setAvatar(asset.uri);
			// Convert URI to File for upload
			const file = await convertUriToFile(asset.uri, `avatar-${Date.now()}.jpg`);
			setSelectedFile(file);
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
			const asset = result.assets[0];
			setAvatar(asset.uri);
			// Convert URI to File for upload
			const file = await convertUriToFile(asset.uri, `avatar-${Date.now()}.jpg`);
			setSelectedFile(file);
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

	const handleSave = async () => {
		if (!selectedFile && !bio) {
			Alert.alert("No changes", "Please make some changes before saving");
			return;
		}

		try {
			setIsUploading(true);

			let avatarKey: string | undefined;

			// Upload avatar if selected and get the key
			if (selectedFile) {
				avatarKey = await uploadFile(selectedFile);
				console.log("Avatar uploaded successfully with key:", avatarKey);
			}

			// Update profile with avatar key and/or bio
			await updateProfile({
				...(avatarKey && { avatarKey }),
				...(bio && { bio }),
			});

			Alert.alert("Success", "Profile updated successfully!");
			setAvatar(null);
			setBio("");
			setSelectedFile(null);
			router.back();
		} catch (error) {
			console.error("Upload error:", error);
			Alert.alert("Error", "Failed to update profile. Please try again.");
		} finally {
			setIsUploading(false);
		}
	};

	const StyledArrowLeft = withUniwind(ArrowLeft);

	return (
		<Container edges={["top"]}>
			<ScrollView>
				<View className="px-4 bg-brand-background">
					<View className="flex flex-row items-center">
						<Button isIconOnly variant="ghost" onPress={() => router.back()}>
							<Button.Label>
								<StyledArrowLeft size={24} />
							</Button.Label>
						</Button>
						<Text className="font-mono text-foreground text-3xl font-bold">Edit Profile</Text>
					</View>

					{/* Avatar Section */}
					<View className="items-center mb-8">
						<View className="relative">
							<Avatar size="lg" alt={"avatar"} variant="soft" color="success">
								<Avatar.Image
									source={{ uri: (avatar as string) || (profile?.avatarUrl as string) }}
								/>
								<Avatar.Fallback />
							</Avatar>
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
							{/*<Camera size={18} color="white" />*/}
							<Button.Label className="text-black">Change Photo</Button.Label>
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

						<TextField>
							<TextField.Label>Bio</TextField.Label>
							<TextField.Input
								placeholder="Enter your bio"
								value={bio}
								onChangeText={setBio}
								autoCapitalize="none"
								autoComplete="off"
								// onBlur={() => handleBlur("email")}
							/>
							{/*<TextField.Description>We'll never share your email</TextField.Description>*/}
							{/*<TextField.ErrorMessage>{getFieldError("email")}</TextField.ErrorMessage>*/}
						</TextField>

						{/* Save Button */}
						<Button
							variant="primary"
							size="lg"
							onPress={handleSave}
							className="mt-6 bg-primary"
							isDisabled={isUploading || (!selectedFile && !bio)}
						>
							{isUploading ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								<Button.Label>Save Changes</Button.Label>
							)}
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
