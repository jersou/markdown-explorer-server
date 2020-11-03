import React, { ChangeEvent, SetStateAction, useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation, useHistory } from "react-router-dom";
import { FileTree, TreeFromRawlist } from "../FileTree/FileTree";
import { Resizable } from "re-resizable";
import marked from "marked";
import IconButton from "@material-ui/core/Button";
import AspectRatioIcon from "@material-ui/icons/AspectRatio";

import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import "./App.css";
import EasyMDE from "easymde";

function addToTree(tree: FileTree, pathParts: string[]) {
  const basename = pathParts[0];
  if (pathParts.length === 1) {
    tree.files ? tree.files.push(basename) : (tree.files = [basename]);
  } else {
    tree.folders ? tree.folders[basename] || (tree.folders[basename] = {}) : (tree.folders = { [basename]: {} });
    addToTree(tree.folders[basename], pathParts.slice(1));
  }
}

function process(path: string, obj: string[]) {
  const regex = new RegExp(`^${path}/?`);
  const tree: FileTree = {};
  obj
    .map((f) => f.replace(regex, ""))
    .sort()
    .map((p) => addToTree(tree, p.split("/")));
  return tree;
}

// TODO : fix url encode file path

marked.setOptions({
  gfm: true,
  breaks: true,
  pedantic: false,
  smartLists: true,
  smartypants: false,
});

function AppRooted() {
  const location = useLocation();
  const [tree, setTree] = useState<FileTree>({});
  const [expanded, setExpanded] = useState<string[]>(["/"]);
  const [selected, setSelected] = useState<string>("");
  const [mdContent, setMdContent] = useState<string>();
  const history = useHistory();
  const [saveHandler, setSaveHandler] = useState<any>();
  const [fileLoaded, setFileLoaded] = useState<boolean>(true);

  function newSelection(selection: SetStateAction<string>) {
    setFileLoaded(false);
    setSelected(selection);
    const pathname = location.pathname.endsWith("/") ? location.pathname : location.pathname + "/";
    history.push({ pathname, search: `?md=${selection}` });
  }

  function onMdContentChange(newContent: string) {
    const path = location.pathname.replace(/^\/mds/, "") + selected;
    if (saveHandler?.path === path) {
      clearTimeout(saveHandler.handler);
    }
    if (fileLoaded) {
      const handler = setTimeout(() => {
        fetch(`http://localhost:8000/file${path}`, { method: "PUT", body: newContent });
      }, 2000);
      setSaveHandler({ path, handler });
    }
    setMdContent(newContent);
  }

  useEffect(() => {
    if (location.search.startsWith("?md=")) {
      setSelected(location.search.replace(/^\?md=/, ""));
    }
    if (location.pathname.startsWith("/mds")) {
      const path = location.pathname.replace(/^\/mds/, "");
      fetch(`http://localhost:8000/tree${path}`).then(async (resp) => setTree(process(path, await resp.json())));
    } else {
      setTree({});
    }
  }, [location.pathname]);

  const basepath = location.pathname.replace(/^\/mds/, "");
  const path = basepath + selected;
  useEffect(() => {
    if (path.toLowerCase().endsWith(".md")) {
      fetch(`http://localhost:8000/file${path}`).then(async (resp) => {
        setMdContent(await resp.text());
        setFileLoaded(true);
      });
    } else {
      setMdContent("");
      setFileLoaded(false);
    }
  }, [location, selected]);

  const [useRawTextArea, setUseRawTextArea] = useState<boolean>(false);

  return (
    <div style={{ width: "100%", display: "flex", overflow: "hidden", height: "100%" }}>
      <Resizable
        style={{ backgroundColor: "#dddddd", overflow: "hidden", height: "100%" }}
        defaultSize={{ width: "20%", height: "100%" }}
        maxWidth="80%"
        minWidth="100px"
        minHeight="100%"
        enable={{ right: true }}
      >
        <div style={{ overflow: "auto", height: "100%" }}>
          <div style={{ textAlign: "right" }}>
            <IconButton onClick={() => setUseRawTextArea(!useRawTextArea)} color="primary" variant="contained">
              <AspectRatioIcon />
            </IconButton>
          </div>
          <TreeFromRawlist
            tree={tree}
            expanded={expanded}
            setExpanded={setExpanded}
            selected={selected}
            setSelected={newSelection}
          />
        </div>
      </Resizable>
      <div style={{ width: "100%", display: "flex", overflow: "hidden", height: "100%" }}>
        <div style={{ width: "100%", minWidth: "100px", backgroundColor: "#ffffff", borderLeft: "solid 3px #999999" }}>
          {useRawTextArea ? (
            <textarea
              style={{ width: "100%", height: "100%" }}
              value={mdContent}
              onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onMdContentChange(event.target.value)}
            />
          ) : (
            <SimpleMDE
              getMdeInstance={(c) => EasyMDE.togglePreview(c)}
              value={mdContent}
              className="simple-mde"
              options={{
                previewRender: (markdownPlaintext) => mdToHtml(markdownPlaintext, selected),
                previewImagesInEditor: true,
                //   nativeSpellcheck: true,
                inputStyle: "contenteditable",
                //   sideBySideFullscreen: false,
                spellChecker: true,
                //  syncSideBySidePreviewScroll: true,
              }}
              onChange={onMdContentChange}
            />
          )}
        </div>
        {useRawTextArea ? (
          <Resizable
            style={{ backgroundColor: "#ffffff", borderLeft: "solid 3px #999999" }}
            defaultSize={{ width: "50%", height: "100%" }}
            maxWidth="100%"
            minWidth="100px"
            minHeight="100%"
            enable={{ left: true }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: mdToHtml(mdContent || "", selected) }}
              style={{ overflow: "auto", height: "100%" }}
            />
          </Resizable>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

function mdToHtml(md: string, selected: string) {
  return marked(md);
}

function App() {
  return (
    <Router>
      <AppRooted />
    </Router>
  );
}

export default App;
