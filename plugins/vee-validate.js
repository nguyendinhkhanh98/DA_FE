import Vue from "vue";
import { ValidationProvider, ValidationObserver, extend, localize } from "vee-validate";
import * as rules from 'vee-validate/dist/rules';
import ja from "vee-validate/dist/locale/ja";
import vi from "vee-validate/dist/locale/vi";
import en from "vee-validate/dist/locale/en";

export default () => {
  Vue.component("ValidationProvider", ValidationProvider);
  Vue.component("ValidationObserver", ValidationObserver);
  Object.keys(rules).forEach(rule => {
    extend(rule, rules[rule]);
  });
  localize("ja", ja);
  localize("vi", vi);
  localize("en", en);
};
