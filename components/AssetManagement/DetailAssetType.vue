<template>
  <a-card class="shadow">
    <span class="h1">{{ $t("asset_type_name") }}</span>
    <a-row type="flex" align="bottom" justify="space-between">
      <a-col :xs="12" class="text-bold">
        <span>{{ $t("total_result") }}: {{ dataSource.length }}</span>
      </a-col>

      <a-col>
        <a-button type="primary" @click="goToAddAsset">{{ $t("add_asset") }}</a-button>
      </a-col>
    </a-row>
    <a-table
      bordered
      class="mt-1"
      :columns="columns"
      :dataSource="dataSource"
      :rowKey="record => record.id"
      :loading="loading"
      :pagination="false"
      :scroll="{ x: true }"
    >
      <template v-for="column of columns" :slot="column.slots.title">
        {{ $t(column.slots.title) }}
      </template>

      <template slot="asset_code" slot-scope="text, record">
        <a-tag class="pointer" :key="text" :color="tagAsset(record.asset_type)" @click="goToUserDetail(record.id)">
          {{ text }}
        </a-tag>
      </template>

      <template slot="asset_info" slot-scope="text">
        <a-tooltip placement="topLeft">
          <template slot="title">
            <span class="table-data-tooltip">{{ text }}</span>
          </template>
          <p>{{ text }}</p>
        </a-tooltip>
      </template>

      <template slot="purpose" slot-scope="text, record">
        <a-tag class="pointer" :key="text" :color="tagPurpose(record.purpose)">
          {{ text }}
        </a-tag>
      </template>

      <template slot="status_id" slot-scope="text, record">
        <ChangeStatus :size="`small`" :record="record" @FetchStatus="refreshAsset" />
      </template>

      <template slot="manager_id" slot-scope="text">
        {{ mapUser(text) }}
      </template>

      <template slot="company_id" slot-scope="text">
        {{ mapCompany(text) }}
      </template>

      <template slot="detail" slot-scope="text">
        <a-button type="primary" @click="goToUserDetail(text)">{{ $t("detail") }}</a-button>
      </template>
    </a-table>
  </a-card>
</template>

<script>
const columns = [
  {
    slots: { title: "asset_code" },
    dataIndex: "asset_code",
    scopedSlots: { customRender: "asset_code" },
    sorter: (a, b) => (a.asset_code > b.asset_code ? 1 : -1),
    key: "asset_code",
    defaultChecked: true
  },
  {
    slots: { title: "asset_info" },
    dataIndex: "asset_info",
    scopedSlots: { customRender: "asset_info" },
    key: "asset_info",
    width: 100,
    defaultChecked: true
  },
  {
    slots: { title: "purpose_id" },
    dataIndex: "purpose",
    key: "purpose",
    scopedSlots: {
      customRender: "purpose",
      filterDropdown: "filterDropdown",
      filterIcon: "filterIcon"
    },
    sorter: (a, b) => (a.purpose > b.purpose ? 1 : -1),
    defaultChecked: true
  },
  {
    slots: { title: "manager_id" },
    dataIndex: "manager_id",
    scopedSlots: { customRender: "manager_id" },
    key: "manager_id",
    defaultChecked: true
  },
  {
    slots: { title: "status" },
    dataIndex: "status_id",
    scopedSlots: { customRender: "status_id" },
    key: "status_id",
    onFilter: (value, record) => {
      let condition = `^${value}$`;
      let regex = new RegExp(condition);
      return regex.test(record.status_id);
    },
    defaultChecked: true
  },
  {
    slots: { title: "company_id" },
    dataIndex: "company_id",
    scopedSlots: { customRender: "company_id" },
    key: "company_id",
    onFilter: (value, record) => {
      let condition = `^${value}$`;
      let regex = new RegExp(condition);
      return regex.test(record.company_id);
    },
    defaultChecked: false
  },
  {
    slots: { title: "" },
    key: "detail",
    dataIndex: "id",
    scopedSlots: { customRender: "detail" },
    width: 10,
    defaultChecked: true
  }
];

import _ from "lodash";
import moment from "moment";
import ChangeStatus from "@/components/AssetManagement/ChangeStatus.vue";

import { mapState, mapActions } from "vuex";

export default {
  name: "DetailAssetType",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  data() {
    return {
      columns,
      loading: false
    };
  },
  props: {
    typeId: {
      type: Number,
      default: -1
    }
  },
  components: {
    ChangeStatus
  },
  computed: {
    ...mapState({
      listUser: state => state.modules["asset-management"].listUser,
      dataSource: state => state.modules["asset-management"].listAssetByAssetType,
      listStatus: state => state.modules["asset-management"].listStatus,
      listPurpose: state => state.modules["asset-management"].listPurpose,
      listCompany: state => state.modules["asset-management"].listCompany,
      listTagColor: state => state.modules["asset-management"].listTagColor,
      listAssetType: state => state.modules["asset-management"].listAssetType,
      storeLoaded: state => state.modules["asset-management"].storeLoaded
    })
  },
  created() {
    this.loading = true;
    this.fetchAssetByAssetType(this.typeId);
  },
  async mounted() {
    if (!this.storeLoaded) await this.fetch();
    this.loading = false;
  },
  methods: {
    ...mapActions({
      fetch: "modules/asset-management/fetch",
      fetchAssetByAssetType: "modules/asset-management/fetchAssetByAssetType",
      refreshAsset: "modules/asset-management/refreshAsset"
    }),
    tagAsset(name) {
      let index = _.findIndex(this.listAssetType, o => o.asset_type_name == name) % this.listTagColor.length;
      return this.listTagColor[index];
    },
    tagPurpose(name) {
      let index = _.findIndex(this.listPurpose, item => item.name == name) % this.listTagColor.length;
      return this.listTagColor[index];
    },
    mapPurpose(id) {
      let item = _.find(this.listPurpose, o => o.id == id);
      return this.listPurpose.length && item ? item.name : "";
    },
    mapCompany(id) {
      let item = _.find(this.listCompany, o => o.id == id);
      return this.listCompany.length && item ? item.name : "";
    },
    mapUser(id) {
      let item = _.find(this.listUser, o => o.id == id);
      return this.listUser.length && item ? item.full_name : "";
    },
    goToUserDetail(text) {
      this.$router.push(`/asset-management/${text}`);
    },
    goToAddAsset() {
      this.$store.state.modules["asset-management"].appendTypeId = this.typeId;
      this.$router.push(`/asset-management/add`);
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
</style>

<style lang="less" scoped>
button {
  margin: 2px;
}

.shadow {
  .item-status {
    display: flex;
    flex-direction: column;
  }

  .comment {
    color: rgb(179, 169, 169);
  }
}
</style>
