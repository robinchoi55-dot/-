import { TravelPlanResult } from './types/travel';

export const SAMPLE_JEJU_PLAN: TravelPlanResult = {
  title: "제주 서부 & 남부 2박 3일 힐링 힐로드",
  destination: "제주특별자치도",
  durationText: "2박 3일",
  summary: "공항 도착부터 렌터카로 애월 해안도로, 협재 에메랄드 해변, 중문 오션뷰 미술관과 서귀포 자연 폭포까지 자연과 미식이 어우러진 알찬 힐링 루트입니다.",
  transportation: "렌터카 / 자가용",
  themes: ["자연풍경", "미술관", "미식/카페", "힐링"],
  overallTravelTips: [
    "렌터카는 제주공항 셔틀버스를 통해 렌터카 하우스에서 신속 인수 가능합니다.",
    "서쪽 해안도로(애월~한림)는 일몰 1시간 전에 드라이브하면 황금빛 노을을 감상하기에 가장 좋습니다.",
    "인기 맛집은 런치/디너 피크타임(12시, 18시) 30분 전 테이블링 또는 캐치테이블 원격 줄서기를 추천합니다."
  ],
  cityAverageHotelPrice: {
    budget: "1박 평균 약 75,000원 ~ 100,000원",
    standard: "1박 평균 약 140,000원 ~ 190,000원",
    luxury: "1박 평균 약 320,000원 ~ 480,000원",
    currencyNote: "제주도 성수기/비수기 및 주말 기준 평균 실시간 숙박 요금"
  },
  days: [
    {
      dayNumber: 1,
      dateLabel: "Day 1 (서부 해안 & 감성 로드)",
      themeSummary: "공항 픽업 → 애월 오션뷰 카페 → 협재 해변 산책 & 흑돼지 저녁 만찬",
      hotelRecommendation: {
        name: "신라스테이 제주 (또는 메종 글래드 제주)",
        address: "제주특별자치도 제주시 노연로 100",
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%8B%A0%EB%9D%BC%EC%8A%A4%ED%85%8C%EC%9D%B4+%EC%A0%9C%EC%83%81",
        averagePricePerNight: "평균 1박 약 155,000원",
        priceRange: "1박 약 140,000원 ~ 180,000원",
        tier: "스탠다드 부티크",
        description: "공항과 연동 시내 중심가 접근성이 탁월하며 깔끔한 침구와 조식으로 호평받는 가성비 호텔입니다.",
        bookingTip: "공항 방면 렌터카 반납/인수가 용이한 주차 시설 완비",
        lat: 33.4890,
        lng: 126.4883,
        transitToHotel: {
          mode: "car",
          modeLabel: "렌터카 / 자가용",
          durationText: "약 35분",
          distanceText: "29.4 km",
          routeTip: "협재에서 일주서로를 이용해 제주시 연동 방면으로 이동 후 호텔 지하주차장 이용"
        },
        transitFromHotel: {
          mode: "car",
          modeLabel: "렌터카",
          durationText: "약 40분",
          distanceText: "32.0 km",
          routeTip: "평화로를 통해 오설록 방면으로 원활하게 진입 가능합니다."
        }
      },
      activities: [
        {
          name: "제주국제공항 3번 게이트 (출발)",
          type: "start",
          category: "출발지",
          address: "제주특별자치도 제주시 공항로 2",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%A0%9C%EC%A3%BC%EA%B5%AD%EC%A0%9C%EA%B3%B5%ED%95%AD",
          lat: 33.5065,
          lng: 126.4933,
          timeSlot: "09:30 - 10:20",
          durationMinutes: 50,
          description: "제주 도착 및 수하물 수령 후 렌터카 하우스에서 차량 픽업 완료.",
          tips: "공항 내 편의점에서 제주 삼다수 및 이동 중 마실 음료 구매 추천",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "0분",
            distanceText: "0 km"
          }
        },
        {
          name: "애월 한담해변 & 오션뷰 카페거리",
          type: "spot",
          category: "자연풍경 / 카페",
          address: "제주특별자치도 제주시 애월읍 애월로1길 24-11",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%95%A0%EC%9B%94+%ED%95%9C%EB%8B%B4%ED%95%B4%EB%B3%80",
          lat: 33.4623,
          lng: 126.3111,
          timeSlot: "10:50 - 12:20",
          durationMinutes: 90,
          description: "에메랄드빛 바다를 끼고 걷는 한담 산책로와 투명 카약, 바다 전망 카페 휴식.",
          tips: "유료 주차장 이용 시 카페 음료 영수증으로 무료 주차 혜택을 챙기세요.",
          estimatedCost: "카페 음료 8,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 30분",
            distanceText: "19.5 km",
            routeTip: "일주서로를 따라 시원한 해안선 뷰를 감상하며 주행하세요."
          }
        },
        {
          name: "애월 우진해장국 인근 or 봄날 전복보말칼국수",
          type: "meal_lunch",
          category: "로컬 점심 맛집",
          address: "제주특별자치도 제주시 애월읍 애월로 11",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%95%A0%EC%9B%94+%EB%B3%B4%EB%A7%90%EC%B0%BC%EA%B5%AD%EC%88%98+%EB%A7%9B%EC%집",
          lat: 33.4651,
          lng: 126.3155,
          timeSlot: "12:30 - 13:40",
          durationMinutes: 70,
          description: "진하고 구수한 제주 자연산 보말과 매생이가 어우러진 시원하고 든든한 점심 식사.",
          tips: "보말죽과 전복구이를 곁들이면 든든한 여행 활력이 됩니다.",
          estimatedCost: "1인 13,000원 ~ 18,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 5분",
            distanceText: "1.2 km"
          }
        },
        {
          name: "아르떼뮤지엄 제주 (몰입형 미디어아트)",
          type: "spot",
          category: "미술관 / 문화전시",
          address: "제주특별자치도 제주시 애월읍 어림비로 478",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%95%84%EB%A5%B4%EB%96%BC%EB% competition뮤%EC%A7%80%EC%97%84+%EC%A0%9C%EC%A3%BC",
          lat: 33.3982,
          lng: 126.3541,
          timeSlot: "14:10 - 16:00",
          durationMinutes: 110,
          description: "디스트릭트가 선보이는 빛과 소리의 웅장한 미디어아트 전시. 폭포, 파도, 오로라 등 환상적인 공간 체험.",
          tips: "전시관 내 TEA BAR 밀크티 체험(입장권 패키지)을 사전 예약하면 만족도가 높습니다.",
          estimatedCost: "성인 17,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 20분",
            distanceText: "11.8 km",
            routeTip: "중산간 도로를 따라 울창한 숲길을 지나는 쾌적한 드라이브 코스입니다."
          }
        },
        {
          name: "협재 해수욕장 & 금능 해변 산책",
          type: "spot",
          category: "자연풍경",
          address: "제주특별자치도 제주시 한림읍 한림로 329-10",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%ED%98%91%EC%9E%AC%ED%95%B4%EC%88%98%EC%9A%95%EC%9E%A5",
          lat: 33.3940,
          lng: 126.2397,
          timeSlot: "16:30 - 18:00",
          durationMinutes: 90,
          description: "비양도가 손에 잡힐 듯 마주 보이는 은빛 백사장과 옥빛 바다. 해질녘 노을 사진 명소.",
          tips: "바람이 불 수 있으니 얇은 겉옷을 준비하세요.",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 25분",
            distanceText: "15.3 km"
          }
        },
        {
          name: "숙성도 협재점 (흑돼지 숙성육 만찬)",
          type: "meal_dinner",
          category: "로컬 저녁 맛집",
          address: "제주특별자치도 제주시 한림읍 원너울로 102",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%88%99%EC%84%B1%EB%8F%84+%ED%98%91%EC%9E%AC%EC%A0%90",
          lat: 33.3986,
          lng: 126.2483,
          timeSlot: "18:15 - 19:45",
          durationMinutes: 90,
          description: "워터에이징 720시간 숙성 흑돼지 삼겹살과 목살, 명란젓과 갈치속젓의 환상적 조합.",
          tips: "테이블링 원격 대기를 오후 5시에 미리 걸어두면 대기 시간을 줄일 수 있습니다.",
          estimatedCost: "1인 25,000원 ~ 35,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 5분",
            distanceText: "1.5 km"
          }
        }
      ]
    },
    {
      dayNumber: 2,
      dateLabel: "Day 2 (중문 예술 & 서귀포 청정 힐링)",
      themeSummary: "포도뮤지엄 기획전시 → 오설록 티뮤지엄 → 중문 천제연폭포 & 오션뷰 흑우 식사",
      hotelRecommendation: {
        name: "파르나스 호텔 제주 (또는 히든클리프)",
        address: "제주특별자치도 서귀포시 중문관광로72번길 100",
        googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%ED%8C%8C%EB%A5%B4%EB%82%98%EC%8A%A4+%ED%98%B8%ED%85%94+%EC%A0%9C%EC%A3%BC",
        averagePricePerNight: "평균 1박 약 310,000원",
        priceRange: "1박 약 280,000원 ~ 350,000원",
        tier: "럭셔리 리조트",
        description: "절벽 위에서 바다를 조망하는 최장 인피니티풀과 중문 단지 최고급 오션뷰 객실을 자랑합니다.",
        bookingTip: "인피니티 풀 온수풀 야간 이용 시 가운 및 슬리퍼 제공",
        lat: 33.2435,
        lng: 126.4112,
        transitToHotel: {
          mode: "car",
          modeLabel: "렌터카 / 택시",
          durationText: "약 25분",
          distanceText: "15.8 km",
          routeTip: "서귀포 올레시장 맛집 식사 후 일주서로를 따라 중문관광단지 호텔로 이동"
        },
        transitFromHotel: {
          mode: "car",
          modeLabel: "렌터카",
          durationText: "약 40분",
          distanceText: "28.5 km",
          routeTip: "남조로 또는 산록남로를 거쳐 사려니숲길 붉은오름 입구 주차장으로 이동"
        }
      },
      activities: [
        {
          name: "1일차 숙소 (신라스테이 제주) 체크아웃 & 출발",
          type: "start",
          category: "숙소 출발",
          address: "제주특별자치도 제주시 노연로 100",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%8B%A0%EB%9D%BC%EC%8A%A4%ED%85%8C%EC%9D%B4+%EC%A0%9C%EC%A3%BC",
          lat: 33.4890,
          lng: 126.4883,
          timeSlot: "08:50 - 09:20",
          durationMinutes: 30,
          description: "호텔 조식 및 체크아웃 완료 후 렌터카 탑승, 서귀포 중문 방면으로 출발.",
          tips: "차량 내 내비게이션에 첫 번째 목적지인 오설록 티뮤지엄 입력",
          estimatedTransitFromPrev: {
            mode: "car",
            modeLabel: "도보 / 차량 준비",
            durationText: "0분",
            distanceText: "0 km"
          }
        },
        {
          name: "오설록 티뮤지엄 & 이니스프리 제주하우스",
          type: "spot",
          category: "자연풍경 / 문화",
          address: "제주특별자치도 서귀포시 안덕면 신화역사로 15",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%98%A4%EC%84%A4%EB%A1%9D+%ED%8B%B0%EB%AE%A4%EC%A7%80%EC%97%84",
          lat: 33.3059,
          lng: 126.2894,
          timeSlot: "09:30 - 11:20",
          durationMinutes: 110,
          description: "초록빛 끝없이 펼쳐진 유기농 다원 산책과 녹차 아이스크림, 롤케이크 시식.",
          tips: "녹차밭 사이 포토존에서 탁 트인 인생 사진을 남겨보세요.",
          estimatedCost: "음료/디저트 9,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 35분",
            distanceText: "24.0 km",
            routeTip: "평화로를 타고 남서부 내륙 방면으로 쾌적하게 연결됩니다."
          }
        },
        {
          name: "포도뮤지엄 (PODO MUSEUM)",
          type: "spot",
          category: "미술관 / 기획전",
          address: "제주특별자치도 서귀포시 안덕면 산록남로 788",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%ED%8F%AC%EB%8F%84%EB%AE%A4%EC%A7%80%EC%97%84",
          lat: 33.3087,
          lng: 126.3776,
          timeSlot: "11:45 - 13:00",
          durationMinutes: 75,
          description: "사회적 공감과 인간에 대한 성찰을 담은 현대미술 테마 전시. 조용하고 감성적인 관람.",
          tips: "전시 오디오 도슨트를 스마트폰으로 무료 청취할 수 있으니 이어폰을 챙겨가세요.",
          estimatedCost: "관람료 10,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 15분",
            distanceText: "9.5 km"
          }
        },
        {
          name: "중문 수두리보말칼국수 or 덕성원 서귀포 중문",
          type: "meal_lunch",
          category: "로컬 점심 맛집",
          address: "제주특별자치도 서귀포시 천제연로 192",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%A4%91%EB%AC%B8+%EC%88%98%EB%91%90%EB%A6%AC%EB%B3%B4%EB%A7%90%EC%B0%BC%EA%B5%AD%EC%88%98",
          lat: 33.2519,
          lng: 126.4258,
          timeSlot: "13:20 - 14:30",
          durationMinutes: 70,
          description: "톳을 넣어 반죽한 쫄깃한 면발과 진한 전복내장/보말 육수가 일품인 든든한 한 끼.",
          tips: "식사 후 칼국수 국물에 밥을 말아 드시면 깊은 풍미를 즐길 수 있습니다.",
          estimatedCost: "1인 11,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 15분",
            distanceText: "8.2 km"
          }
        },
        {
          name: "중문 대포주상절리 & 올레 8코스 산책로",
          type: "spot",
          category: "자연풍경 / 액티비티",
          address: "제주특별자치도 서귀포시 이어도로 272",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EB%8C%80%ED%8F%AC%EC%A3%BC%EC%83%81%EC%A0%88%EB%A6%AC%EB%8C%80",
          lat: 33.2378,
          lng: 126.4252,
          timeSlot: "15:00 - 16:30",
          durationMinutes: 90,
          description: "육각기둥 모양의 신비로운 현무암 주상절리와 부서지는 거대한 파도의 장관.",
          tips: "데크 산책로가 평탄해 걷기 편하며 전망대에서 웅장한 자연의 힘을 느낄 수 있습니다.",
          estimatedCost: "입장료 성인 2,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 8분",
            distanceText: "3.5 km"
          }
        },
        {
          name: "서귀포 칠십리 야경 & 올레시장 천혜향 주스",
          type: "spot",
          category: "쇼핑 / 로컬문화",
          address: "제주특별자치도 서귀포시 중앙로62번길 18",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%84%9C%EA%B7%80%ED%8F%AC%EB%A7%A4%EC%9D%BC%EC%98%AC%EB%A0%88%EC%8B%9C%EC%9E%A5",
          lat: 33.2505,
          lng: 126.5638,
          timeSlot: "17:15 - 18:30",
          durationMinutes: 75,
          description: "마농통닭, 모닥치기, 오메기떡, 감귤 과즙이 가득한 활기 넘치는 전통 야시장 탐방.",
          tips: "공영주차타워가 잘 갖춰져 있으며 선물용 한라봉/과즐 쇼핑에 좋습니다.",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 25분",
            distanceText: "14.2 km"
          }
        },
        {
          name: "아서원 or 뽈살집 서귀포본점 (특수부위 숯불구이)",
          type: "meal_dinner",
          category: "로컬 저녁 맛집",
          address: "제주특별자치도 서귀포시 중정로91번길 37",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%84%9C%EA%B7%80%ED%8F%AC+%EB%BD%88%EC%82%B4%EC%A7%91+%EB%B3%B8%EC%A0%90",
          lat: 33.2501,
          lng: 126.5629,
          timeSlot: "18:45 - 20:15",
          durationMinutes: 90,
          description: "제주 돼지 꽃살, 돈새살, 뽈살 등 귀한 특수부위를 푸짐한 반찬과 함께 즐기는 현지인 극찬 맛집.",
          tips: "서비스로 나오는 돼지 껍데기와 수제 소시지도 일품입니다.",
          estimatedCost: "모둠 2인 39,000원",
          estimatedTransitFromPrev: {
            mode: "walk",
            durationText: "도보 약 3분",
            distanceText: "250 m"
          }
        }
      ]
    },
    {
      dayNumber: 3,
      dateLabel: "Day 3 (사려니 숲 힐링 & 쇼핑 귀가)",
      themeSummary: "사려니숲길 피톤치드 산책 → 제주시 동문시장 기념품 쇼핑 → 공항 복귀",
      activities: [
        {
          name: "2일차 숙소 (파르나스 호텔) 체크아웃 & 출발",
          type: "start",
          category: "숙소 출발",
          address: "제주특별자치도 서귀포시 중문관광로72번길 100",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%ED%8C%8C%EB%A5%B4%EB%82%98%EC%8A%A4+%ED%98%B8%ED%85%94+%EC%A0%9C%EC%A3%BC",
          lat: 33.2435,
          lng: 126.4112,
          timeSlot: "08:40 - 09:10",
          durationMinutes: 30,
          description: "오션뷰 조식 후 체크아웃, 중산간 사려니숲길 방면으로 출발.",
          tips: "동쪽으로 넘어가기 전 호텔 로비에서 생수 챙기기",
          estimatedTransitFromPrev: {
            mode: "car",
            modeLabel: "도보 / 차량 준비",
            durationText: "0분",
            distanceText: "0 km"
          }
        },
        {
          name: "사려니숲길 (붉은오름 방면 입구)",
          type: "spot",
          category: "자연풍경 / 힐링",
          address: "제주특별자치도 서귀포시 표선면 가시리 산158-4",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%82%AC%EB%A0%A4%EB%8B%88%EC%88%B2%EA%B8%B8+%EB%B6%89%EC%9D%80%EC%98%A4%EB%A6%84+%EC%9E%85%EA%B5%AC",
          lat: 33.4025,
          lng: 126.6575,
          timeSlot: "09:30 - 11:30",
          durationMinutes: 120,
          description: "삼나무가 하늘 높이 솟아오른 청정 숲길. 흙냄새와 피톤치드로 온몸을 정화하는 시간.",
          tips: "붉은오름 쪽 입구에 주차하시면 무장애 나눔길 데크로 걷기 아주 편합니다.",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 40분",
            distanceText: "28.5 km",
            routeTip: "516도로 또는 번영로 방면의 숲길 도로를 따라 천천히 안전 운전하세요."
          }
        },
        {
          name: "교래 손칼국수 or 교래 닭칼국수",
          type: "meal_lunch",
          category: "로컬 점심 맛집",
          address: "제주특별자치도 제주시 조천읍 교래3길 112",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EA%B5%90%EB%9E%98+%EB%8B%AD%EC%B0%BC%EA%B5%AD%EC%88%98",
          lat: 33.4372,
          lng: 126.6698,
          timeSlot: "11:50 - 13:00",
          durationMinutes: 70,
          description: "토종닭의 쫄깃함과 진한 사골 육수에 손반죽 메밀면을 넣은 조천읍 대표 보양식.",
          tips: "함께 나오는 겉절이 김치와 녹두 빈대떡의 궁합이 뛰어납니다.",
          estimatedCost: "1인 12,000원",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 8분",
            distanceText: "5.4 km"
          }
        },
        {
          name: "동문재래시장 (특산품 & 쇼핑)",
          type: "spot",
          category: "쇼핑 / 기념품",
          address: "제주특별자치도 제주시 관덕로14길 20",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%A0%9C%EC%A3%BC+%EB%8F%99%EB%AC%B8%EC%9E%AC%EB%9E%98%EC%8B%9C%EC%9E%A5",
          lat: 33.5126,
          lng: 126.5284,
          timeSlot: "13:45 - 15:30",
          durationMinutes: 105,
          description: "제주 최대 전통시장. 오메기떡, 감귤 초콜릿, 옥돔, 흑돼지 육포 등 여행 선물 일괄 쇼핑.",
          tips: "동문시장 공영주차장 또는 남수각 공영주차장에 주차 후 편리하게 쇼핑하세요.",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 30분",
            distanceText: "19.0 km"
          }
        },
        {
          name: "렌터카 반납 및 제주국제공항 T1 (종료)",
          type: "end",
          category: "도착지",
          address: "제주특별자치도 제주시 공항로 2",
          googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=%EC%A0%9C%EC%A3%BC%EA%B5%AD%EC%A0%9C%EA%B3%B5%ED%95%AD",
          lat: 33.5065,
          lng: 126.4933,
          timeSlot: "16:00 - 17:00",
          durationMinutes: 60,
          description: "렌터카 주유 및 반납 절차 후 셔틀버스로 공항 터미널 도착, 탑승 수속 및 출발.",
          tips: "항공편 출발 최소 1시간 30분 전 공항에 도착해 면세점 쇼핑과 보안 검색을 진행하세요.",
          estimatedTransitFromPrev: {
            mode: "car",
            durationText: "약 15분",
            distanceText: "4.8 km"
          }
        }
      ]
    }
  ]
};
