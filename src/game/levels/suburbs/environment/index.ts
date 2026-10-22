import type { IEnvironmentConfig } from "../../types";

export const SUBURBS_ENVIRONMENT: IEnvironmentConfig = {
	street: {
		ROAD_SEGMENT_LENGTH: 48,
		ROAD_SEGMENT_COUNT: 8,
		ROAD_SEGMENTS_BEHIND: 1,
		SIDEWALK_WIDTH: 2.2,
		DESPAWN_Z: -72,
	},
	rows: {
		BUILDINGS: {
			COUNT_PER_SIDE: 10,
			SPACING: 30,
			START_Z: -56,
			GAP: 3.2,
			FAR_SETBACK: 8.2,
			SEED_LEFT: 5000,
			SEED_RIGHT: 6000,
		},
		HOUSES: {
			COUNT_PER_SIDE: 8,
			SPACING: 22,
			START_Z: -32,
			ROW_DEPTH: 8,
			CURB_GAP: 1.2,
			SEED_LEFT: 7000,
			SEED_RIGHT: 8000,
		},
		TRAFFIC_LIGHTS: {
			COUNT_PER_SIDE: 6,
			SPACING: 52,
			START_Z: -18,
			CURB_OFFSET: 1.15,
			SEED_LEFT: 9000,
			SEED_RIGHT: 9100,
		},
		STREET_LIGHTS: {
			COUNT_PER_SIDE: 5,
			SPACING: 64,
			START_Z: -28,
			SIDEWALK_INSET: 1.85,
			SEED_LEFT: 9200,
			SEED_RIGHT: 9300,
		},
		CROSSWALKS: {
			COUNT: 3,
			SEED: 9400,
			START_Z: 28,
			MIN_SPACING: 68,
			SPACING_JITTER: 52,
		},
		ROAD_SIGNS: {
			COUNT: 18,
			SEED: 9500,
			START_Z: -8,
			MIN_SPACING: 16,
			SPACING_JITTER: 24,
			SIDEWALK_INSET: 1.45,
		},
		TRASH_BINS: {
			SIDEWALK: {
				COUNT: 4,
				SEED: 9600,
				START_Z: 6,
				MIN_SPACING: 58,
				SPACING_JITTER: 42,
				INSET: 1.15,
			},
			BETWEEN_HOUSES: {
				SEED: 9700,
				GAP_CHANCE: 0.28,
				Z_JITTER: [-1.5, 1.5],
				ROW_INSET: 5.8,
			},
		},
		TREES: {
			COUNT_PER_SIDE: 16,
			SPACING: 15,
			START_Z: -44,
			ROW_INSET: -1.3,
			Z_JITTER: [-2.0, 2.0],
			X_JITTER: [-0.15, 0.15],
			SKIP_CHANCE: 0.08,
			SEED_LEFT: 9800,
			SEED_RIGHT: 9900,
			PALM_CHANCE: 0.7,
		},
	},
	houses: {
		wallColors: [
			0xdc6e50, 0xd06446, 0xe67c5e, 0xecdcbe, 0xe0ceae, 0xf4e6ce,
			0x82a4c2, 0x7296b4, 0x92b2d0, 0xe8c878, 0xdec06e, 0xd68076,
		],
		trimColors: [
			0xf6f0e6, 0xe8e0d4, 0x48382e, 0x382c24,
		],
		roofColors: [
			0xb44832, 0xc4543a, 0xa63e28, 0x3e322e,
		],
		doorColors: [
			0x2e2018, 0x3a2820, 0x483226, 0x1e1410,
		],
		awningColors: [
			0x8a3a1a, 0x1a5a3a, 0x22446a, 0xb45428,
		],
		neonColors: [0xffa834, 0x4ae0ff, 0xffd060, 0x34d490],
	},
};
