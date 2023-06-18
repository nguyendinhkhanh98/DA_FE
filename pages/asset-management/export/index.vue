<template>
  <a-card class="shadow">
    <div class="export">
      <div class="container">
        <a-button type="primary" :loading="exporting" @click="exportToFile">{{ $t("export") }}</a-button>
      </div>

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

        <template slot="no" slot-scope="text, record, index">{{ index + 1 }} </template>

        <template slot="created_at" slot-scope="text">
          {{ mapTime(text) }}
        </template>

        <template slot="buy_date" slot-scope="text">
          {{ mapTime(text) }}
        </template>
      </a-table>
    </div>
  </a-card>
</template>

<script>
import Excel from "exceljs";
import moment from "moment";
import { columns } from "./const";
import { mapState, mapActions } from "vuex";
import * as CONST from "@/constants/index.js";

export default {
  name: "import",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  data() {
    return {
      columns,
      loading: false,
      listIdAsset: [],
      dataSource: [],
      exporting: false
    };
  },
  computed: {
    ...mapState({
      listAsset: state => state.modules["asset-management"].data,
      storeLoaded: state => state.modules["asset-management"].storeLoaded
    })
  },
  async mounted() {
    this.loading = true;
    if (!this.storeLoaded) await this.fetch();
    this.checkRouter();
    if (this.listIdAsset.length) {
      this.dataSource = _.intersectionBy(this.listAsset, this.listIdAsset, function (item) {
        if (typeof item == "number") return item;
        else return item.id;
      });
    } else this.dataSource = this.listAsset;

    this.loading = false;
  },
  methods: {
    ...mapActions({
      fetch: "modules/asset-management/fetch",
      exportExcel: "modules/asset-management/exportExcel"
    }),
    checkRouter() {
      if (this.$route.params) {
        const { message } = this.$route.params;
        if (message) {
          this.listIdAsset = [...message];
        }
      }
    },
    mapTime(time) {
      moment.locale(this.$i18n.locale);
      return moment(time).format(CONST.DATE_FORMAT_AND_TIME);
    },
    exportToFile() {
      this.exporting = true;
      this.exportExcel(this.listIdAsset)
        .then(response => {
          const fileName = response.headers["content-disposition"].split("=")[1];
          const url = URL.createObjectURL(
            new Blob([response.data], {
              type: "application/vnd.ms-excel"
            })
          );
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          this.exporting = false;
        })
        .catch(error => {
          console.log(error);
          this.exporting = false;
        });
    }
  }
};
</script>
