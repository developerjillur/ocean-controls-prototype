import { useSyncExternalStore } from "react";
const event = "ocean:navigate";
export function navigate(path: string, scroll = true) {
  const url = new URL(path, window.location.href);
  history.pushState(null, "", url);
  window.dispatchEvent(new Event(event));
  if (scroll) window.scrollTo({ top: 0 });
}
export function setQuery(
  changes: Record<string, string | string[] | null>,
  resetPage = true,
) {
  const s = new URLSearchParams(location.search);
  if (resetPage) s.delete("page");
  for (const [k, v] of Object.entries(changes)) {
    s.delete(k);
    if (Array.isArray(v)) v.forEach((x) => s.append(k, x));
    else if (v) s.set(k, v);
  }
  navigate(location.pathname + (s.size ? "?" + s : "") + location.hash, false);
}
export function useLocation() {
  return useSyncExternalStore(
    (cb) => {
      window.addEventListener("popstate", cb);
      window.addEventListener(event, cb);
      return () => {
        window.removeEventListener("popstate", cb);
        window.removeEventListener(event, cb);
      };
    },
    () => location.pathname + location.search + location.hash,
  );
}
