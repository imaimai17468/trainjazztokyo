# CLAUDE.md

## Component Rules

### Colocation

Place components in a directory next to the page that uses them. Do not use a shared `src/components/` directory. No need to create a page-name subdirectory — the component directory itself implies the association.

```
src/routes/
  index.tsx                        # page
  MapView/                         # belongs to index.tsx
    MapView.container.tsx           # container
    MapView.tsx                     # presenter
    MapView.logic.ts                # logic
  settings/
    index.tsx                       # page
    Form/                           # belongs to settings/index.tsx
      Form.container.tsx
      Form.tsx
      Form.logic.ts
```

### One component per file

Each `.tsx` file exports exactly one component as its default export.

### Props-controlled state

Internal state must be controllable via props. If a piece of state cannot be lifted, extract it into its own component.

```tsx
// Good: state controlled by parent
function VolumeSlider(props: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="range"
      value={props.value}
      onInput={(e) => props.onChange(+e.currentTarget.value)}
    />
  );
}

// Bad: uncontrollable internal state mixed with display
function VolumeSlider() {
  const [value, setValue] = createSignal(50);
  return <input type="range" value={value()} onInput={(e) => setValue(+e.currentTarget.value)} />;
}
```

### Container / Presenter separation

- **Logic** (`.logic.ts`) — pure functions, hooks, utilities, API calls
- **Container** (`.container.tsx`) — holds state and wires logic to the presenter
- **Presenter** (`.tsx`) — pure display component receiving only props

Page files (`index.tsx`) are routing entries only — they render containers, not hold state.

```tsx
// src/routes/MapView/MapView.container.tsx (container)
import { clientOnly } from "@solidjs/start";
const MapViewPresenter = clientOnly(() => import("./MapView"));

export default function MapViewContainer() {
  const style = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";
  return <MapViewPresenter center={[139.77, 35.68]} zoom={12} style={style} />;
}

// src/routes/index.tsx (page — just wires containers)
import MapView from "./MapView/MapView.container";

export default function Home() {
  return (
    <main>
      <MapView />
    </main>
  );
}
```

## Tooling

### Formatter / Linter

- **Formatter**: `oxfmt` (oxc formatter) — `pnpm oxfmt --check` / `pnpm oxfmt --write`
- **Linter**: `oxlint` — `pnpm oxlint --fix`
- **Git hooks**: `lefthook` — pre-commit で `oxfmt --check` と `oxlint` を実行
- **biome は使わない**

フォーマットエラーが出た場合は `pnpm oxfmt --write <file>` で修正する。

### Dead code / Unused exports

[Knip](https://knip.dev/) で未使用の export やファイルを検出する。

```sh
# 初回セットアップ: pnpm create @knip/config
pnpm knip
```

### コード重複検出

[similarity-ts](https://github.com/mizchi/similarity) で類似・重複コードを検出する。

```sh
similarity-ts .
similarity-ts . --print  # コード表示付き
```

## Tailwind CSS

### No arbitrary value brackets

Do not use Tailwind's `[...]` arbitrary value syntax. Tailwind v4 supports any numeric value natively.

```tsx
// Good
<div class="p-18 mt-7 w-120" />

// Bad
<div class="p-[72px] mt-[28px] w-[480px]" />
```

### Use dynamic viewport units

Prefer `dvh` / `dvw` over `vh` / `vw` / `screen` for viewport-relative sizing. This handles mobile address bar resize correctly.

```tsx
// Good
<div class="h-dvh w-dvw" />

// Bad
<div class="h-screen w-screen" />
```

### Custom colors and fonts as CSS theme variables

Define project-specific colors, fonts, and other design tokens as `@theme` variables in CSS. Do not hardcode hex values or font names in utility classes.

```css
/* app.css */
@theme {
  --color-brand: #1a2b3c;
  --color-brand-light: #4a5b6c;
  --font-heading: "Noto Sans JP", sans-serif;
  --font-body: "Inter", sans-serif;
}
```

```tsx
// Good: use theme variables
<h1 class="font-heading text-brand">Title</h1>
<p class="font-body text-brand-light">Body</p>

// Bad: inline values
<h1 class="font-['Noto_Sans_JP'] text-[#1a2b3c]">Title</h1>
```
