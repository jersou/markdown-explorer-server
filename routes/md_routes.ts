import { Router, RouterContext } from "https://deno.land/x/oak@v6.3.1/mod.ts";
import { assert } from "https://deno.land/std@0.75.0/testing/asserts.ts";
import { Status } from "https://deno.land/std@0.75.0/http/http_status.ts";

type Entries = { dirs: string[]; mdFiles: string[] };

const dirToIgnore = ["node_modules", ".git", "target"];

export function addMdRoutes(router: Router) {
  router.get("/file:path(.*)", async (context) => {
    //TODO : log générique des requetes qui arrivent
    console.log("get /file:path(.*)", context.params.path);
    const path = String(context.params.path);
    assert(path.match(/\.md$/i));
    context.response.body = await Deno.readTextFile(path);
    allowLocalhost(context);
  });

  router.options("/file:path(.*)", async (context) => {
    console.log("options /file:path(.*)", context.params.path);
    allowLocalhost(context);
    context.response.headers.set("Access-Control-Allow-Methods", "PUT");
    context.response.status = Status.OK;
  });

  router.put("/file:path(.*)", async (context) => {
    console.log("put /file:path(.*)", context.params.path);
    const path = String(context.params.path);
    assert(path.match(/\.md$/i));

    const result = context.request.body();
    result.type;
    const content: string = await result.value;
    allowLocalhost(context);
    await Deno.writeTextFile(path, content);
    context.response.status = Status.OK;
  });

  router.get("/tree:path(.*)", async (context) => {
    console.log("get /tree:path(.*)", context.params.path);
    context.response.body = await tree(String(context.params.path));
    allowLocalhost(context);
  });
}

export function allowLocalhost(ctx: RouterContext) {
  const origin = ctx.request.headers.get("Origin");
  if (origin?.match(/http:\/\/localhost:.*/)) {
    ctx.response.headers.set("Access-Control-Allow-Origin", origin);
  }
}

// slow implem
// async function tree_expandGlob(path: string): Promise<string[]> {
//   const mds: string[] = [];
//   for await (const file of expandGlob("**/*.md", { root: path, exclude: ["**/node_modules", "**/.git"] })) {
//     mds.push(file.path);
//   }
//   return mds;
// }

// slow implem
// async function tree_walk(path: string): Promise<string[]> {
//   const mds: string[] = [];
//   for await (const entry of walk(path, { exts: [".md"], skip: [/node_modules/, /\.git/] })) {
//     mds.push(entry.path);
//   }
//   return mds;
// }

async function tree(path: string): Promise<string[]> {
  const fsAsyncPromisesLimit = 32;
  const promises = new Set<Promise<void>>();
  const mds: string[] = [];
  const dirs: string[] = [path];

  while (dirs.length > 0 || promises.size > 0) {
    if (promises.size >= fsAsyncPromisesLimit || dirs.length === 0) {
      await Promise.race(promises);
    } else {
      const promise = readDirEntries(dirs.pop() || "").then((entries) => {
        mds.push(...entries.mdFiles);
        dirs.push(...entries.dirs);
      });
      promises.add(promise);
      promise.finally(() => promises.delete(promise));
    }
  }
  return mds;
}

async function readDirEntries(path: string): Promise<Entries> {
  const entries: Entries = { dirs: [], mdFiles: [] };
  try {
    for await (const entry of Deno.readDir(path)) {
      if (entry.isFile && entry.name.toLowerCase().endsWith(".md")) {
        entries.mdFiles.push(path + "/" + entry.name);
      } else if (entry.isDirectory && !dirToIgnore.includes(entry.name)) {
        entries.dirs.push(path + "/" + entry.name);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return entries;
}
