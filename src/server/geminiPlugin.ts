import type { Plugin } from 'vite';
import { GoogleGenAI, Type, Schema } from '@google/genai';

export function geminiApiPlugin(): Plugin {
  return {
    name: 'gemini-api-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // 1. Candidate spots discovery API based on Location, Themes & Transportation
        if (req.url === '/api/discover-spots' && req.method === 'POST') {
          try {
            let bodyStr = '';
            req.on('data', chunk => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                const requestData = JSON.parse(bodyStr || '{}');
                const apiKey = process.env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }));
                  return;
                }

                const ai = new GoogleGenAI({ apiKey });
                const selectedThemes = requestData.themes || [];
                const includesGolf = selectedThemes.includes('골프');

                const prompt = `
당신은 국내 및 전 세계 도시를 아우르는 여행 큐레이터입니다.
사용자가 설정한 여행지와 선택한 테마, 이동 수단 동선에 맞추어 **실제 많은 사람들이 방문하고 위치상 이동 가능한 핵심 인기 여행지 14~18곳**을 엄선해 제시해주세요.

[입력 조건]
- 여행지: ${requestData.destination || '제주도'}
- 여행 테마: ${(selectedThemes.length > 0) ? selectedThemes.join(', ') : '자연풍경, 미식/카페, 쇼핑, 문화'}
- 이동 수단: ${requestData.transportation === 'rental_car' ? '렌터카 / 자가용' : '대중교통 및 도보'}
- 출발/도착 위치: ${requestData.startLocation || '공항 또는 기차역'} ~ ${requestData.endLocation || '공항 또는 도심'}

[필수 중요 조건]
${includesGolf ? `
★★★ [골프 테마 특별 규칙] ★★★:
- 사용자가 '골프' 테마를 선택했습니다!
- 반드시 해당 여행지(${requestData.destination})에서 가장 유명하고 라운딩하기 좋은 **실제 명품 골프장(CC / 리조트)을 최소 3개 이상(3~4개)** 포함해야 합니다!
  (예: 제주도의 경우 클럽나인브릿지, 핀크스CC, 블랙스톤CC, 롯데스카이힐CC 등 / 해외의 경우 해당 도시의 대표 명문 골프 코스)
- 골프장의 경우 category는 '골프장 / 클럽', theme은 '골프', recommendedDuration은 '5시간 (18홀 라운딩 + 클럽하우스 식사/사우나)', highlight는 '명문 18홀 코스 및 클럽하우스'로 기재해주세요.
` : ''}
1. 사용자가 선택한 테마(${selectedThemes.join(', ')})별로 각각 2~4곳씩 골고루 포함하세요.
2. 각 스팟마다 어떤 테마에 속하는지 theme 필드에 정확히 명시해주세요 (예: '골프', '자연풍경', '미식/카페', '미술관', '쇼핑', '역사/유적' 등).
3. 위치상 서로 연계 이동이 가능하도록 권역명(area, 예: '시부야/하라주쿠', '신주쿠', '애월/한림', '서귀포/중문' 등)을 꼭 지정해주세요.
4. 해외 명소인 경우 한국어 명칭과 영문/현지어 명칭을 병기해주세요 (예: '센소지 (Sensō-ji)').
5. highlight에는 많은 사람들이 방문하는 이유나 특징을 매력적으로 적어주세요.
`;

                const schema: Schema = {
                  type: Type.OBJECT,
                  properties: {
                    destination: { type: Type.STRING },
                    spots: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          category: { type: Type.STRING },
                          theme: { type: Type.STRING, description: "해당 스팟이 속한 테마 (예: 골프, 자연풍경, 미식/카페 등)" },
                          area: { type: Type.STRING, description: "지리적 권역 (예: 시부야권역, 종로/광화문 등)" },
                          description: { type: Type.STRING },
                          recommendedDuration: { type: Type.STRING },
                          highlight: { type: Type.STRING },
                          lat: { type: Type.NUMBER },
                          lng: { type: Type.NUMBER }
                        },
                        required: ["name", "category", "area", "description", "highlight"]
                      }
                    }
                  },
                  required: ["destination", "spots"]
                };

                const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
                let responseText: string | null = null;
                let lastErr: any = null;

                for (const modelName of modelsToTry) {
                  try {
                    const response = await ai.models.generateContent({
                      model: modelName,
                      contents: prompt,
                      config: {
                        responseMimeType: 'application/json',
                        responseSchema: schema,
                        temperature: 0.2,
                      }
                    });
                    if (response.text) {
                      responseText = response.text;
                      break;
                    }
                  } catch (err: any) {
                    lastErr = err;
                  }
                }

                if (!responseText) {
                  throw lastErr || new Error('명소 목록을 불러올 수 없습니다.');
                }

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.statusCode = 200;
                res.end(responseText);
              } catch (innerErr: any) {
                console.error("Discover spots error:", innerErr);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: innerErr.message || '추천 명소 목록 검색 실패' }));
              }
            });
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // 2. Recommend Between Spots API (Supports BOTH middle spots and adding after the last spot)
        if (req.url === '/api/recommend-between-spots' && req.method === 'POST') {
          try {
            let bodyStr = '';
            req.on('data', chunk => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                const requestData = JSON.parse(bodyStr || '{}');
                const apiKey = process.env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ error: 'GEMINI_API_KEY가 설정되지 않았습니다.' }));
                  return;
                }

                const ai = new GoogleGenAI({ apiKey });
                const { currentSpot, nextSpot, destination, transportationMode } = requestData;

                const isLastSpot = !nextSpot;
                const prompt = isLastSpot ? `
당신은 여행 동선 및 로컬 큐레이션 전문가입니다.
사용자가 현재 일정의 마지막 방문지인 **[${currentSpot?.name || '현재 장소'}]** (주소: ${currentSpot?.address || ''}) 다음에 추가로 들를 만한 인기 스팟을 [추가]하고자 합니다.

[조건]
- 여행지: ${destination || '현지 도시'}
- 현재 마지막 일정 위치: ${currentSpot?.name} (${currentSpot?.address || ''})
- 이동 수단: ${transportationMode || '대중교통 또는 도보/차량'}

[요청]
마지막 일정 이후 또는 숙소/귀가 전 저녁 야경 명소, 감성 바/카페, 야시장, 힐링 스팟 등 **[${currentSpot?.name}] 근처나 이어지는 추천 후보 3~4곳**을 제시해주세요.
각 후보마다 예상 방문 시간, 특징, 추천 이유, 대략적 위경도(lat, lng)와 구글맵 검색 링크를 제공하세요.
` : `
당신은 여행 동선 및 로컬 큐레이션 전문가입니다.
사용자가 현재 일정 중 **[${currentSpot?.name || '현재 장소'}]** 와 바로 다음 일정인 **[${nextSpot?.name || '다음 장소'}]** 사이에 새로 방문할 장소를 [추가]하고자 합니다.

[조건]
- 여행지: ${destination || '현지 도시'}
- 현재 출발 장소: ${currentSpot?.name} (주소/위치: ${currentSpot?.address || ''})
- 다음 도착 장소: ${nextSpot?.name} (주소/위치: ${nextSpot?.address || ''})
- 이동 수단: ${transportationMode || '대중교통 또는 도보/차량'}

[요청]
두 장소 사이의 지리적 이동 동선 상에서 바로 들르기에 가장 적합하고 많은 사람들이 추천하는 인기 명소(디저트/감성 카페, 전망대, 소품샵, 포토존, 산책로 등) **3~4곳의 추천 후보**를 제시해주세요.
각 후보마다 예상 방문 시간, 특징, 추천 이유, 대략적 위경도(lat, lng)와 구글맵 검색 링크를 제공하세요.
`;

                const schema: Schema = {
                  type: Type.OBJECT,
                  properties: {
                    recommendations: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          category: { type: Type.STRING },
                          description: { type: Type.STRING },
                          recommendedDurationMinutes: { type: Type.INTEGER },
                          whyRecommend: { type: Type.STRING, description: "동선에서 추천하는 이유" },
                          googleMapsUrl: { type: Type.STRING },
                          tips: { type: Type.STRING },
                          lat: { type: Type.NUMBER },
                          lng: { type: Type.NUMBER }
                        },
                        required: ["name", "category", "description", "recommendedDurationMinutes", "whyRecommend", "googleMapsUrl", "lat", "lng"]
                      }
                    }
                  },
                  required: ["recommendations"]
                };

                const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
                let responseText: string | null = null;
                let lastErr: any = null;

                for (const modelName of modelsToTry) {
                  try {
                    const response = await ai.models.generateContent({
                      model: modelName,
                      contents: prompt,
                      config: {
                        responseMimeType: 'application/json',
                        responseSchema: schema,
                        temperature: 0.2,
                      }
                    });
                    if (response.text) {
                      responseText = response.text;
                      break;
                    }
                  } catch (err: any) {
                    lastErr = err;
                  }
                }

                if (!responseText) {
                  throw lastErr || new Error('사이 일정 추천 생성 실패');
                }

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.statusCode = 200;
                res.end(responseText);
              } catch (innerErr: any) {
                console.error("Recommend between spots error:", innerErr);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ error: innerErr.message || '중간 추천 명소 생성 실패' }));
              }
            });
          } catch (e: any) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: e.message }));
          }
          return;
        }

        // 3. Full Plan Generation API (Ensuring Minimum 5+ Activities for Compact Pace & Complete Breakfast/Lunch/Dinner)
        if (req.url === '/api/generate-plan' && req.method === 'POST') {
          try {
            let bodyStr = '';
            req.on('data', chunk => {
              bodyStr += chunk;
            });
            req.on('end', async () => {
              try {
                const requestData = JSON.parse(bodyStr || '{}');
                const apiKey = process.env.GEMINI_API_KEY;

                if (!apiKey) {
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ 
                    error: 'GEMINI_API_KEY 환경변수가 설정되지 않았습니다.' 
                  }));
                  return;
                }

                if (!requestData.destination) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json; charset=utf-8');
                  res.end(JSON.stringify({ error: '여행지를 입력해주세요.' }));
                  return;
                }

                const totalDays = Number(requestData.durationDays) || 1;
                const finalDestinationName = requestData.endLocation || `${requestData.destination} 주요 공항/역`;
                const desiredPlaces = requestData.desiredPlaces || [];
                const themes = requestData.themes || [];
                const hasGolf = themes.includes('골프') || desiredPlaces.some((p: string) => p.includes('CC') || p.includes('골프') || p.includes('Golf'));

                const ai = new GoogleGenAI({ apiKey });

                // Stepwise Pace Density Policy
                const isCompact = !requestData.pace || requestData.pace === 'compact';
                const isRelaxed = requestData.pace === 'relaxed';

                const prompt = `
당신은 대한민국 및 전 세계 최고의 여행 동선 최적화 전문가이자 미식 가이드입니다.

[사용자 입력 조건]
- 여행지: ${requestData.destination}
- 기간: ${requestData.durationNights || 0}박 ${totalDays}일 (총 ${totalDays}개의 Day 일정을 반드시 온전하게 생성할 것!)
- 시작 시간 및 장소: ${requestData.startTime || '08:30'} (${requestData.startLocation || '현지 주요 역 또는 공항'})
- 최종 종료 시간 및 도착 목적지: ${requestData.endTime || '18:00'} (${finalDestinationName})
- 기본 이동 수단: ${requestData.transportation === 'rental_car' ? '렌터카 / 자가용' : requestData.transportation === 'transit' ? '대중교통 (지하철, 기차, 버스, 도보)' : '도보 & 대중교통'}
- 여행 테마/목적: ${(themes.length > 0) ? themes.join(', ') : '명소 탐방, 미식'}
- 현재 선택된 명소: ${(desiredPlaces.length > 0) ? desiredPlaces.join(', ') : '해당 도시의 가장 대표적인 인기 명소 자동 포함'}
- 숙소 예산 등급: ${requestData.hotelBudgetTier === 'budget' ? '가성비 실속형' : requestData.hotelBudgetTier === 'luxury' ? '럭셔리 / 5성급' : '스탠다드 / 쾌적한 부티크'}
- 추가 요청사항: ${requestData.additionalNotes || '없음'}
- 선택된 일정 밀도: ${requestData.pace || 'compact'}

[★★★ 절대 필수 규칙 1: 촘촘한 일정(Compact) 시 하루 5~7개 이상 풍성한 동선 보장 ★★★]
${isCompact ? `
- 사용자가 [촘촘한 일정]을 선택했습니다! 절대 하루 일정이 2~3개로 휑하게 비어 있으면 안 됩니다!
- **각 일차(Day)마다 반드시 최소 5개 이상 (5~8개)의 구체적인 방문지 및 일정 활동(activities)을 꽉 채워 생성하세요!**
- 하루 구성 예시 (총 6~7개 이상):
  1) 08:30 출발 또는 숙소 체크아웃 (type: "start")
  2) 08:50 ~ 09:40 현지 로컬 아침 식사 맛집 (type: "meal_breakfast")
  3) 10:00 ~ 11:30 오전 핵심 관광 명소 1
  4) 12:00 ~ 13:10 현지 대표 로컬 점심 식사 맛집 (type: "meal_lunch")
  5) 13:30 ~ 15:30 오후 명소 2 (또는 골프 18홀 라운딩 300분)
  6) 16:00 ~ 17:30 감성 카페거리 또는 전망대 / 문화 명소 3
  7) 18:00 ~ 19:30 풍성한 현지 특산물 저녁 식사 맛집 (type: "meal_dinner")
  8) 20:00 ~ 숙소 체크인 또는 야경 명소 / 야시장
