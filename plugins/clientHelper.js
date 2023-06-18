import Vue from "vue";
import moment from "moment";
import _ from "lodash";
Vue.mixin({
  methods: {
    convertNumberToCurrency(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },
    bufferToBase64(cv) {
      return "data:application/pdf;base64," + Buffer.from(cv).toString("base64");
    },
    convertTime(time) {
      return moment(time).format("DD/MM/YYYY");
    },
    convertTimeHaveHour(time) {
      return moment(time).format("DD/MM/YYYY hh:mm");
    },
    convertTimeToDay(time) {
      return moment(time).format("ddd");
    },
    convertTimeMonth() {
      return moment().format("YYYY/MM");
    },
    isLastWeek(time) {
      let today = moment().format("DD/MM/YYYY");
      let day = moment(time).day();
      time = moment(time).format("DD/MM/YYYY");
      if (time === today) return "issue-warning";
      if (day == 6 || day == 0) return "background-gray";
      return "";
    },
    isToday(time) {
      return moment().format("YYYY-MM-DD") == time;
    },
    reverse(arr) {
      let array = Array.from(arr);
      return _.reverse(array);
    },
    handleNotifyAPI(response) {
      if (response.error) {
        let options = {
          message: response.title || this.$t("failed"),
          description: this.$t(response.message),
          duration: 2.5
        };
        if (response.message && response.data) {
          options.message = this.$t(response.message);
          options.description = this.$t(response.data);
        }
        this.$notification.error(options);
      } else {
        this.$notification.success({
          message: response.title || this.$t("success"),
          description: this.$t(response.message),
          duration: 2.5
        });
      }
    }
  }
});
