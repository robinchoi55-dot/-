import React, { useEffect, useRef, useState } from 'react';
import { DayItinerary, ActivityLocation } from '../types/travel';
import { MapPin, Navigation, Car, Bus, Footprints, ExternalLink, Hotel, Utensils } from 'lucide-react';

interface InteractiveMapProps {
  apiKey: string;
  day: DayItinerary;
  selectedActivityIndex: number | null;
  onSelectActivity: (index: number) => void;
}

declare global {
  interface Window {
    google?: any;
    initGoogleMapCallback?: () => void;
  }
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  apiKey,
  day,
  selectedActivityIndex,
  onSelectActivity
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const polylineRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load Google Maps script once
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMapCallback`;
      script.async = true;
      script.defer = true;
      window.initGoogleMapCallback = () => {
        setMapLoaded(true);
      };
      script.onerror = () => {
        setLoadError('구글 지도 라이브러리를 로드하지 못했습니다. 네트워크 연결을 확인해주세요.');
      };
      document.head.appendChild(script);
    } else {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
      } else {
        window.initGoogleMapCallback = () => {
          setMapLoaded(true);
        };
      }
    }
  }, [apiKey]);

  // Initialize or update Map & Markers & Route Polyline
  useEffect(() => {
    if (!mapLoaded || !mapContainerRef.current || !window.google?.maps) return;

    const validActivities = day.activities.filter(a => typeof a.lat === 'number' && typeof a.lng === 'number');
    
    // Default center if no coordinates
    const defaultCenter = validActivities.length > 0
      ? { lat: validActivities[0].lat!, lng: validActivities[0].lng! }
      : { lat: 33.4996, lng: 126.5312 }; // Jeju or default

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 11,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: false,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'simplified' }]
          },
          {
            featureType: 'transit',
            stylers: [{ visibility: 'simplified' }]
          }
        ]
      });
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Clear old polyline
    if (polylineRef.current) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
    }

    if (validActivities.length === 0) return;

    const bounds = new window.google.maps.LatLngBounds();
    const routeCoords: any[] = [];

    validActivities.forEach((act, idx) => {
      const pos = { lat: act.lat!, lng: act.lng! };
      bounds.extend(pos);
      routeCoords.push(pos);

      // Determine pin visual/badge
      const isStart = act.type === 'start';
      const isEnd = act.type === 'end';
      const isBreakfast = act.type === 'meal_breakfast' || act.category?.includes('아침') || act.category?.includes('조식');
      const isLunch = act.type === 'meal_lunch' || act.category?.includes('점심');
      const isDinner = act.type === 'meal_dinner' || act.category?.includes('저녁');
      const isMeal = act.type.startsWith('meal') || isBreakfast || isLunch || isDinner;
      const isGolf = act.type === 'golf' || act.category?.includes('골프') || act.name.includes('CC') || act.name.includes('골프') || act.name.includes('Golf');
      const isSelected = selectedActivityIndex === idx;

      // Color scheme
      let pinColor = '#d97706'; // amber-600 default spot
      if (isStart) pinColor = '#2563eb'; // blue
      else if (isEnd) pinColor = '#dc2626'; // rose-600 for Final Destination
      else if (isGolf) pinColor = '#059669'; // emerald-600 for Golf Courses
      else if (isBreakfast) pinColor = '#d97706'; // amber for breakfast
      else if (isLunch) pinColor = '#ea580c'; // orange for lunch
      else if (isDinner) pinColor = '#b91c1c'; // deep red for dinner
      else if (isMeal) pinColor = '#ea580c'; // orange

      // Custom SVG Marker icon
      const labelText = isStart ? 'S' : isEnd ? '도착' : isGolf ? '⛳' : isBreakfast ? '조식' : isLunch ? '점심' : isDinner ? '저녁' : `${idx + 1}`;
      
      const svgMarker = {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: isSelected ? 15 : 12,
        fillColor: pinColor,
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: isSelected ? 3 : 2,
      };

      const marker = new window.google.maps.Marker({
        position: pos,
        map: map,
        title: act.name,
        icon: svgMarker,
        label: {
          text: labelText,
          color: '#ffffff',
          fontSize: isMeal ? '9px' : '11px',
          fontWeight: 'bold',
        },
        zIndex: isSelected ? 999 : 10 + idx,
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
      });

      const infoContent = `
        <div style="padding: 10px; font-family: Pretendard, sans-serif; max-width: 250px;">
          <div style="font-size: 11px; color: ${pinColor}; font-weight: 600; margin-bottom: 2px;">
            ${act.timeSlot} · ${act.category || '장소'}
          </div>
          <div style="font-weight: 700; font-size: 14px; color: #1c1917; margin-bottom: 4px;">
            ${act.name}
          </div>
          <p style="font-size: 12px; color: #57534e; margin: 0 0 8px 0; line-height: 1.4;">
            ${act.description.substring(0, 90)}...
          </p>
          <a href="${act.googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
             style="display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: #0284c7; text-decoration: none; font-weight: 600;">
            구글 지도에서 보기 &rarr;
          </a>
        </div>
      `;

      const infoWindow = new window.google.maps.InfoWindow({
        content: infoContent,
      });

      marker.addListener('click', () => {
        onSelectActivity(idx);
        infoWindow.open(map, marker);
      });

      if (isSelected) {
        infoWindow.open(map, marker);
      }

      markersRef.current.push(marker);
    });

    // Also plot hotel marker if available and has coords
    if (day.hotelRecommendation && day.hotelRecommendation.lat && day.hotelRecommendation.lng) {
      const hotelPos = { lat: day.hotelRecommendation.lat, lng: day.hotelRecommendation.lng };
      bounds.extend(hotelPos);

      const hotelMarker = new window.google.maps.Marker({
        position: hotelPos,
        map: map,
        title: day.hotelRecommendation.name,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: '#7c3aed', // purple
          fillOpacity: 0.95,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        label: {
          text: '숙소',
          color: '#ffffff',
          fontSize: '9px',
          fontWeight: 'bold',
        }
      });

      const hotelInfoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; font-family: Pretendard, sans-serif; max-width: 240px;">
            <div style="font-size: 11px; color: #7c3aed; font-weight: 600; margin-bottom: 2px;">
              추천 숙박 호텔 (${day.hotelRecommendation.tier})
            </div>
            <div style="font-weight: 700; font-size: 14px; color: #1c1917; margin-bottom: 4px;">
              ${day.hotelRecommendation.name}
            </div>
            <div style="font-size: 12px; font-weight: 700; color: #6d28d9; margin-bottom: 3px;">
              💰 ${day.hotelRecommendation.averagePricePerNight || day.hotelRecommendation.priceRange}
            </div>
            <div style="font-size: 11px; color: #78716c; margin-bottom: 6px;">
              예상 범위: ${day.hotelRecommendation.priceRange}
            </div>
            <a href="${day.hotelRecommendation.googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
               style="font-size: 12px; color: #0284c7; text-decoration: none; font-weight: 600;">
              구글 지도 보기 &rarr;
            </a>
          </div>
        `
      });

      hotelMarker.addListener('click', () => {
        hotelInfoWindow.open(map, hotelMarker);
      });

      markersRef.current.push(hotelMarker);
    }

    // Connect sequential route points with a styled polyline
    if (routeCoords.length > 1) {
      polylineRef.current = new window.google.maps.Polyline({
        path: routeCoords,
        geodesic: true,
        strokeColor: '#0284c7', // sky-600
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map: map
      });
    }

    // Adjust camera view
    if (validActivities.length === 1) {
      map.setCenter(defaultCenter);
      map.setZoom(13);
    } else {
      map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
    }

  }, [mapLoaded, day, selectedActivityIndex, onSelectActivity]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
      {loadError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-stone-600">
          <p className="text-sm font-medium text-rose-600 mb-2">{loadError}</p>
          <p className="text-xs text-stone-500">API 키 상태 또는 네트워크 연결을 확인해주세요.</p>
        </div>
      ) : !mapLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-stone-50 text-stone-500">
          <div className="w-8 h-8 border-2 border-stone-300 border-t-amber-600 rounded-full animate-spin mb-3"></div>
          <span className="text-xs font-medium tracking-wide">구글 지도를 불러오는 중...</span>
        </div>
      ) : null}

      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />

      {/* Map Legend & Summary Bar */}
      <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm border border-stone-200 flex items-center justify-between text-xs text-stone-700">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
            출발/도착
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"></span>
            명소
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-600 inline-block"></span>
            점심/저녁 맛집
          </span>
          {day.hotelRecommendation && (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span>
              추천 호텔
            </span>
          )}
        </div>
        <div className="text-[11px] text-stone-500 hidden sm:block">
          동선 최적화 완료 · 마커 클릭 시 상세 안내
        </div>
      </div>
    </div>
  );
};
