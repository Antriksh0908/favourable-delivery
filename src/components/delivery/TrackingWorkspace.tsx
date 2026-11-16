import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  CheckCircle2,
  Navigation,
  Package,
  PackageSearch,
  Phone,
  TriangleAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CARRIER_META,
  GIG_OPTIONS,
  rupees,
  SAMPLE_IDS,
  SLOTS,
  STATUS_LABEL,
  type GigOption,
  type GigSlug,
  type Parcel,
} from "@/lib/delivery-data";
import { VoiceDispatch } from "./VoiceDispatch";

const STATUS_STYLES: Record<Parcel["stage"], string> = {
  held: "border-hub/35 bg-hub-soft text-hub-deep",
  assigned: "border-route-deep/25 bg-route-soft text-route-deep",
  delivered: "border-route-deep/25 bg-route-soft text-route-deep",
};

function StatusBadge({ parcel }: { parcel: Parcel }) {
  const tone =
    parcel.stage === "held" ? "bg-hub" : "bg-route";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em]",
        STATUS_STYLES[parcel.stage],
      )}
    >
      <span className={cn("size-1.5 rounded-full", tone)} />
      {STATUS_LABEL[parcel.stage]}
    </span>
  );
}

export function TrackingWorkspace({
  parcels,
  selectedId,
  onSelect,
  onConfirm,
}: {
  parcels: Parcel[];
  selectedId: string;
  onSelect: (id: string) => void;
  onConfirm: (parcelId: string, slot: string, gig: GigOption) => void;
}) {
  const [query, setQuery] = useState(selectedId);
  const [notFound, setNotFound] = useState<string | null>(null);
  const parcel = parcels.find((item) => item.id === selectedId) ?? parcels[0];

  useEffect(() => {
    setQuery(selectedId);
    setNotFound(null);
  }, [selectedId]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleaned = query.trim().toUpperCase();
    const match = parcels.find((item) => item.id.toUpperCase() === cleaned);
    if (match) {
      onSelect(match.id);
      setNotFound(null);
      return;
    }
    setNotFound(cleaned || "—");
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="paper-grid pointer-events-none absolute inset-0 opacity-50 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
        <div className="relative mx-auto w-full max-w-[1180px] px-5 pb-12 pt-14 sm:px-8 sm:pt-20 lg:pt-24">
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-route" />
            <p className="eyebrow text-muted-foreground">
              Logistics middleware · Evening delivery network
            </p>
          </div>

          <h1 className="mt-6 max-w-[17ch] font-display text-[clamp(2.7rem,6vw,4.9rem)] leading-[0.94] tracking-[-0.02em] text-ink">
            Never Miss a Parcel{" "}
            <span className="italic text-route-deep">While You&apos;re</span> at
            Work
          </h1>

          <p className="mt-6 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Your courier knocked at 11:42 AM. You were in a meeting. We hold the
            parcel at the local hub and hand it to a gig rider for an 8–10 PM
            doorstep drop — for a fraction of a failed re-attempt.
          </p>

          <form onSubmit={handleSubmit} className="mt-9 w-full max-w-2xl">
            <div className="flex flex-col gap-2 border border-ink/15 bg-card p-2 shadow-[0_1px_0_rgba(15,23,42,0.04)] sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3 px-3">
                <PackageSearch className="size-4 shrink-0 text-muted-foreground" />
                <label htmlFor="tracking-id" className="sr-only">
                  Tracking ID
                </label>
                <input
                  id="tracking-id"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Enter a tracking ID, e.g. DLV-894210"
                  spellCheck={false}
                  autoComplete="off"
                  className="h-11 w-full bg-transparent text-sm tracking-wide outline-none placeholder:text-muted-foreground/70"
                />
              </div>
              <button
                type="submit"
                className="eyebrow flex h-11 items-center justify-center gap-2 bg-ink px-6 text-paper transition-colors hover:bg-ink-soft"
              >
                Track parcel
                <ArrowRight className="size-3.5" />
              </button>
            </div>

            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="eyebrow mr-1 text-[9px] text-muted-foreground/80">
                Sample IDs
              </span>
              {SAMPLE_IDS.map((id) => {
                const sample = parcels.find((item) => item.id === id);
                const active = parcel.id === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onSelect(id)}
                    className={cn(
                      "inline-flex items-center gap-2 border px-2.5 py-1.5 text-[11px] tracking-wide transition-colors",
                      active
                        ? "border-route-deep/40 bg-route-soft text-route-deep"
                        : "border-border bg-card text-foreground/75 hover:border-ink/25 hover:text-ink",
                    )}
                  >
                    <span
                      className="size-1.5 rounded-full"
                      style={{
                        backgroundColor: sample
                          ? CARRIER_META[sample.carrier].dot
                          : "#6E6A60",
                      }}
                    />
                    {id}
                  </button>
                );
              })}
            </div>

            {notFound && (
              <p className="mt-3 flex items-center gap-2 text-xs text-hub-deep">
                <TriangleAlert className="size-3.5" />
                No parcel found for &ldquo;{notFound}&rdquo;. Try DLV-894210,
                EKT-441092 or XPB-772104.
              </p>
            )}
          </form>

          <dl className="mt-12 grid gap-6 border-t border-border/80 pt-7 sm:grid-cols-3 sm:gap-0">
            {[
              { value: "12,400", label: "Parcels rerouted this month" },
              { value: "₹9.3L", label: "Saved on failed re-attempts" },
              { value: "96%", label: "Evening first-try delivery" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={cn(
                  "sm:px-6",
                  index === 0 && "sm:pl-0",
                  index > 0 && "sm:border-l sm:border-border/70",
                )}
              >
                <dd className="font-display text-[26px] leading-none tracking-tight text-ink num">
                  {stat.value}
                </dd>
                <dt className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-muted-foreground">Parcel workspace</p>
            <h2 className="mt-2 max-w-2xl font-display text-[clamp(1.8rem,3.2vw,2.5rem)] leading-[1.05] text-ink">
              Everything that happens after the missed knock.
            </h2>
          </div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            Unified tracking · 3 carriers linked
          </p>
        </div>

        <div className="mt-8">
          <ParcelOverview parcel={parcel} />
        </div>

        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[1.5fr_1fr]">
          <InterceptPanel parcel={parcel} onConfirm={onConfirm} />
          <VoiceDispatch parcel={parcel} />
        </div>
      </section>
    </>
  );
}

function ParcelOverview({ parcel }: { parcel: Parcel }) {
  const carrier = CARRIER_META[parcel.carrier];
  return (
    <article className="border border-border bg-card">
      <div className="flex flex-col gap-5 border-b border-border/70 p-6 sm:flex-row sm:items-start sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex size-11 shrink-0 items-center justify-center border border-border bg-paper">
            <Package className="size-5 text-ink" strokeWidth={1.4} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: carrier.dot }}
              />
              <p className="eyebrow text-muted-foreground">
                {parcel.carrier} · {parcel.weightKg} kg
              </p>
            </div>
            <h3 className="mt-2 font-display text-[28px] leading-none tracking-tight text-ink num">
              {parcel.id}
            </h3>
            <p className="mt-2 text-xs text-muted-foreground">
              {parcel.hub} · {parcel.city}
            </p>
          </div>
        </div>
        <StatusBadge parcel={parcel} />
      </div>

      <dl className="grid divide-y divide-border/70 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="px-6 py-5 sm:px-8">
          <dt className="eyebrow text-[9px] text-muted-foreground">
            Line-haul carrier
          </dt>
          <dd className="mt-2 text-sm text-ink">{parcel.carrier}</dd>
          <dd className="mt-1 text-[11px] text-muted-foreground">
            Bulk sorting network
          </dd>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <dt className="eyebrow text-[9px] text-muted-foreground">
            Parcel weight
          </dt>
          <dd className="mt-2 text-sm text-ink num">{parcel.weightKg} kg</dd>
          <dd className="mt-1 text-[11px] text-muted-foreground">
            Evening-slot eligible
          </dd>
        </div>
        <div className="px-6 py-5 sm:px-8">
          <dt className="eyebrow text-[9px] text-muted-foreground">
            Evening window
          </dt>
          <dd
            className={cn(
              "mt-2 text-sm num",
              parcel.slot ? "text-route-deep" : "text-ink",
            )}
          >
            {parcel.slot ?? "Not selected"}
          </dd>
          <dd className="mt-1 text-[11px] text-muted-foreground">
            {parcel.slot ? "Gig rider assigned" : "Divert to 8–10 PM"}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-4 border-t border-hub/25 bg-hub-soft/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-start gap-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-hub-deep" />
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-hub-deep">
              Original failed daytime attempt
            </p>
            <p className="mt-1 text-[13px] text-foreground/80">
              {parcel.failedAttempt}. Courier re-attempt is queued for tomorrow,
              11 AM – 2 PM.
            </p>
          </div>
        </div>
        <div className="shrink-0 border-t border-hub/20 pt-3 sm:border-t-0 sm:pl-6 sm:pt-0 sm:text-right">
          <p className="eyebrow text-[9px] text-hub-deep/80">Re-attempt fee</p>
          <p className="mt-1 font-display text-xl leading-none text-hub-deep num">
            {rupees(parcel.reattemptCost)}
          </p>
        </div>
      </div>
    </article>
  );
}

