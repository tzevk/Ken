const STORAGE_KEY = "ken-finance-agent-preferences";

// Runs before paint to avoid a flash of the wrong theme/accent. Mirrors the
// shape zustand's `persist` middleware writes to localStorage.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var raw = localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    var accent = "forest";
    var colorMode = "system";
    if (raw) {
      var parsed = JSON.parse(raw);
      var state = parsed && parsed.state ? parsed.state : {};
      if (state.accent) accent = state.accent;
      if (state.colorMode) colorMode = state.colorMode;
    }
    var resolved = colorMode;
    if (colorMode === "system") {
      resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    var root = document.documentElement;
    root.setAttribute("data-accent", accent);
    root.setAttribute("data-theme", resolved);
  } catch (e) {}
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
}
