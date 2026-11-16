export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role="img"
      aria-label="Favourable Delivery mark"
    >
      <rect width="32" height="32" rx="2" fill="#0F172A" />
      <path
        d="M9 23V9h6.6a4.4 4.4 0 0 1 0 8.8H9"
        fill="none"
        stroke="#F7F4EC"
        strokeWidth="1.9"
        strokeLinecap="square"
      />
      <circle cx="23.5" cy="21.5" r="3.2" fill="#10B981" />
    </svg>
  );
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-none">
        <p className="font-display text-[19px] tracking-tight text-ink">
          Favourable Delivery
        </p>
        {!compact && (
          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            Last-mile middleware
          </p>
        )}
      </div>
    </div>
  );
}

export function LiveStatusPill() {
  return (
    <div className="hidden items-center gap-2.5 border border-border bg-card px-3 py-1.5 lg:flex">
      <span className="relative flex size-1.5">
        <span className="live-dot absolute inline-flex size-1.5 rounded-full bg-route text-route" />
        <span className="relative inline-flex size-1.5 rounded-full bg-route" />
      </span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-foreground/80">
        Middleware Active
      </span>
      <span className="text-muted-foreground/50">•</span>
      <span className="text-[10px] uppercase tracking-[0.16em] text-route-deep">
        Zapier Synced
      </span>
    </div>
  );
}

export function ViewToggle({
  value,
  onChange,
}: {
  value: "customer" | "hub";
  onChange: (next: "customer" | "hub") => void;
}) {
  const items = [
    { id: "customer" as const, label: "Customer View", short: "Customer" },
    { id: "hub" as const, label: "Hub Partner Admin View", short: "Hub Admin" },
  ];
  return (
    <div
      className="inline-flex w-full items-center gap-0.5 border border-border bg-card p-1 sm:w-auto"
      role="group"
      aria-label="Switch between customer and hub partner views"
    >
      {items.map((item) => {
        const active = value === item.id;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.id)}
            className={[
              "flex-1 whitespace-nowrap px-3.5 py-2 text-[10px] uppercase tracking-[0.16em] transition-colors duration-200 sm:flex-none",
              active
                ? "bg-ink text-paper"
                : "text-muted-foreground hover:bg-paper-deep/60 hover:text-foreground",
            ].join(" ")}
          >
            <span className="lg:hidden">{item.short}</span>
            <span className="hidden lg:inline">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
