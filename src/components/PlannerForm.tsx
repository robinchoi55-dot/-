import React, { useState, useEffect } from 'react';
import { TravelPlanRequest, CandidateSpot } from '../types/travel';
import { 
  Compass, 
  MapPin, 
  Car, 
  Bus, 
  Footprints, 
  Sparkles, 
  Plus, 
  X, 
  Info,
  ChevronRight,
  Globe,
  Check,
  Search,
  Sliders,
  Layers,
  Flame,
  ArrowRight,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface PlannerFormProps {
  initialValues?: Partial<TravelPlanRequest>;
  onSubmit: (formData: TravelPlanRequest) => void;
  isLoading: boolean;
}

const AVAILABLE_THEMES = [
  { id: '골프', label: '골프', icon: '⛳', desc: '18홀 라운딩 & 명문 CC (최소 3곳 추천, 5시간 체류)' },
  { id: '자연풍경', label: '자연풍경', icon: '🌲', desc: '바다, 산, 공원, 호수' },
  { id: '미식/카페', label: '미식/카페', icon: '☕', desc: '현지 로컬 맛집, 디저트' },
  { id: '쇼핑', label: '쇼핑', icon: '🛍️', desc: '쇼핑몰, 명품거리, 플리마켓' },
  { id: '미술관', label: '미술관', icon: '🎨', desc: '미술관, 갤러리' },
  { id: '박물관', label: '박물관', icon: '🏛️', desc: '역사 박물관, 기념관' },
  { id: '액티비티', label: '액티비티', icon: '🏄', desc: '테마파크, 투어, 수상스포츠' },
  { id: '역사/유적', label: '역사/유적', icon: '⛩️', desc: '고성, 사찰, 랜드마크' },
  { id: '휴식/힐링', label: '휴식/힐링', icon: '🧘', desc: '온천, 스파, 시티워크' },
];

export const PlannerForm: React.FC<PlannerFormProps> = ({
  initialValues,
  onSubmit,
  isLoading
}) => {
  // Step navigation in Form
  const [activeStep, setActiveStep] = useState<'basic' | 'spots'>('basic');

  // Basic Form States
  const [destination, setDestination] = useState(initialValues?.destination || '제주도');
  const [durationNights, setDurationNights] = useState<number>(initialValues?.durationNights ?? 2);
  const [durationDays, setDurationDays] = useState<number>(initialValues?.durationDays ?? 3);
  
  const [startTime, setStartTime] = useState(initialValues?.startTime || '09:00');
  const [endTime, setEndTime] = useState(initialValues?.endTime || '18:00');
  const [startLocation, setStartLocation] = useState(initialValues?.startLocation || '제주국제공항 T1');
  const [endLocation, setEndLocation] = useState(initialValues?.endLocation || '제주국제공항 T1');

  const [transportation, setTransportation] = useState<'rental_car' | 'transit' | 'walking'>(
    initialValues?.transportation || 'rental_car'
  );

  const [themes, setThemes] = useState<string[]>(
    initialValues?.themes || ['골프', '자연풍경', '미식/카페']
  );

  // ★ CRITICAL: Clear fixed confirmed spots upon initial load or when changing destination
  const [selectedSpots, setSelectedSpots] = useState<string[]>([]);

  const [hotelBudgetTier, setHotelBudgetTier] = useState<'budget' | 'standard' | 'luxury'>(
    initialValues?.hotelBudgetTier || 'standard'
  );

  // ★ 단계별 일정 밀도 선택 옵션: 촘촘하게(compact) / 적당하게(balanced) / 넉넉하게(relaxed)
  const [pace, setPace] = useState<'compact' | 'balanced' | 'relaxed'>(
    initialValues?.pace || 'compact'
  );

  const [additionalNotes, setAdditionalNotes] = useState(initialValues?.additionalNotes || '');
  const [customSpotInput, setCustomSpotInput] = useState('');

  // Discover candidate spots state
  const [candidateSpots, setCandidateSpots] = useState<CandidateSpot[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverError, setDiscoverError] = useState<string | null>(null);

  // Filters for Step 2: Theme Filter & Area Filter
  const [selectedThemeFilter, setSelectedThemeFilter] = useState<string>('all');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>('all');

  // When user changes destination, completely clear candidate spots and selected confirmed spots
  const handleDestinationChange = (newDest: string) => {
    setDestination(newDest);
    setSelectedSpots([]);
    setCandidateSpots([]);
    setSelectedThemeFilter('all');
    setSelectedAreaFilter('all');
  };

  // Trigger candidate spot discovery
  const handleDiscoverSpots = async () => {
    if (!destination.trim()) {
      alert('여행지를 먼저 입력해주세요.');
      return;
    }

    setIsDiscovering(true);
    setDiscoverError(null);
    try {
      const res = await fetch('/api/discover-spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          themes,
          transportation,
          startLocation,
          endLocation,
        }),
      });

      if (!res.ok) {
        throw new Error('추천 명소를 불러오지 못했습니다.');
      }

      const data = await res.json();
      if (data && data.spots && data.spots.length > 0) {
        // Enforce golf inclusion if golf theme selected
        let spots: CandidateSpot[] = data.spots;
        if (themes.includes('골프')) {
          const golfCount = spots.filter(s => s.theme === '골프' || s.category?.includes('골프') || s.name.includes('CC') || s.name.includes('골프')).length;
          if (golfCount < 3) {
            // Append top reputable golf courses in destination
            if (destination.includes('제주')) {
              spots.unshift(
                { name: "핀크스 골프클럽 (PINX GC)", category: "골프장 / 클럽", theme: "골프", area: "서귀포(안덕)", description: "한국 10대 골프 코스. 산방산과 오름을 조망하는 명문 18홀 라운딩", recommendedDuration: "5시간 (라운딩+식사)", highlight: "PGA급 관리 상태 & 포도호텔 인접" },
                { name: "클럽나인브릿지 (Club at Nine Bridges)", category: "골프장 / 클럽", theme: "골프", area: "제주 중산간", description: "국내 유일 세계 100대 코스 선정 글로벌 챔피언십 골프장", recommendedDuration: "5시간 (라운딩+식사)", highlight: "국내 최고 럭셔리 프라이빗 명문 코스" },
                { name: "블랙스톤 제주 CC", category: "골프장 / 클럽", theme: "골프", area: "제주 서부(한림)", description: "원시 곶자왈 숲에 둘러싸인 천혜의 자연 코스와 유럽풍 클럽하우스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "자연 친화적 27홀 힐링 라운딩" }
              );
            } else {
              spots.unshift(
                { name: `${destination} 명문 컨트리클럽 1`, category: "골프장 / 클럽", theme: "골프", area: "근교", description: "현지 최고 수준의 잔디 관리와 아름다운 조경의 18홀 코스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "18홀 정규 코스 & 클럽하우스" },
                { name: `${destination} 인터내셔널 골프 리조트`, category: "골프장 / 클럽", theme: "골프", area: "도심 근교", description: "호수와 벙커가 조화로운 챔피언십 골프 코스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "탁 트인 페어웨이" },
                { name: `${destination} 로얄 골프 & 스파 CC`, category: "골프장 / 클럽", theme: "골프", area: "휴양 권역", description: "라운딩 후 천연 온천과 사우나를 함께 즐길 수 있는 힐링 코스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "골프 & 사우나 패키지" }
              );
            }
          }
        }
        setCandidateSpots(spots);
      }
      setActiveStep('spots');
    } catch (err: any) {
      console.error(err);
      setDiscoverError(err.message || '인기 여행지 목록을 불러오는 중 오류가 발생했습니다.');
      fallbackLocalSpots();
      setActiveStep('spots');
    } finally {
      setIsDiscovering(false);
    }
  };

  const fallbackLocalSpots = () => {
    if (destination.includes('도쿄') || destination.toLowerCase().includes('tokyo')) {
      const list: CandidateSpot[] = [
        { name: "시부야 스카이 (Shibuya Sky)", category: "전망대/랜드마크", theme: "자연풍경", area: "시부야/하라주쿠", description: "도쿄 최신 랜드마크 옥상 전망대", recommendedDuration: "1시간 30분", highlight: "황홀한 도쿄 파노라마 일몰 명소" },
        { name: "센소지 (Sensō-ji) & 나카미세도리", category: "역사/유적", theme: "역사/유적", area: "아사쿠사", description: "도쿄 최고(最古)의 사찰과 전통 간식 거리", recommendedDuration: "2시간", highlight: "전통 기모노 체험 및 길거리 미식" },
        { name: "모리 미술관 (Mori Art Museum)", category: "미술관", theme: "미술관", area: "롯폰기", description: "롯폰기 힐즈 타워 53층의 현대미술관", recommendedDuration: "1시간 30분", highlight: "전시와 도쿄타워 뷰를 함께 관람" },
        { name: "긴자 식스 (GINZA SIX) & 명품거리", category: "쇼핑", theme: "쇼핑", area: "긴자/도쿄역", description: "쿠사마 야요이 아트와 최고급 부티크 몰", recommendedDuration: "2시간", highlight: "도쿄 최신 패션 & 옥상 정원 휴식" },
        { name: "메이지 신궁 & 오모테산도 카페거리", category: "자연풍경/카페", theme: "미식/카페", area: "시부야/하라주쿠", description: "도심 속 거대한 숲과 감성 브런치 거리", recommendedDuration: "2시간", highlight: "힐링 숲길 산책 & 도쿄 핫플 카페" },
        { name: "츠키지 장외시장", category: "미식/시장", theme: "미식/카페", area: "긴자/츠키지", description: "신선한 참치 덮밥과 계란말이 길거리 음식", recommendedDuration: "1시간 30분", highlight: "로컬 아침/점심 식사 필수 코스" },
      ];
      if (themes.includes('골프')) {
        list.unshift(
          { name: "도쿄 요미우리 컨트리클럽 (Yomiuri CC)", category: "골프장 / 클럽", theme: "골프", area: "도쿄 근교", description: "JGTO 투어 챔피언십 개최 명문 코스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "도쿄 인근 최고 명문 18홀" },
          { name: "카스미가세키 컨트리클럽 (올림픽 코스)", category: "골프장 / 클럽", theme: "골프", area: "사이타마/도쿄", description: "도쿄 올림픽 골프 경기장으로 유명한 세계적 명문 코스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "올림픽 공식 토너먼트 코스" },
          { name: "와카스 골프링크스 (도쿄만 오션뷰)", category: "골프장 / 클럽", theme: "골프", area: "도쿄 코토구", description: "도쿄 도심에서 30분 거리, 도쿄만을 바라보며 즐기는 해변 18홀", recommendedDuration: "5시간 (라운딩+식사)", highlight: "도심 인접 최고 접근성" }
        );
      }
      setCandidateSpots(list);
    } else {
      const list: CandidateSpot[] = [
        { name: "협재 해수욕장 & 금능 해변", category: "자연풍경", theme: "자연풍경", area: "제주 서부(한림)", description: "비양도가 보이는 옥빛 에메랄드 해변", recommendedDuration: "1시간 30분", highlight: "제주 최고 노을 명소" },
        { name: "아르떼뮤지엄 제주", category: "미술관", theme: "미술관", area: "제주 서부(애월)", description: "빛과 소리의 웅장한 몰입형 미디어아트", recommendedDuration: "2시간", highlight: "SNS 인생 사진 스팟" },
        { name: "오설록 티뮤지엄", category: "문화/카페", theme: "미식/카페", area: "제주 서남부(안덕)", description: "끝없는 유기농 녹차밭과 녹차 디저트", recommendedDuration: "1시간 30분", highlight: "이니스프리 제주하우스 산책" },
        { name: "중문 대포주상절리", category: "자연풍경", theme: "자연풍경", area: "서귀포(중문)", description: "화산암 육각기둥과 부서지는 파도의 장관", recommendedDuration: "1시간", highlight: "유네스코 지질공원 대표" },
        { name: "서귀포 매일올레시장", category: "쇼핑/시장", theme: "쇼핑", area: "서귀포 시내", description: "마농통닭, 모닥치기, 감귤 과즙이 가득한 전통 야시장", recommendedDuration: "1시간 30분", highlight: "현지 미식 & 특산품 쇼핑" },
        { name: "사려니숲길", category: "자연풍경/힐링", theme: "자연풍경", area: "제주 중산간", description: "삼나무가 곧게 뻗은 피톤치드 청정 숲길", recommendedDuration: "2시간", highlight: "무장애 데크 걷기 좋은 숲" }
      ];
      if (themes.includes('골프')) {
        list.unshift(
          { name: "핀크스 골프클럽 (PINX GC)", category: "골프장 / 클럽", theme: "골프", area: "서귀포(안덕)", description: "한국 10대 골프 코스. 산방산과 오름을 조망하는 명문 18홀 라운딩", recommendedDuration: "5시간 (라운딩+식사)", highlight: "PGA급 관리 상태 & 포도호텔 인접" },
          { name: "클럽나인브릿지 (Club at Nine Bridges)", category: "골프장 / 클럽", theme: "골프", area: "제주 중산간", description: "국내 유일 세계 100대 코스 선정 글로벌 챔피언십 골프장", recommendedDuration: "5시간 (라운딩+식사)", highlight: "국내 최고 럭셔리 프라이빗 명문 코스" },
          { name: "블랙스톤 제주 CC", category: "골프장 / 클럽", theme: "골프", area: "제주 서부(한림)", description: "원시 곶자왈 숲에 둘러싸인 천혜의 자연 코스와 유럽풍 클럽하우스", recommendedDuration: "5시간 (라운딩+식사)", highlight: "자연 친화적 27홀 힐링 라운딩" }
        );
      }
      setCandidateSpots(list);
    }
  };

  const toggleTheme = (themeId: string) => {
    if (themes.includes(themeId)) {
      if (themes.length > 1) {
        setThemes(themes.filter(t => t !== themeId));
      }
    } else {
      setThemes([...themes, themeId]);
    }
  };

  const toggleSpotSelection = (spotName: string) => {
    if (selectedSpots.includes(spotName)) {
      setSelectedSpots(selectedSpots.filter(s => s !== spotName));
    } else {
      setSelectedSpots([...selectedSpots, spotName]);
    }
  };

  const handleAddCustomSpot = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSpotInput.trim();
    if (trimmed && !selectedSpots.includes(trimmed)) {
      setSelectedSpots([...selectedSpots, trimmed]);
      setCustomSpotInput('');
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      destination,
      durationDays,
      durationNights,
      startTime,
      endTime,
      startLocation,
      endLocation,
      transportation,
      themes,
      desiredPlaces: selectedSpots, // User picked confirmed spots
      hotelBudgetTier,
      additionalNotes,
      pace: pace,
    });
  };

  // Distinct Themes present in candidate spots
  const distinctThemes = React.useMemo(() => {
    const themeSet = new Set<string>();
    candidateSpots.forEach(s => {
      if (s.theme) themeSet.add(s.theme);
      else if (s.category?.includes('골프')) themeSet.add('골프');
    });
    return Array.from(themeSet);
  }, [candidateSpots]);

  // Distinct Areas present in candidate spots
  const distinctAreas = React.useMemo(() => {
    const areas = new Set<string>();
    candidateSpots.forEach(s => {
      if (s.area) areas.add(s.area);
    });
    return Array.from(areas);
  }, [candidateSpots]);

  // Combined filtered candidate spots based on BOTH Theme filter and Area filter
  const filteredCandidateSpots = candidateSpots.filter(s => {
    const matchesTheme = selectedThemeFilter === 'all' || 
      s.theme === selectedThemeFilter || 
      (selectedThemeFilter === '골프' && (s.category?.includes('골프') || s.name.includes('CC') || s.name.includes('골프')));
    
    const matchesArea = selectedAreaFilter === 'all' || s.area === selectedAreaFilter;
    return matchesTheme && matchesArea;
  });

  return (
    <div className="space-y-6">
      {/* Step Tabs Navigation */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-200/80 rounded-xl max-w-md mx-auto">
        <button
          type="button"
          onClick={() => setActiveStep('basic')}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeStep === 'basic'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-stone-100 flex items-center justify-center text-[10px]">1</span>
          <span>위치 & 테마 설정</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (candidateSpots.length === 0) {
              handleDiscoverSpots();
            } else {
              setActiveStep('spots');
            }
          }}
          className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeStep === 'spots'
              ? 'bg-white text-stone-900 shadow-xs'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-[10px]">2</span>
          <span>인기 여행지 선택 ({selectedSpots.length})</span>
        </button>
      </div>

      {/* STEP 1: Basic Location, Themes, Transportation */}
      {activeStep === 'basic' && (
        <div className="space-y-6">
          {/* Destination & Presets */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                1. 여행지 선택 (국내 & 전 세계 해외 지원)
              </label>
              <span className="text-[11px] text-amber-700 font-medium flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                <Globe className="w-3 h-3" />
                새 여행지 설정 시 이전 확정 명소는 자동 초기화됩니다
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => handleDestinationChange(e.target.value)}
                placeholder="어디로 여행을 떠나시나요? (예: 제주도, 도쿄, 오사카, 방콕, 다낭, 파리 등)"
                className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs text-stone-500">
              <span className="font-medium text-stone-400">인기 프리셋:</span>
              <button
                type="button"
                onClick={() => {
                  handleDestinationChange('제주도');
                  setStartLocation('제주국제공항 T1');
                  setEndLocation('제주국제공항 T1');
                  setTransportation('rental_car');
                  setThemes(['골프', '자연풍경', '미식/카페']);
                }}
                className="px-2 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded font-medium transition"
              >
                ⛳ 제주도 골프 & 힐링 2박 3일
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDestinationChange('도쿄 (Tokyo, Japan)');
                  setStartLocation('하네다 공항 (Haneda Airport)');
                  setEndLocation('도쿄역 (Tokyo Station)');
                  setTransportation('transit');
                  setThemes(['미식/카페', '쇼핑', '미술관']);
                }}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 transition"
              >
                ✈️ 도쿄 2박 3일
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDestinationChange('오사카 & 교토 (Osaka & Kyoto)');
                  setStartLocation('간사이 국제공항 (KIX Airport)');
                  setEndLocation('오사카 난바역');
                  setTransportation('transit');
                  setThemes(['미식/카페', '역사/유적', '쇼핑']);
                }}
                className="px-2 py-1 bg-stone-100 hover:bg-stone-200 rounded text-stone-600 transition"
              >
                ✈️ 오사카·교토 3박 4일
              </button>
            </div>
          </div>

          {/* Travel Themes Selection (Includes Golf) */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                2. 여행 테마 선택 (골프 포함 다중 선택 가능)
              </label>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                ⛳ '골프' 선택 시 명문 골프장 최소 3곳 추천 & 5시간 배정
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {AVAILABLE_THEMES.map((t) => {
                const isSelected = themes.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTheme(t.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-2.5 ${
                      isSelected
                        ? t.id === '골프' 
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-500'
                          : 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                    }`}
                  >
                    <span className="text-xl shrink-0 mt-0.5">{t.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{t.label}</span>
                        {isSelected && <Check className={`w-3.5 h-3.5 ${t.id === '골프' ? 'text-emerald-700' : 'text-amber-700'}`} />}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate mt-0.5">
                        {t.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schedule & Timing */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                3. 여행 기간 설정
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={durationDays}
                  onChange={(e) => {
                    const days = parseInt(e.target.value);
                    setDurationDays(days);
                    setDurationNights(Math.max(0, days - 1));
                  }}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm text-stone-900"
                >
                  <option value={1}>당일치기 (0박 1일)</option>
                  <option value={2}>1박 2일</option>
                  <option value={3}>2박 3일 (인기)</option>
                  <option value={4}>3박 4일</option>
                  <option value={5}>4박 5일</option>
                  <option value={6}>5박 6일</option>
                  <option value={7}>6박 7일</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                4. 주요 이동 수단
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTransportation('rental_car')}
                  className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition ${
                    transportation === 'rental_car'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Car className="w-4 h-4" />
                  <span>렌터카 / 자차</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransportation('transit')}
                  className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition ${
                    transportation === 'transit'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Bus className="w-4 h-4" />
                  <span>대중교통</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTransportation('walking')}
                  className={`p-2 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition ${
                    transportation === 'walking'
                      ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Footprints className="w-4 h-4" />
                  <span>도보 & 전철</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                출발 시간 & 출발 장소
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                  placeholder="예: 공항, 기차역, 숙소"
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-1">
                마지막 날 도착 시간 & 최종 목적지
              </label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
                <input
                  type="text"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                  placeholder="예: 공항 귀가 터미널, 역"
                  className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          {/* 5. 일정 밀도 단계별 선택 옵션 (촘촘하게 / 적당하게 / 넉넉하게) */}
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                5. 일정 밀도 선택 (촘촘하게 vs 넉넉하게)
              </label>
              <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
                여행 스타일에 맞추어 AI가 하루 방문지 개수 및 체류시간 조절
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPace('compact')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  pace === 'compact'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      🔥 촘촘하게 (알찬 코스)
                    </span>
                    {pace === 'compact' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    오전부터 밤까지 하루 5~7곳을 빈틈없이 꽉 채워 랜드마크와 맛집을 모두 정복하는 일정
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded w-fit">
                  하루 5~7곳 · 최적 동선
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPace('balanced')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  pace === 'balanced'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      ⚖️ 적당하게 (균형 코스)
                    </span>
                    {pace === 'balanced' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    무리하지 않고 오전 1곳, 맛있는 점심, 오후 1~2곳과 저녁 식사로 편안하게 즐기는 일정
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-stone-700 bg-stone-200/80 px-2 py-0.5 rounded w-fit">
                  하루 3~4곳 · 밸런스
                </span>
              </button>

              <button
                type="button"
                onClick={() => setPace('relaxed')}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  pace === 'relaxed'
                    ? 'border-amber-600 bg-amber-50/80 text-amber-950 ring-2 ring-amber-500 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/50 text-stone-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      🌿 넉넉하게 (힐링 코스)
                    </span>
                    {pace === 'relaxed' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </div>
                  <p className="text-[11px] text-stone-600 leading-snug">
                    바쁜 이동 없이 핵심 1~2곳에서 오랜 시간 머물며 카페와 휴식을 여유롭게 누리는 일정
                  </p>
                </div>
                <span className="mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded w-fit">
                  하루 2~3곳 · 힐링 여유
                </span>
              </button>
            </div>
          </div>

          {/* Action button to proceed to Step 2 */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              disabled={isDiscovering}
              onClick={handleDiscoverSpots}
              className="w-full py-3.5 px-6 bg-stone-900 hover:bg-black text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              {isDiscovering ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>선택한 테마와 동선에 맞는 인기 여행지 리스트 불러오는 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="text-base">선택한 테마별 인기 여행지 & 골프장 리스트 찾기</span>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Pick from Discovered Popular Spots (With Theme Tabs!) */}
      {activeStep === 'spots' && (
        <form onSubmit={handleFinalSubmit} className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded">
                    {destination}
                  </span>
                  <span className="text-xs font-bold text-stone-800">
                    추천 인기 여행지 & 골프장 리스트
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-1">
                  선택하신 테마별로 필터링하여 원하는 곳을 클릭해 담아주세요. (골프장은 5시간 라운딩 코스로 자동 배정됩니다)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  선택된 확정 명소 {selectedSpots.length}곳
                </span>
                {selectedSpots.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedSpots([])}
                    className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>선택 비우기</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setActiveStep('basic')}
                  className="text-xs text-stone-500 hover:text-stone-800 underline ml-1"
                >
                  기본설정 변경
                </button>
              </div>
            </div>

            {/* 1. Theme Filter Tabs (선택한 테마별로 선택 가능하게 제공) */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-stone-500 font-bold">✨ 테마별 보기:</span>
                <button
                  type="button"
                  onClick={() => setSelectedThemeFilter('all')}
                  className={`px-3 py-1 rounded-full transition font-semibold ${
                    selectedThemeFilter === 'all'
                      ? 'bg-amber-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  전체 테마 ({candidateSpots.length})
                </button>
                {distinctThemes.map(themeName => (
                  <button
                    key={themeName}
                    type="button"
                    onClick={() => setSelectedThemeFilter(themeName)}
                    className={`px-3 py-1 rounded-full transition font-semibold flex items-center gap-1 ${
                      selectedThemeFilter === themeName
                        ? themeName === '골프' ? 'bg-emerald-700 text-white shadow-2xs' : 'bg-amber-600 text-white shadow-2xs'
                        : themeName === '골프' ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {themeName === '골프' && <span>⛳</span>}
                    <span>{themeName}</span>
                    <span className="text-[10px] opacity-80">
                      ({candidateSpots.filter(s => s.theme === themeName || (themeName === '골프' && s.category?.includes('골프'))).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* 2. Area Filter Tabs */}
              {distinctAreas.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1 border-t border-stone-100">
                  <span className="text-stone-400 font-medium">권역 필터:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedAreaFilter('all')}
                    className={`px-2.5 py-0.5 rounded-md transition text-[11px] ${
                      selectedAreaFilter === 'all'
                        ? 'bg-stone-800 text-white font-medium'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    전 권역
                  </button>
                  {distinctAreas.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => setSelectedAreaFilter(area)}
                      className={`px-2.5 py-0.5 rounded-md transition text-[11px] ${
                        selectedAreaFilter === area
                          ? 'bg-stone-800 text-white font-medium'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Candidate Spots Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
              {filteredCandidateSpots.map((spot, idx) => {
                const isSelected = selectedSpots.includes(spot.name);
                const isGolf = spot.theme === '골프' || spot.category?.includes('골프') || spot.name.includes('CC') || spot.name.includes('골프');
                return (
                  <div
                    key={idx}
                    onClick={() => toggleSpotSelection(spot.name)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? isGolf
                          ? 'border-emerald-600 bg-emerald-50/80 text-emerald-950 ring-2 ring-emerald-600 shadow-xs'
                          : 'border-amber-600 bg-amber-50/70 text-amber-950 ring-2 ring-amber-600 shadow-xs'
                        : isGolf
                          ? 'border-emerald-200 bg-emerald-50/30 hover:bg-emerald-50/60 text-stone-800'
                          : 'border-stone-200 bg-stone-50/60 hover:bg-stone-100/80 text-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                            isSelected 
                              ? isGolf ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-amber-600 border-amber-600 text-white'
                              : 'border-stone-300 bg-white'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </span>
                          <span className="font-bold text-xs text-stone-900 leading-tight">
                            {spot.name}
                          </span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 ${
                          isGolf ? 'bg-emerald-100 text-emerald-800 font-bold' : 'bg-stone-200/70 text-stone-600'
                        }`}>
                          {spot.category}
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed mb-2">
                        {spot.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                      <span className="text-amber-800 font-medium truncate max-w-[170px]">
                        ✨ {spot.highlight}
                      </span>
                      <span className="text-stone-400 shrink-0 font-medium">
                        ⏱️ {spot.recommendedDuration}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Currently Selected Confirmed Spots Drawer */}
            <div className="pt-3 border-t border-stone-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-stone-800">
                  동선에 포함될 확정 명소 ({selectedSpots.length}곳):
                </span>
                <span className="text-[11px] text-stone-400">
                  선택한 순서와 상관없이 최적 지리적 동선으로 자동 정렬됩니다
                </span>
              </div>

              {selectedSpots.length === 0 ? (
                <div className="p-3 bg-stone-50 rounded-xl text-center text-xs text-stone-500 border border-dashed border-stone-200">
                  선택된 명소가 없습니다. 위 목록에서 원하는 명소나 골프장을 클릭해 주세요.
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {selectedSpots.map((spotName, idx) => {
                    const isGolfSpot = spotName.includes('CC') || spotName.includes('골프') || spotName.includes('Golf');
                    return (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium ${
                          isGolfSpot
                            ? 'bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold'
                            : 'bg-amber-100/80 border border-amber-300 text-amber-950 font-semibold'
                        }`}
                      >
                        {isGolfSpot && <span>⛳</span>}
                        <span>{spotName}</span>
                        <button
                          type="button"
                          onClick={() => toggleSpotSelection(spotName)}
                          className="hover:text-rose-600 transition"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add Custom Spot Direct Input */}
            <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                value={customSpotInput}
                onChange={(e) => setCustomSpotInput(e.target.value)}
                placeholder="목록에 없는 특별한 장소나 특정 골프장을 직접 입력해 추가"
                className="flex-1 w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
              />
              <button
                type="button"
                onClick={handleAddCustomSpot}
                className="w-full sm:w-auto px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold rounded-lg shrink-0"
              >
                + 직접 추가
              </button>
            </div>
          </div>

          {/* Hotel Budget Tier Selection */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
            <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
              매일 저녁 동선에 맞춰 추천받을 호텔 등급 (평균 가격 표시 연동)
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setHotelBudgetTier('budget')}
                className={`p-3 rounded-xl border text-left transition ${
                  hotelBudgetTier === 'budget'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="text-xs font-bold">실속 가성비</div>
                <div className="text-[11px] text-stone-500 mt-0.5">평균 7~10만원대</div>
              </button>
              <button
                type="button"
                onClick={() => setHotelBudgetTier('standard')}
                className={`p-3 rounded-xl border text-left transition ${
                  hotelBudgetTier === 'standard'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="text-xs font-bold">스탠다드 부티크</div>
                <div className="text-[11px] text-stone-500 mt-0.5">평균 14~19만원대</div>
              </button>
              <button
                type="button"
                onClick={() => setHotelBudgetTier('luxury')}
                className={`p-3 rounded-xl border text-left transition ${
                  hotelBudgetTier === 'luxury'
                    ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-1 ring-amber-500'
                    : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <div className="text-xs font-bold">럭셔리 / 5성급</div>
                <div className="text-[11px] text-stone-500 mt-0.5">평균 30만원 이상</div>
              </button>
            </div>
          </div>

          {/* Final Submit Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveStep('basic')}
              className="py-3.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition"
            >
              &larr; 이전 단계
            </button>
            <button
              type="submit"
              disabled={isLoading || selectedSpots.length === 0}
              className="flex-1 py-3.5 px-6 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>동선 최적화 & 호텔 연계 일정 생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-base">
                    선택한 {selectedSpots.length}곳 명소로 최적 동선 일정 완성하기
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
