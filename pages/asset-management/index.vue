<template>
  <a-card class="shadow">
    <h1>{{ $t("asset_management") }}</h1>

    <a-row type="flex" align="bottom" justify="space-between" class="tool-bar">
      <a-col :xs="24" class="text-bold">
        <span>{{ $t("total_result") }}: {{ filterAssetLocal.length }}</span>
      </a-col>

      <a-col :xs="24" :md="12" :xl="10">
        <CustomSearch :value="keySearchGlobal" @change="e => (keySearchGlobal = e)" />
      </a-col>

      <a-col :xs="24" :md="12" :xl="12">
        <span style="float: right">
          <button v-if="isAdminOrAssetAdmin" class="button-responsive" @click="toggleDeviceAction">
            <i v-if="!toggleDevice" class="fas fa-laptop mr-1"></i>
            <i v-else class="fas fa-desktop mr-1"></i>
            <span>{{ toggleDevice ? $t("all_device") : $t("my_device") }}</span>
          </button>

          <button class="button-responsive" @click="goToQRScanner">
            <i class="fas fa-qrcode mr-1"></i>
            <span>{{ $t("scan_qr") }}</span>
          </button>

          <!-- <a-tooltip placement="top">
            <template slot="title">
              <span>{{ $t("export_excel") }}</span>
            </template>
            <a-button :disabled="selectedRowKeys.length <= 0" @click="exportItemSelected" class="text-success"
              ><i class="fas fa-file-excel"></i
            ></a-button>
          </a-tooltip>

          <a-tooltip placement="top">
            <template slot="title">
              <span>{{ $t("print") }}</span>
            </template>
            <a-button :disabled="selectedRowKeys.length <= 0" @click="printItemSelected" type="primary" ghost
              ><i class="fas fa-print"></i
            ></a-button>
          </a-tooltip> -->

          <ToggleColumn :columns="columns" @change="onChangeToggleColumn" class="toggle-columns" />

          <button class="button-responsive button-primary" :loading="loading" @click="goToAdd">
            <i class="fas fa-plus-circle mr-1"></i>
            <span>{{ $t("add_asset") }}</span>
          </button>
        </span>
      </a-col>
    </a-row>

    <a-table
      bordered
      class="mt-1"
      :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
      :columns="currentColumns"
      :dataSource="filterAssetLocal"
      :rowKey="record => record.id"
      :loading="loading"
      :scroll="{ x: true }"
      :pagination="pagination"
      @change="handleTableChange"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <div slot="filterDropdown" slot-scope="{ column }" class="filter-column">
        <!-- asset_type column -->
        <a-select
          v-ant-ref="c => (searchForcus = c)"
          v-if="column.dataIndex == `asset_type`"
          :default-value="filterObject.asset_type"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
          @change="onChangeFilter(column.key, $event)"
        >
          <a-select-option
            v-for="item in listAssetType"
            :key="item.id"
            :label="item.asset_type_name"
            :value="`${item.asset_type_name}`"
          >
            {{ item.asset_type_name }}
          </a-select-option>
        </a-select>

        <!-- purpose -->
        <a-select
          v-if="column.dataIndex == `purpose`"
          v-ant-ref="c => (searchForcus = c)"
          :default-value="filterObject.purpose"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
          @change="onChangeFilter(column.key, $event)"
        >
          <a-select-option v-for="item in listPurpose" :key="item.id" :label="item.name" :value="`${item.name}`">
            {{ item.name }}
          </a-select-option>
        </a-select>

        <!-- manager -->
        <a-select
          v-if="column.dataIndex == `manager`"
          v-ant-ref="c => (searchForcus = c)"
          :default-value="filterObject.manager"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          :filterOption="filterOptionForManager"
          @change="onChangeFilter(column.key, $event)"
        >
          <a-select-option
            v-for="item in listUserWithNoManager"
            :key="item.id"
            :label="item.full_name"
            :value="item.full_name"
          >
            {{ item.full_name }}
          </a-select-option>
        </a-select>

        <!-- status -->
        <a-select
          v-if="column.dataIndex == `status`"
          v-ant-ref="c => (searchForcus = c)"
          :default-value="filterObject.status"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
          @change="onChangeFilter(column.key, $event)"
        >
          <a-select-option
            v-for="item in listStatus.filter(item => item.id != 5 && item.id != 6)"
            :key="item.id"
            :label="item.name"
            :value="`${item.name}`"
          >
            {{ item.name }}
          </a-select-option>
        </a-select>
      </div>

      <a-icon slot="filterIcon" type="search" />

      <template slot="no" slot-scope="text, record, index"
        >{{ index + 1 + (pagination.current - 1) * pagination.pageSize }}
      </template>

      <template slot="asset_code" slot-scope="text, record">
        <a-tag class="pointer" :key="text" :color="tagAsset(record.asset_type)" @click="goToUserDetail(record.id)">
          {{ text }}
        </a-tag>
      </template>

      <template slot="purpose" slot-scope="text, record">
        <a-tag class="pointer" :key="text" :color="tagPurpose(record.purpose)">
          {{ text }}
        </a-tag>
      </template>

      <template slot="status" slot-scope="text, record">
        <ChangeStatus :size="`small`" :record="record" @FetchStatus="fetchAssetByJoin" />
      </template>

      <template slot="manager" slot-scope="text, record, index">
        <BindCell :type="`cell`" :ref="`bind-cell-${index}`" :record="record" @BindManager="e => onBind(e, index)" />
      </template>

      <template slot="asset_info" slot-scope="text">
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span class="table-data-tooltip">{{ text }}</span>
          </template>
          <p>{{ text }}</p>
        </a-tooltip>
      </template>

      <template slot="detail" slot-scope="text">
        <a-button type="primary" @click="goToUserDetail(text)">{{ $t("detail") }}</a-button>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import _ from "lodash";
