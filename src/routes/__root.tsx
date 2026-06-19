import { Suspense, lazy } from "react";
import type { ReactNode } from "react";
import { Outlet, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import appCss from "~/app.css?url";

const ThemeToggle = lazy(() => import("~/ThemeToggle/ThemeToggle.container"));

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "train jazz TOKYO" },
      { name: "description", content: "東京の電車がジャズを奏でる" },
      { property: "og:title", content: "train jazz TOKYO" },
      { property: "og:description", content: "東京の電車がジャズを奏でる" },
      { property: "og:image", content: "/og-image.png" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "train jazz TOKYO" },
      { name: "twitter:description", content: "東京の電車がジャズを奏でる" },
      { name: "twitter:image", content: "/og-image.png" },
    ],
    links: [
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "stylesheet", href: appCss },
    ],
  }),
  component: RootComponent,
  shellComponent: RootDocument,
});

function RootComponent() {
  return (
    <>
      <Suspense>
        <ThemeToggle />
      </Suspense>
      <Outlet />
    </>
  );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <div id="app">{children}</div>
        <Scripts />
      </body>
    </html>
  );
}
