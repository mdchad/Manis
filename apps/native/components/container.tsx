import React from "react";
import { Edges, SafeAreaView } from "react-native-safe-area-context";
import { withUniwind } from "uniwind";

export const Container = ({
	children,
	edges = [],
}: {
	children: React.ReactNode;
	edges?: Edges;
}) => {
	const StyledSafeAreaView = withUniwind(SafeAreaView);

	return (
		<StyledSafeAreaView className="flex-1 bg-brand-background" edges={edges}>
			{children}
		</StyledSafeAreaView>
	);
};
