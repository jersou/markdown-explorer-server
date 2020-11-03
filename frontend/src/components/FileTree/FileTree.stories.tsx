import React, { useState } from "react";
import { Tree, FileTree, fileTreeToRenderTree } from "./FileTree";
import { action } from "@storybook/addon-actions";
import { Meta } from "@storybook/react";

export default { title: "FileTree", decorators: [], component: Tree } as Meta;

const baseTree: FileTree = {
  folders: {
    doc: {
      folders: {
        Usage: { files: ["GUI.md", "CLI.md", "NPM.md"] },
        Markdown: { files: ["TOC.md", "Syntax.md"] },
        Development: { files: ["Todos.md", "Dev_Tools.md", "Dependencies.md"] },
      },
      files: ["README.md"],
    },
  },
};

export const fileTree = () => {
  const tree = baseTree;
  const expanded = ["/", "/doc"];
  const selected = "3";

  return (
    <Tree
      data={fileTreeToRenderTree(tree)}
      expanded={expanded}
      setExpanded={action("setExpanded")}
      selected={selected}
      setSelected={action("setSelected")}
    />
  );
};

export const FileTreeWithState = () => {
  const tree = baseTree;
  const [expanded, setExpanded] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");

  return (
    <Tree
      data={fileTreeToRenderTree(tree)}
      expanded={expanded}
      setExpanded={setExpanded}
      selected={selected}
      setSelected={setSelected}
    />
  );
};
