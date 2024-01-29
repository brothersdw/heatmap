import { createStore } from "https://framer.com/m/framer/store.js@^1.0.0"

export const useStore = createStore({
  flSelected: false,
  flHover: false,
  hoveringCountyName: "",
  selectedDisease: "Hepatitis",
  hoveringCounty: {},
  selectedCounty: {},
  expanded: false,
  location: "/",
  mapFullScreen: false,
  loadingAnimation: true,
  mapChartsMinimized: false,
  navigatingTo: "/",
  selectedAdminTab: "Users",
})