` : isRelaxed ? `
- 여유로운 힐링 일정: 하루 3~4개 내외로 느긋하게 머무는 동선으로 구성하세요.
` : `
- 적당한 균형 일정: 하루 4~5개 내외로 균형 잡힌 동선으로 구성하세요.
`}

[★★★ 절대 필수 규칙 2: 아침 식사, 점심 식사, 저녁 식사 3끼 추천 필수 포함 ★★★]
- 매일매일 동선에 맞추어 현지에서 가장 유명하고 평점 높은 실제 맛집을 **[아침 식사, 점심 식사, 저녁 식사] 3끼 모두** 빠짐없이 추천하여 일정(activity)에 넣으세요:
  1) 아침 식사 (type: "meal_breakfast", category: "아침 식사", 예: 제주 몸국/해장국, 전복죽, 호텔 조식 뷔페, 로컬 조식 카페 등)
  2) 점심 식사 (type: "meal_lunch", category: "점심 식사", 예: 현지 흑돼지, 해물 뚝배기, 스시/라멘, 현지 대표 명물 등)
  3) 저녁 식사 (type: "meal_dinner", category: "저녁 식사", 예: 신선한 활어회, 오마카세, 야시장 먹거리, 숯불구이 등)
  (마지막 날 도착 시간이 이른 오후인 경우에만 저녁 식사 대신 공항 내 식사로 대체 가능)
- 각 식사 장소마다 실제 식당 이름(name), 추천 대표 메뉴 및 특징(description), 예상 식사 비용(estimatedCost, 예: "1인 15,000원"), 구글맵 링크(googleMapsUrl)를 구체적으로 작성하세요.

[★★★ 절대 필수 규칙 3: 매일 저녁 동선에 따른 숙소 추천 & 다음날 그 숙소에서 출발 ★★★]
- 각 일차(Day N)의 마지막 일정 위치 근처에서 가장 좋은 숙소(hotelRecommendation)를 추천하세요.
- 마지막 날을 제외하고 저녁 일정 후 해당 숙소로 체크인합니다.
- **다음 날(Day N+1) 아침 첫 일정(첫 번째 activity, type: "start")은 반드시 "Day N 숙소 ([호텔명]) 체크아웃 & 출발"로 매끄럽게 연결하세요.**

[★★★ 절대 필수 규칙 4: 마지막 날(Day ${totalDays}) 최종 도착 목적지까지 완벽한 귀가 동선 ★★★]
- 마지막 날(Day ${totalDays})의 마지막 일정(type: "end")은 반드시 사용자가 입력한 최종 목적지인 [${finalDestinationName}]에 도착하여 여행을 마무리하는 일정(항공기 탑승/기차 탑승/렌터카 반납 등)이어야 합니다.

[★★★ 골프 테마 규칙 ★★★]
${hasGolf ? '- 골프장(CC) 일정이 포함된 경우, 18홀 라운딩+클럽하우스 식사/사우나를 위해 durationMinutes: 300 (5시간)을 배정하세요.' : ''}

모든 장소는 실제 구글 지도 검색 링크(googleMapsUrl)와 대략적인 위도(lat), 경도(lng)를 포함해야 합니다.
`;

                const schema: Schema = {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    destination: { type: Type.STRING },
                    summary: { type: Type.STRING },
                    durationText: { type: Type.STRING },
                    transportation: { type: Type.STRING },
                    themes: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    overallTravelTips: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    cityAverageHotelPrice: {
                      type: Type.OBJECT,
                      properties: {
                        budget: { type: Type.STRING },
                        standard: { type: Type.STRING },
                        luxury: { type: Type.STRING },
                        currencyNote: { type: Type.STRING }
                      },
                      required: ["budget", "standard", "luxury"]
                    },
                    popularSpotPool: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          category: { type: Type.STRING },
                          description: { type: Type.STRING },
                          recommendedDuration: { type: Type.STRING }
                        },
                        required: ["name", "category", "description"]
                      }
                    },
                    days: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          dayNumber: { type: Type.INTEGER },
                          dateLabel: { type: Type.STRING },
                          themeSummary: { type: Type.STRING },
                          hotelRecommendation: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              address: { type: Type.STRING },
                              googleMapsUrl: { type: Type.STRING },
                              averagePricePerNight: { type: Type.STRING },
                              priceRange: { type: Type.STRING },
                              tier: { type: Type.STRING },
                              description: { type: Type.STRING },
                              bookingTip: { type: Type.STRING },
                              lat: { type: Type.NUMBER },
                              lng: { type: Type.NUMBER },
                              transitToHotel: {
                                type: Type.OBJECT,
                                properties: {
                                  mode: { type: Type.STRING },
                                  modeLabel: { type: Type.STRING },
                                  durationText: { type: Type.STRING },
                                  distanceText: { type: Type.STRING },
                                  routeTip: { type: Type.STRING },
                                  cost: { type: Type.STRING }
                                },
                                required: ["mode", "modeLabel", "durationText", "distanceText"]
                              },
                              transitFromHotel: {
                                type: Type.OBJECT,
                                properties: {
                                  mode: { type: Type.STRING },
                                  modeLabel: { type: Type.STRING },
                                  durationText: { type: Type.STRING },
                                  distanceText: { type: Type.STRING },
                                  routeTip: { type: Type.STRING }
                                },
                                required: ["mode", "modeLabel", "durationText", "distanceText"]
                              }
                            }
                          },
                          activities: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                name: { type: Type.STRING },
                                type: { type: Type.STRING },
                                category: { type: Type.STRING },
                                address: { type: Type.STRING },
                                googleMapsUrl: { type: Type.STRING },
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER },
                                timeSlot: { type: Type.STRING },
                                durationMinutes: { type: Type.INTEGER },
                                description: { type: Type.STRING },
                                tips: { type: Type.STRING },
                                estimatedCost: { type: Type.STRING },
                                estimatedTransitFromPrev: {
                                  type: Type.OBJECT,
                                  properties: {
                                    mode: { type: Type.STRING },
                                    modeLabel: { type: Type.STRING },
                                    durationText: { type: Type.STRING },
                                    distanceText: { type: Type.STRING },
                                    routeTip: { type: Type.STRING },
                                    cost: { type: Type.STRING }
                                  },
                                  required: ["mode", "modeLabel", "durationText", "distanceText"]
                                }
                              },
                              required: ["name", "type", "googleMapsUrl", "timeSlot", "durationMinutes", "description", "lat", "lng"]
                            }
                          }
                        },
                        required: ["dayNumber", "themeSummary", "activities"]
                      }
                    }
                  },
                  required: ["title", "destination", "summary", "durationText", "transportation", "themes", "days", "overallTravelTips"]
                };

                const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
                let responseText: string | null = null;
                let lastError: any = null;

                for (const modelName of modelsToTry) {
                  try {
                    const response = await ai.models.generateContent({
                      model: modelName,
                      contents: prompt,
                      config: {
                        responseMimeType: 'application/json',
                        responseSchema: schema,
                        temperature: 0.2,
                      }
                    });
                    if (response.text) {
                      responseText = response.text;
                      break;
                    }
                  } catch (err: any) {
                    console.warn(`Model ${modelName} failed or unavailable:`, err?.message || err);
                    lastError = err;
                  }
                }

                if (!responseText) {
                  throw lastError || new Error('모든 모델이 현재 일시적으로 응답할 수 없습니다.');
                }

                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.statusCode = 200;
                res.end(responseText);
              } catch (innerErr: any) {
                console.error("Gemini Plan Generation Error:", innerErr);
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
                res.end(JSON.stringify({ 
                  error: innerErr.message || 'AI 일정 생성 중 일시적인 지연이 발생했습니다. 다시 한번 시도해주세요.' 
                }));
              }
            });
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ error: err.message || '요청 처리 실패' }));
          }
          return;
        }
        next();
      });
    }
  };
}
