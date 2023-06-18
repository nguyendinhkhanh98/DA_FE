<template>
  <a-card class="shadow">
    <a-row type="flex" align="bottom" justify="space-between" class="tool-bar">
      <a-col :xs="24" :md="24" :xl="24" style="margin-bottom: 20px">
        <span class="h1">{{ $t("register_calendar") }}</span>
        <span style="float: right">
          <a-button class="submit-button" @click="onGetTimeWorkLastMonth()">{{ $t("previous_month") }}</a-button>
          <a-button class="submit-button" @click="onViewTimeDraft()">{{
            isDraft ? $t("see_time_work") : $t("see_draft")
          }}</a-button>

          <a-button class="submit-button" @click="onSaveTimeDraft(events)">
            {{ $t("save_draft") }}
          </a-button>
          <a-button type="primary" class="submit-button" @click="onSaveTimeWork(events)">{{ $t("submit") }}</a-button>
        </span>
      </a-col>
    </a-row>

    <full-calendar
      ref="calendar"
      :config="config"
      :events="events"
      @day-click="dayClick"
      @event-render="eventRender"
    ></full-calendar>

    <a-modal v-model="activeModal" :title="$t('choose_time')" @cancel="time = ''">
      <template slot="footer">
        <i></i>
      </template>
      <a-radio-group :value="time" @change="addDay">
        <a-radio :style="radioStyle" value="0"> {{ $t("morning") }} </a-radio>
        <a-radio :style="radioStyle" value="1"> {{ $t("afternoon") }} </a-radio>
        <a-radio :style="radioStyle" value="2">{{ $t("all_day") }}</a-radio>
      </a-radio-group>
    </a-modal>
  </a-card>
</template>