import jwtDecode from "jwt-decode";

import ToggleColumn from "@/components/Common/ToggleColumn";
import BindCell from "@/components/AssetManagement/AssignAsset.vue";
import ChangeStatus from "@/components/AssetManagement/ChangeStatus.vue";
import CustomSearch from "@/components/Common/CustomSearch";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

import { mapState, mapActions, mapGetters } from "vuex";
import { columns } from "./const";

export default {
  name: "asset-management",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "accountant"]
  },
  components: {
    BindCell,
    ToggleColumn,
    ChangeStatus,
    CustomSearch
  },
  data() {
    return {
      columns,
      loading: false,
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
      searchForcus: null
    };
  },
  computed: {
    ...mapState({
      listAsset: state => state.modules["asset-management"].data,
      listCompany: state => state.modules["asset-management"].listCompany,
      userListOnlyName: state => state.modules["user-management"].userListOnlyName,
      listPurpose: state => state.modules["asset-management"].listPurpose,
      listStatus: state => state.modules["asset-management"].listStatus,
      listTagColor: state => state.modules["asset-management"].listTagColor,
      listAssetType: state => state.modules["asset-management"].listAssetType,
      storeLoaded: state => state.modules["asset-management"].storeLoaded,
      userInfo: state => state.modules["asset-management"].userInfo,
      toggleDevice: state => state.modules["asset-management"].toggleDevice,
      filterObject: state => state.modules["asset-management"].filterObject
    }),
    ...mapGetters({
      filterAsset: "modules/asset-management/filterAsset",
      isAdminOrAssetAdmin: "modules/asset-management/isAdminOrAssetAdmin"
    }),
    filterAssetLocal() {
      let data = _.cloneDeep(this.filterAsset);

      data = _.filter(data, o => {
        //filter follow asset type
        let exist = o && this.filterObject.asset_type.length;
        return exist ? this.filterObject.asset_type.includes(o.asset_type) : true;
      });

      data = _.filter(data, o => {
        //filter follow purpose
        let exist = o && this.filterObject.purpose.length;
        return exist ? this.filterObject.purpose.includes(o.purpose) : true;
      });

      data = data.filter(o => {
        //filter follow manager
        let exist = o && this.filterObject.manager.length;
        if (!exist) return true;

        if (!o.manager && this.filterObject.manager.includes(this.$t("empty_manager"))) return true;

        return this.filterObject.manager.includes(o.manager);
      });

      data = _.filter(data, o => {
        //filter follow status
        let exist = o && this.filterObject.status.length;
        return exist ? this.filterObject.status.includes(o.status) : true;
      });

      data = _.filter(data, o => {
        //filter follow search input
        let clone = _.omit(_.cloneDeep(o), ["qr_code"]);
        let str = JSON.stringify(clone).toLowerCase();
        return str.indexOf(this.keySearchGlobal.toLowerCase()) >= 0;
      });

      return data;
    },
    listUserWithNoManager() {
      return [{ id: -1, full_name: this.$t("empty_manager") }, ...this.userListOnlyName];
    }
  },
  beforeMount() {
    this.loading = true;
  },
  async mounted() {
    if (!this.storeLoaded) await this.fetch();
    this.checkRouter();
    this.configColumns();
    this.fetchAssetByJoin();
    this.getListUserOnlyName();
    this.loading = false;
  },
  beforeDestroy() {
    ["asset_type", "purpose", "manager", "status"].forEach(key => {
      this.setHeaderFilter({ key, value: null });
    });
  },
  methods: {
    ...mapActions({
      bindManagerById: "modules/asset-management/bindManagerById",
      fetch: "modules/asset-management/fetch",
      toggleDeviceAction: "modules/asset-management/toggleDevice",
      fetchAssetByJoin: "modules/asset-management/fetchAssetByJoin",
      changeFilterObject: "modules/asset-management/changeFilterObject",
      setHeaderFilter: "modules/asset-management/setHeaderFilter",
      getListUserOnlyName: "modules/user-management/getListUserOnlyName"
    }),
    onChangeFilter(key, value) {
      this.changeFilterObject({ key, value });
    },
    setColorHeader(key) {
      if (this.filterObject[key] && this.filterObject[key].length) {
        let header = this.filterObject.header[key];
        if (!header) {
          header = document.querySelector(`th[key="${key}"]`);
          this.setHeaderFilter({ key, value: header });
        }

        header.classList.add("header-filtered");
      } else {
        let header = this.filterObject.header[key];
        if (header) {
          header.classList.remove("header-filtered");
          this.setHeaderFilter({ key, value: null });
        }
      }
    },
    printItemSelected() {
      this.loading = true;
      let listIdAsset = _.cloneDeep(this.selectedRowKeys).map(o => o); // list id of asset

      let listPrint = _.map(this.listAsset, o =>
        listIdAsset.indexOf(o.id) >= 0 ? { name: o.asset_code, code: o.qr_code } : null
      );
      listPrint = _.filter(listPrint, o => o);

      this.$router.push({
        name: "asset-management-print",
        params: { message: listPrint }
      });

      this.selectedRowKeys = [];
      this.loading = false;
    },
    exportItemSelected() {
      this.$router.push({
        name: "asset-management-export",
        params: { message: this.selectedRowKeys }
      });
      this.selectedRowKeys = [];
    },
    async onBind(e, index) {
      this.$refs[`bind-cell-${index}`].loading = true;
      const data = await this.bindManagerById({
        manager_id: e.manager_id,
        id: e.record.id,
        asset_code: e.record.asset_code
      });

      if (data.status === 200) {
        this.fetchAssetByJoin();
        this.$notification.success({
          message: "Bind to new Manager",
          description: "Bind to new Manager",
          duration: 2.5
        });
      } else {
        this.$notification.error({
          message: data.data.message || "",
          description: data.data.message || "",
          duration: 2.5
        });
      }
      this.$refs[`bind-cell-${index}`].loading = false;
    },
    onChangeToggleColumn(cols) {
      this.currentColumns = cols;
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    handleTableChange(pagination) {
      this.pagination = pagination;
    },
    tagAsset(name) {
      let index = _.findIndex(this.listAssetType, o => o.asset_type_name == name) % this.listTagColor.length;
      return this.listTagColor[index];
    },
    tagPurpose(name) {
      let index = _.findIndex(this.listPurpose, item => item.name == name) % this.listTagColor.length;
      return this.listTagColor[index];
    },
    checkRouter() {
      if (this.$route.params) {
        const { message } = this.$route.params;
        if (message) {
          this.$notification.success({
            message: message,
            description: message,
            duration: 2.5
          });
        }
      }
    },
    goToAdd() {
      this.$router.push("/asset-management/add");
    },
    goToUserDetail(userId) {
      this.$router.push(`/asset-management/${userId}`);
    },
    goToQRScanner() {
      this.$router.push("/asset-management/QrScanner");
    },
    configColumns() {
      let self = this;
      this.columns.filter(item => {
        switch (item.key) {
          case "manager":
          case "purpose":
          case "status":
          case "asset_type": {
            this.setColorHeader(item.key);
            item.onFilterDropdownVisibleChange = visible => {
              if (!visible) this.setColorHeader(item.key);
              if (visible) {
                setTimeout(() => this.searchForcus.focus(), 0);
              }
            };
            break;
          }

          case "company": {
            item.filters = _.map(self.listCompany, o => ({ text: o.name, value: o.name }));
            break;
          }
        }
        return true;
      });
    },
    filterOptionForManager(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
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
