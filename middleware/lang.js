import { localize } from "vee-validate";
import "moment/locale/en-ca";
import "moment/locale/vi";
import "moment/locale/ja";

export default function ({ app, query }) {
  const curLocale = localStorage.getItem("lang");
  const locale = query.lang || curLocale || app.i18n.fallbackLocale;
  localStorage.setItem("lang", locale);
  app.i18n.locale = locale;
  app.$moment.locale(locale);
  localize(locale);
}
