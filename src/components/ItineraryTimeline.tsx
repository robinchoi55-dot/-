import React, { useState } from 'react';
import { DayItinerary, ActivityLocation, TransitInfo, BetweenSpotRecommendation } from '../types/travel';
import { 
  Clock, 
  MapPin, 
  ExternalLink, 
  Car, 
  Bus, 
  Footprints, 
  Utensils, 
  Hotel as HotelIcon, 
  ArrowRight,
  Navigation,
  Compass,
  Train,
  Trash2,
  Sparkles,
  PlusCircle,
  Plus,
  X,
  CheckCircle2,
  ChevronDown,
  Loader2
} from 'lucide-react';

interface ItineraryTimelineProps {
  day: DayItinerary;
  selectedActivityIndex: number | null;
  onSelectActivity: (index: number) => void;
  transportationMode: string;
  destination: string;
  onRemoveSpotAndReplace?: (spotName: string) => void;
  onInsertSpotBetween?: (targetIndex: number, newSpot: BetweenSpotRecommendation) => void;
  isRefreshing?: boolean;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  day,
  selectedActivityIndex,
  onSelectActivity,
  transportationMode,
  destination,
  onRemoveSpotAndReplace,
  onInsertSpotBetween,
  isRefreshing,
}) => {
  // State for '추가' (Add spot after index - supports middle and last spots)
  const [activeBetweenIndex, setActiveBetweenIndex] = useState<number | null>(null);
  const [betweenLoading, setBetweenLoading] = useState(false);
  const [betweenRecommendations, setBetweenRecommendations] = useState<BetweenSpotRecommendation[]>([]);
  const [betweenError, setBetweenError] = useState<string | null>(null);

  const handleOpenBetweenModal = async (index: number) => {
    // If clicking same open one, toggle closed
    if (activeBetweenIndex === index) {
      setActiveBetweenIndex(null);
      return;
    }

    setActiveBetweenIndex(index);
    setBetweenLoading(true);
    setBetweenError(null);
    setBetweenRecommendations([]);

    const currentSpot = day.activities[index];
    const nextSpot = day.activities[index + 1] || null;

    try {
      const res = await fetch('/api/recommend-between-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSpot,
          nextSpot,
          destination,
          transportationMode,
        }),
      });

      if (!res.ok) {
        throw new Error('들를 추천 장소를 불러오지 못했습니다.');
      }

      const data = await res.json();
      if (data && data.recommendations && data.recommendations.length > 0) {
        setBetweenRecommendations(data.recommendations);
      } else {
        throw new Error('추천 가능한 장소를 찾지 못했습니다.');
      }
    } catch (err: any) {
      console.warn('Fallback between spot recommendations:', err);
      // Sensible local fallback based on destination
      setBetweenRecommendations([
        {
          name: "현지 감성 로컬 베이커리 & 드립 커피",
          category: "카페 / 디저트",
          description: "이동 동선 상에서 향긋한 커피와 디저트를 즐길 수 있는 휴식 스팟",
          recommendedDurationMinutes: 45,
          whyRecommend: "이동 경로에서 도보/차량으로 바로 접근 가능하며 당 충전에 최적",
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination + ' 카페')}`,
          tips: "시그니처 라떼와 크루아상이 인기",
          lat: currentSpot.lat ? currentSpot.lat + 0.003 : 33.47,
          lng: currentSpot.lng ? currentSpot.lng + 0.003 : 126.32
        },
        {
          name: "지역 특산품 & 감성 소품 편집숍",
          category: "쇼핑 / 문화",
          description: "로컬 작가들의 핸드메이드 소품 및 기념품을 구경하기 좋은 아기자기한 상점",
          recommendedDurationMinutes: 40,
          whyRecommend: "장소 이동 중에 가볍게 들러 구경하기 좋은 쾌적한 핫플레이스",
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination + ' 소품샵')}`,
          tips: "선물용 로컬 간식과 엽서 구매 추천",
          lat: currentSpot.lat ? currentSpot.lat - 0.002 : 33.46,
          lng: currentSpot.lng ? currentSpot.lng - 0.002 : 126.31
        },
        {
          name: "전망대 & 도심/해변 산책로 쉼터",
          category: "자연풍경 / 포토존",
          description: "탁 트인 뷰와 함께 인생 사진을 찍고 쉬어갈 수 있는 힐링 쉼터",
          recommendedDurationMinutes: 40,
          whyRecommend: "동선 상에 위치하여 빽빽한 도심을 벗어나 여유로운 뷰를 감상",
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination + ' 산책로')}`,
          tips: "노을 시간대 사진 촬영 명소",
          lat: currentSpot.lat || 33.48,
          lng: currentSpot.lng || 126.33
        }
      ]);
    } finally {
      setBetweenLoading(false);
    }
  };

  const handleApplyBetweenSpot = (chosenSpot: BetweenSpotRecommendation, atIndex: number) => {
    if (onInsertSpotBetween) {
      onInsertSpotBetween(atIndex, chosenSpot);
    }
    setActiveBetweenIndex(null);
  };

  const renderTransitBadge = (transit?: TransitInfo) => {
    if (!transit) return null;

    const isWalk = transit.mode === 'walk' || transit.modeLabel?.includes('도보');
    const isSubway = transit.mode === 'subway' || transit.modeLabel?.includes('지하철') || transit.modeLabel?.includes('전철');
    const isBus = transit.mode === 'bus' || transit.modeLabel?.includes('버스');
    const isCar = transit.mode === 'car' || transit.modeLabel?.includes('렌터카') || transit.modeLabel?.includes('차');

    return (
      <div className="p-3 my-2 bg-stone-50/90 rounded-xl border border-stone-200/90 shadow-2xs flex flex-col gap-1.5 text-xs text-stone-700">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-bold text-stone-800">
            {isWalk ? (
              <span className="p-1 rounded bg-emerald-100 text-emerald-700 flex items-center gap-1">
                <Footprints className="w-3.5 h-3.5" />
                <span>{transit.modeLabel || '도보'}</span>
              </span>
            ) : isSubway ? (
              <span className="p-1 rounded bg-blue-100 text-blue-700 flex items-center gap-1">
                <Train className="w-3.5 h-3.5" />
                <span>{transit.modeLabel || '지하철'}</span>
              </span>
            ) : isBus ? (
              <span className="p-1 rounded bg-indigo-100 text-indigo-700 flex items-center gap-1">
                <Bus className="w-3.5 h-3.5" />
                <span>{transit.modeLabel || '시내버스'}</span>
              </span>
            ) : (
              <span className="p-1 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                <Car className="w-3.5 h-3.5" />
                <span>{transit.modeLabel || '차량/렌터카'}</span>
              </span>
            )}

            <span className="text-amber-800 font-semibold">{transit.durationText}</span>
            <span className="text-stone-400 font-normal">({transit.distanceText})</span>
          </div>

          {transit.cost && (
            <span className="text-[11px] font-medium text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
              비용 {transit.cost}
            </span>
          )}
        </div>

        {transit.routeTip && (
          <div className="text-[11px] text-stone-600 bg-white p-2 rounded-lg border border-stone-100 flex items-start gap-1.5">
            <span className="font-semibold text-amber-600 shrink-0">이동 안내:</span>
            <span className="leading-relaxed">{transit.routeTip}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Day Header Summary */}
      <div className="p-4 bg-stone-100/80 rounded-xl border border-stone-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
            {day.dateLabel || `Day ${day.dayNumber}`}
          </span>
          <span className="text-xs text-stone-500">
            총 {day.activities.length}개 일정 및 방문지
          </span>
        </div>
        <p className="text-sm font-semibold text-stone-800">
          {day.themeSummary}
        </p>
      </div>

      {/* Sequential Timeline Activities */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-stone-200">
        {day.activities.map((act, index) => {
          const isSelected = selectedActivityIndex === index;
          const isStart = act.type === 'start';
          const isEnd = act.type === 'end';
          const isMeal = act.type.startsWith('meal') || act.type === 'cafe';
          const isBreakfast = act.type === 'meal_breakfast' || act.category?.includes('아침') || act.category?.includes('조식');
          const isLunch = act.type === 'meal_lunch' || act.category?.includes('점심');
          const isDinner = act.type === 'meal_dinner' || act.category?.includes('저녁');
          const isGolf = act.type === 'golf' || act.category?.includes('골프') || act.name.includes('CC') || act.name.includes('골프') || act.name.includes('Golf');
          const isRemovableSpot = !isStart && !isEnd;
          const isLastActivity = index === day.activities.length - 1;
          const isBetweenOpen = activeBetweenIndex === index;

          let nodeBg = 'bg-amber-500 ring-amber-100';
          if (isStart) nodeBg = 'bg-blue-600 ring-blue-100';
          else if (isEnd) nodeBg = 'bg-rose-600 ring-rose-100';
          else if (isGolf) nodeBg = 'bg-emerald-600 ring-emerald-100';
          else if (isBreakfast) nodeBg = 'bg-amber-600 ring-amber-100';
          else if (isLunch) nodeBg = 'bg-orange-500 ring-orange-100';
          else if (isDinner) nodeBg = 'bg-red-500 ring-red-100';
          else if (isMeal) nodeBg = 'bg-orange-500 ring-orange-100';

          return (
            <div key={index} className="space-y-3">
              {/* Transit From Previous activity */}
              {index > 0 && act.estimatedTransitFromPrev && (
                <div className="mb-2 -ml-3">
                  {renderTransitBadge(act.estimatedTransitFromPrev)}
                </div>
              )}

              <div
                onClick={() => onSelectActivity(index)}
                className={`relative group transition cursor-pointer rounded-xl p-4 border ${
                  isSelected
                    ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-1 ring-amber-500'
                    : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                }`}
              >
                {/* Timeline Connector Dot */}
                <div
                  className={`absolute -left-[30px] top-5 w-4 h-4 rounded-full ring-4 text-white text-[9px] font-bold flex items-center justify-center transition-transform ${nodeBg} ${
                    isSelected ? 'scale-125' : 'group-hover:scale-110'
                  }`}
                >
                  {isStart ? 'S' : isEnd ? 'E' : isMeal ? '식' : index + 1}
                </div>

                {/* Activity Card Header */}
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-stone-400" />
                      {act.timeSlot}
                    </span>
                    <span className="text-stone-300">·</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                      isEnd ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200' :
                      isGolf ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300' :
                      isBreakfast ? 'bg-amber-100 text-amber-900 font-bold border border-amber-300' :
                      isLunch ? 'bg-orange-100 text-orange-900 font-bold border border-orange-300' :
                      isDinner ? 'bg-red-100 text-red-900 font-bold border border-red-300' :
                      isMeal ? 'text-orange-700 bg-orange-50' : 
                      isStart ? 'text-blue-700 bg-blue-50' : 'text-stone-600 bg-stone-100'
                    }`}>
                      {isEnd ? '🏁 최종 도착지' : 
                       isGolf ? '⛳ 골프 라운딩 (5시간 배정)' : 
                       isBreakfast ? '🍳 아침 식사 맛집' :
                       isLunch ? '🍽️ 점심 식사 맛집' :
                       isDinner ? '🥩 저녁 식사 맛집' :
                       act.category || '관광 명소'}
                    </span>
                    {act.durationMinutes > 0 && (
                      <>
                        <span className="text-stone-300">·</span>
                        <span className="text-[11px] text-stone-400">체류 {act.durationMinutes}분</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* [대체] button */}
                    {isRemovableSpot && onRemoveSpotAndReplace && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSpotAndReplace(act.name);
                        }}
                        disabled={isRefreshing}
                        className="inline-flex items-center gap-1 text-[11px] text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded border border-amber-200 transition font-medium"
                        title="이 장소 대신 다른 인기 명소로 즉시 대체하여 동선 재구성"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>대체</span>
                      </button>
                    )}

                    {/* ★★★ [추가] button: Generated for ALL activities (including the last activity!) ★★★ */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenBetweenModal(index);
                      }}
                      disabled={isRefreshing}
                      className={`inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded border transition font-medium ${
                        isBetweenOpen
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border-emerald-200'
                      }`}
                      title={isLastActivity ? "이 일정 다음에 추가로 들를 추천 장소를 추천받아 추가" : "이 장소와 다음 일정 사이에 갈만한 추천 장소를 추천받아 추가"}
                    >
                      <Plus className="w-3 h-3" />
                      <span>추가</span>
                    </button>

                    {/* Google Maps External Link */}
                    <a
                      href={act.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800 font-medium shrink-0 bg-sky-50 px-2 py-1 rounded transition hover:bg-sky-100"
                      title="구글 지도에서 보기"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>구글맵</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-stone-900 mb-1 flex items-center gap-2">
                  {isMeal && <Utensils className="w-4 h-4 text-orange-500 inline shrink-0" />}
                  {isGolf && <span className="text-emerald-600">⛳</span>}
                  {act.name}
                </h4>

                {/* Description */}
                <p className="text-xs text-stone-600 leading-relaxed mb-2">
                  {act.description}
                </p>

                {/* Tips & Cost Footnote */}
                {(act.tips || act.estimatedCost || act.address) && (
                  <div className="pt-2 border-t border-stone-100 flex flex-col gap-1 text-[11px] text-stone-500">
                    {act.address && (
                      <div className="flex items-center gap-1 truncate text-stone-400">
                        <span className="font-medium text-stone-500 shrink-0">주소:</span>
                        <span className="truncate">{act.address}</span>
                      </div>
                    )}
                    {act.tips && (
                      <div className="flex items-start gap-1 text-amber-900 bg-amber-50/70 p-1.5 rounded">
                        <span className="font-semibold shrink-0">꿀팁:</span>
                        <span>{act.tips}</span>
                      </div>
                    )}
                    {act.estimatedCost && (
                      <div className="flex items-center gap-1 text-stone-600 font-medium">
                        <span>예상 비용:</span>
                        <span>{act.estimatedCost}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Collapsible '추가' Recommendations Tray (For between index and index+1 OR after last activity) */}
              {isBetweenOpen && (
                <div className="ml-2 p-3.5 bg-emerald-50/70 border-2 border-emerald-300 rounded-xl space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>
                        {isLastActivity
                          ? `[${act.name}] 다음 추천 추가 방문지`
                          : `[${act.name}] ➔ [${day.activities[index + 1]?.name}] 사이 추천 명소`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveBetweenIndex(null)}
                      className="text-stone-400 hover:text-stone-700 text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-[11px] text-emerald-800 leading-snug">
                    {isLastActivity
                      ? '이 일정 이후에 연계해 방문하기 좋은 핫플레이스/카페/스팟입니다. 마음에 드는 곳을 선택하면 일정에 추가됩니다:'
                      : '두 목적지 이동 동선 상에서 바로 들르기 좋은 명소입니다. 마음에 드는 곳을 클릭하면 일정 사이에 자동으로 추가되고 동선이 재조정됩니다:'}
                  </p>

                  {betweenLoading ? (
                    <div className="py-4 flex items-center justify-center gap-2 text-xs text-emerald-800">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                      <span>최적 추천 장소를 찾는 중...</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 pt-1">
                      {betweenRecommendations.map((rec, rIdx) => (
                        <div
                          key={rIdx}
                          className="p-3 bg-white border border-emerald-200 rounded-lg shadow-2xs hover:border-emerald-400 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-1">
                              <span className="font-bold text-xs text-stone-900">{rec.name}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                                {rec.category}
                              </span>
                              <span className="text-[10px] text-stone-400">
                                약 {rec.recommendedDurationMinutes}분
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-600 leading-snug mb-1">
                              {rec.description}
                            </p>
                            <div className="text-[10px] text-emerald-700 font-medium">
                              💡 추천 이유: {rec.whyRecommend}
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-1.5 self-end sm:self-center">
                            <a
                              href={rec.googleMapsUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[11px] text-sky-600 hover:underline px-2 py-1 bg-sky-50 rounded"
                            >
                              지도보기
                            </a>
                            <button
                              type="button"
                              onClick={() => handleApplyBetweenSpot(rec, index)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                            >
                              <Plus className="w-3 h-3 stroke-[3]" />
                              <span>일정에 넣기</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Hotel Recommendation & Transit To/From Hotel Box */}
      {day.hotelRecommendation && (
        <div className="mt-6 space-y-3">
          {/* Movement from Last Spot to Hotel */}
          {day.hotelRecommendation.transitToHotel ? (
            <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-purple-900 mb-1">
                <Navigation className="w-3.5 h-3.5 text-purple-700" />
                <span>당일 마지막 일정 종료 후 ➔ 숙소로 이동 방법</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-purple-950 font-semibold mb-1">
                <span className="px-2 py-0.5 bg-purple-200/80 rounded text-[11px]">
                  {day.hotelRecommendation.transitToHotel.modeLabel || '교통편'}
                </span>
                <span>소요시간: {day.hotelRecommendation.transitToHotel.durationText}</span>
                <span className="text-purple-600 text-[11px]">({day.hotelRecommendation.transitToHotel.distanceText})</span>
              </div>
              {day.hotelRecommendation.transitToHotel.routeTip && (
                <p className="text-xs text-purple-800 bg-white/70 p-2 rounded border border-purple-100 leading-relaxed">
                  💡 {day.hotelRecommendation.transitToHotel.routeTip}
                </p>
              )}
            </div>
          ) : (
            <div className="p-2.5 bg-purple-50/60 rounded-lg text-xs text-purple-800 border border-dashed border-purple-200 flex items-center justify-between">
              <span>➔ 마지막 일정 장소 인근 숙소로 도보/대중교통 이동 (약 10~15분)</span>
            </div>
          )}

          {/* Hotel Details Card with Average Price */}
          <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <HotelIcon className="w-4 h-4 text-purple-700" />
                <span className="text-xs font-bold text-purple-900 uppercase tracking-wide">
                  Day {day.dayNumber} 숙소 · {day.hotelRecommendation.tier}
                </span>
              </div>
              <a
                href={day.hotelRecommendation.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-medium bg-white px-2 py-1 rounded border border-purple-200 transition shadow-2xs"
              >
                <span>숙소 구글맵</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <h4 className="text-base font-bold text-stone-900 mb-1">
              {day.hotelRecommendation.name}
            </h4>

            {/* Average Hotel Price Banner */}
            <div className="flex items-center gap-2 flex-wrap mb-2.5">
              <span className="text-xs font-bold text-purple-900 bg-purple-100/90 px-2.5 py-1 rounded-md border border-purple-300">
                💰 {day.hotelRecommendation.averagePricePerNight || day.hotelRecommendation.priceRange}
              </span>
              {day.hotelRecommendation.averagePricePerNight && (
                <span className="text-[11px] text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                  예상 범위: {day.hotelRecommendation.priceRange}
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 mb-2 leading-relaxed">
              {day.hotelRecommendation.description}
            </p>
            {day.hotelRecommendation.address && (
              <div className="text-[11px] text-stone-500 mb-1">
                📍 {day.hotelRecommendation.address}
              </div>
            )}
            {day.hotelRecommendation.bookingTip && (
              <div className="text-[11px] text-purple-900 bg-white/80 p-2 rounded border border-purple-100 mb-2">
                💡 <span className="font-semibold">체크인 & 이용 팁:</span> {day.hotelRecommendation.bookingTip}
              </div>
            )}

            {/* Next Morning Transit from Hotel to Next Day First Spot */}
            {day.hotelRecommendation.transitFromHotel && (
              <div className="mt-3 pt-3 border-t border-purple-200/80">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900 mb-1">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-700" />
                  <span>다음 날 아침 숙소에서 출발 안내</span>
                </div>
                <div className="text-xs text-purple-900">
                  <span className="font-semibold">{day.hotelRecommendation.transitFromHotel.modeLabel}:</span>{' '}
                  {day.hotelRecommendation.transitFromHotel.durationText} 소요 ({day.hotelRecommendation.transitFromHotel.distanceText})
                  {day.hotelRecommendation.transitFromHotel.routeTip && (
                    <span className="text-purple-700 block mt-0.5 text-[11px]">
                      {day.hotelRecommendation.transitFromHotel.routeTip}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
