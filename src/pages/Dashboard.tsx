import { DeliveryApp } from "@/components/delivery/DeliveryApp";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router";

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate("/");
  }

  return (
    <DeliveryApp
      initialView="hub"
      signedInAs={user?.name ?? user?.email ?? null}
      onSignOut={handleSignOut}
    />
  );
}
