import { useMemo, useState } from "react";
import { RefreshCw, Search, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CARRIER_META,
  rupees,
  SAVED_TO_DATE,
  type Carrier,
  type Parcel,
  type ParcelStage,
} from "@/lib/delivery-data";

const SHORT_STATUS: Record<ParcelStage, string> = {
  held: "Held at hub",
  assigned: "Assigned to rider",
  delivered: "Delivered",
};

const STATUS_TONE: Record<ParcelStage, string> = {
  held: "border-hub/35 bg-hub-soft text-hub-deep",
  assigned: "border-route-deep/25 bg-route-soft text-route-deep",
  delivered: "border-route-deep/25 bg-route-soft text-route-deep",
};

const COLUMNS = [
  "Tracking ID",
  "Line-Haul Carrier",
  "Hub Location",
  "Evening Slot",
  "Assigned Gig Partner",
  "Rider & OTP",
  "Status",
];

export function HubLedger({
  parcels,
  lastSync,
  syncPulse,
  onSync,
}: {
  parcels: Parcel[];
  lastSync: string | null;
  syncPulse: string | null;
  onSync: () => void;
}) {
  const [carrier, setCarrier] = useState<"all" | Carrier>("all");
  const [stage, setStage] = useState<"all" | ParcelStage>("all");
  const [query, setQuery] = useState("");

  const held = parcels.filter((parcel) => parcel.stage === "held").length;
  const dispatched = parcels.filter(
    (parcel) => parcel.stage === "assigned",
  ).length;
  const liveSaved = parcels.reduce(
    (total, parcel) =>
      parcel.gig
        ? total + Math.max(parcel.reattemptCost - parcel.gig.fee, 0)
        : total,
    0,
  );

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return parcels.filter((parcel) => {
      if (carrier !== "all" && parcel.carrier !== carrier) return false;
      if (stage !== "all" && parcel.stage !== stage) return false;
      if (!needle) return true;
      return (
        parcel.id.toLowerCase().includes(needle) ||
        parcel.hub.toLowerCase().includes(needle) ||
        parcel.city.toLowerCase().includes(needle) ||
        (parcel.gig?.rider ?? "").toLowerCase().includes(needle)
      );
    });
  }, [parcels, carrier, stage, query]);

  return (
    <main className="mx-auto w-full max-w-[1180px] px-5 py-10 sm:px-8 sm:py-14">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-9 bg-hub" />
            <p className="eyebrow text-muted-foreground">
              Hub partner admin · Sector 14
            </p>
          </div>
          <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.2rem,4.6vw,3.4rem)] leading-[0.98] tracking-[-0.01em] text-ink">
            The evening network,
            <br />
            <span className="italic">at a glance.</span>
          </h1>
          <p className="mt-4 max-w-lg text-[14px] leading-7 text-muted-foreground">
            Every held parcel, every gig dispatch and every rupee saved on
            failed re-attempts — synced from the courier webhooks in real time.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2.5 sm:items-end">
          <button
            type="button"
            onClick={onSync}
            className="eyebrow flex h-11 items-center gap-2 bg-ink px-5 text-paper transition-colors hover:bg-ink-soft"
          >
            <RefreshCw
              className={cn("size-3.5", syncPulse && "animate-spin")}
            />
            Add / Sync Webhook Row
          </button>
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {lastSync ? `Last Zapier sync · ${lastSync}` : "Zapier webhook · 2 min ago"}
          </p>
        </div>
      </div>

      <dl className="mt-9 grid gap-px border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        <Metric
          label="Active Hub Holds"
          value={String(held).padStart(2, "0")}
          note="Across 3 partner hubs"
          accent="hub"
        />
        <Metric
          label="Evening Batches Dispatched"
          value={String(dispatched).padStart(2, "0")}
          note="Gig riders collecting tonight"
          accent="route"
        />
        <Metric
          label="Courier Cost Saved (₹)"
          value={rupees(SAVED_TO_DATE + liveSaved)}
          note={`+${rupees(liveSaved)} from batched gigs`}
          accent="route"
        />
        <div className="bg-ink p-5 text-paper">
          <div className="flex items-center justify-between gap-2">
            <p className="eyebrow text-[9px] text-white/45">
              Zapier Webhook Status
            </p>
            <Zap className="size-3.5 text-route" />
          </div>
          <p className="mt-4 flex items-center gap-2 font-display text-[26px] leading-none text-paper">
            Active
            <span className="relative flex size-1.5">
              <span className="live-dot absolute inline-flex size-1.5 rounded-full bg-route text-route" />
              <span className="relative inline-flex size-1.5 rounded-full bg-route" />
            </span>
          </p>
          <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-white/45">
            {lastSync ? `Synced ${lastSync}` : "Synced 12s ago"}
          </p>
        </div>
      </dl>

      <div className="mt-6 border border-border bg-card">
        <div className="flex flex-col gap-4 border-b border-border/70 p-5 sm:p-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="relative flex size-1.5">
                <span className="live-dot absolute inline-flex size-1.5 rounded-full bg-route text-route" />
                <span className="relative inline-flex size-1.5 rounded-full bg-route" />
              </span>
              <p className="eyebrow text-muted-foreground">
                Live logistics ledger
              </p>
            </div>
            <h2 className="mt-2 font-display text-[24px] leading-tight text-ink">
              Tonight&apos;s evening batches
            </h2>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex h-9 items-center gap-2 border border-border bg-paper/50 px-2.5">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <label htmlFor="ledger-search" className="sr-only">
                Filter ledger
              </label>
              <input
                id="ledger-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search ID, hub or rider"
                className="w-full min-w-0 bg-transparent text-[11px] outline-none placeholder:text-muted-foreground/70 sm:w-[172px]"
              />
            </div>
            <label className="sr-only" htmlFor="carrier-filter">
              Filter by carrier
            </label>
            <select
              id="carrier-filter"
              value={carrier}
              onChange={(event) =>
                setCarrier(event.target.value as "all" | Carrier)
              }
              className="h-9 border border-border bg-paper/50 px-2 text-[11px] text-foreground/80 outline-none focus:border-ink/30"
            >
              <option value="all">All carriers</option>
              <option value="Delhivery">Delhivery</option>
              <option value="Ekart">Ekart</option>
              <option value="Xpressbees">Xpressbees</option>
            </select>
            <label className="sr-only" htmlFor="status-filter">
              Filter by status
            </label>
            <select
              id="status-filter"
              value={stage}
              onChange={(event) =>
                setStage(event.target.value as "all" | ParcelStage)
              }
              className="h-9 border border-border bg-paper/50 px-2 text-[11px] text-foreground/80 outline-none focus:border-ink/30"
            >
              <option value="all">All statuses</option>
              <option value="held">Held at hub</option>
              <option value="assigned">Assigned to rider</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border/70 bg-paper/60">
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="eyebrow whitespace-nowrap px-4 py-3 text-[9px] font-medium text-muted-foreground"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((parcel) => (
                <tr
                  key={parcel.id}
                  className={cn(
                    "border-b border-border/60 align-top transition-colors last:border-0 hover:bg-paper/50",
                    syncPulse === parcel.id && "row-flash",
                  )}
                >
                  <td className="px-4 py-4">
                    <p className="text-[12.5px] text-ink num">{parcel.id}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {parcel.weightKg} kg · {parcel.city}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <span className="flex items-center gap-2 text-[12px] text-foreground/80">
                      <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{
                          backgroundColor: CARRIER_META[parcel.carrier].dot,
                        }}
                      />
                      {parcel.carrier}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-[12px] text-foreground/80">
                      {parcel.hub}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {parcel.city}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    {parcel.slot ? (
                      <span className="whitespace-nowrap text-[12px] text-foreground/80 num">
                        {parcel.slot}
                      </span>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/60">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {parcel.gig ? (
                      <>
                        <p className="whitespace-nowrap text-[12px] text-foreground/80">
                          {parcel.gig.partner}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground num">
                          {rupees(parcel.gig.fee)} batched fee
                        </p>
                      </>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/70">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {parcel.gig ? (
                      <>
                        <p className="whitespace-nowrap text-[12px] text-foreground/80">
                          {parcel.gig.rider}
                        </p>
                        <p className="mt-0.5 whitespace-nowrap text-[10px] tracking-[0.06em] text-muted-foreground num">
                          {parcel.gig.plate} · {parcel.pickupOtp} /{" "}
                          {parcel.deliveryOtp}
                        </p>
                      </>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/70">
                        Awaiting diversion
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 text-[9px] uppercase tracking-[0.12em]",
                        STATUS_TONE[parcel.stage],
                      )}
                    >
                      <span
                        className={cn(
                          "size-1 rounded-full",
                          parcel.stage === "held" ? "bg-hub" : "bg-route",
                        )}
                      />
                      {SHORT_STATUS[parcel.stage]}
                    </span>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="font-display text-xl text-ink">
                      No parcels match this filter.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setCarrier("all");
                        setStage("all");
                        setQuery("");
                      }}
                      className="eyebrow mt-3 border-b border-border pb-0.5 text-[9px] text-muted-foreground hover:text-ink"
                    >
                      Reset filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-2 border-t border-border/70 px-5 py-3.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            Showing {rows.length} of {parcels.length} parcels
          </span>
          <span className="flex items-center gap-1.5 text-route-deep">
            <span className="size-1 rounded-full bg-route" />
            Zapier webhook connected · updates stream live
          </span>
        </div>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  note,
  accent,
}: {
  label: string;
  value: string;
  note: string;
  accent: "hub" | "route";
}) {
  return (
    <div className="bg-card p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow text-[9px] text-muted-foreground">{label}</p>
        <span
          className={cn(
            "h-px w-5",
            accent === "hub" ? "bg-hub" : "bg-route",
          )}
        />
      </div>
      <p className="mt-4 font-display text-[26px] leading-none tracking-tight text-ink num">
        {value}
      </p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {note}
      </p>
    </div>
  );
}
