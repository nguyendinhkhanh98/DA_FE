import Vue from "vue";
import apiConfig from "../api-config";
import UrlPattern from "url-pattern";

function makeUrl(url, params) {
  let pattern = new UrlPattern(/^\/api\/(.*)$/);
  let apiLink = "";
  let requestParams = params;
  if (!pattern.match(url)) {
    let apiInfo = apiConfig[url];
    if (!apiInfo) {
      throw Error(`Route ${url} not found`);
    }
    let patternUrl = new UrlPattern(apiInfo.url);
    apiLink = patternUrl.stringify(params);
    let query = patternUrl.match(apiLink);
    Object.keys(params).map(key => {
      if (query[key] !== undefined) {
        delete requestParams[key];
      }
    });
  } else {
    apiLink = url;
  }
  return { apiLink, requestParams };
}

export default function({ $axios }, inject) {
  inject(
    "request",
    new Vue({
      methods: {
        get(url, params = {}) {
          const { apiLink, requestParams } = makeUrl(url, params);
          return $axios.get(apiLink, { params: requestParams });
        },
        post(url, params = {}) {
          const { apiLink, requestParams } = makeUrl(url, params);
          return $axios.post(apiLink, requestParams);
        },
        put(url, params = {}) {
          const { apiLink, requestParams } = makeUrl(url, params);
          return $axios.put(apiLink, requestParams);
        },
        delete(url, params = {}) {
          const { apiLink, requestParams } = makeUrl(url, params);
          return $axios.delete(apiLink, { params: requestParams });
        }
      }
    })
  );
}
