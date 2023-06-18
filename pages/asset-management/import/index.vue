<template>
  <a-card class="shadow">
    <div class="print">
      <div class="container">
        <a-upload name="file" :headers="headers" @change="handleChange">
          <a-button> <a-icon type="upload" /> Click to Upload </a-button>
        </a-upload>
        <a-button type="primary" :loading="importing" @click="submitFile">Import</a-button>
      </div>

      <a-table
        bordered
        class="mt-1"
        :columns="currentColumns"
        :dataSource="listAsset"
        :loading="loading"
        :rowKey="record => record.id"
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
      </a-table>
    </div>
  </a-card>
</template>

<script>
import moment, { months } from "moment";
import Excel from "exceljs";
import _ from "lodash";

import { mapState, mapActions } from "vuex";
import { columns } from "./const";

export default {
  name: "import",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  data() {
    return {
      columns,
      currentColumns: columns.filter(item => item.defaultChecked),
      loading: false,
      listAsset: [],
      fieldsIndex: {
        asset_code: 2,
        asset_type: 3,
        asset_info: 4,
        purpose: 5,
        status: 6,
        manager: 7,
        company: 8,
        note: 9,
        buy_date: 10,
        created_at: 11
      },
      convertStatus: true,
      headers: {
        authorization: "authorization-text"
      },
      importing: false
    };
  },
  computed: {
    ...mapState({
      listCompany: state => state.modules["asset-management"].listCompany,
      listUser: state => state.modules["asset-management"].listUser,
      listPurpose: state => state.modules["asset-management"].listPurpose,
      listTagColor: state => state.modules["asset-management"].listTagColor,
      listAssetType: state => state.modules["asset-management"].listAssetType,
      storeLoaded: state => state.modules["asset-management"].storeLoaded,
      userInfo: state => state.modules["asset-management"].userInfo,
      listStatus: state => state.modules["asset-management"].listStatus
    })
  },
  async mounted() {
    if (!this.storeLoaded) await this.fetch();

    this.loading = true;
    this.checkRouter();

    this.loading = false;
  },
  methods: {
    ...mapActions({
      fetch: "modules/asset-management/fetch",
      createAsset: "modules/asset-management/createAsset",
      bindManagerById: "modules/asset-management/bindManagerById"
    }),
    mapTime(time) {
      moment.locale(this.$i18n.locale);
      return `${moment(time).format("L")} ${moment(time).format("LTS")}`;
    },
    mapAssetType(name) {
      let item = _.find(this.listAssetType, o => o.asset_type_name == name);
      if (item) return this.listAssetType.length && item ? item.id : "";
      else {
        this.convertStatus = false;
        this.handleError(new Error(`Cannot found asset_type_id of ${name}`));
      }
    },
    mapPurpose(name) {
      let item = _.find(this.listPurpose, o => o.name == name);
      return this.listPurpose.length && item ? item.id : name;
    },
    mapUser(name) {
      if (!name) return -1;
      let item = _.find(this.listUser, o => o.full_name == name);
      if (item) return this.listUser.length && item ? item.id : -1;
      else {
        this.convertStatus = false;
        this.handleError(new Error(`Cannot found user_id of ${name}`));
      }
    },
    mapCompany(name) {
      let item = _.find(this.listCompany, o => o.name == name);
      if (item) return this.listCompany.length && item ? item.id : "";
      else {
        this.convertStatus = false;
        this.handleError(new Error(`Cannot found company_id of ${name}`));
      }
    },
    mapStatus(name) {
      let item = _.find(this.listStatus, o => o.name == name);
      if (this.listStatus.length && item) return item.id;
      else {
        if (name) {
          this.convertStatus = false;
          this.handleError(new Error(`Cannot found status of ${name}`));
        } else return 1;
      }
    },
    async submitFile() {
      this.importing = true;
      let cloneAsset = _.cloneDeep(this.listAsset);
      // Convert to stand info and throw error if cannot convert
      cloneAsset = _.map(cloneAsset, o => {
        o.asset_type_id = this.mapAssetType(o.asset_type);
        o.purpose_id = this.mapPurpose(o.purpose);
        o.manager_id = this.mapUser(o.manager);
        o.company_id = this.mapCompany(o.company);
        o.status_id = this.mapStatus(o.status);
        return o;
      });
      if (this.convertStatus) {
        for (let i = 0; i < cloneAsset.length; i++) {
          await this.createAsset(cloneAsset[i]);
        }
        this.$router.push("/asset-management");
      } else this.importing = false;
    },
    handleError(error) {
      console.error(error);
      this.$notification.error({
        message: "Data invalid",
        description: error.message,
        duration: 2.5
      });
    },
    handleChange(info) {
      if (info.file.status === "done") {
        this.$message.success(`${info.file.name} file uploaded successfully`);

        //working
        const workbook = new Excel.Workbook();
        const reader = new FileReader();
        reader.readAsArrayBuffer(info.file.originFileObj);
        reader.onload = async () => {
          const buffer = reader.result;
          workbook.xlsx.load(buffer).then(workbook => {
            const worksheet = workbook.worksheets[0];
            this.exelToObject(worksheet);
          });
        };
      } else if (info.file.status === "error") {
        this.$message.error(`${info.file.name} file upload failed.`);
      }
    },
    exelToObject(worksheet) {
      this.listAsset = [];
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber == 1) return;
        let asset = this.getAssetByRow(row.values, rowNumber);
        this.listAsset.push(asset);
      });
    },
    getAssetByRow(rows, id) {
      let asset = {};
      asset.id = id;
      Object.keys(this.fieldsIndex).forEach(field => {
        asset[field] = rows[this.fieldsIndex[field]];
      });
      return asset;
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
    }
  }
};
</script>

<style lang="less" scoped>
.container {
  display: inline-flex;
  .ant-btn {
    margin-left: 5px;
  }
}
</style>
