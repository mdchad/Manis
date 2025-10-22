import { hairlineWidth } from "nativewind/theme";

/** @type {import('tailwindcss').Config} */
export const darkMode = "class";
export const content = [
	"./app/**/*.{js,ts,tsx}",
	"./components/**/*.{js,ts,tsx}",
];
export const presets = [require("nativewind/preset")];
export const theme = {
	extend: {
		colors: {
			background: "hsl(var(--background))",
			foreground: "hsl(var(--foreground))",
			card: {
				DEFAULT: "hsl(var(--card))",
				foreground: "hsl(var(--card-foreground))",
			},
			popover: {
				DEFAULT: "hsl(var(--popover))",
				foreground: "hsl(var(--popover-foreground))",
			},
			primary: {
				DEFAULT: "#e2296f",
				foreground: "hsl(var(--primary-foreground))",
				50: "#fdf2f7",
				100: "#fbe9f1",
				200: "#fad2e5",
				300: "#fcaad0",
				400: "#fa6ead",
				500: "#f44791",
				600: "#e2296f",
				700: "#c41955",
				800: "#a11646",
				900: "#86173d",
				950: "#52031f",
			},
			secondary: {
				DEFAULT: "#8cb700",
				foreground: "hsl(var(--secondary-foreground))",
				50: "#f9fde6",
				100: "#eef7cc",
				200: "#ddef9d",
				300: "#c5e45b",
				400: "#a9d203",
				500: "#8cb700",
				600: "#6d9300",
				700: "#537004",
				800: "#445a0b",
				900: "#3b4e0d",
				950: "#1f2d00",
			},
			muted: {
				DEFAULT: "hsl(var(--muted))",
				foreground: "hsl(var(--muted-foreground))",
			},
			accent: {
				DEFAULT: "hsl(var(--accent))",
				foreground: "hsl(var(--accent-foreground))",
			},
			destructive: {
				DEFAULT: "hsl(var(--destructive))",
				foreground: "hsl(var(--destructive-foreground))",
			},
			border: "hsl(var(--border))",
			input: "hsl(var(--input))",
			ring: "hsl(var(--ring))",
			radius: "var(--radius)",
		},
		borderRadius: {
			xl: "calc(var(--radius) + 4px)",
			lg: "var(--radius)",
			md: "calc(var(--radius) - 2px)",
			sm: "calc(var(--radius) - 4px)",
		},
		borderWidth: {
			hairline: hairlineWidth(),
		},
	},
};
export const plugins = [];
