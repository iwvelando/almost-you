import { useEffect, useState } from "react";
import { Icon } from "./Icon";
type Preference = "system" | "light" | "dark";
const valid = (value: string | null): Preference =>
  value === "dark" || value === "light" ? value : "system";
export function Theme() {
  const [preference, setPreference] = useState<Preference>(() => {
    try {
      return valid(localStorage.getItem("almost-you-theme"));
    } catch {
      return "system";
    }
  });
  const [systemDark, setSystemDark] = useState(
    () => matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const dark = preference === "system" ? systemDark : preference === "dark";
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setSystemDark(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [dark]);
  const choose = (next: Preference) => {
    setPreference(next);
    try {
      if (next === "system") localStorage.removeItem("almost-you-theme");
      else localStorage.setItem("almost-you-theme", next);
    } catch {
      /* Keep the choice in memory if storage is denied. */
    }
  };
  return (
    <div className="theme" role="group" aria-label="Color theme">
      <button
        type="button"
        className="theme-toggle"
        onClick={() => choose(dark ? "light" : "dark")}
        aria-label={dark ? "Use light background" : "Use dark background"}
        title={
          preference === "system"
            ? "Following your system theme. Click to choose a fixed theme."
            : "Your theme choice is saved in this browser."
        }
      >
        <Icon kind={dark ? "sun" : "moon"} />
      </button>
      <button
        type="button"
        className="system-theme"
        aria-label="Follow system"
        aria-pressed={preference === "system"}
        onClick={() => choose("system")}
        title={
          preference === "system"
            ? "Following your system theme"
            : "Follow system changes, including time-of-day changes"
        }
      >
        <Icon kind="system" />
      </button>
    </div>
  );
}
