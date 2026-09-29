import React, { useState } from 'react';
import { TravelPlanRequest, TravelPlanResult } from './types/travel';
import { SAMPLE_JEJU_PLAN } from './data/samplePlan';
import { PlannerForm } from './components/PlannerForm';
import { ItineraryView } from './components/ItineraryView';
import { 
  Compass, 
  Map, 
  Sparkles, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  HelpCircle,
  Globe2
} from 'lucide-react';

const GOOGLE_MAPS_KEY = "AIzaSyCl_f65ZfZO7d49XYTdrNc0CvsA8ZX-4wg";

export default function App() {
  const [currentPlan, setCurrentPlan] = useState<TravelPlanResult | null>(SAMPLE_JEJU_PLAN);
  const [currentRequest, setCurrentRequest] = useState<TravelPlanRequest>({
    destination: '제주도',
    durationDays: 3,
    durationNights: 2,
    startTime: '09:30',
    endTime: '17:00',
    startLocation: '제주국제공항 T1',
    endLocation: '제주국제공항 T1',
    transportation: 'rental_car',
    themes: ['자연풍경', '미술관', '미식/카페'],
    desiredPlaces: ['아르떼뮤지엄', '협재해수욕장', '오설록 티뮤지엄'],
    hotelBudgetTier: 'standard',
    pace: 'compact',
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'view' | 'form'>('view');

  const executePlanGeneration = async (requestPayload: TravelPlanRequest, isRefreshAction = false) => {
    if (isRefreshAction) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `서버 응답 오류 (상태 코드: ${response.status})`);
      }

      const planData: TravelPlanResult = await response.json();
      if (!planData || !planData.days || planData.days.length === 0) {
        throw new Error('생성된 일정 데이터가 비어있습니다. 여행지 또는 희망 명소 명칭을 보완해 다시 시도해주세요.');
      }

      setCurrentRequest(requestPayload);
      setCurrentPlan(planData);
      setActiveTab('view');
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMessage(
        err.message || '일정 생성 중 문제가 발생했습니다. 해외 여행지인 경우 도시명이나 명소를 영어/현지어로 병기하여 다시 시도해보세요.'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleGeneratePlan = (formData: TravelPlanRequest) => {
    executePlanGeneration(formData, false);
  };

  const handleRefreshWithUpdatedPlaces = (updatedPlaces: string[], pace: 'compact' | 'balanced' | 'relaxed') => {
    const updatedRequest: TravelPlanRequest = {
      ...currentRequest,
      desiredPlaces: updatedPlaces,
      pace: pace,
    };
    executePlanGeneration(updatedRequest, true);
  };

  const handleResetToForm = () => {
    // Clear confirmed spots when going back to set a new destination
    setCurrentRequest(prev => ({
      ...prev,
      desiredPlaces: [],
    }));
    setActiveTab('form');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-stone-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-stone-900 tracking-tight">RouteGenie</span>
                <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  Google Maps 연동
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                동선 최적화 & 맛집·호텔 큐레이션 여행 플래너
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('form')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'form'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
              }`}
            >
              새 여행지 설정
            </button>
            {currentPlan && (
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'view'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                일정표 & 지도 보기
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Body Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">{errorMessage}</p>
              <p className="mt-1 text-rose-700">
                입력하신 조건으로 AI 맞춤 일정을 수립하는 도중 오류가 발생했습니다. 명소 이름을 확인하시거나 다시 시도해주세요.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'form' ? (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-stone-900 tracking-tight">
                어떤 여행을 계획 중이신가요?
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                여행지, 기간, 희망 명소를 입력하면 시간 낭비 없는 알찬 최적 동선을 자동으로 구성해드립니다.
              </p>
            </div>
            <PlannerForm
              initialValues={currentRequest}
              onSubmit={handleGeneratePlan}
              isLoading={isLoading}
            />
          </div>
        ) : (
          currentPlan && (
            <ItineraryView
              plan={currentPlan}
              apiKey={GOOGLE_MAPS_KEY}
              onReset={handleResetToForm}
              onRefreshPlan={handleRefreshWithUpdatedPlaces}
              isRefreshing={isRefreshing}
            />
          )
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span>RouteGenie AI Trip Planner</span>
            <span>·</span>
            <span>Google Maps Platform & Gemini AI</span>
          </div>
          <div>
            <span>동선 최적화 · 실시간 명소 추가/제외 & 재구성 지원</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
