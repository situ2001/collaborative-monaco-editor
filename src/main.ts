import "./style.css";
import * as Y from "yjs";
import * as monaco from "monaco-editor";
import { MonacoBinding } from "y-monaco";
import { WebrtcProvider } from "y-webrtc";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = `
  <h1>Collaborative Monaco Editor Demo</h1>
`;

const ydoc = new Y.Doc();
const ymap = ydoc.getMap("textMap");
const provider = new WebrtcProvider("situ-demo-collaborative-monaco", ydoc);
const awareness = provider.awareness;
const editorElement = document.querySelector<HTMLElement>("#editor")!;

// set user name
const username = `Situ-${Math.floor(Math.random() * 1000)}`;
awareness.setLocalStateField("user", {
  name: username,
});
app.innerHTML += `<div>You are ${username}</div>`;
awareness.on("change", () => {
  // Map each awareness state to a dom-string
  const strings: string[] = [];
  awareness.getStates().forEach((state) => {
    if (state.user) {
      strings.push(`<div>• ${state.user.name}</div>`);
    }
    document.querySelector("#users")!.innerHTML =
      `<div>Online users</div>` + strings.join("");
  });
});

let binding: any = null;
let editor: monaco.editor.IStandaloneCodeEditor;
let key: string;

const bindEditor = (ytext: Y.Text) => {
  if (binding) {
    binding.destroy();
  }
  if (editor === undefined) {
    editor = monaco.editor.create(editorElement, {
      value: "",
      language: "javascript",
    });
  }
  binding = new MonacoBinding(
    ytext,
    editor.getModel(),
    new Set([editor]),
    provider.awareness
  );
};

// render docs tab
const docNames = ["cat", "dog", "snake", "mouse", "chicken"];
docNames.forEach((name) => {
  if (!ymap.has(name)) {
    ymap.set(name, new Y.Text(`const name = '${name}';`));
  }
});

const docsDiv = document.querySelector<HTMLElement>("#docs")!;
docsDiv.innerHTML = `${docNames
  .map((name) => `<button key=${name}>${name}</button>`)
  .join("")}`;

const currentEditorDiv = document.querySelector<HTMLElement>("#currentEditor")!;
currentEditorDiv.innerHTML = `<div>(Pick one from below) Current editing: </div>`;

docsDiv.addEventListener("click", (e) => {
  const clickedButton = e.target as HTMLButtonElement;
  // console.log(clickedButton);
  key = clickedButton.getAttribute("key")!;
  // console.log(key);
  // change to corresponding editor
  if (key !== null && docNames.includes(key)) {
    // console.log(ymap.get(key));
    currentEditorDiv.innerHTML = `<div>(Pick one from below) Current editing: ${key}</div>`;
    bindEditor(ymap.get(key) as Y.Text);
  }
});
