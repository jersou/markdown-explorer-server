# Mardown Explorer Server

**/!\ ALPHA**

**/!\ ALPHA**

**/!\ ALPHA**

TODO

"Electron less" version of https://github.com/jersou/markdown-explorer

A web app to explore markdown files (and to make a standalone [Deno](https://deno.land/)/[React](https://www.reactjs.org/) WebApp POC).


## To run the WebApp :
First, you need deno : https://deno.land/#installation

The whole application is encapsulated in a single file, and could simply run with :
```
deno run --unstable --allow-read --allow-write --allow-net --allow-run https://raw.githubusercontent.com/jersou/markdown-explorer-server/main/server.ts
```
Then, go to [http://localhost:8000/](http://localhost:8000/) with a web browser (this page open at app start-up
 if you use the `--allow-run` parameter).

The `--allow-run` parameter can be skipped if you don't want the application to open in the default browser on startup.

If the script parameter `--wait-and-close` is present, the server will wait a frontend connection,
 and it will stop by itself as soon as the frontend is closed (a websocket check this).

The web app list markdown files recursivly from the folder `http://localhost:8000/mds/<the path HERE>`.

## Install (by Deno)
```
deno install --name mds --unstable --allow-read --allow-write --allow-net --allow-run https://raw.githubusercontent.com/jersou/markdown-explorer-server/main/server.ts
```
Then, simply run `mds` from the folder to show and edit the current folder.

## Permissions

* `--unstable`  : permission check
* `--allow-net` : to serve HTTP, and run Websocket (if --wait-and-close).
You can adjust this permission: `--allow-net=127.0.0.1:8000,0.0.0.0:8001`
* `--allow-run` (optional) : to open the frontend in the default web browser, this feature use [Deno-Opn](https://github.com/hashrock/deno-opn)
* `--allow-read` : to read the content of md files and the folders
* `--allow-write` : to write md files

## To update the WebApp :
Once run one time, the app is cached by Deno, to update the app :
```
deno cache --reload --unstable https://raw.githubusercontent.com/jersou/markdown-explorer-server/main/server.ts
```
or add the `--reload` parameter to the run command.


## Dependencies

* [Deno](https://deno.land/)
  * [Oak](https://oakserver.github.io/oak/)
  * [Deno-Opn](https://github.com/hashrock/deno-opn)
* [React](https://www.reactjs.org/)
  * [Create React App](https://reactjs.org/docs/create-a-new-react-app.html)
  * [Material UI](https://material-ui.com/)
  * ... TODO
* ... TODO

# Make the bundle file
```
git clone https://github.com/jersou/markdown-explorer-server.git
cd markdown-explorer-server/
deno run --unstable --allow-run --allow-read --allow-write ./bundler/bundler.ts
```
