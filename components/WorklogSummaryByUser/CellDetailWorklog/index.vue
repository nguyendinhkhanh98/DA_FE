<template>
  <div>
    <a-tooltip placement="top">
      <template slot="title">
        <span>{{ $t("click_for_more_infomation") }}</span>
      </template>
      <span @click="showModal" class="cursor" :class="classMarked">{{ title.value | formatByHour }}</span>
    </a-tooltip>

    <a-modal v-model="visible" :title="$t('worklog_detail_by_user')" @ok="handleOk">
      <template slot="footer">
        <a-button key="submit" type="primary" @click="handleOk"> Ok </a-button>
      </template>

      <a-form v-bind="formLayout">
        <a-form-item :label="$t('user')">
          <label class="text-bold">{{ record.worklogAuthor }}</label>
        </a-form-item>
        <a-form-item :label="$t('project')">
          <label class="text-bold">{{ record.project }}</label>
        </a-form-item>
        <a-form-item :label="$t('day')">
          <label class="text-bold">{{ dateToday }}</label>
        </a-form-item>
      </a-form>

      <a-table
        class="mt-1 mb-1"
        :columns="userColumns"
        :dataSource="title.worklogs"
        :pagination="false"
        :rowKey="record => record.id"
      >
        <template v-for="column of userColumns" :slot="column.slots.title">
          {{ $t(column.slots.title) }}
        </template>

        <template slot="dateRender" slot-scope="text">
          {{ text.substr(11, 5) }}
        </template>

        <template slot="issueRender" slot-scope="text, record">
          <a :href="`${record.self.substr(0, record.self.indexOf('.net') + 4)}/browse/${text}`" target="_blank">
            {{ text }}</a
          >
        </template>

        <template slot="spentTime" slot-scope="text">
          {{ (text / 3600).toFixed(2) }}
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

const userColumns = [
  {
    slots: { title: "started_time" },
    dataIndex: "started",
    key: "started",
    scopedSlots: { customRender: "dateRender" }
  },
  {
    slots: { title: "issue" },
    dataIndex: "issueKey",
    key: "issueKey",
    scopedSlots: { customRender: "issueRender" }
  },
  {
    slots: { title: "spent_time" },
    dataIndex: "timeSpentSeconds",
    key: "timeSpentSeconds",
    scopedSlots: { customRender: "spentTime" }
  }
];

export default {
  props: ["title", "record"],
  filters: {
    formatByHour(timeSpent) {
      if (!timeSpent) return "";
      let hours = Math.round((timeSpent / 3600) * 100) / 100;
      return hours.toFixed(2) + "h";
    }
  },
  data() {
    return {
      userColumns,
      visible: false,
      formLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      }
    };
  },
  computed: {
    ...mapState({
      jiraUrl: state => state.jiraUrl
    }),
    dateToday() {
      let started = this.title.worklogs[0].started.substring(0, 10).replace(/-/g, "/");
      return started;
    },
    classMarked() {
      let classList = {
        "worklog-danger": false,
        "worklog-warning": false,
        "worklog-normal": false
      };

      if (this.title.value < 25200) classList["worklog-danger"] = true;
      else if (this.title.value < 32400) classList["worklog-warning"] = true;
      else classList["worklog-normal"] = true;

      return classList;
    }
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.visible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.cursor {
  cursor: pointer;
}

.worklog-danger {
  color: red;
}

.worklog-warning {
  color: #0066ff;
}
</style>
