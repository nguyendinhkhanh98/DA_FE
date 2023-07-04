<template>
  <div>
    <a-card class="shadow">
      <a-spin :spinning="spinning">
        <span id="title" class="h1">
          <span>{{ isAdd ? $t("add_asset") : nameAsset }}</span>
          <ChangeStatus v-if="!isAdd" :record="thisRecord" @FetchStatus="getAndFillAssetByIdAPI" />
          <a-button type="primary" @click="goBack"><a-icon type="left" /> {{ $t("back") }}</a-button>
        </span>
        <a-row>
          <a-col v-bind="wrapperContainerCol">
            <a-form :form="form" @submit.prevent="onSubmit">
              <a-row v-if="!isAdd">
                <a-col v-bind="actionCol">
                  <div class="qr-code">
                    <img width="150px" src="" alt="QR code" />
                  </div>
                </a-col>
              </a-row>

              <a-form-item :label="$t('asset_type')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
                <a-select
                  show-search
                  :filter-option="filterOption"
                  v-decorator="[
                    'asset_type_id',
                    {
                      initialValue: appendTypeId ? parseInt(appendTypeId) : null,
                      rules: [{ required: true, message: $t('asset_type') + ' ' + $t('default_error_empty') }]
                    }
                  ]"
                >
                  <a-select-option v-for="item of filterListAssetType" :key="item.id" :value="item.id">
                    {{ item.asset_type_name }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item :label="$t('asset_info')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
                <a-input
                  v-decorator="[
                    'asset_info',
                    { rules: [{ required: false, message: $t('asset_info') + ' ' + $t('default_error_empty') }] }
                  ]"
                />
              </a-form-item>

              <a-form-item :label="$t('purpose_id')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
                <a-auto-complete
                  class="global-search"
                  placeholder="Search purpose"
                  allowClear
                  option-label-prop="title"
                  @search="
                    e => {
                      keyFilterPurpose = e;
                    }
                  "
                  v-decorator="[
                    'purpose_id',
                    { rules: [{ required: true, message: $t('purpose_id') + ' ' + $t('default_error_empty') }] }
                  ]"
                >
                  <template slot="dataSource">
                    <a-select-option
                      v-for="item in filterPurpose"
                      :key="item.id.toString()"
                      :title="item.name"
                      class="select_item"
                    >
                      <span className="global-search-item-count">{{ item.name }}</span>
                    </a-select-option>
                  </template>
                </a-auto-complete>
              </a-form-item>

              <a-form-item :label="$t('manager_id')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
                <a-input
                  class="global-search"
                  placeholder="Search Manager"
                  allowClear
                  option-label-prop="title"
                  v-decorator="[
                    'manager_id',
                    {
                      rules: [{ required: false, message: $t('manager_id') + ' ' + $t('default_error_empty') }]
                    }
                  ]"
                  disabled
                >
                </a-input>
              </a-form-item>

              <a-form-item :label="$t('company_id')" :label-col="labelCol" :wrapper-col="wrapperCol">
                <a-select
                  v-decorator="[
                    'company_id',
                    {
                      initialValue: 1,
                      rules: [{ required: true, message: $t('company_id') + ' ' + $t('default_error_empty') }]
                    }
                  ]"
                >
                  <a-select-option v-for="item of listCompany" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>

              <a-form-item :label="$t('note')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
                <a-textarea
                  :rows="5"
                  v-decorator="[
                    'note',
                    { rules: [{ required: false, message: $t('note') + ' ' + $t('default_error_empty') }] }
                  ]"
                />
              </a-form-item>

              <a-form-item :label="$t('buy_date')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
                <a-date-picker
                  v-decorator="[
                    'buy_date',
                    { rules: [{ required: false, message: $t('buy_date') + ' ' + $t('default_error_empty') }] }
                  ]"
                  :format="dateFormat"
                >
                  <template slot="dateRender" slot-scope="current, today">
                    <div class="ant-calendar-date" :style="getCurrentStyle(current, today)">
                      {{ current.date() }}
                    </div>
                  </template>
                </a-date-picker>
              </a-form-item>

              <a-row class="mt-4">
                <a-col class="text-center">
                  <span class="action-footer">
                    <span class="footer-1">
                      <a-button type="primary" html-type="submit" :loading="loadingSubmit">
                        {{ isAdd ? $t("add_asset") : $t("submit") }}
                      </a-button>
                      <bind v-if="!isAdd" :type="'assign'" :record="thisRecord" @BindManager="onBind" />
                    </span>

                    <a-button
                      class="footer-2"
                      v-if="!isAdd"
                      type="danger"
                      ghost
                      :loading="loadingDel"
                      @click="onDelete"
                    >
                      {{ $t("delete") }}
                    </a-button>
                  </span>
                </a-col>
              </a-row>
            </a-form>
          </a-col>
        </a-row>
      </a-spin>
    </a-card>
    <AssetHistory class="mt-3" v-if="!isAdd" :thisRecord="thisRecord" />
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import * as CONST from "@/constants/index.js";

