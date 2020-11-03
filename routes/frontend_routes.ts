import { Router } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { decodeFileContent } from "../bundler/filesContentGenerator.ts";
import { lookup } from "https://deno.land/x/media_types@v2.5.1/mod.ts";
import { files } from "../bundler/filesContent.ts";
import { dirname } from "https://deno.land/std@0.75.0/path/posix.ts";

const imgExtRegEx = /\.(png|jpg|jpeg|gif|bmp|svg)$/i;

export async function addStaticFilesRoutes(router: Router) {
  if (files["index.html"]) {
    const indexContent = await decodeFileContent(files["index.html"]);
    Object.entries(files)
      .map(([path, content]) => [path, lookup(path), decodeFileContent(content)])
      .map(([path, type, bodyPromise]) =>
        router.get(`/${path}`, async (ctx) => {
          console.log(`get /${path}`);
          ctx.response.body = await bodyPromise;
          ctx.response.type = String(type);
        })
      );
    router.get("/:path(.*)", async (ctx) => {
      console.log(`get /${ctx.params.path}`);

      if (ctx.params.path?.match(imgExtRegEx)) {
        const path = ctx.params.path.replace(/^mds/, "");
        const referer: string = ctx.request.headers.get("referer") || "";
        console.log({ referer });
        const res = referer.match(/^http:\/\/[^/]*\/mds(.*)\?md=(.*)/);
        console.log({ res });
        if (res && res.length > 2) {
          const file = res[1] + dirname(res[2]) + "/" + path.replace(res[1], "");
          console.log({ file });
          ctx.response.body = await Deno.readFile(file);
          ctx.response.type = lookup(path);
        }
      } else {
        ctx.response.body = indexContent;
        ctx.response.type = lookup("index.html");
      }
    });
  }
}
