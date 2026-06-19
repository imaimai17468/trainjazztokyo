import { createFileRoute } from "@tanstack/react-router";
import MapView from "./MapView/MapView.container";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main>
      <MapView />
    </main>
  );
}
