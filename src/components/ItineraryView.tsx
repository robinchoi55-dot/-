import React, { useState } from 'react';
import { 
  TravelPlanResult, 
  ActivityLocation, 
  PopularSpotRecommendation, 
  TravelPlanRequest,
  BetweenSpotRecommendation 
} from '../types/travel';
import { InteractiveMap } from './InteractiveMap';
import { ItineraryTimeline } from './ItineraryTimeline';
import { 
  Share2, 
  Download, 
  Sparkles, 
  Navigation2, 
  Check, 
  RefreshCw, 
  Info, 
  Plus, 
  Trash2, 
  ListPlus, 
  SlidersHorizontal, 
  Flame,
  PlusCircle
} from 'lucide-react';

interface ItineraryViewProps {
  plan: TravelPlanResult;
  apiKey: string;
  onReset: () => void;
  onRefreshPlan: (updatedPlaces: string[], pace: 'compact' | 'balanced' | 'relaxed') => void;
  isRefreshing: boolean;
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  plan,
  apiKey,
  onReset,
  onRefreshPlan,
  isRefreshing,
}) => {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedActivityIndex, setSelectedActivityIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Collect all spot names currently in the plan (excluding start/end/meals)
  const existingSpots = React.useMemo(() => {
    const list: string[] = [];
    plan.days.forEach(d => {
      d.activities.forEach(a => {
        if (a.type !== 'start' && a.type !== 'end' && !a.type.startsWith('meal')) {
          if (!list.includes(a.name)) list.push(a.name);
        }
      });
    });
    return list;
  }, [plan]);

  const [activePlaces, setActivePlaces] = useState<string[]>(existingSpots);
  const [customNewPlace, setCustomNewPlace] = useState('');
  const [planPace, setPlanPace] = useState<'compact' | 'balanced' | 'relaxed'>('compact');
  const [showSpotManager, setShowSpotManager] = useState(false);

  // Sync state whenever plan changes
  React.useEffect(() => {
    setActivePlaces(existingSpots);
  }, [existingSpots]);

  const currentDay = plan.days[activeDayIndex] || plan.days[0];

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const popularSpots: PopularSpotRecommendation[] = plan.popularSpotPool && plan.popularSpotPool.length > 0
    ? plan.popularSpotPool
    : [
        { name: "도쿄 타워 (Tokyo Tower)", category: "전망대/랜드마크", description: "도쿄를 상징하는 붉은 철탑과 환상적인 도심 야경", recommendedDuration: "1시간 30분" },
        { name: "오모테산도 힐즈 & 카페거리", category: "쇼핑/카페", description: "감각적인 부티크와 유명 베이커리, 플래그십 스토어 밀집", recommendedDuration: "2시간" },
        { name: "롯폰기 모리타워 전망대", category: "전망/미술", description: "도쿄 시내 360도 파노라마 뷰와 현대미술 기획전", recommendedDuration: "2시간" },
        { name: "아키하바라 전자상가 & 피규어거리", category: "문화/쇼핑", description: "애니메이션, 서브컬처, 전자기기 테마 쇼핑 거리", recommendedDuration: "1시간 30분" },
        { name: "메이지 신궁 & 요요기 공원", category: "자연풍경/역사", description: "도심 속 울창한 녹음과 고즈넉한 삼나무 숲길 산책", recommendedDuration: "1시간 30분" },
        { name: "츠키지 장외시장", category: "로컬미식/시장", description: "신선한 해산물 덮밥, 계란말이, 길거리 해산물 간식", recommendedDuration: "1시간 30분" }
      ];

  // 1. Remove spot directly from the timeline card and immediately trigger replacement refresh
  const handleRemoveSpotFromTimeline = (spotNameToRemove: string) => {
    // 1. Remove the spot
    const filtered = activePlaces.filter(p => !p.includes(spotNameToRemove) && !spotNameToRemove.includes(p));
    
    // 2. Pick a replacement from popular spots that isn't already in activePlaces
    const candidateReplacement = popularSpots.find(pop => !filtered.some(p => p.includes(pop.name) || pop.name.includes(p)));
    const updatedPlaces = candidateReplacement ? [...filtered, candidateReplacement.name] : filtered;

    setActivePlaces(updatedPlaces);
    // 3. Immediately refresh plan with new set
    onRefreshPlan(updatedPlaces, planPace);
  };

  // 2. Insert recommended spot between two consecutive schedule items
  const handleInsertSpotBetween = (targetIndex: number, newSpot: BetweenSpotRecommendation) => {
    const updatedPlaces = [...activePlaces];
    if (!updatedPlaces.includes(newSpot.name)) {
      // Find position of the spot at targetIndex to insert right next to it
      const currentActivityName = currentDay.activities[targetIndex]?.name;
      const foundIdx = updatedPlaces.findIndex(p => p.includes(currentActivityName) || currentActivityName?.includes(p));
      
      if (foundIdx !== -1) {
        updatedPlaces.splice(foundIdx + 1, 0, newSpot.name);
      } else {
        updatedPlaces.push(newSpot.name);
      }
    }

    setActivePlaces(updatedPlaces);
    onRefreshPlan(updatedPlaces, planPace);
  };

  const handleTogglePopularSpot = (spotName: string) => {
    if (activePlaces.includes(spotName)) {
      setActivePlaces(activePlaces.filter(p => p !== spotName));
    } else {
      setActivePlaces([...activePlaces, spotName]);
    }
  };

  const handleAddCustomSpot = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customNewPlace.trim();
    if (trimmed && !activePlaces.includes(trimmed)) {
      setActivePlaces([...activePlaces, trimmed]);
      setCustomNewPlace('');
    }
  };

  const handleRemovePlaceFromManager = (placeName: string) => {
    setActivePlaces(activePlaces.filter(p => p !== placeName));
  };

  const handleTriggerManualRefresh = () => {
    onRefreshPlan(activePlaces, planPace);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-stone-100 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-100 text-amber-900 rounded-md">
                {plan.destination}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md">
                {plan.durationText}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-md">
                {plan.transportation}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 bg-rose-50 text-rose-700 rounded border border-rose-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-500" />
                알찬 동선 최적화 코스
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
              {plan.title}
            </h1>
            <p className="text-sm text-stone-600 max-w-3xl leading-relaxed">
              {plan.summary}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setShowSpotManager(!showSpotManager)}
              className="px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>{showSpotManager ? '명소 관리 닫기' : '명소 추가·제외 관리'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? '복사 완료' : '공유하기'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>인쇄 / PDF</span>
            </button>
            <button
              onClick={onReset}
              className="px-3 py-2 bg-stone-900 hover:bg-black text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>새 여행지 설정</span>
            </button>
          </div>
        </div>

        {/* City Average Hotel Price Bar */}
        <div className="pt-4 mt-4 border-t border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-stone-800 flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded">
              🏨 {plan.destination} 평균 호텔 1박 가격:
            </span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 font-medium">
              실속 가성비: {plan.cityAverageHotelPrice?.budget || '약 80,000원 ~ 110,000원'}
            </span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded border border-blue-200 font-medium">
              스탠다드: {plan.cityAverageHotelPrice?.standard || '약 140,000원 ~ 220,000원'}
            </span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-800 rounded border border-purple-200 font-medium">
              럭셔리/리조트: {plan.cityAverageHotelPrice?.luxury || '약 320,000원 이상'}
            </span>
          </div>
          {plan.cityAverageHotelPrice?.currencyNote && (
            <span className="text-[11px] text-stone-400">
              * {plan.cityAverageHotelPrice.currencyNote}
            </span>
          )}
        </div>

        {/* Selected Themes & Overall Tips */}
        <div className="pt-3 mt-1 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-stone-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-stone-700">테마:</span>
            {plan.themes.map((theme, idx) => (
              <span key={idx} className="text-stone-600 font-medium">
                #{theme}
              </span>
            ))}
          </div>
          {plan.overallTravelTips && plan.overallTravelTips.length > 0 && (
            <div className="text-stone-600 flex items-center gap-1 text-[11px] bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200">
              <span className="font-semibold text-amber-700">💡 로컬 가이드:</span>
              <span className="truncate max-w-md">{plan.overallTravelTips[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Spot Manager Drawer Panel */}
      {showSpotManager && (
        <div className="bg-white rounded-2xl border-2 border-amber-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-stone-900">
                인기 여행지 추가/제외 & 코스 재구성
              </h3>
            </div>
            <button
              onClick={() => setShowSpotManager(false)}
              className="text-xs text-stone-400 hover:text-stone-700"
            >
              ✕ 닫기
            </button>
          </div>

          <p className="text-xs text-stone-500">
            아래 인기 명소를 클릭하여 추가하거나, 아래 일정표 카드에서 <strong>[대체]</strong> 또는 <strong>[추가]</strong> 버튼을 누르면 다음 일정 사이의 최적 명소가 자동으로 채워집니다.
          </p>

          {/* Popular recommendations list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {popularSpots.map((spot, idx) => {
              const isChecked = activePlaces.some(p => p.includes(spot.name) || spot.name.includes(p));
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleTogglePopularSpot(spot.name)}
                  className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 ${
                    isChecked
                      ? 'border-amber-600 bg-amber-50/70 text-amber-950 ring-1 ring-amber-600'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className={`mt-0.5 shrink-0 w-4 h-4 rounded flex items-center justify-center border ${
                    isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-stone-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-xs font-bold truncate">{spot.name}</span>
                      <span className="text-[10px] text-stone-400 shrink-0">{spot.category}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1">{spot.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Currently Selected Chips */}
          <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold text-stone-600 mr-1">포함된 명소:</span>
            {activePlaces.map((place, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 border border-stone-200 rounded-lg text-xs font-medium text-stone-800"
              >
                <span>{place}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePlaceFromManager(place)}
                  className="text-stone-400 hover:text-rose-600 ml-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom spot and submit refresh */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <form onSubmit={handleAddCustomSpot} className="flex gap-2 w-full sm:w-auto flex-1 max-w-md">
              <input
                type="text"
                value={customNewPlace}
                onChange={(e) => setCustomNewPlace(e.target.value)}
                placeholder="원하는 명소 직접 추가"
                className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium shrink-0"
              >
                + 추가
              </button>
            </form>

            <button
              onClick={handleTriggerManualRefresh}
              disabled={isRefreshing || activePlaces.length === 0}
              className="w-full sm:w-auto px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
            >
              {isRefreshing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>동선 재최적화 중...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>선택한 명소로 일정 다시 짜기</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-stone-200">
        {plan.days.map((d, index) => {
          const isActive = index === activeDayIndex;
          return (
            <button
              key={index}
              onClick={() => {
                setActiveDayIndex(index);
                setSelectedActivityIndex(null);
              }}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <span>{d.dateLabel || `Day ${d.dayNumber}`}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                isActive ? 'bg-stone-700 text-stone-200' : 'bg-stone-100 text-stone-500'
              }`}>
                {d.activities.length}개 스팟
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Map (Left) & Timeline with [대체] and [추가] (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Map */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-4">
          <div className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center gap-2">
                <Navigation2 className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-stone-800">
                  {currentDay.dateLabel || `Day ${currentDay.dayNumber}`} 최적 이동 경로 & 장소 맵
                </span>
              </div>
              <span className="text-[11px] text-stone-500">
                실시간 구글 지도 연동
              </span>
            </div>

            <div className="h-[460px] w-full">
              <InteractiveMap
                apiKey={apiKey}
                day={currentDay}
                selectedActivityIndex={selectedActivityIndex}
                onSelectActivity={(idx) => setSelectedActivityIndex(idx)}
              />
            </div>
          </div>

          {/* Tips Box */}
          {plan.overallTravelTips && plan.overallTravelTips.length > 0 && (
            <div className="bg-white p-4 rounded-xl border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-600" />
                현지 이동 & 여행 추천 가이드
              </h4>
              <ul className="space-y-1.5 text-xs text-stone-600">
                {plan.overallTravelTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Timeline & [대체] & [추가] Buttons */}
        <div className="lg:col-span-5 xl:col-span-5 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs h-fit max-h-[850px] overflow-y-auto">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
            <span className="text-xs font-bold text-stone-700">시간대별 일정표</span>
            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-amber-700 font-medium">💡 [대체]: 다른 곳으로 교체</span>
              <span className="text-stone-300">|</span>
              <span className="text-emerald-700 font-medium">✨ [추가]: 사이 추천 추가</span>
            </div>
          </div>

          <ItineraryTimeline
            day={currentDay}
            selectedActivityIndex={selectedActivityIndex}
            onSelectActivity={(idx) => setSelectedActivityIndex(idx)}
            transportationMode={plan.transportation}
            destination={plan.destination}
            onRemoveSpotAndReplace={handleRemoveSpotFromTimeline}
            onInsertSpotBetween={handleInsertSpotBetween}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>
    </div>
  );
};
