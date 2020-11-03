import React, { ChangeEvent, Dispatch, SetStateAction, useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import TreeView from "@material-ui/lab/TreeView";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import TreeItem from "@material-ui/lab/TreeItem";

const useStyles = makeStyles({ root: { flexGrow: 1 } });

export interface FileTree {
  folders?: { [key: string]: FileTree };
  files?: string[];
}

export interface RenderTree {
  path: string;
  name: string;
  children?: RenderTree[];
}

export function fileTreeToRenderTree(fileTree: FileTree, name = "", basePath = ""): RenderTree {
  const path = basePath || name ? basePath + "/" + name : "";
  const renderTree: RenderTree = { path, name };
  const folders = fileTree.folders
    ? (renderTree.children = Object.entries<FileTree>(fileTree.folders).map(([key, value]) =>
        fileTreeToRenderTree(value, key, path)
      ))
    : [];
  const files = fileTree.files ? fileTree.files.map((name) => ({ path: path + "/" + name, name })) : [];
  renderTree.children = [...folders, ...files];
  return renderTree;
}

export function TreeFromRawlist({
  tree,
  expanded,
  setExpanded,
  selected,
  setSelected,
}: {
  tree: FileTree;
  expanded: string[];
  setExpanded: Dispatch<SetStateAction<string[]>>;
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}) {
  const [data, setData] = useState<RenderTree>({ children: [], name: "", path: "" });
  useEffect(() => {
    setData(fileTreeToRenderTree(tree));
  }, [tree]);

  return (
    <Tree data={data} expanded={expanded} setExpanded={setExpanded} selected={selected} setSelected={setSelected} />
  );
}

export function Tree({
  data,
  expanded,
  setExpanded,
  selected,
  setSelected,
}: {
  data: RenderTree;
  expanded: string[];
  setExpanded: Dispatch<SetStateAction<string[]>>;
  selected: string;
  setSelected: Dispatch<SetStateAction<string>>;
}) {
  const classes = useStyles();
  const handleToggle = (event: ChangeEvent<{}>, nodeIds: string[]) => setExpanded(nodeIds);
  const handleSelect = (event: ChangeEvent<{}>, nodeIds: string) => {
    if (nodeIds?.toLowerCase().endsWith(".md")) {
      setSelected(nodeIds);
    }
  };

  const renderTree = (nodes: RenderTree, isRoot = false) =>
    isRoot ? (
      <div>{Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}</div>
    ) : (
      <TreeItem key={nodes.path} nodeId={nodes.path} label={nodes.name}>
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpandIcon={<ChevronRightIcon />}
      expanded={expanded}
      selected={selected}
      onNodeToggle={handleToggle}
      onNodeSelect={handleSelect}
    >
      {renderTree(data, true)}
    </TreeView>
  );
}
