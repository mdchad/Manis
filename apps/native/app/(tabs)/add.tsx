import { useState, useEffect } from "react";
import {
	View,
	Text,
	Image,
	FlatList,
	TouchableOpacity,
	Dimensions,
	ActivityIndicator,
	Alert,
	Pressable,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { X, ChevronRight } from "lucide-react-native";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 3;
const GRID_SPACING = 2;
const GRID_ITEM_SIZE = (width - GRID_SPACING * (GRID_COLUMNS + 1)) / GRID_COLUMNS;

interface Photo {
	id: string;
	uri: string;
	width: number;
	height: number;
}

export default function AddScreen() {
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		requestPermissionAndLoadPhotos();
	}, []);

	const requestPermissionAndLoadPhotos = async () => {
		try {
			const { status } = await MediaLibrary.requestPermissionsAsync();
			setHasPermission(status === "granted");

			if (status === "granted") {
				await loadPhotos();
			} else {
				setLoading(false);
				Alert.alert(
					"Permission Required",
					"Please grant photo library access to select photos for your post."
				);
			}
		} catch (error) {
			console.error("Error requesting permissions:", error);
			setLoading(false);
		}
	};

	const loadPhotos = async () => {
		try {
			setLoading(true);
			const album = await MediaLibrary.getAlbumAsync("Recent");
			const albumAssets = album
				? await MediaLibrary.getAssetsAsync({
						album: album,
						first: 100,
						mediaType: "photo",
						sortBy: [MediaLibrary.SortBy.creationTime],
					})
				: await MediaLibrary.getAssetsAsync({
						first: 100,
						mediaType: "photo",
						sortBy: [MediaLibrary.SortBy.creationTime],
					});

			const photoData: Photo[] = albumAssets.assets.map((asset) => ({
				id: asset.id,
				uri: asset.uri,
				width: asset.width,
				height: asset.height,
			}));

			setPhotos(photoData);
			if (photoData.length > 0) {
				setSelectedPhoto(photoData[0]);
			}
		} catch (error) {
			console.error("Error loading photos:", error);
			Alert.alert("Error", "Failed to load photos from your library.");
		} finally {
			setLoading(false);
		}
	};

	const handlePhotoSelect = (photo: Photo) => {
		setSelectedPhoto(photo);
	};

	const handleNext = () => {
		if (selectedPhoto) {
			// TODO: Navigate to the next screen with the selected photo
			// You can pass the photo URI to the next screen
			console.log("Selected photo:", selectedPhoto.uri);
			Alert.alert("Next", `Selected photo: ${selectedPhoto.uri}`);
		}
	};

	const renderPhotoItem = ({ item }: { item: Photo }) => {
		const isSelected = selectedPhoto?.id === item.id;
		return (
			<TouchableOpacity
				onPress={() => handlePhotoSelect(item)}
				className="relative"
				style={{
					width: GRID_ITEM_SIZE,
					height: GRID_ITEM_SIZE,
					margin: GRID_SPACING / 2,
				}}
			>
				<Image
					source={{ uri: item.uri }}
					style={{ width: "100%", height: "100%" }}
					resizeMode="cover"
				/>
				{isSelected && <View className="absolute inset-0 border-2 border-primary bg-primary/20" />}
			</TouchableOpacity>
		);
	};

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-background">
				<ActivityIndicator size="large" />
				<Text className="mt-4 text-foreground">Loading photos...</Text>
			</View>
		);
	}

	if (!hasPermission) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-6">
				<Text className="text-center text-lg text-foreground mb-4">
					Photo library access is required
				</Text>
				<TouchableOpacity
					onPress={requestPermissionAndLoadPhotos}
					className="bg-primary px-6 py-3 rounded-lg"
				>
					<Text className="text-primary-foreground font-semibold">Grant Permission</Text>
				</TouchableOpacity>
			</View>
		);
	}

	if (photos.length === 0) {
		return (
			<View className="flex-1 items-center justify-center bg-background p-6">
				<Text className="text-center text-lg text-foreground">No photos found in your library</Text>
			</View>
		);
	}

	return (
		<View className="flex-1 bg-background">
			{/* Header */}
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
				<Pressable onPress={() => router.back()}>
					<X size={28} color="currentColor" className="text-foreground" />
				</Pressable>
				<Text className="text-lg font-semibold text-foreground">NEW POST</Text>
				<Pressable onPress={handleNext} disabled={!selectedPhoto}>
					<ChevronRight size={28} color={selectedPhoto ? "#007AFF" : "#999"} />
				</Pressable>
			</View>

			{/* Selected Photo Preview */}
			{selectedPhoto && (
				<View
					className="bg-black"
					style={{
						width: width,
						height: width,
					}}
				>
					<Image
						source={{ uri: selectedPhoto.uri }}
						style={{ width: "100%", height: "100%" }}
						resizeMode="cover"
					/>
				</View>
			)}

			{/* Recent Photos Label */}
			<View className="flex-row items-center justify-between px-4 py-3 border-b border-border">
				<Text className="text-base font-medium text-foreground">RECENTS</Text>
				<Text className="text-sm text-muted-foreground">DRAFTS</Text>
			</View>

			{/* Photo Grid */}
			<FlatList
				data={photos}
				renderItem={renderPhotoItem}
				keyExtractor={(item) => item.id}
				numColumns={GRID_COLUMNS}
				contentContainerStyle={{
					padding: GRID_SPACING / 2,
				}}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
}
