import { treaty } from "@elysiajs/eden";
import type { App } from "@food-order-app/contracts";
import { env } from "@food-order-app/env/web";

export const eden = treaty<App>(env.VITE_SERVER_URL);
