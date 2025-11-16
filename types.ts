export interface FoodInfo {
  foodName: string;
  reason: string;
  recommendation?: string;
  alternative?: string;
}

export interface AnalysisResult {
  growthBoosters: FoodInfo[];
  growthSlowers: FoodInfo[];
}
