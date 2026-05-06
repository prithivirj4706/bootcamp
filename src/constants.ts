/**
 * Constants for threshold logic and safety limits
 * Based on SIH 2025 Project A.S.T.R.A. requirements
 */

export const THRESHOLDS = {
  CO: 35,         // ppm
  H2S: 10,        // ppm
  O2_MIN: 19.5,   // %
  HEART_RATE: 130, // bpm
  SPO2_MIN: 90,   // %
  IMPACT: 4.5,    // Gs
};

export const MOCK_RANGES = {
  CO: { min: 0, max: 45 },
  H2S: { min: 0, max: 15 },
  O2: { min: 18, max: 21 },
  TEMP: { min: 20, max: 45 },
  BPM: { min: 60, max: 150 },
  SPO2: { min: 85, max: 100 },
  FATIGUE: { min: 0, max: 100 },
  BATTERY: { min: 0, max: 100 },
};
