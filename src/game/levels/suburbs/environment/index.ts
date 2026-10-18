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
			CURB_GAP: 0.6,
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
			COUNT_PER_SIDE: 14,
			SPACING: 16,
			START_Z: -44,
			ROW_INSET: 2.35,
			Z_JITTER: [-2.5, 2.5],
			X_JITTER: [-0.45, 0.45],
			SKIP_CHANCE: 0.1,
			SEED_LEFT: 9800,
			SEED_RIGHT: 9900,
		},
	},
	houses: {
		wallColors: [
			0xe8dcc8, 0xd8ccb8, 0xc8bca8, 0xf0e4d0, 0xb8ac98, 0xa89c88,
		],
		trimColors: [
			0x8a7868, 0x6a5848, 0x4a3828, 0x9a8878, 0x3a2818,
		],
		roofColors: [
			0x3a2a1a, 0x4a3a2a, 0x2a1a0a, 0x5a4a3a,
		],
		doorColors: [
			0x2a1808, 0x3a2818, 0x1a0808, 0x4a3828,
		],
		awningColors: [
			0x8a3a1a, 0x2a5a3a, 0x2a3a6a, 0x8a6a1a,
		],
		neonColors: [0xff6a2a, 0x2aff6a, 0xffd42a, 0x2ad4ff],
	},
};
