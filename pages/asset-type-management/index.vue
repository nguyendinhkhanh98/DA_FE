<template>
  <a-card class="shadow">
    <h1>{{ actived ? $t("asset_type_management") : $t("trash") }}</h1>
    <a-row type="flex" align="bottom" justify="space-between">
      <span class="text-bold">{{ $t("total_result") }}: {{ filterListAssetType.length }}</span>
      <span style="float: right">
        <a-button :icon="actived ? 'delete' : 'appstore'" type="primary" ghost @click="actived = !actived">{{
          actived ? $t("trash") : $t("cancel")
        }}</a-button>
        <span v-if="actived">
          <a-button type="primary" @click="handleAdd()">{{ $t("add_asset_type") }}</a-button>
        </span>
        <span v-else>
          <a-button type="primary" :loading="updating" @click="onRestoreAll()">{{ $t("restore_all") }}</a-button>
        </span>
      </span>
    </a-row>

    <a-table
      bordered
      class="mt-1"
      :columns="columns"
      :dataSource="filterListAssetType"
      :loading="loading"
      :rowKey="record => record.id"
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
          v-if="column.dataIndex == `asset_type_name`"
          v-ant-ref="c => (searchForcus = c)"
          ref="selecta"
          :default-value="filterObject.asset_type_name"
          mode="multiple"
          allow-clear
          placeholder="Please type"
          style="width: 200px"
          option-label-prop="label"
          @change="onChangeFilter(column.key, $event)"
        >
          <a-select-option
            v-for="item in listAssetType"
            :key="item.asset_type_code"
            :label="item.asset_type_name"
            :value="`${item.asset_type_name}`"
          >
            {{ item.asset_type_name }}
          </a-select-option>
        </a-select>
      </div>

      <template slot="no" slot-scope="text, record, index"
        >{{ index + 1 + (pagination.current - 1) * pagination.pageSize }}
      </template>

      <a-icon slot="filterIcon" type="search" />

      <template slot="detail" slot-scope="text">
        <span v-if="actived">
          <a-button type="primary" @click="toToAssetTypeDetail(text)">{{ $t("detail") }}</a-button>
        </span>
        <span v-else>
          <a-button type="primary" :loading="updating" @click="onRestore(text)">{{ $t("restore") }}</a-button>
          <a-button type="danger" ghost :loading="updating" @click="onDelete(text)">{{ $t("delete") }}</a-button>
        </span>
      </template>
    </a-table>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { columns } from "./const";
export default {
  name: "asset-type-management",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "asset_admin"]
  },
  data() {
    return {
      columns,
      loading: false,
      actived: true,
      searchForcus: null,
      updating: false,
      pagination: {
        pageSize: 10,
        total: 0,
        current: 1
      }
    };
  },
  computed: {
    ...mapState({
      listAssetType: state => state.modules["asset-management"].listAssetType,
      storeLoaded: state => state.modules["asset-management"].storeLoaded,
      filterObject: state => state.modules["asset-management"].filterObject
    }),
    filterListAssetType() {
      let data = _.cloneDeep(this.listAssetType);

      data = data.filter(o => !this.actived == o.delete_flag);

      data = _.filter(data, o => {
        //filter follow asset type
        let exist = o && this.filterObject.asset_type_name.length;
        return exist ? this.filterObject.asset_type_name.includes(o.asset_type_name) : true;
      });

      return data;
    }
  },
  created() {
    this.configColumns();
  },
  async mounted() {
    if (!this.storeLoaded) await this.fetch();
    this.checkRouter();
  },
  watch: {
    searchForcus() {
      if (this.searchForcus) this.searchForcus.focus();
    }
  },
  beforeDestroy() {
    this.setHeaderFilter({ key: "asset_type_name", value: null });
  },
  methods: {
    ...mapActions({
      deleteAssetType: "modules/asset-management/deleteAssetType",
      restoreAssetType: "modules/asset-management/restoreAssetType",
      restoreAllAssetType: "modules/asset-management/restoreAllAssetType",
      changeFilterObject: "modules/asset-management/changeFilterObject",
      fetch: "modules/asset-management/fetch",
      setHeaderFilter: "modules/asset-management/setHeaderFilter",
      setSorter: "modules/asset-management/setSorter"
    }),
    onChangeFilter(key, value) {
      this.changeFilterObject({ key, value });
    },
    handleTableChange(pagination, filters, sorter) {
      this.pagination = pagination;
      if (sorter) this.setSorter({ key: sorter.field, value: sorter.order });
    },
    onRestoreAll() {
      const self = this;
      if (this.filterListAssetType.length) {
        this.$confirm({
          title: this.$t("are_you_sure_to_restore_all"),
          okText: this.$t("yes"),
          cancelText: this.$t("no"),
          zIndex: 10000,
          centered: true,
          async onOk() {
            self.updating = true;
            await self.restoreAllAssetType();
            self.updating = false;
            self.$notification.success({
              message: "Restored all item",
              description: "Restored all item",
              duration: 2.5
            });
          },
          onCancel() {}
        });
      }
    },
    async onRestore(code) {
      this.updating = true;
      await this.restoreAssetType(code);
      this.updating = false;
      this.$notification.success({
        message: "Restore item success",
        description: "Restore item success",
        duration: 2.5
      });
    },
    onDelete(code) {
      let self = this;
      this.$confirm({
        title: this.$t("are_you_sure_to_delete"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          let item = _.find(self.listAssetType, o => o.id == code);
          self.deleteAssetTypeAPI(item);
        },
        onCancel() {}
      });
    },
    async deleteAssetTypeAPI(item) {
      const data = await this.deleteAssetType(item);
      if (data.status === 200) {
        this.$router.push({
          name: "asset-type-management",
          params: { message: data.data.message }
        });
      } else {
        this.$notification.error({
          message: data.data.message,
          description: data.data.message,
          duration: 2.5
        });
      }
    },
    goToRecleBin() {
      this.$router.push("/asset-type-management/recycle");
    },
    handleAdd() {
      this.$router.push("/asset-type-management/add");
    },
    toToAssetTypeDetail(userId) {
      this.$router.push(`/asset-type-management/${userId}`);
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
    configColumns() {
      let self = this;
      this.columns.filter(item => {
        switch (item.key) {
          case "asset_type_name": {
            self.setColorHeader(item.key);
            item.defaultSortOrder = this.filterObject.sorter[item.key] || null;
            item.onFilterDropdownVisibleChange = visible => {
              if (!visible) self.setColorHeader(item.key);
              if (visible) {
                setTimeout(() => self.searchForcus.focus(), 0);
              }
            };
            break;
          }

          case "count": {
            item.defaultSortOrder = this.filterObject.sorter[item.key] || "desc";
            break;
          }
        }
        return true;
      });
    }
  }
};
</script>

<style lang="less">
.shadow {
  .header-filtered {
    color: blue;
  }

  .filter-column {
    padding: 8px;
    display: flex;
    flex-direction: column;
  }
}
</style>
