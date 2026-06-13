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
          <Suspense>{props.children}</Suspense>
        </>
      )}
    >
      <FileRoutes />
    </Router>
  );
}
