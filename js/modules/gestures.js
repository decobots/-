/* Index the Taiyin Daquanji gesture-images by the technique they illustrate,
 * so each card can render its own poetic gesture inline (no separate gallery). */
import { store } from "./store.js";

export function indexGestures() {
  store.gestureByTech = {};
  if (!store.gestures) return;
  store.gestures.gestures.forEach(function (g) {
    if (g.technique_id) store.gestureByTech[g.technique_id] = g;
  });
}
