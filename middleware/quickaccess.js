import sider from "@/utils/sider";
import * as CONST from "@/constants/index.js";

let triggerFoundRoute = false;

const storeRoute = (route, store) => {
  triggerFoundRoute = true;
  store.commit("pushRouteToHistory", route);
};

const compareRouteSider = (routeSider, routeTarget, store) => {
  routeSider.forEach(route => {
    if (triggerFoundRoute) return;
    if (route.link == routeTarget.path) storeRoute(route, store);
    if (route.items && route.items.length) compareRouteSider(route.items, routeTarget, store);
  });
};

export default function({ route, store }) {
  let localHistory = localStorage.getItem(CONST.KEY_LOCAL_HISTORY);
  if (store.state.currentHistory.length == 0 && localHistory) {
    store.state.currentHistory = JSON.parse(localHistory);
  }

  triggerFoundRoute = false;
  compareRouteSider(sider, route, store);
}
