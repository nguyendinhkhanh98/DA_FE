const isUrlExportExcel = url => {
  if (!url) return false;
  if (url.indexOf("export") > -1) return true;
  if (url.indexOf("qcd-report/origin") > -1) return true;
  if (url.indexOf("qcd-report/summary") > -1) return true;
  if (url.indexOf("qcd-report/invoice") > -1) return true;
  if (url.indexOf("monthly-report") > -1) return true;

  return false;
};
export default function({ $axios, redirect }) {
  $axios.setHeader("Content-Type", "application/json");
  $axios.interceptors.request.use(config => {
    let token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = "Bearer " + token;
    }
    if (isUrlExportExcel(config.url)) config.responseType = "blob";
    return config;
  });
  $axios.interceptors.response.use(config => {
    if (config.data.statusCode == 404) {
      redirect("/not-found");
    }
    return config;
  });
  $axios.onError(error => {
    const code = parseInt(error.response && error.response.status);
    console.log('code', code)
    if ([403, 401].includes(code)) {
      localStorage.clear();
      redirect("/login");
    }
  });
}
