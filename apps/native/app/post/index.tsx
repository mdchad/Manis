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
	const StyledArrowLeft = withUniwind(ArrowLeft);

	return (
		<Container edges={["top"]}>
			<ScrollView>
				<View className="px-4 bg-brand-background"></View>
			</ScrollView>
		</Container>
	);
}
