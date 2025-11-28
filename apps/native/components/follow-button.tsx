import { Alert, TouchableOpacity, Text } from "react-native";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@manis/backend/convex/_generated/api";
import type { Id } from "@manis/backend/convex/_generated/dataModel";
import { Button } from "heroui-native";

interface FollowButtonProps {
	userId: Id<"user">;
	variant?: "default" | "ghost" | "outline";
	size?: "sm" | "md" | "lg";
}

export function FollowButton({ userId, variant = "outline", size = "md" }: FollowButtonProps) {
	const [isLoading, setIsLoading] = useState(false);
	const isFollowing = useQuery(api.follows.isFollowing, { userId });
	const follow = useMutation(api.follows.follow);
	const unfollow = useMutation(api.follows.unfollow);

	const handlePress = async () => {
		setIsLoading(true);
		try {
			if (isFollowing) {
				await unfollow({ userId });
			} else {
				await follow({ userId });
			}
		} catch (error) {
			Alert.alert("Error", error instanceof Error ? error.message : "Something went wrong");
		} finally {
			setIsLoading(false);
		}
	};

	// Show loading state while checking follow status
	if (isFollowing === undefined) {
		return (
			<Button variant={variant} size={size} isDisabled>
				<Button.Text>Loading...</Button.Text>
			</Button>
		);
	}

	return (
		<Button variant={variant} size={size} onPress={handlePress} isDisabled={isLoading}>
			<Button.Text>{isFollowing ? "Following" : "Follow"}</Button.Text>
		</Button>
	);
}