<script>
import moment from "moment";
import { mapActions, mapState } from "vuex";
export default {
  name: "calendar",
  middleware: "permissions",
  meta: {
    permissions: ["intern"]
  },
  data() {
    return {
      time: "",
      day: "",
      events: "",
      activeModal: false,
      isDraft: false,
      days: [this.$t("morning"), this.$t("afternoon"), this.$t("all_day")],
      radioStyle: {
        display: "block",
        height: "30px",
        lineHeight: "30px"
      },
      config: {
        locale: "vn",
        allDayDefault: true,
        showNonCurrentDates: false,
        defaultView: "month",
        height: 650,
        firstDay: 1,
        header: {
          right: "",
          left: ""
        }
      }
    };
  },
  computed: {
    ...mapState({
      user: state => state.modules["auth"].user,
      timeWork: state => state.modules["register-calendar"].timeWork,
      timeDraft: state => state.modules["register-calendar"].timeDraft,
      lang: state => state.lang
    })
  },
  watch: {
    lang() {
      this.days = [this.$t("morning"), this.$t("afternoon"), this.$t("all_day")];
      let events = this.events.map(e => {
        e.title = this.days[e.value];
        return e;
      });
      this.events = events;
    }
  },
  methods: {
    ...mapActions({
      saveTimeDraft: "modules/register-calendar/saveTimeDraft",
      getTimeDraft: "modules/register-calendar/getTimeDraft",
      getTimeWork: "modules/register-calendar/getTimeWork",
      saveTimeWork: "modules/register-calendar/saveTimeWork"
    }),
    eventRender(event, element) {
      let self = this;
      element.css("font-size", "1.2em");
      element.css("padding", "5px");
      element[0].classList.add("fc-event");
      var div = element.prepend('<div class="fc-zindex"></div>');
      var e = div.prepend('<i size="20px" class="closeon fas fa-times"></i>');
      var edit = div.prepend('<i  class="fc-edit fas fa-edit"></i>');
      e.children(".closeon").click(function (ev) {
        self.deleteEvent(event);
      });
      edit.children(".fc-edit").click(function (ev) {
        self.time = event.value + "";
        self.day = event.start._d;
        self.activeModal = true;
      });
    },
    dayClick(day) {
      const events = this.events.filter(event => day._d.getTime() !== moment(event.start).valueOf());
      if (events.length === this.events.length) {
        this.activeModal = true;
        this.day = day._d;
        this.time = "";
      }
    },
    deleteEvent(deleteEvent) {
      const events = this.events.filter(event => {
        let thisDay = deleteEvent.start.toDate().getTime();
        return thisDay !== moment(event.start).valueOf();
      });
      this.events = events;
      this.activeModal = false;
    },
    addDay(e) {
      this.time = e.target.value;
      if (this.time != "") {
        const events = this.events.filter(e => this.day.getTime() !== moment(e.start).valueOf());
        this.events = events;
        this.activeModal = false;
        this.events.push({
          title: this.days[this.time],
          start: this.day,
          value: this.time
        });
      }
    },
    async onViewTimeDraft() {
      let events;
      this.isDraft = !this.isDraft;
      if (this.isDraft) {
        await this.getTimeDraft();
        events = this.timeDraft.map(e => {
          e.title = this.days[e.value];
          return e;
        });
      } else {
        let month = moment().format("M");
        let year = moment().format("Y");
        await this.getTimeWork({ month: month, year: year });
        events = this.timeWork.map(e => {
          e.title = this.days[e.value];
          return e;
        });
      }

      this.events = events;
    },
    async onSaveTimeDraft(timeline) {
      // if (this.events.length === 0) {
      //   this.$notification.error({
      //     message: "ERROR",
      //     description: "Please select time work.",
      //     duration: 2.5
      //   });
      // }
      let reponse = await this.saveTimeDraft({ timeline });
      if (reponse.status === 200) {
        this.$notification.success({
          message: "SUCCESS",
          description: "Save time draft success",
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: "Save time draft error",
          description: reponse.data.error,
          duration: 2.5
        });
      }
    },
    async onSaveTimeWork(timeline) {
      // if (this.events.length === 0) {
      //   this.$notification.error({
      //     message: "ERROR",
      //     description: "Please register for the time",
      //     duration: 2.5
      //   });
      //   return;
      // }
      let reponse = await this.saveTimeWork({ timeline });
      if (reponse.status === 200) {
        this.$notification.success({
          message: "SUCCESS",
          description: "Save time work success",
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: "Save time work error",
          description: reponse.data.error,
          duration: 2.5
        });
      }
    },
    async onGetTimeWorkLastMonth() {
      let month = moment().format("M");
      let year = moment().format("Y");
      if (month == 1) {
        month = 12;
        year = year - 1;
      } else {
        month = month - 1;
      }
      await this.getTimeWork({ month: month, year: year });
      let events = this.timeWork.map(e => {
        e.title = this.days[e.value];
        e.start = moment(e.start).add(1, "month").toISOString();
        return e;
      });
      this.events = this.timeWork;
    }
  },
  async created() {
    let month = moment().format("M");
    let year = moment().format("Y");
    await this.getTimeWork({ month: month, year: year });
    let events = this.timeWork.map(e => {
      e.title = this.days[e.value];
      return e;
    });
    this.events = events;
  }
};
</script>
<style scoped>
.fc-view-container {
  overflow-x: scroll;
}
.calendar {
  position: relative;
}
.calendar__title {
  text-align: start;
  font-size: 27px;
  font-weight: bold !important;
  margin-bottom: 40px;
}
.edit-input {
  margin-bottom: 10px;
  margin-top: 20px;
  padding: 10px;
  border: 1px solid gray;
  border-radius: 10px;
}
.loading {
  position: absolute;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  justify-content: center;
  align-items: center;
}
</style>
<style lang="css">
.closeon {
  display: none;
  position: absolute;
  right: -1px;
  top: -26px;
  z-index: 5;
  padding: 4px 8px 4px 8px;
  border-radius: 3px;
  background: #3a87ad;
}
.fc-edit {
  display: none;
  position: absolute;
  right: 27px;
  top: -26px;
  z-index: 5;
  padding: 4px 4px 4px 6px;
  border-radius: 3px;
  background: #3a87ad;
}
.fc-zindex {
  position: absolute;
  right: 0px;
  z-index: 2;
  bottom: 0px;
  width: 100%;
  height: 200%;
}
</style>

<style lang="less">
.fc-event {
  &:hover {
    .closeon {
      display: block;
    }
    .fc-edit {
      display: block;
    }
  }
}
</style>
