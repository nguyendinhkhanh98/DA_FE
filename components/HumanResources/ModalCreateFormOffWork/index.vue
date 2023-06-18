<template>
  <a-modal
    class="modal-hr-off-work"
    v-model="visibleModal"
    title="ĐĂNG KÝ: NGHỈ, ĐI MUỘN, VỀ SỚM, LÀM VIỆC NGOÀI CÔNG TY, QUÊN LẤY VÂN TAY"
    @ok="handleOK"
  >
    <template slot="footer">
      <a-button key="back" @click="() => (visibleModal = false)"> {{ $t("cancel") }}</a-button>
      <a-button v-if="keyOpen == 'create'" key="submit" type="primary" :loading="loading" @click="handleOK">
        {{ $t("create") }}
      </a-button>
    </template>

    <a-form-model ref="modal-off-work" v-bind="formItemLayout" :model="formOffWork" :rules="rules">
      <a-form-model-item :label="$t('day')" :colon="false">
        <a-date-picker :value="calendarValue" disabled class="w-100" />
      </a-form-model-item>

      <a-form-model-item :label="$t('manager')" prop="manager" :colon="false">
        <a-select
          allowClear
          show-search
          :placeholder="$t('manager')"
          :disabled="disabledView"
          option-filter-prop="children"
          v-model="formOffWork.manager"
        >
          <a-select-option v-for="item in listLeader" :key="item.id" :value="item.id">{{
            item.fullName
          }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <a-form-model-item :label="$t('request_type')" prop="request_type" :colon="false">
        <a-select
          allowClear
          show-search
          :placeholder="$t('request_type')"
          :disabled="disabledView"
          option-filter-prop="children"
          v-model="formOffWork.request_type"
        >
          <a-select-option v-for="item in optionsRequestType" :key="item.key" :value="item.key">{{
            $t(item.key)
          }}</a-select-option>
        </a-select>
      </a-form-model-item>

      <!-- Only render when selected request_type -->
      <template v-if="formOffWork.request_type">
        <a-form-model-item class="mt-5" :label="$t('reason')" prop="reason" :colon="false">
          <a-textarea
            allowClear
            v-model="formOffWork.reason"
            :disabled="disabledView"
            :placeholder="$t('reason')"
            :auto-size="{ minRows: 1, maxRows: 3 }"
          />
        </a-form-model-item>

        <!-- Off work -->
        <template v-if="formOffWork.request_type == 'off_work'">
          <a-form-model-item :label="$t('session_in_day')" prop="session_in_day" :colon="false">
            <a-select
              allowClear
              show-search
              :placeholder="$t('session_in_day')"
              :disabled="disabledView"
              option-filter-prop="children"
              v-model="formOffWork.session_in_day"
            >
              <a-select-option v-for="item in sessionInDay" :key="item" :value="item">{{ $t(item) }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </template>

        <!-- Go to office late -->
        <template v-if="formOffWork.request_type == 'go_to_office_late'">
          <a-form-model-item :label="$t('time_to_office_late')" prop="time_to_office_late" :colon="false">
            <a-time-picker
              :default-value="$moment('08:30', formatTimeHourAndMinute)"
              :format="formatTimeHourAndMinute"
              :disabled="disabledView"
              v-model="formOffWork.time_to_office_late"
              @change="validateSelectTimeToOfficeLate"
            />
          </a-form-model-item>

          <a-form-model-item :label="$t('time_work_compensate')" prop="time_work_compensate" :colon="false">
            <a-row>
              <a-col :span="10" class="pr-1">
                <a-date-picker
                  :default-value="calendarValue"
                  v-model="formOffWork.date_work_compensate"
                  :disabled="disabledView"
                />
              </a-col>

              <a-col :span="7" class="px-1">
                <a-time-picker
                  style="width: initial;"
                  :default-value="$moment('17:30', formatTimeHourAndMinute)"
                  :format="formatTimeHourAndMinute"
                  disabled
                />
              </a-col>

              <a-col :span="7" class="pl-1">
                <a-time-picker
                  style="width: initial;"
                  :value="getTimeCompensateForWorkLate()"
                  :format="formatTimeHourAndMinute"
                  :disabled="disabledView"
                />
              </a-col>
            </a-row>
          </a-form-model-item>
        </template>

        <!-- Leave office early -->
        <template v-if="formOffWork.request_type == 'leave_office_early'">
          <a-form-model-item :label="$t('time_leave_office_early')" prop="time_leave_office_early" :colon="false">
            <a-time-picker
              :default-value="$moment('17:30', formatTimeHourAndMinute)"
              :format="formatTimeHourAndMinute"
              :disabled="disabledView"
              v-model="formOffWork.time_leave_office_early"
              @change="validateSelectTimeLeaveOfficeEarly"
            />
          </a-form-model-item>

          <a-form-model-item :label="$t('time_work_compensate')" prop="time_work_compensate" :colon="false">
            <a-row>
              <a-col :span="10" class="pr-1">
                <a-date-picker
                  :default-value="calendarValue"
                  v-model="formOffWork.date_work_compensate"
                  :disabled="disabledView"
                />
              </a-col>

              <a-col :span="7" class="px-1">
                <a-time-picker
                  style="width: initial;"
                  :default-value="$moment('17:30', formatTimeHourAndMinute)"
                  :format="formatTimeHourAndMinute"
                  disabled
                />
              </a-col>

              <a-col :span="7" class="pl-1">
                <a-time-picker
                  style="width: initial;"
                  :value="getTimeCompensateForLeaveEarly()"
                  :format="formatTimeHourAndMinute"
                  :disabled="disabledView"
                />
              </a-col>
            </a-row>
          </a-form-model-item>
        </template>

        <!-- Working out side office -->
        <template v-if="formOffWork.request_type == 'working_outside_office'">
          <a-form-model-item :label="$t('session_in_day')" prop="session_in_day" :colon="false">
            <a-select
              allowClear
              show-search
              :placeholder="$t('session_in_day')"
              :disabled="disabledView"
              option-filter-prop="children"
              v-model="formOffWork.session_in_day"
            >
              <a-select-option v-for="item in sessionInDay" :key="item" :value="item">{{ $t(item) }}</a-select-option>
            </a-select>
          </a-form-model-item>
        </template>
      </template>
    </a-form-model>
  </a-modal>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapMutations, mapActions } from "vuex";
import { rules, optionsRequestType, sessionInDay } from "./const";
const keyOpenModal = ["create", "view"];

export default {
  name: "ModalCreateFormOffWork",
  props: {
    calendarValue: Object
  },
  data() {
    return {
      rules,
      sessionInDay,
      optionsRequestType,
      formatTimeHourAndMinute: CONST.TIME_HOUR_AND_MINUTE,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_DOUBLE,
        wrapperCol: CONST.WRAPPER_COLUMN_DOUBLE
      },
      visibleModal: false,
      formCreateOffWork: {
        manager: this.latestManagerByFilter,
        request_type: null,
        reason: null,

        session_in_day: null,
        date_work_compensate: null,
        time_to_office_late: this.$moment("08:30", CONST.TIME_HOUR_AND_MINUTE),
        time_work_compensate: this.$moment("17:30", CONST.TIME_HOUR_AND_MINUTE),
        time_leave_office_early: this.$moment("17:30", CONST.TIME_HOUR_AND_MINUTE)
      },
      formViewOffWork: {
        manager: null,
        request_type: null,
        reason: null,

        session_in_day: null,
        date_work_compensate: null,
        time_to_office_late: this.$moment("08:30", CONST.TIME_HOUR_AND_MINUTE),
        time_work_compensate: this.$moment("17:30", CONST.TIME_HOUR_AND_MINUTE),
        time_leave_office_early: this.$moment("17:30", CONST.TIME_HOUR_AND_MINUTE)
      },
      keyOpen: keyOpenModal[0],
      loading: false
    };
  },
  watch: {
    triggerRequestType(newValue) {
      switch (newValue) {
        case "go_to_office_late":
          this.formOffWork.date_work_compensate = this.calendarValue.clone();
          break;

        default:
          this.formOffWork.date_work_compensate = this.calendarValue.clone().add(1, "days");
          break;
      }
    },
    latestManagerByFilter() {
      this.formCreateOffWork.manager = this.latestManagerByFilter;
    }
  },
  mounted() {
    this.formCreateOffWork.manager = this.latestManagerByFilter;
    if (!this.listLeader.length) this.getAndFillListLeader();
  },
  computed: {
    ...mapState({
      userList: state => state.modules["hr-management"].userList,
      latestManager: state => state.modules["hr-management"].latestManager,
      listLeader: state => state.modules["user-management"].listLeader
    }),
    formOffWork() {
      if (this.keyOpen == "create") return this.formCreateOffWork;
      else return this.formViewOffWork;
    },
    payloadForm() {
      return {
        manager: this.formOffWork.manager,
        date: this.calendarValue.format(CONST.DATE_FORMAT),
        type: this.formOffWork.request_type,
        reason: this.formOffWork.reason,
        data: this.formatDataForm()
      };
    },
    triggerRequestType() {
      return this.formOffWork.request_type;
    },
    disabledView() {
      return this.keyOpen == "view";
    },
    latestManagerByFilter() {
      let listManagerId = this.listLeader?.map(item => item.id);
      return listManagerId.includes(this.latestManager) ? this.latestManager : null;
    }
  },
  methods: {
    ...mapActions({
      createRequestOffWork: "modules/hr-management/createRequestOffWork",
      getAndFillListLeader: "modules/user-management/getAndFillListLeader"
    }),
    showModal(keyOpen, dataViewObject) {
      // Call this method from parent component
      if (keyOpenModal.includes(keyOpen)) {
        this.keyOpen = keyOpen; // validate

        if (keyOpen == "view") {
          let { data } = dataViewObject;

          this.formViewOffWork.manager = dataViewObject.manager_id;
          this.formViewOffWork.request_type = dataViewObject.type;
          this.formViewOffWork.reason = dataViewObject.reason;
          this.formViewOffWork.session_in_day = data?.session_in_day;
          this.formViewOffWork.date_work_compensate = this.$moment(data?.date_work_compensate, CONST.DATE_FORMAT);
          this.formViewOffWork.time_to_office_late = this.$moment(
            data?.time_to_office_late,
            CONST.TIME_HOUR_AND_MINUTE
          );
          this.formViewOffWork.time_work_compensate = this.$moment(
            data?.time_work_compensate,
            CONST.TIME_HOUR_AND_MINUTE
          );
          this.formViewOffWork.time_leave_office_early = this.$moment(
            data?.time_leave_office_early,
            CONST.TIME_HOUR_AND_MINUTE
          );
        }
      }

      if (!keyOpen) this.keyOpen = "create";

      this.visibleModal = true;
    },
    async handleOK() {
      await this.$refs["modal-off-work"].validate();
      this.loading = true;
      let data = await this.createRequestOffWork(this.payloadForm);

      let message = {
        message: data.message,
        description: data.message,
        duration: 2.5
      };
      if (data.error) this.$notification.error(message);
      else {
        this.visibleModal = false;
        this.$emit("re-render", this.calendarValue);
        this.$notification.success(message);
      }
      this.loading = false;
    },
    formatDataForm() {
      switch (this.formOffWork.request_type) {
        case "off_work":
        case "working_outside_office":
          return {
            session_in_day: this.formOffWork.session_in_day
          };
        case "go_to_office_late": {
          let { date_work_compensate, time_to_office_late, time_work_compensate } = this.formOffWork;
          date_work_compensate = date_work_compensate.format(CONST.DATE_FORMAT);
          time_to_office_late = time_to_office_late.format(CONST.TIME_HOUR_AND_MINUTE);
          time_work_compensate = time_work_compensate.format(CONST.TIME_HOUR_AND_MINUTE);
          return { date_work_compensate, time_to_office_late, time_work_compensate };
        }
        case "leave_office_early": {
          let { date_work_compensate, time_leave_office_early, time_work_compensate } = this.formOffWork;
          date_work_compensate = date_work_compensate.format(CONST.DATE_FORMAT);
          time_leave_office_early = time_leave_office_early.format(CONST.TIME_HOUR_AND_MINUTE);
          time_work_compensate = time_work_compensate.format(CONST.TIME_HOUR_AND_MINUTE);
          return { date_work_compensate, time_leave_office_early, time_work_compensate };
        }
      }
    },
    getTimeCompensateForWorkLate() {
      let startPoint = this.$moment("08:30", this.formatTimeHourAndMinute);
      let diff = this.formOffWork.time_to_office_late.diff(startPoint);

      let endPoint = this.$moment("17:30", this.formatTimeHourAndMinute).add(diff, "ms");
      this.formOffWork.time_work_compensate = endPoint;
      return endPoint;
    },
    getTimeCompensateForLeaveEarly() {
      let startPoint = this.$moment("17:30", this.formatTimeHourAndMinute);
      let diff = startPoint.diff(this.formOffWork.time_leave_office_early);

      let endPoint = this.$moment("17:30", this.formatTimeHourAndMinute).add(diff, "ms");
      this.formOffWork.time_work_compensate = endPoint;
      return endPoint;
    },
    validateSelectTimeToOfficeLate(time) {
      let earlyTime = this.$moment("08:30", this.formatTimeHourAndMinute);
      if (time.isBefore(earlyTime)) this.formOffWork.time_to_office_late = earlyTime;
    },
    validateSelectTimeLeaveOfficeEarly(time) {
      let latestTimeLeave = this.$moment("17:30", this.formatTimeHourAndMinute);
      if (time.isAfter(latestTimeLeave)) this.formOffWork.time_leave_office_early = latestTimeLeave;
    },
    resetFieldInDataModel() {
      this.formOffWork = {
        manager: this.latestManagerByFilter,
        request_type: null,
        reason: null,

        session_in_day: null,
        date_work_compensate: null,
        time_to_office_late: this.$moment("08:30", CONST.TIME_HOUR_AND_MINUTE),
        time_work_compensate: this.$moment("17:30", CONST.TIME_HOUR_AND_MINUTE),
        time_leave_office_early: this.$moment("17:30", CONST.TIME_HOUR_AND_MINUTE)
      };
    }
  }
};
</script>
