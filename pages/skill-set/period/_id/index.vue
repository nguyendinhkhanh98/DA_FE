<template>
  <a-card class="shadow">
    <h1>{{ dataSource ? dataSource.name : "" }}</h1>

    <a-row>
      <a-col v-bind="wrapperContainerCol">
        <a-form-model ref="form-input" v-bind="formItemLayout" :model="dataSource" :rules="rules">
          <a-form-model-item :label="$t('period_name')" required has-feedback prop="name" :colon="false">
            <a-input v-model="dataSource.name" />
          </a-form-model-item>

          <a-form-model-item :label="$t('description')" has-feedback prop="description" :colon="false">
            <a-input v-model="dataSource.description" />
          </a-form-model-item>

          <a-form-model-item :label="$t('start_date')" required has-feedback prop="start_date" :colon="false">
            <a-date-picker v-model="dataSource.start_date" :format="dateFormat" class="w-100" />
          </a-form-model-item>

          <a-form-model-item :label="$t('end_date')" required has-feedback prop="end_date" :colon="false">
            <a-date-picker v-model="dataSource.end_date" :format="dateFormat" class="w-100" />
          </a-form-model-item>

          <a-form-model-item :label="$t('created_at')" has-feedback prop="created_at" :colon="false">
            <a-date-picker disabled v-model="dataSource.created_at" :format="dateFormatAndTime" class="w-100" />
          </a-form-model-item>

          <a-row class="mt-4">
            <a-col class="text-center">
              <a-button
                v-if="dataSource.delete_flag == false"
                type="primary"
                html-type="submit"
                class="mb-1"
                :loading="loading"
                @click="onSubmit"
              >
                {{ $t("save") }}
              </a-button>

              <a-button v-else type="primary" html-type="submit" class="mb-1" :loading="loading" @click="handleRestore">
                {{ $t("restore") }}
              </a-button>

              <a-popconfirm
                v-if="dataSource.delete_flag == false"
                :title="$t('are_you_sure_to_delete')"
                @confirm="deletePeriodAPI"
              >
                <a-button type="danger" ghost class="ml-2" :loading="loading">{{ $t("delete") }}</a-button>
              </a-popconfirm>
            </a-col>
          </a-row>
        </a-form-model>
      </a-col>
    </a-row>
  </a-card>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  name: "Period_Detail",
  data() {
    return {
      routeID: null,
      loading: false,
      dateFormat: CONST.DATE_FORMAT,
      dateFormatAndTime: CONST.DATE_FORMAT_AND_TIME,
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      formItemLayout: {
        labelCol: CONST.LABEL_COLUMN_SINGLE,
        wrapperCol: CONST.WRAPPER_COLUMN_SINGLE
      },
      dataSource: {
        id: this.routeID,
        name: null,
        start_date: null,
        end_date: null,
        description: "",
        created_at: null,
        delete_flag: false
      },
      rules: {
        name: [{ validator: this.validateNamePeriod, trigger: "change" }],
        start_date: [{ validator: this.validateDateTime, trigger: "change" }],
        end_date: [{ validator: this.validateDateTime, trigger: "change" }]
      }
    };
  },
  async created() {
    this.loading = true;
    this.findAndSetRouteID();
    if (this.listPeriod.length) this.updateDataSource();
    else await this.getAllPeriod();
    this.loading = false;
  },
  watch: {
    listPeriod: {
      deep: true,
      handler: "updateDataSource"
    }
  },
  computed: {
    ...mapState({
      listPeriod: state => state.modules["skill-set"].listPeriod
    }),
    payloadSubmit() {
      let { id, name, start_date, end_date, description, created_at } = this.dataSource;
      start_date = start_date ? start_date.format(CONST.DATE_FORMAT) : "";
      end_date = end_date ? end_date.format(CONST.DATE_FORMAT) : "";
      return { id, name, start_date, end_date, description, created_at };
    }
  },
  methods: {
    ...mapActions({
      getAllPeriod: "modules/skill-set/getAllPeriod",
      UpdatePeriod: "modules/skill-set/UpdatePeriod",
      DeletePeriod: "modules/skill-set/DeletePeriod",
      restorePeriod: "modules/skill-set/restorePeriod"
    }),
    findAndSetRouteID() {
      let pathName = location.pathname;
      let paths = _.filter(pathName.split("/"), o => o);
      this.routeID = this.$route.params.id || paths[1];
    },
    async onSubmit() {
      let valid = await this.$refs["form-input"].validate();
      if (!valid) return;
      this.loading = true;
      let response = await this.UpdatePeriod(this.payloadSubmit);
      this.loading = false;
      if (response.success) {
        this.$notification.success({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      }
    },
    async handleRestore() {
      this.loading = true;
      let response = await this.restorePeriod({ period_id: this.routeID });
      this.loading = false;
      if (response.success) {
        let periodDeleted = this.listPeriod.find(item => item.id == this.routeID);
        periodDeleted.delete_flag = false;

        this.$notification.success({
          message: response.message,
          description: response.message,
          duration: 2.5
        });

        this.$router.push("/skill-set/period");
      } else {
        this.$notification.error({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      }
    },
    validateNamePeriod(rule, value, callback) {
      if (value == "") return callback(new Error(`${this.$t("period_name")} ${this.$t("default_error_empty")}`));
      callback();
    },
    validateDateTime(rule, value, callback) {
      let isMoment = value instanceof this.$moment;
      if (!isMoment) return callback(new Error(`${this.$t(rule.field)} ${this.$t("default_error_empty")}`));
      callback();
    },
    updateDataSource() {
      try {
        let source = this.listPeriod.find(period => period.id == this.routeID);
        this.dataSource.id = source.id;
        this.dataSource.name = source.name;
        this.dataSource.description = source.description;
        this.dataSource.delete_flag = source.delete_flag;
        this.dataSource.start_date = this.$moment(source.start_date);
        this.dataSource.end_date = this.$moment(source.end_date);
        this.dataSource.created_at = this.$moment(source.created_at);
      } catch (error) {
        this.$notification.error({
          message: `Internal Server Error`,
          description: `Sorry, connect error!`,
          duration: 2.5
        });
      }
    },
    async deletePeriodAPI() {
      this.loading = true;
      let response = await this.DeletePeriod({ period_id: this.routeID });
      this.loading = false;
      if (response.success) {
        this.$router.push("/skill-set/period");
        let periodDeleted = this.listPeriod.find(item => item.id == this.routeID);
        periodDeleted.delete_flag = true;

        this.$notification.success({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: response.message,
          description: response.message,
          duration: 2.5
        });
      }
    }
  }
};
</script>
