"use client";

import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { Plane, BookMarked } from "lucide-react";

export function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <Plane className="h-6 w-6" />
          <span className="font-semibold text-lg">Para AI</span>
        </div>
        <span className="absolute left-1/2 -translate-x-1/2 text-sm text-muted-foreground hidden sm:block">
          Your AI-Powered Travel Planner
        </span>
        <Button
          variant="outline"
          onClick={() => router.push(isHome ? "/saved" : "/")}
          className="flex items-center gap-2"
        >
          {isHome ? (
            <>
              <BookMarked className="h-4 w-4" />
              Saved Trips
            </>
          ) : (
            <>
              <Plane className="h-4 w-4" />
              Plan Trip
            </>
          )}
        </Button>
      </div>
    </div>
  );
}