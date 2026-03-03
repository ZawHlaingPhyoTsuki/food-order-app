import type { QueryClient } from "@tanstack/react-query";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import Header from "@/components/header";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import type { eden } from "@/lib/eden";
import type { authClient } from "@/lib/auth-client";

import "../index.css";

export interface RouterAppContext {
  queryClient: QueryClient;
  authClient: typeof authClient;
  eden: typeof eden;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "food-order-app",
      },
      {
        name: "description",
        content: "food-order-app is a web application",
      },
    ],
    links: [
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        disableTransitionOnChange
        storageKey="vite-ui-theme"
      >
          <Outlet />
        <Toaster richColors />
      </ThemeProvider>
      <TanStackRouterDevtools />
      <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
    </>
  );
}