import Bind from "@/components/AssetManagement/AssignAsset.vue";
import ChangeStatus from "@/components/AssetManagement/ChangeStatus.vue";
import AssetHistory from "@/components/AssetManagement/AssetHistory.vue";

import { mapState, mapActions } from "vuex";
import { columns } from "../const";

export default {
  name: "detail-asset-management",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "accountant"]
  },
  components: {
    Bind,
    ChangeStatus,
    AssetHistory
  },
  data() {
    return {
      dateFormat: CONST.DATE_FORMAT,
      userId: null,
      isAdd: true,
      nameAsset: null,
      loadingSubmit: false,
      loadingDel: false,
      keyFilterPurpose: "",
      thisRecord: {},
      form: this.$form.createForm(this, { name: "Form edit/add asset" }),
      spinning: true,
      labelCol: CONST.LABEL_COLUMN_SINGLE,
      wrapperCol: CONST.WRAPPER_COLUMN_SINGLE,
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE
    };
  },
  computed: {
    ...mapState({
      listAsset: state => state.modules["asset-management"].data,
      roleList: state => state.modules["user-management"].roleList,
      listCompany: state => state.modules["asset-management"].listCompany,
      listPurpose: state => state.modules["asset-management"].listPurpose,
      listAssetType: state => state.modules["asset-management"].listAssetType,
      userListOnlyName: state => state.modules["user-management"].userListOnlyName,
      storeLoaded: state => state.modules["asset-management"].storeLoaded,
      appendTypeId: state => state.modules["asset-management"].appendTypeId
    }),
    filterPurpose() {
      let string = new String(this.keyFilterPurpose);
      let stringSearch = string.split("").join("([a-zA-Z0-9_]*)");
      return this.listPurpose.filter(function (row) {
        let regex = new RegExp(stringSearch, "ig");
        return regex.test(row.name);
      });
    },
    filterListAssetType() {
      return this.listAssetType.filter(o => !o.delete_flag);
    }
  },
  created() {
    this.spinning = true;
    //find id for vue-ant render column
    if (!this.userId) this.findID();
  },
  async mounted() {
    //because mounted is async
    if (!this.userId) this.findID();
    let promises = [];

    if (!this.storeLoaded) promises.push(this.fetch());
    if (!this.isAdd && this.thisRecord && this.userId) promises.push(this.getAndFillAssetByIdAPI());
    if (!this.userListOnlyName.length) promises.push(this.getListUserOnlyName());
    await Promise.all(promises);

    this.spinning = false;
  },
  methods: {
    ...mapActions({
      fetchAssetType: "modules/asset-management/fetchAssetType",
      fetchUsers: "modules/asset-management/fetchUsers",
      fetchPurpose: "modules/asset-management/fetchPurpose",
      fetchCompany: "modules/asset-management/fetchCompany",
      createAsset: "modules/asset-management/createAsset",
      updateAssetById: "modules/asset-management/updateAssetById",
      deleteAssetById: "modules/asset-management/deleteAssetById",
      bindManagerById: "modules/asset-management/bindManagerById",
      fetch: "modules/asset-management/fetch",
      getAssetByID: "modules/asset-management/getAssetByID",
      getListUserOnlyName: "modules/user-management/getListUserOnlyName"
    }),
    onDelete() {
      const emit = this;
      this.$confirm({
        title: this.$t("are_you_sure_to_delete"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          emit.deleteAssetByIdAPI();
        },
        onCancel() {}
      });
    },
    async onBind(e) {
      const data = await this.bindManagerById({
        manager_id: e.manager_id,
        id: e.record.id,
        asset_code: e.record.asset_code
      });

      if (data.status === 200) {
        this.$router.push({
          name: "asset-management",
          params: { message: "Bind to new Manager" }
        });
      } else {
        this.$notification.error({
          message: data.data.message,
          description: data.data.message,
          duration: 2.5
        });
      }
    },
    async deleteAssetByIdAPI() {
      this.loadingDel = true;
      let item = _.find(this.listAsset, o => o.id == this.userId);
      const data = await this.deleteAssetById(item);
      this.loadingDel = false;
      if (data.status === 200) {
        this.$router.push({
          name: "asset-management",
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
    async onSubmit() {
      let value = null;
      let fields = ["asset_type_id", "asset_info", "company_id", "note", "purpose_id", "buy_date"];

      this.form.validateFields(fields, (err, values) => {
        if (!err) {
          value = { ...values };
          for (const key in value) {
            value[key] = value[key] || "";
          }
          // value.buy_date = value.buy_date.format("L") + " " + value.buy_date.format("LTS");
          value.buy_date = value.buy_date
        }
      });

      if (value != null) {
        this.loadingSubmit = true;
        let data;
        if (this.isAdd) {
          data = await this.createAsset(value);
        } else {
          value.id = this.thisRecord.id;
          data = await this.updateAssetById(value);
        }
        this.loadingSubmit = false;

        if (data.status === 200) {
          let options = this.isAdd
            ? {
                path: `/asset-management/${data.data.id}`,
                params: { message: data.data.message }
              }
            : {
                path: `/asset-management`,
                params: { message: data.data.message }
              };
          this.$router.push(options);
        } else {
          this.$notification.error({
            message: data.data.message || data.data.errors[0].msg,
            description: data.data.message || data.data.errors[0].msg,
            duration: 2.5
          });
        }
      }
    },
    async getAndFillAssetByIdAPI() {
      let data = await this.getAssetByID(this.userId);
      this.thisRecord = data;

      let source = _.pick(data, ["asset_type_id", "asset_info", "company_id", "note", "purpose_id", "buy_date"]);
      source.buy_date = moment(source.buy_date);
      source.purpose_id = source.purpose_id.toString();
      source.manager_id = this.mapUser(data.manager_id);

      let imageQR = document.querySelector(".shadow .qr-code img");
      imageQR.src = data.qr_code;

      this.form.setFieldsValue({ ...source });
      this.nameAsset = data.asset_code;
    },
    findID() {
      let pathName = location.pathname;
      let paths = _.filter(pathName.split("/"), o => o);

      this.userId = this.$route.params.id || paths[1];
      this.isAdd = this.userId === "add" ? true : false;
    },
    mapUser(id) {
      let item = _.find(this.userListOnlyName, o => o.id == id);
      return item ? item.full_name : this.$t("empty_manager");
    },
    getCurrentStyle(current, today) {
      const style = {};
      if (current.date() === 1) {
        style.border = "1px solid #1890ff";
        style.borderRadius = "50%";
      }
      return style;
    },
    goBack() {
      this.$router.go(-1);
    },
    filterOption(input, option) {
      let string = new String(input);
      let stringSearch = string.split("").join("([a-zA-Z0-9_]*)");
      let regex = new RegExp(stringSearch, "ig");
      return regex.test(option.componentOptions.children[0].text);
    }
  }
};
</script>

<style lang="less" scoped>
button {
  margin: 2px;
}

.shadow {
  span#title {
    button {
      cursor: pointer;
      border: 0px;
      float: right;
      color: white;
      background-color: #022a50;
      border-radius: 5px;
    }
  }

  .action-footer {
    .footer-1 {
      display: inline-flex;
    }
    @media (max-width: 575px) {
      display: block;
      text-align: center;
      text-align: -webkit-center;
      .footer-2 {
        display: block;
      }
    }

    @media (min-width: 576px) {
      display: inline-block;
      .footer-2 {
        display: inline-block;
      }
    }
  }

  .qr-code {
    width: 100%;
    margin: 10px 0px;
  }
}
</style>
