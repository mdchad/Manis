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
	ScrollView,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import { X, ChevronRight, ArrowRightIcon, CheckIcon } from "lucide-react-native";
import { router } from "expo-router";
import { Container } from "@/components/container";
import { Checkbox } from "heroui-native";
import { useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";

const { width } = Dimensions.get("window");
const GRID_COLUMNS = 4;
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
	const [selectedPhotos, setSelectedPhotos] = useState<Photo[]>([]);
	const [primaryPhoto, setPrimaryPhoto] = useState<Photo | null>(null);
	const [hasPermission, setHasPermission] = useState<boolean | null>(null);
	const [loading, setLoading] = useState(true);
	const [isCreatingDraft, setIsCreatingDraft] = useState(false);

	// Convex hooks
	const createDraftPost = useMutation(api.posts.createDraftPost);

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

			// Get actual file URIs (not ph:// URIs)
			const photoData: Photo[] = await Promise.all(
				albumAssets.assets.map(async (asset) => {
					const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);
					return {
						id: asset.id,
						uri: assetInfo.localUri || assetInfo.uri,
						width: asset.width,
						height: asset.height,
					};
				})
			);

			setPhotos(photoData);
			if (photoData.length > 0) {
				setPrimaryPhoto(photoData[0]);
				setSelectedPhotos([photoData[0]]);
			}
		} catch (error) {
			console.error("Error loading photos:", error);
			Alert.alert("Error", "Failed to load photos from your library.");
		} finally {
			setLoading(false);
		}
	};

	const handlePhotoSelect = (photo: Photo) => {
		const isAlreadySelected = selectedPhotos.some((p) => p.id === photo.id);

		if (isAlreadySelected) {
			// Deselect the photo - must keep at least one selected
			if (selectedPhotos.length > 1) {
				const newSelectedPhotos = selectedPhotos.filter((p) => p.id !== photo.id);
				setSelectedPhotos(newSelectedPhotos);

				// If we deselected the primary photo, set the first remaining photo as primary
				if (primaryPhoto?.id === photo.id) {
					setPrimaryPhoto(newSelectedPhotos[0]);
				}
			}
			// If only one photo is selected, don't allow deselection
		} else {
			// Add to selection (max 10 photos like Instagram)
			if (selectedPhotos.length < 10) {
				setSelectedPhotos([...selectedPhotos, photo]);
				// If this is the first photo being selected, make it primary
				if (selectedPhotos.length === 0) {
					setPrimaryPhoto(photo);
				}
			} else {
				Alert.alert("Maximum Reached", "You can select up to 10 photos.");
			}
		}
	};

	const handlePhotoPrimarySelect = (photo: Photo) => {
		// Tap to make this photo the primary preview
		setPrimaryPhoto(photo);
	};

	const handleNext = async () => {
		if (selectedPhotos.length === 0) return;

		try {
			setIsCreatingDraft(true);

			// Create draft post (without uploading images yet)
			const draftPostId = await createDraftPost({});

			// Pass photo URIs and draft post ID to edit screen
			const photoUris = selectedPhotos.map((p) => p.uri).join(",");
			router.push({
				pathname: "/post/edit",
				params: {
					photoUris: photoUris,
					draftPostId: draftPostId,
				},
			});
		} catch (error) {
			console.error("Error creating draft:", error);
			Alert.alert("Error", "Failed to create draft post. Please try again.");
		} finally {
			setIsCreatingDraft(false);
		}
	};

	const renderPhotoItem = ({ item }: { item: Photo }) => {
		const selectedIndex = selectedPhotos.findIndex((p) => p.id === item.id);
		const isSelected = selectedIndex !== -1;
		const selectionNumber = isSelected ? selectedIndex + 1 : null;

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

				{/* Checkbox with selection number */}
				<View className="absolute top-2 right-2">
					<Checkbox
						isSelected={isSelected}
						onSelectedChange={() => handlePhotoSelect(item)}
						className="w-6 h-6 rounded-full"
					>
						<Checkbox.Indicator className="bg-primary">
							{({ isSelected }) =>
								isSelected && selectionNumber ? (
									<Text className="text-white text-xs font-bold">{selectionNumber}</Text>
								) : null
							}
						</Checkbox.Indicator>
					</Checkbox>
				</View>
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
		<Container edges={["top"]}>
			<View className="bg-brand-background">
				{/* Selected Photo Preview with Header Inside */}
				{primaryPhoto && (
					<View
						className="bg-black relative"
						style={{
							width: width,
							height: width,
						}}
					>
						<Image
							source={{ uri: primaryPhoto.uri }}
							style={{ width: "100%", height: "100%" }}
							resizeMode="cover"
						/>

						{/* Header Overlay */}
						<View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-4 py-3">
							<Pressable onPress={() => router.back()} className="bg-black/30 rounded-full p-1">
								<X size={28} color="white" />
							</Pressable>
							<Text className="text-lg font-semibold text-white">NEW POST</Text>
							<Pressable
								onPress={handleNext}
								disabled={selectedPhotos.length === 0 || isCreatingDraft}
								className="bg-black/30 rounded-full p-1"
							>
								{isCreatingDraft ? (
									<ActivityIndicator size="small" color="white" />
								) : (
									<ArrowRightIcon size={28} color="white" />
								)}
							</Pressable>
						</View>

						{/* Multiple Selection Indicator */}
						{selectedPhotos.length > 1 && (
							<View className="absolute top-16 right-4 bg-black/60 px-3 py-1 rounded-full">
								<Text className="text-white text-sm font-semibold">
									{selectedPhotos.findIndex((p) => p.id === primaryPhoto.id) + 1}/
									{selectedPhotos.length}
								</Text>
							</View>
						)}
					</View>
				)}

				{/* Recent Photos Label */}
				<View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-[#262627]">
					<Text className="text-xs font-medium text-white">RECENTS</Text>
					<Text className="text-xs text-white">DRAFTS</Text>
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
		</Container>
	);
}
