"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TrendingUpIcon, TrendingDownIcon } from "lucide-react";

interface PlatformStats {
  organizations: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
  };
  orders: {
    total: number;
    today: number;
  };
}

export function SectionCards({ stats }: { stats?: PlatformStats }) {
  const orgs = stats?.organizations ?? { total: 0, active: 0, pending: 0, suspended: 0 };
  const orders = stats?.orders ?? { total: 0, today: 0 };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Organizations</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {orgs.total}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              {orgs.active} active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {orgs.active} active restaurants
          </div>
          <div className="text-muted-foreground">{orgs.suspended} suspended</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending Approvals</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {orgs.pending}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              {orgs.pending > 0 ? (
                <>
                  <TrendingUpIcon />
                  Needs attention
                </>
              ) : (
                "All clear"
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {orgs.pending > 0
              ? `${orgs.pending} organizations awaiting review`
              : "No pending approvals"}
          </div>
          <div className="text-muted-foreground">Review and approve new restaurants</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {orders.total.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Platform-wide
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            All-time order count <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Across all organizations</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Today's Orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {orders.today}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <TrendingUpIcon />
              Today
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Orders placed today</div>
          <div className="text-muted-foreground">Real-time platform activity</div>
        </CardFooter>
      </Card>
    </div>
  );
}