function InterceptPanel({
  parcel,
  onConfirm,
}: {
  parcel: Parcel;
  onConfirm: (parcelId: string, slot: string, gig: GigOption) => void;
}) {
  const [slot, setSlot] = useState(SLOTS[0].id);
  const [gigSlug, setGigSlug] = useState<GigSlug>("rapido");

  useEffect(() => {
    setSlot(parcel.slot ?? SLOTS[0].id);
    setGigSlug(parcel.gig?.slug ?? "rapido");
  }, [parcel.id, parcel.slot, parcel.gig?.slug]);

  const gig = GIG_OPTIONS.find((option) => option.slug === gigSlug) ?? GIG_OPTIONS[0];
  const savings = Math.max(parcel.reattemptCost - gig.fee, 0);
  const confirmed = parcel.stage !== "held" && parcel.gig;

  return (
    <section className="flex flex-col border border-border bg-card">
      <div className="border-b border-border/70 p-6 sm:p-7">
        <p className="eyebrow text-route-deep">Intercept</p>
        <h3 className="mt-2 font-display text-[26px] leading-tight text-ink">
          Intercept &amp; Divert to Evening Slot
        </h3>
        <p className="mt-2 max-w-md text-[13px] leading-6 text-muted-foreground">
          Pick an evening window, compare the hyperlocal fleets, and dispatch a
          gig rider from the hub. Both OTPs are generated the moment you
          confirm.
        </p>
      </div>

      {confirmed ? (
        <ConfirmedState parcel={parcel} />
      ) : (
        <div className="flex flex-col gap-6 p-6 sm:p-7">
          <div>
            <div className="flex items-baseline justify-between">
              <p className="eyebrow text-[9px] text-muted-foreground">
                01 — Choose an evening window
              </p>
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground/70">
                Tonight
              </p>
            </div>
            <div className="mt-3 flex flex-col gap-2" role="radiogroup" aria-label="Evening delivery window">
              {SLOTS.map((option) => {
                const active = option.id === slot;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setSlot(option.id)}
                    className={cn(
                      "flex items-center justify-between gap-3 border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-route-deep/45 bg-route-soft/70"
                        : "border-border hover:border-ink/20 hover:bg-paper/70",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-ink num">{option.label}</span>
                        {option.tag && (
                          <span className="border border-route-deep/30 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em] text-route-deep">
                            {option.tag}
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted-foreground">
                        {option.note}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded-full border",
                        active
                          ? "border-route-deep bg-route-deep text-paper"
                          : "border-border bg-card",
                      )}
                    >
                      {active && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="eyebrow text-[9px] text-muted-foreground">
              02 — Compare hyperlocal gig fleets
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {GIG_OPTIONS.map((option) => {
                const active = option.slug === gigSlug;
                return (
                  <button
                    key={option.slug}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGigSlug(option.slug)}
                    className={cn(
                      "flex flex-col items-start border p-4 text-left transition-colors",
                      active
                        ? "border-ink/70 bg-paper"
                        : "border-border hover:border-ink/25 hover:bg-paper/60",
                    )}
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="text-sm text-ink">{option.partner}</span>
                      <span
                        className={cn(
                          "flex size-4 shrink-0 items-center justify-center rounded-full border",
                          active
                            ? "border-route-deep bg-route-deep text-paper"
                            : "border-border bg-card",
                        )}
                      >
                        {active && <Check className="size-2.5" strokeWidth={3} />}
                      </span>
                    </div>
                    <p className="mt-3 font-display text-[26px] leading-none text-ink num">
                      {rupees(option.fee)}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {option.pickup} · {option.eta}
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground/90">
                      {option.note}
                    </p>
                    {option.slug === "rapido" && (
                      <span className="mt-2 text-[9px] uppercase tracking-[0.12em] text-route-deep">
                        Lowest batched fee
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border border-route-deep/25 bg-route-soft/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="size-4 text-route-deep" strokeWidth={1.7} />
                <p className="eyebrow text-[9px] text-route-deep">
                  Cost arbitrage breakdown
                </p>
              </div>
              <span className="font-display text-[22px] leading-none text-route-deep num">
                save {rupees(savings)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-route-deep/15 pt-3 text-[11px] text-muted-foreground">
              <span className="num">Bulk re-attempt {rupees(parcel.reattemptCost)}</span>
              <ArrowRight className="size-3 text-route-deep/60" />
              <span className="num text-foreground">
                Batched gig fee {rupees(gig.fee)}
              </span>
              <span className="text-route-deep">
                — {rupees(savings)} stays with the hub per parcel.
              </span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onConfirm(parcel.id, slot, gig)}
              className="eyebrow flex h-12 w-full items-center justify-center gap-2 bg-route-deep text-paper transition-colors hover:bg-route-deep/90"
            >
              Confirm Evening Diversion
              <ArrowRight className="size-3.5" />
            </button>
            <p className="mt-2.5 text-center text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              OTPs generated instantly · rider notified on WhatsApp
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function ConfirmedState({ parcel }: { parcel: Parcel }) {
  const gig = parcel.gig;
  if (!gig) return null;
  const initials = gig.rider
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div className="animate-rise">
      <div className="flex items-start gap-3 border-b border-border/70 bg-route-soft/60 px-6 py-4 sm:px-7">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-route-deep" />
        <div>
          <p className="text-[11px] uppercase tracking-[0.14em] text-route-deep">
            Diversion confirmed — Assigned to Gig Rider
          </p>
          <p className="mt-1 text-[12px] text-foreground/75">
            {gig.partner} · {parcel.slot} · {rupees(gig.fee)} batched fee
          </p>
        </div>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="bg-card px-6 py-5">
          <p className="eyebrow text-[9px] text-muted-foreground">
            Hub Pickup OTP
          </p>
          <p className="mt-2 font-display text-[32px] leading-none tracking-[0.2em] text-ink num">
            {parcel.pickupOtp}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Rider verifies this at {parcel.hub}.
          </p>
        </div>
        <div className="bg-card px-6 py-5">
          <p className="eyebrow text-[9px] text-muted-foreground">
            Doorstep Delivery OTP
          </p>
          <p className="mt-2 font-display text-[32px] leading-none tracking-[0.2em] text-ink num">
            {parcel.deliveryOtp}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Share only when the parcel is in hand.
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="animate-rise-slow bg-ink p-5 text-paper">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/20 text-[11px] tracking-[0.1em] text-paper">
                {initials}
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-[0.2em] text-white/50">
                  Gig rider assigned
                </p>
                <p className="mt-1 text-sm text-paper">{gig.rider}</p>
                <p className="text-[11px] text-white/60">
                  {gig.partner} · {gig.plate}
                </p>
              </div>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-[9px] uppercase tracking-[0.2em] text-white/50">
                ETA
              </p>
              <p className="mt-1 font-display text-[24px] leading-none text-route num">
                {gig.eta}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-[11px] text-white/60">
            <span className="flex items-center gap-1.5">
              <Navigation className="size-3 text-route" />
              On the way to hub
            </span>
            <span className="flex items-center gap-1.5 text-white/70">
              <Phone className="size-3" />
              Rider contact unlocked
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
