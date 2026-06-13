import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
import { clientOnly } from "@solidjs/start";
import "./app.css";

const ThemeToggle = clientOnly(() => import("./ThemeToggle/ThemeToggle.container"));

export default function App() {
  return (
    <Router
      root={(props) => (
        <>
          <ThemeToggle />
          <link rel="preload" href="/soundfont.sf3" as="fetch" crossorigin="anonymous" />
          <link
            rel="preload"
            href="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
            as="fetch"
            crossorigin="anonymous"
          />
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
