/* Shared app state + loaded data. Mutated once at boot, read everywhere. */

export const state = { cat: "all", query: "" };

export const store = {
  data: null,        // techniques.json
  resources: null,   // resources.json
  gestures: null,    // gestures.json
  byId: {},          // technique id -> technique
  gestureByTech: {}  // technique id -> its poetic gesture-image
};

export function catById(id) {
  return store.data.categories.filter(function (c) { return c.id === id; })[0];
}

// DOM handles, filled at boot.
export const el = {};
export function bindEls() {
  ["results", "resources", "navCategories", "search", "symbolIndex",
   "composer", "empty", "sidebar"].forEach(function (id) {
    el[id] = document.getElementById(id);
  });
}

export function load(url) {
  return fetch(url).then(function (res) {
    if (!res.ok) throw new Error("Failed to load " + url + " (" + res.status + ")");
    return res.json();
  });
}
