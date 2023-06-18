import jwtDecode from "jwt-decode";
import * as CONST from "@/constants/index.js";

export const strict = false;

export const state = () => ({
  lang: localStorage.getItem("lang"),
  userInfo: null,
  jiraUrl: null,
  currentHistory: []
});

export const getters = {
  role: state => {
    if (state.userInfo && state.userInfo.permissions) {
      return state.userInfo.permissions;
    } else return [];
  }
};

export const mutations = {
  setLanguage(state, lang) {
    state.lang = lang;
  },
  setUserInfo(state) {
    const token = localStorage.getItem("token");
    state.userInfo = jwtDecode(token);
    state.jiraUrl = state.jiraUrl ? state.jiraUrl : state.userInfo.jiraUrl;
  },
  setJiraUrl(state, url) {
    state.jiraUrl = url;
    localStorage.setItem(CONST.KEY_LOCAL_JIRA_URL, url);
  },
  pushRouteToHistory(state, route) {
    let includesInHistory = state.currentHistory.map(item => item.key).includes(route.key);
    if (!includesInHistory && route.key != "home") state.currentHistory.unshift(route);

    state.currentHistory = state.currentHistory.slice(0, 4);
    localStorage.setItem(CONST.KEY_LOCAL_HISTORY, JSON.stringify(state.currentHistory));
  }
};

export const actions = {
  loadLocalData({ state }) {
    let localJiraUrl = localStorage.getItem(CONST.KEY_LOCAL_JIRA_URL);
    state.jiraUrl = localJiraUrl ? localJiraUrl : state.jiraUrl;
  }
};
