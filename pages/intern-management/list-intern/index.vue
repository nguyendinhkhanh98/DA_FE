<template>
  <a-card class="shadow">
    <h1>{{ $t("list_intern") }}</h1>
    <a-row type="flex" align="bottom" justify="space-between" class="tool-bar">
      <a-col :xs="24" class="text-bold">
        <span>{{ $t("total_result") }}: {{ listIntern.length }}</span>
      </a-col>
      <a-col :xs="24" :md="24" :xl="24">
        <span style="float: right">
          <button class="button-responsive button-primary" :loading="loading" @click="visibleSlack = true">
            <i class="fas fa-edit mr-1"></i>
            <span>{{ $t("update_link_slack") }}</span>
          </button>
          <button class="button-responsive button-primary" :loading="loading" @click="visible = true">
            <i class="fas fa-plus-circle mr-1"></i>
            <span>{{ $t("add_intern") }}</span>
          </button>
        </span>
      </a-col>
    </a-row>
    <a-table
      bordered
      class="mt-1"
      :columns="currentColumns"
      :dataSource="filterIntern"
      :rowKey="record => record.id"
      :loading="loading"
      :scroll="{ x: true }"
      :pagination="pagination"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>
      <div slot="filterDropdown" slot-scope="{ confirm }" style="padding: 8px">
        <a-select
          v-ant-ref="c => (searchForcus = c)"
          show-search
          placeholder="Please enter name"
          style="width: 200px"
          :show-arrow="false"
          @change="handleChange"
        >
          <a-select-option key="" label="" value="" @click="confirm"> All </a-select-option>
          <a-select-option
            @click="confirm"
            v-for="item in listIntern"
            :key="item.full_name"
            :label="item.full_name"
            :value="`${item.full_name + item.internid}`"
          >
            {{ item.full_name }}
          </a-select-option>
        </a-select>
      </div>
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />
      <template slot="no" slot-scope="text, record, index">{{ index + 1 }}</template>

      <span slot="action" slot-scope="text, record">
        <a-popconfirm :title="$t('are_you_sure_to_delete')" @confirm="delIntern(record.id)">
          <a-button type="danger" ghost :loading="updating">{{ $t("delete") }}</a-button>
        </a-popconfirm>
      </span>
    </a-table>
    <a-modal v-model="visible" title="Add Intern" :okButtonProps="{ props: { loading: updating } }" @ok="onAddIntern">
      <h4 style="color: #a8a7a7">Please enter name</h4>
      <a-select
        :value="value"
        v-ant-ref="c => (searchForcus = c)"
        show-search
        placeholder="Please enter name"
        style="width: 100%"
        :show-arrow="false"
        @change="onSearch"
      >
        <a-select-option
          v-for="item in resultSearchUser"
          :key="item.full_name"
          :label="item.full_name"
          :value="`${item.full_name + item.id}`"
        >
          {{ item.full_name }}
        </a-select-option>
      </a-select>
    </a-modal>
    <a-modal
      v-model="visibleSlack"
      :title="$t('update_link_slack')"
      :okButtonProps="{ props: { loading: updating } }"
      @ok="onUpdateLinkSlack"
    >
      <h4 style="color: #a8a7a7">
        {{ $t("link_webhook_slack")
        }}<a
          style="padding-left: 10px; text-decoration: underline"
          target="_blank"
          href="https://api.slack.com/messaging/webhooks"
          >{{ this.$t("see_guide") }}</a
        >
      </h4>
      <a-input v-model="linkSlack" placeholder="https://hooks.slack.com/services/XXXXXXXX">
        <a-icon slot="prefix" type="user" />
        <a-tooltip slot="suffix" title="Extra information">
          <a-icon type="info-circle" style="color: rgba(0, 0, 0, 0.45)" />
        </a-tooltip>
      </a-input>
    </a-modal>
  </a-card>
</template>

<script>
import _ from "lodash";
import jwtDecode from "jwt-decode";

import ToggleColumn from "@/components/Common/ToggleColumn";
import CustomSearch from "@/components/Common/CustomSearch";

import { mapState, mapActions, mapGetters } from "vuex";
import { columns } from "./const";

