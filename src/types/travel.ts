export interface TravelPlanRequest {
  destination: string;
  durationDays: number;
  durationNights: number;
  startDate?: string;
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "20:00"
  startLocation: string; // e.g. "인천국제공항 T1"
  endLocation: string;   // e.g. "인천국제공항 T1" or "호텔"
  transportation: 'rental_car' | 'transit' | 'walking';
  themes: string[]; // e.g. ['골프', '쇼핑', '자연풍경', '미술관', '박물관', '액티비티', '미식/카페', '역사/유적', '휴식/힐링']
  desiredPlaces: string[]; // user specified landmarks/spots
  hotelBudgetTier: 'budget' | 'standard' | 'luxury'; // e.g. '가성비 (10만원대 이하)', '스탠다드 (10~25만원대)', '럭셔리 (30만원 이상)'
  additionalNotes?: string;
  pace?: 'compact' | 'balanced' | 'relaxed';
}

export interface CandidateSpot {
  name: string;
  category: string;
  theme?: string; // 연결된 여행 테마 (예: "골프", "자연풍경", "미식/카페", "미술관" 등)
  area: string; // 권역/지역 (예: "애월/한림", "시부야/하라주쿠", "중문관광단지", "긴자/도쿄역")
  description: string;
  recommendedDuration: string;
  highlight: string; // "많은 여행객이 필수로 찾는 랜드마크", "노을 명소", "핫플레이스"
  lat?: number;
  lng?: number;
}

export interface BetweenSpotRecommendation {
  name: string;
  category: string;
  description: string;
  recommendedDurationMinutes: number;
  whyRecommend: string;
  googleMapsUrl: string;
  tips?: string;
  lat?: number;
  lng?: number;
}

export interface TransitInfo {
  mode: 'car' | 'transit' | 'walk' | 'bus' | 'subway' | 'taxi';
  modeLabel: string; // e.g. "도보", "지하철", "시내버스", "렌터카", "택시"
  durationText: string; // e.g. "약 15분"
  distanceText: string; // e.g. "1.2 km"
  routeTip?: string; // e.g. "도쿄메트로 긴자선 탑승 후 긴자역 4번 출구 도보 3분"
  cost?: string; // e.g. "210엔" or "무료 도보"
}

export interface ActivityLocation {
  name: string;
  type: 'spot' | 'golf' | 'meal_lunch' | 'meal_dinner' | 'meal_breakfast' | 'cafe' | 'hotel' | 'start' | 'end';
  category?: string;
  address?: string;
  googleMapsUrl: string;
  lat?: number;
  lng?: number;
  timeSlot: string; // e.g. "09:30 - 11:30"
  durationMinutes: number;
  description: string;
  tips?: string;
  estimatedCost?: string;
  estimatedTransitFromPrev?: TransitInfo;
}

export interface HotelRecommendation {
  name: string;
  address: string;
  googleMapsUrl: string;
  averagePricePerNight: string; // e.g. "평균 1박 약 160,000원 (약 18,000엔)"
  priceRange: string; // e.g. "1박 140,000원 ~ 180,000원"
  tier: string; // e.g. "스탠다드 부티크", "가성비 비즈니스", "럭셔리 5성급"
  description: string;
  bookingTip?: string;
  lat?: number;
  lng?: number;
  transitToHotel?: TransitInfo;
  transitFromHotel?: TransitInfo;
}

export interface DayItinerary {
  dayNumber: number;
  dateLabel?: string;
  themeSummary: string;
  activities: ActivityLocation[];
  hotelRecommendation?: HotelRecommendation;
}

export interface PopularSpotRecommendation {
  name: string;
  category: string;
  description: string;
  recommendedDuration: string;
}

export interface TravelPlanResult {
  title: string;
  destination: string;
  summary: string;
  durationText: string;
  transportation: string;
  themes: string[];
  days: DayItinerary[];
  overallTravelTips: string[];
  cityAverageHotelPrice?: {
    budget: string;   // e.g. "약 80,000원 ~ 110,000원"
    standard: string; // e.g. "약 150,000원 ~ 220,000원"
    luxury: string;   // e.g. "약 350,000원 이상"
    currencyNote?: string; // e.g. "현지 통화 기준 (엔화 약 9,000엔~25,000엔)"
  };
  popularSpotPool?: PopularSpotRecommendation[];
  requestParams?: TravelPlanRequest;
}
