import { useState, useRef, useCallback } from "react";
import { Globe, MapPin, Volume2, VolumeOff } from "lucide-react";
import { setMuted, setUserLocation } from "../MapView.sound";

type Props = {
  railwayOnly: boolean;
  onToggleRailwayOnly: () => void;
  onLocationChange: (coords: [number, number] | null) => void;
};

export default function Controls({ railwayOnly, onToggleRailwayOnly, onLocationChange }: Props) {
  const [soundOn, setSoundOn] = useState(true);
  const [locOn, setLocOn] = useState(false);
  const watchIdRef = useRef<number | undefined>(undefined);

  const toggleSound = useCallback(() => {
    setSoundOn((prev) => {
      setMuted(prev);
      return !prev;
    });
  }, []);

  const toggleLocation = useCallback(() => {
    if (locOn) {
      if (watchIdRef.current !== undefined) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = undefined;
      setLocOn(false);
      setUserLocation(null);
      onLocationChange(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setLocOn(true);
        setUserLocation(coords);
        onLocationChange(coords);
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => {
            const c: [number, number] = [p.coords.longitude, p.coords.latitude];
            setUserLocation(c);
            onLocationChange(c);
          },
          () => {},
          { enableHighAccuracy: false },
        );
      },
      () => setLocOn(false),
      { enableHighAccuracy: false },
    );
  }, [locOn, onLocationChange]);

  return (
    <>
      <button
        type="button"
        onClick={toggleSound}
        className={`fixed bottom-4 right-4 z-50 rounded-full p-1.5 transition-colors duration-700 ${
          soundOn
            ? "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
            : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
        aria-label={soundOn ? "音を消す" : "音を出す"}
      >
        {soundOn ? <Volume2 size={16} /> : <VolumeOff size={16} />}
      </button>
      <button
        type="button"
        onClick={onToggleRailwayOnly}
        className={`fixed bottom-4 right-14 z-50 rounded-full p-1.5 transition-colors duration-700 ${
          railwayOnly
            ? "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
            : "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900"
        }`}
        aria-label={railwayOnly ? "地図を表示" : "線路のみ表示"}
      >
        <Globe size={16} />
      </button>
      <button
        type="button"
        onClick={toggleLocation}
        className={`fixed bottom-4 right-24 z-50 rounded-full p-1.5 transition-colors duration-700 ${
          locOn
            ? "bg-blue-600 text-white"
            : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
        }`}
        aria-label={locOn ? "位置情報OFF" : "位置情報ON"}
      >
        <MapPin size={16} />
      </button>
    </>
  );
}
