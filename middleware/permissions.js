const jwtDecode = require("jwt-decode");
const _ = require("lodash");

export default function({ route, redirect }) {
  let token = localStorage.getItem("token");
  let decoded = jwtDecode(token);
  let userPermissions = decoded.permissions;

  //for old version jira_qcd => permission = signle role
  if (typeof userPermissions == "string") {
    localStorage.clear();
    return redirect("/login");
  }

  // Nếu permissions = guest và route đến trang home thì lập tức đến màn summary issue
  if (userPermissions.length == 1 && userPermissions[0] === "guest" && route.path === "/") {
    return redirect("/summary-report-by-issue");
  }

  // Nếu permissions = intern và route đến trang home thì lập tức đến màn skill-set
  if (userPermissions.length == 1 && userPermissions[0] === "intern" && route.path === "/") {
    return redirect("/skill-set");
  }

  let { meta } = route;
  console.log('meta', meta)
  const permissions = meta.length && meta[0].permissions ? _.cloneDeep(meta[0].permissions) : -1;
  console.log('permissions', permissions)
  // Validate role of user, if in list role of user contain => pass
  if (permissions !== -1) {
    let hasPermission = false;
    let equals = _.filter(permissions, item => {
      return _.findIndex(userPermissions, o => o == item) >= 0;
    });
    if (equals.length > 0) hasPermission = true;

    if (!hasPermission) {
      localStorage.clear();
      return redirect("/login");
    }
  }
}
