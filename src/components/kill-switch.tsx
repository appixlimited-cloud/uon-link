import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { fetchAppConfig } from "@/lib/db/queries";
import type { ReactNode } from "react";

export function KillSwitch({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  const { data } = useQuery({ queryKey: ["app_config"], queryFn: fetchAppConfig });
  if (data && data.app_enabled === false && !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold">Under maintenance</h1>
          <p className="mt-3 text-muted-foreground">{data.maintenance_message}</p>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
