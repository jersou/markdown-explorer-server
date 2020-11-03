import { Router } from "https://deno.land/x/oak@v6.3.1/mod.ts";

export function addStopRoute(router: Router, controller: AbortController) {
  router.post("/stop", (ctx) => {
    ctx.response.body = "stop ok";
    console.log("Stop");
    controller.abort();
  });
}
