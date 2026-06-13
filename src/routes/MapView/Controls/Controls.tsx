import { createSignal } from "solid-js";
import { Globe, MapPin, Volume2, VolumeOff } from "lucide-solid";
import { setMuted, setUserLocation } from "../MapView.sound";

type Props = {
  railwayOnly: boolean;
  onToggleRailwayOnly: () => void;
  onLocationChange: (coords: [number, number] | null) => void;
};

export default function Controls(props: Props) {
  const [soundOn, setSoundOn] = createSignal(true);
  const [locOn, setLocOn] = createSignal(false);
  let watchId: number | undefined;

  const toggleSound = () => {
    const next = !soundOn();
    setSoundOn(next);
    setMuted(!next);
  };

  const toggleLocation = () => {
    if (locOn()) {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
      watchId = undefined;
      setLocOn(false);
      setUserLocation(null);
      props.onLocationChange(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setLocOn(true);
        setUserLocation(coords);
        props.onLocationChange(coords);
        watchId = navigator.geolocation.watchPosition(
          (p) => {
            const c: [number, number] = [p.coords.longitude, p.coords.latitude];
            setUserLocation(c);
            props.onLocationChange(c);
          },
          () => {},
          { enableHighAccuracy: false },
        );
      },
      () => setLocOn(false),
      { enableHighAccuracy: false },
    );
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleSound}
        class="fixed bottom-4 right-4 z-50 rounded-full p-1.5 transition-colors duration-700"
        classList={{
          "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": !soundOn(),
          "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900": soundOn(),
        }}
        aria-label={soundOn() ? "音を消す" : "音を出す"}
      >
        {soundOn() ? <Volume2 size={16} /> : <VolumeOff size={16} />}
      </button>
      <button
        type="button"
        onClick={props.onToggleRailwayOnly}
        class="fixed bottom-4 right-14 z-50 rounded-full p-1.5 transition-colors duration-700"
        classList={{
          "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": props.railwayOnly,
          "bg-gray-800 text-white dark:bg-gray-200 dark:text-gray-900": !props.railwayOnly,
        }}
        aria-label={props.railwayOnly ? "地図を表示" : "線路のみ表示"}
      >
        <Globe size={16} />
      </button>
      <button
        type="button"
        onClick={toggleLocation}
        class="fixed bottom-4 right-24 z-50 rounded-full p-1.5 transition-colors duration-700"
        classList={{
          "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400": !locOn(),
          "bg-blue-600 text-white": locOn(),
        }}
        aria-label={locOn() ? "位置情報OFF" : "位置情報ON"}
      >
        <MapPin size={16} />
      </button>
    </>
  );
}
