/* Transport only: the immutable ranking engine runs entirely in this worker. */
let ready = false;
(async () => {
  try {
    importScripts("./wasm_exec.js");
    const go = new Go();
    const response = await fetch("./engine.wasm");
    if (!response.ok) throw new Error("Could not load the name engine.");
    const { instance } = await WebAssembly.instantiate(
      await response.arrayBuffer(),
      go.importObject,
    );
    void go.run(instance);
    ready = true;
    postMessage({
      type: "ready",
      catalog: JSON.parse(almostYou(JSON.stringify({ action: "catalog" }))),
    });
  } catch (error) {
    postMessage({ type: "error", error: String(error) });
  }
})();
onmessage = ({ data }) => {
  if (!ready) return;
  try {
    postMessage({
      type: "result",
      id: data.id,
      result: JSON.parse(almostYou(JSON.stringify(data.request))),
    });
  } catch {
    postMessage({
      type: "result",
      id: data.id,
      result: { error: "Something went wrong. Please try again." },
    });
  }
};
