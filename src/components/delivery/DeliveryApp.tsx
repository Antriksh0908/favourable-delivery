import { useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Brand, LiveStatusPill, ViewToggle } from "./Brand";
import { TrackingWorkspace } from "./TrackingWorkspace";
import { HubLedger } from "./HubLedger";
import { ChatAssistant } from "./ChatAssistant";
import {
  assignGig,
  INITIAL_PARCELS,
  riderEta,
  SAMPLE_IDS,
  webhookParcel,
  type GigOption,
  type Parcel,
} from "@/lib/delivery-data";

export type AppView = "customer" | "hub";

export function DeliveryApp({
  initialView = "customer",
  signedInAs,
  onSignOut,
}: {
  initialView?: AppView;
  signedInAs?: string | null;
  onSignOut?: () => void;
}) {
  const [view, setView] = useState<AppView>(initialView);
  const [parcels, setParcels] = useState<Parcel[]>(INITIAL_PARCELS);
  const [selectedId, setSelectedId] = useState<string>(SAMPLE_IDS[0]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [syncPulse, setSyncPulse] = useState<string | null>(null);
  const syncCounter = useRef(0);

  const selected = useMemo(
    () => parcels.find((parcel) => parcel.id === selectedId) ?? parcels[0],
    [parcels, selectedId],
  );

  function handleConfirm(parcelId: string, slot: string, gig: GigOption) {
    setParcels((current) =>
      current.map((parcel) =>
        parcel.id === parcelId ? assignGig(parcel, slot, gig) : parcel,
      ),
    );
  }

  function handleReschedule(parcelId: string, slot: string) {
    setParcels((current) =>
      current.map((parcel) =>
        parcel.id === parcelId && parcel.gig
          ? { ...parcel, slot, gig: { ...parcel.gig, eta: riderEta(slot) } }
          : parcel,
      ),
    );
  }

  function handleSync() {
    const fresh = webhookParcel(syncCounter.current);
    syncCounter.current += 1;
    setParcels((current) => [fresh, ...current]);
    setLastSync(
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    );
    setSyncPulse(fresh.id);
    window.setTimeout(() => setSyncPulse(null), 3400);
    toast.success(`Zapier row synced · ${fresh.id}`, {
      description: `${fresh.carrier} · ${fresh.hub} — held for evening diversion`,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:py-0 lg:h-[72px] lg:px-8">
          <Link to="/" className="flex items-center self-start" aria-label="Favourable Delivery home">
            <Brand />
          </Link>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
            <LiveStatusPill />
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>
      </header>

      {view === "customer" ? (
        <TrackingWorkspace
          parcels={parcels}
          selectedId={selected.id}
          onSelect={setSelectedId}
          onConfirm={handleConfirm}
        />
      ) : (
        <HubLedger
          parcels={parcels}
          lastSync={lastSync}
          syncPulse={syncPulse}
          onSync={handleSync}
        />
      )}

      <footer className="border-t border-border/80 bg-paper">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-5 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <p className="max-w-sm leading-6">
            Favourable Delivery bridges bulk couriers and hyperlocal gig fleets
            for the 8–10 PM window. Built for the last mile.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="eyebrow text-[9px] text-muted-foreground/70">
              ElevenLabs · Botpress · Zapier
            </span>
            {onSignOut ? (
              <button
                type="button"
                onClick={onSignOut}
                className="border-b border-border pb-0.5 text-foreground/80 transition-colors hover:border-route-deep hover:text-route-deep"
              >
                Sign out{signedInAs ? ` · ${signedInAs}` : ""}
              </button>
            ) : (
              <Link
                to="/auth?returnTo=%2Fdashboard"
                className="border-b border-border pb-0.5 text-foreground/80 transition-colors hover:border-route-deep hover:text-route-deep"
              >
                Hub partner sign in
              </Link>
            )}
          </div>
        </div>
      </footer>

      <ChatAssistant
        parcel={selected}
        onReschedule={(slot) => handleReschedule(selected.id, slot)}
      />
    </div>
  );
}
