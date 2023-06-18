<template>
  <a-modal class="qcd-view-bug-detail-modal" :title="title" :visible="visible" @ok="handleOk" @cancel="handleCancel">
    <template slot="footer">
      <a-button key="back" @click="handleCancel"> Close </a-button>
    </template>

    <div class="bug-detail-container" v-if="dataSource && dataSource.length">
      <a-table :columns="columns" :dataSource="dataSource" :pagination="false">
        <template slot="title" slot-scope="currentPageData"> Total: {{ currentPageData.length }} </template>

        <template slot="no" slot-scope="text, record, index">
          {{ index + 1 }}
        </template>

        <template slot="userInWorklog" slot-scope="text">
          <span v-for="(author, index) in text" :key="index" class="pr-1">
            <a-tooltip placement="top">
              <template slot="title">
                <span>{{ author.displayName }}</span>
              </template>
              <img :src="author.avatarUrl" :alt="author.displayName" width="16" height="16" />
            </a-tooltip>
          </span>
        </template>

        <template slot="key" slot-scope="text, record">
          <div class="cursor" @click="gotoIssue(record.jiraLink)">
            <b>{{ text }}</b>
          </div>
        </template>

        <template slot="cost" slot-scope="text">
          <span class="text-align-right">{{ text }}</span>
        </template>
      </a-table>
    </div>

    <a-spin v-else tip="Loading..." :spinning="loading">
      <a-empty :description="false" />
    </a-spin>
  </a-modal>
</template>
<script>
import { fieldsTableViewIssue } from "./const.js";
export default {
  name: "QCDViewIssueInfo",
  props: {
    title: {
      type: String,
      default: ""
    },
    viewType: {
      required: true,
      validator: function (value) {
        // The value must match one of these strings
        return ["quality", "costEstimate", "deliveryOverDueDate", "degrate"].indexOf(value) !== -1;
      }
    },
    dataSource: Array
  },
  data() {
    return {
      visible: false,
      loading: true,
      fieldsTableViewIssue
    };
  },
  computed: {
    columns() {
      let addOnForEstimate = {
        title: "Cost over (%)",
        dataIndex: "cost",
        key: "cost",
        scopedSlots: { customRender: "cost" },
        sorter: (a, b) => a.cost - b.cost,
        defaultSortOrder: "descend"
      };
      if (this.viewType == "costEstimate") return [...fieldsTableViewIssue, addOnForEstimate];
      else return [...fieldsTableViewIssue];
    }
  },
  methods: {
    showModal() {
      this.visible = true;
    },
    handleOk(e) {
      this.visible = false;
    },
    handleCancel(e) {
      this.visible = false;
    },
    gotoIssue(link) {
      window.open(link);
    },
    loadedData() {
      this.loading = false;
    }
  }
};
</script>

<style lang="less" scoped>
.bug-detail-container {
  max-height: 400px;
  overflow-y: auto;
}
.cursor {
  cursor: pointer;
}
</style>

<style lang="less">
.qcd-view-bug-detail-modal {
  .ant-modal {
    top: 20px !important;
    width: 1000px !important;
  }
}
.text-align-right {
  float: right;
}
</style>
