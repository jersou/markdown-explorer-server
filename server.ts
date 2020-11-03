#!/usr/bin/env -S deno run --allow-run --allow-read --allow-write

import { Application, Router } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { addMdRoutes } from "./routes/md_routes.ts";
import { runWebsocketServerAndWaitClose } from "./websocket.ts";
import { opn } from "./opn.ts";
import { addStopRoute } from "./routes/stop_route.ts";
import { addStaticFilesRoutes } from "./routes/frontend_routes.ts";

async function main() {
  const httpPort = 8000;
  const controller = new AbortController();
  const router = new Router();
  addMdRoutes(router);
  addStopRoute(router, controller);
  addStaticFilesRoutes(router);
  const app = new Application();
  app.use(router.routes());
  app.use(router.allowedMethods());
  app.addEventListener("listen", () => {
    console.log(`Listening on: http://localhost:${httpPort}`);
    const cwd = Deno.cwd();
    opn(`http://localhost:${httpPort}/mds${cwd}`, { checkDenoPermission: true }).catch(() =>
      console.log("Run permission is missing, the localhost url was not opened in the default web browser at launch")
    );
  });
  if (Deno.args.includes("--wait-and-close")) {
    runWebsocketServerAndWaitClose().then(() => controller.abort());
  }
  await app.listen({ port: 8000, signal: controller.signal });
}

if (import.meta.main) {
  await main();
}