export default {
  name: "asset-management",
  middleware: "permissions",
  meta: {
    permissions: ["leader"]
  },
  data() {
    return {
      columns,
      loading: false,
      value: "",
      isLoading: false,
      visible: false,
      visibleSlack: false,
      keyword: "",
      linkSlack: "",
      showResult: "none",
      currentColumns: columns.filter(item => item.defaultChecked),
      selectedRowKeys: [],
      pagination: {
        pageSize: 40,
        total: 0,
        current: 1,
        showSizeChanger: true,
        pageSizeOptions: ["40", "50", "60"]
      },
      keySearchGlobal: "",
      searchForcus: null,
      internToAdd: "",
      filterIntern: [],
      updating: false
    };
  },
  computed: {
    ...mapState({
      listIntern: state => state.modules["intern-management"].listIntern,
      resultSearchUser: state => state.modules["intern-management"].resultSearchUser
    })
  },
  beforeMount() {
    this.loading = true;
  },
  async mounted() {
    this.loading = false;
  },
  async created() {
    await this.getListIntern();
    await this.searchUser({ keyword: "" });
    this.filterIntern = this.listIntern;
  },
  watch: {
    visible() {
      this.keyword = "";
      this.showResult = "none";
    }
  },
  methods: {
    ...mapActions({
      getListIntern: "modules/intern-management/getListIntern",
      delInternFromTeam: "modules/intern-management/delInternFromTeam",
      searchUser: "modules/intern-management/searchUser",
      addInternToTeam: "modules/intern-management/addInternToTeam",
      updateLinkSlack: "modules/intern-management/updateLinkSlack"
    }),
    handleChange(value) {
      if (value == "") {
        this.filterIntern = this.listIntern;
      } else {
        let filterIntern = this.listIntern.find(element => element.full_name + element.internid == value);
        this.filterIntern = [filterIntern];
      }
    },
    async onSearch(value) {
      let filterIntern = this.resultSearchUser.find(element => element.full_name + element.id == value);
      this.internToAdd = filterIntern.id;
      this.value = filterIntern.full_name;
    },
    async delIntern(id) {
      this.updating = true;
      let self = this;
      let reponse = await self.delInternFromTeam(id);
      if (reponse.status === 200) {
        await self.getListIntern();
        self.filterIntern = self.listIntern;
        await self.searchUser({ keyword: "" });
        self.$notification.success({
          message: this.$t("delete_intern_success"),
          description: this.$t("delete_intern_success"),
          duration: 2.5
        });
      } else {
        self.$notification.error({
          message: this.$t("delete_intern_error"),
          description: this.$t("delete_intern_error"),
          duration: 2.5
        });
      }
      this.updating = false;
    },
    onBlurSearch() {
      this.showResult = "none";
      // this.keyword = "";
    },
    async onAddIntern() {
      if (this.internToAdd == "") {
        this.$notification.error({
          message: this.$t("please_select_intern"),
          description: this.$t("please_select_intern"),
          duration: 2.5
        });
        return;
      }
      this.updating = true;
      let reponse = await this.addInternToTeam(this.internToAdd);
      if (reponse.status === 200) {
        this.visible = false;
        this.keyword = "";
        await this.getListIntern();
        await this.searchUser({ keyword: "" });
        this.internToAdd = "";
        this.value = "";
        this.filterIntern = this.listIntern;
        this.$notification.success({
          message: this.$t("add_intern_success"),
          description: this.$t("add_intern_success"),
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: this.$t("add_intern_error"),
          description: this.$t("add_intern_error"),
          duration: 2.5
        });
      }
      this.updating = false;
    },
    async onUpdateLinkSlack() {
      if (this.linkSlack == "") {
        this.$notification.error({
          message: this.$t("please_enter_link_slack"),
          description: this.$t("please_enter_link_slack"),
          duration: 2.5
        });
        return;
      }
      this.updating = true;
      let reponse = await this.updateLinkSlack(this.linkSlack);
      if (reponse.status === 200) {
        this.visibleSlack = false;
        this.linkSlack = "";
        this.$notification.success({
          message: this.$t("update_link_slack_success"),
          description: this.$t("update_link_slack_success"),
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: this.$t("update_link_slack_error"),
          description: this.$t("update_link_slack_error"),
          duration: 2.5
        });
      }
      this.updating = false;
    }
  }
};
</script>

<style lang="less">
.shadow {
  .ant-table-row-cell-break-word {
    max-width: 200px;
    p {
      max-width: 100%;
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      margin: 0px;
    }
  }
}
.table-data-tooltip {
  white-space: normal;
}
.highlight {
  background-color: rgb(255, 192, 105);
  padding: 0px;
}
</style>

<style lang="less" scoped>
.result-search {
  background: #f5f5f5;
  border-radius: 5px;
  position: absolute;
  left: 20px;
  top: 120px;
  right: 20px;
  z-index: 2;
}
.result-search li {
  list-style: none;
  cursor: pointer;
}
.result-search li:hover {
  background: paleturquoise !important;
}
.shadow {
  .pointer {
    cursor: pointer;
  }
  .tool-bar {
    @media (max-width: 767px) {
      & span {
        display: block;
        width: 100%;

        & > * {
          width: 20%;
          display: inline-block;
          font-size: calc(50% + 1vw);
        }
      }
    }

    @media (min-width: 768px) {
      & span {
        display: inline-block;
      }
    }

    button {
      margin: 2px;
      &.button-responsive {
        height: 32px;
        color: #0052cc;
        line-height: 1.499;
        position: relative;
        display: inline-block;
        font-weight: 400;
        white-space: nowrap;
        text-align: center;
        padding: 0 15px;
        font-size: 14px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        box-shadow: 0 2px 0 rgba(0, 0, 0, 0.015);
        cursor: pointer;
        transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        user-select: none;
        touch-action: manipulation;
        background: transparent;
        -webkit-tap-highlight-color: rgba(0, 0, 0, 0);

        @media (max-width: 767px) {
          & span {
            display: none;
          }

          & i {
            margin: 0px !important;
          }
        }
      }

      &.button-disabled {
        color: rgba(0, 0, 0, 0.25);
        background-color: #f5f5f5;
        border-color: #d9d9d9;
        text-shadow: none;
        box-shadow: none;
        cursor: not-allowed;
      }

      &.button-primary {
        color: white;
        background-color: #0052cc;
      }
    }
  }
  .search-bar {
    margin-top: 2px;
    margin-bottom: 2px;
    height: fit-content;
    width: 100%;
    display: flex;
    align-items: flex-end;

    .wrap-filter {
      height: 30px;
      border: 1px solid;
      border-radius: 5px;
      width: 100%;

      .content {
        color: blueviolet;
      }
      .content-toggle {
        width: 100%;
        position: absolute;
        z-index: 1;
      }
    }
  }

  .filter-column {
    padding: 8px;
    display: flex;
    flex-direction: column;
  }
}
</style>

// global style
<style lang="less">
.shadow {
  .header-filtered {
    color: blue;
  }
}
</style>
