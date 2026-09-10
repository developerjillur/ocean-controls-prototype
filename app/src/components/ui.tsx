import {
  useEffect,
  useRef,
  type ReactNode,
  type AnchorHTMLAttributes,
} from "react";
import {
  ArrowRight,
  Search,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Check,
  SlidersHorizontal,
  Grid2X2,
  List,
  Table2,
  FileText,
  Download,
  MapPin,
  Phone,
  User,
  Globe,
  ArrowUpRight,
  Layers,
  Settings,
  Factory,
  Mail,
  CheckCircle2,
  Info,
  GitCompareArrows,
} from "lucide-react";
import { navigate } from "../domain/navigation";
const icons = {
  arrow: ArrowRight,
  search: Search,
  cart: ShoppingCart,
  menu: Menu,
  close: X,
  down: ChevronDown,
  right: ChevronRight,
  plus: Plus,
  minus: Minus,
  check: Check,
  filter: SlidersHorizontal,
  grid: Grid2X2,
  list: List,
  table: Table2,
  document: FileText,
  download: Download,
  pin: MapPin,
  phone: Phone,
  user: User,
  globe: Globe,
  external: ArrowUpRight,
  layers: Layers,
  settings: Settings,
  factory: Factory,
  mail: Mail,
  success: CheckCircle2,
  info: Info,
  compare: GitCompareArrows,
};
export function Icon({
  name,
  size = 19,
}: {
  name: keyof typeof icons;
  size?: number;
}) {
  const C = icons[name];
  return <C size={size} strokeWidth={1.7} aria-hidden="true" />;
}
export function Link({
  href = "",
  onClick,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (
          !e.defaultPrevented &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.shiftKey &&
          e.button === 0 &&
          href &&
          !/^(https?:|mailto:|tel:)/.test(href) &&
          !rest.download &&
          rest.target !== "_blank"
        ) {
          e.preventDefault();
          navigate(href);
        }
      }}
    >
      {children}
    </a>
  );
}
export function Modal({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const prior = document.activeElement as HTMLElement;
    ref.current?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = old;
      prior?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "modal wide" : "modal"}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-head">
        <h2>{title}</h2>
        <button
          className="icon-button"
          aria-label={`Close ${title}`}
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Tabs({
  labels,
  value,
  onChange,
  panelPrefix,
}: {
  labels: string[];
  value: string;
  onChange: (s: string) => void;
  panelPrefix?: string;
}) {
  return (
    <div className="tabs" role="tablist">
      {labels.map((s, i) => (
        <button
          key={s}
          id={panelPrefix ? `${panelPrefix}-tab-${i}` : undefined}
          aria-controls={panelPrefix ? `${panelPrefix}-panel` : undefined}
          role="tab"
          aria-selected={value === s}
          tabIndex={value === s ? 0 : -1}
          onClick={() => onChange(s)}
          onKeyDown={(e) => {
            const n =
              e.key === "ArrowRight"
                ? i + 1
                : e.key === "ArrowLeft"
                  ? i - 1
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? labels.length - 1
                      : null;
            if (n !== null) {
              e.preventDefault();
              const index = (n + labels.length) % labels.length;
              onChange(labels[index]);
              (
                e.currentTarget.parentElement?.children[index] as HTMLElement
              ).focus();
            }
          }}
        >
          {s}
        </button>
      ))}
    </div>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <Icon name="search" size={32} />
      <h2>{title}</h2>
      {children}
    </div>
  );
}
export function PageTitle({
  eyebrow,
  title,
  children,
  blue = false,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  blue?: boolean;
}) {
  return (
    <section className={blue ? "page-title blue" : "page-title"}>
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </section>
  );
}
export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link href="index.html">Home</Link>
      {items.map((x, i) => (
        <span key={i}>
          <Icon name="right" size={14} />
          {x}
        </span>
      ))}
    </nav>
  );
}
export function Pagination({
  page,
  total,
  size,
  onPage,
}: {
  page: number;
  total: number;
  size: number;
  onPage: (n: number) => void;
}) {
  const max = Math.max(1, Math.ceil(total / size));
  return (
    <nav className="pagination" aria-label="Results pagination">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)}>
        Previous
      </button>
      {Array.from({ length: max }, (_, i) => i + 1)
        .filter((n) => n === 1 || n === max || Math.abs(n - page) < 2)
        .map((n) => (
          <button
            key={n}
            aria-current={page === n ? "page" : undefined}
            onClick={() => onPage(n)}
          >
            {n}
          </button>
        ))}
      <button disabled={page >= max} onClick={() => onPage(page + 1)}>
        Next
      </button>
    </nav>
  );
}
