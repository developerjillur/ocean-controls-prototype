import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import { products, productBySku } from "./catalogue";
import { addLine, quantityError, lineTotals } from "./commerce";
import type { CartLine, Product } from "./types";
const KEY = "ocean-rebuild-1400-v3";
type Setter<T> = Dispatch<SetStateAction<T>>;
type Saved = {
  cart: CartLine[];
  inc: boolean;
  currency: string;
  location: string;
};
function restore(): Saved {
  const empty: Saved = {
    cart: [],
    inc: false,
    currency: "AUD",
    location: "Melbourne",
  };
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "{}");
    if (!value || typeof value !== "object") return empty;
    const v = value as Record<string, unknown>;
    const cart: CartLine[] = [];
    if (Array.isArray(v.cart))
      for (const line of v.cart) {
        if (!line || typeof line !== "object" || typeof line.sku !== "string")
          continue;
        const p = productBySku(line.sku);
        if (
          !p ||
          !Number.isSafeInteger(line.quantity) ||
          quantityError(p, line.quantity)
        )
          continue;
        const merged = addLine(cart, p, line.quantity);
        if (!merged.error) cart.splice(0, cart.length, ...merged.lines);
      }
    return {
      cart,
      inc: v.inc === true,
      currency:
        typeof v.currency === "string" &&
        ["AUD", "USD", "EUR", "NZD"].includes(v.currency)
          ? v.currency
          : "AUD",
      location:
        v.location === "Warehouse information"
          ? "Warehouse information"
          : "Melbourne",
    };
  } catch {
    return empty;
  }
}
type State = {
  cart: CartLine[];
  setCart: Setter<CartLine[]>;
  inc: boolean;
  setInc: Setter<boolean>;
  currency: string;
  setCurrency: Setter<string>;
  location: string;
  setLocation: Setter<string>;
  compare: string[];
  setCompare: Setter<string[]>;
  toggleCompare: (sku: string) => void;
  drawer: string;
  setDrawer: Setter<string>;
  notice: string;
  setNotice: Setter<string>;
  add: (p: Product, q: number) => boolean;
  update: (sku: string, q: number) => void;
  totals: { ex: number; tax: number; inc: number };
  demo: boolean;
  setDemo: Setter<boolean>;
  products: Product[];
};
const Store = createContext<State | null>(null);
export function Provider({ children }: { children: ReactNode }) {
  const [saved] = useState(restore);
  const [cart, commitCart] = useState(saved.cart);
  const cartRef = useRef(cart);
  const setCart: Setter<CartLine[]> = (next) => {
    const value = typeof next === "function" ? next(cartRef.current) : next;
    cartRef.current = value;
    commitCart(value);
  };
  const [inc, setInc] = useState(saved.inc);
  const [currency, setCurrency] = useState(saved.currency);
  const [location, setLocation] = useState(saved.location);
  const [compare, setCompare] = useState<string[]>([]);
  const [drawer, setDrawer] = useState("");
  const [notice, setNotice] = useState("");
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ cart, inc, currency, location }),
      );
    } catch {
      /* Session state remains available when browser storage is disabled. */
    }
  }, [cart, inc, currency, location]);
  useEffect(() => {
    if (notice) {
      const id = setTimeout(() => setNotice(""), 5000);
      return () => clearTimeout(id);
    }
  }, [notice]);
  function add(p: Product, q: number) {
    const r = addLine(cartRef.current, p, q);
    if (r.error) {
      setNotice(r.error);
      return false;
    }
    setCart(r.lines);
    setNotice(`${q} × ${p.sku} added to your cart`);
    return true;
  }
  function update(sku: string, q: number) {
    const p = productBySku(sku);
    if (!p) return;
    if (q === 0) {
      setCart((lines) => lines.filter((l) => l.sku !== sku));
      return;
    }
    const err = quantityError(p, q);
    if (err) {
      setNotice(err);
      return;
    }
    setCart((lines) =>
      lines.map((l) => (l.sku === sku ? { ...l, quantity: q } : l)),
    );
  }
  function toggleCompare(sku: string) {
    if (!productBySku(sku)) return;
    if (compare.includes(sku)) setCompare(compare.filter((s) => s !== sku));
    else if (compare.length < 4) setCompare([...compare, sku]);
    else setNotice("Compare up to four products. Remove one to add another.");
  }
  const totals = cart.reduce(
    (t, l) => {
      const v = lineTotals(productBySku(l.sku)!, l.quantity);
      return { ex: t.ex + v.ex, tax: t.tax + v.tax, inc: t.inc + v.inc };
    },
    { ex: 0, tax: 0, inc: 0 },
  );
  return (
    <Store.Provider
      value={{
        cart,
        setCart,
        inc,
        setInc,
        currency,
        setCurrency,
        location,
        setLocation,
        compare,
        setCompare,
        toggleCompare,
        drawer,
        setDrawer,
        notice,
        setNotice,
        add,
        update,
        totals,
        demo,
        setDemo,
        products,
      }}
    >
      {children}
    </Store.Provider>
  );
}
export function useStore() {
  const value = useContext(Store);
  if (!value) throw new Error("Store provider is required");
  return value;
}
