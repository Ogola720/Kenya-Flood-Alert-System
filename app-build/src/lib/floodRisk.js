// Kenya Flood Alert System - SCS-CN Flood Risk Computation Engine
// Based on Section 3 of the architecture document

/**
 * SCS-CN Method for computing direct surface runoff
 * Q = (P - Ia)^2 / (P - Ia + S)
 * where Ia = 0.2 * S (initial abstraction)
 * S = (25400 / CN) - 254 (potential maximum retention in mm)
 */
export function computeRunoff(rainfall_mm, curveNumber) {
    const S = (25400 / curveNumber) - 254;
    const Ia = 0.2 * S;

    if (rainfall_mm <= Ia) return 0;

    const Q = Math.pow(rainfall_mm - Ia, 2) / (rainfall_mm - Ia + S);
    return Math.max(0, Q);
}

/**
 * Compute potential maximum retention S from Curve Number
 */
export function computeMaxRetention(curveNumber) {
    return (25400 / curveNumber) - 254;
}

/**
 * Adjust Curve Number based on Antecedent Moisture Condition (AMC)
 * AMC I (Dry): CN_I = 4.2 * CN_II / (10 - 0.058 * CN_II)
 * AMC III (Wet): CN_III = 23 * CN_II / (10 + 0.13 * CN_II)
 */
export function adjustCurveNumber(cn_ii, amcClass) {
    switch (amcClass) {
        case 'I': // Dry
            return (4.2 * cn_ii) / (10 - 0.058 * cn_ii);
        case 'III': // Wet
            return Math.min(98, (23 * cn_ii) / (10 + 0.13 * cn_ii));
        default: // AMC II - Average
            return cn_ii;
    }
}

/**
 * Determine AMC class from antecedent 5-day rainfall
 * Based on growing season thresholds
 */
export function getAMCClass(antecedent5DayRainfall_mm) {
    if (antecedent5DayRainfall_mm < 36) return 'I';   // Dry
    if (antecedent5DayRainfall_mm <= 53) return 'II';  // Average
    return 'III';                                        // Wet
}

/**
 * Compute the Antecedent Rainfall Index (ARI)
 * disaster_index = antecedent_rainfall / intraday_rainfall
 * When disaster_index > 0.5, flood correlation approaches certainty
 */
export function computeDisasterIndex(antecedentRainfall_mm, intradayRainfall_mm) {
    if (intradayRainfall_mm === 0) return 0;
    return antecedentRainfall_mm / intradayRainfall_mm;
}

/**
 * Get dynamic rainfall threshold based on soil moisture
 * From Section 3.2.2 table in the architecture document
 */
export function getDynamicThreshold(amcClass) {
    switch (amcClass) {
        case 'I': return 45.0;  // Dry: > 45.0 mm/hr
        case 'II': return 34.5;  // Average: > 34.5 mm/hr (Nairobi empirical)
        case 'III': return 15.0;  // Wet: > 15.0 mm/hr
        default: return 34.5;
    }
}

/**
 * Compute comprehensive flood risk score (0-100)
 * Combines: rainfall intensity, soil saturation, runoff volume, imperviousness
 */
export function computeFloodRiskScore({
    currentRainfall_mmhr,
    antecedent5DayRainfall_mm = 0,
    curveNumber = 89,
    imperviousness = 0.55,
    soilMoisture = 0.5,
}) {
    // 1. Determine AMC class and adjust CN
    const amcClass = getAMCClass(antecedent5DayRainfall_mm);
    const adjustedCN = adjustCurveNumber(curveNumber, amcClass);

    // 2. Get the dynamic threshold
    const threshold = getDynamicThreshold(amcClass);

    // 3. Rainfall intensity score (0-40 points)
    const intensityRatio = currentRainfall_mmhr / threshold;
    const intensityScore = Math.min(40, intensityRatio * 30);

    // 4. Soil saturation score (0-25 points)
    const saturationScore = soilMoisture * 25;

    // 5. Runoff potential score (0-20 points)
    const runoff = computeRunoff(currentRainfall_mmhr, adjustedCN);
    const runoffScore = Math.min(20, (runoff / 10) * 20);

    // 6. Imperviousness multiplier (0-15 points)
    const impervScore = imperviousness * 15;

    const totalScore = Math.min(100, intensityScore + saturationScore + runoffScore + impervScore);
    return Math.round(totalScore);
}

/**
 * Classify risk level from score
 */
export function classifyRisk(score) {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MODERATE';
    return 'LOW';
}

/**
 * Generate risk summary text
 */
export function getRiskSummary(score, cityName) {
    const level = classifyRisk(score);
    const summaries = {
        LOW: `${cityName} is currently at LOW flood risk. Normal conditions prevail. Continue monitoring.`,
        MODERATE: `${cityName} has MODERATE flood risk. Increased rainfall detected. Stay alert for updates.`,
        HIGH: `${cityName} is at HIGH flood risk. Heavy rainfall exceeding safe thresholds. Prepare for possible evacuation.`,
        CRITICAL: `🚨 CRITICAL: ${cityName} faces IMMINENT FLOOD DANGER. Immediate evacuation recommended for flood-prone zones.`,
    };
    return summaries[level];
}
