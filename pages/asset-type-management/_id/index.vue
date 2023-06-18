<template>
  <div>
    <a-card class="shadow">
      <h1>{{ isAdd ? $t("add_asset_type") : nameAsset }}</h1>
      <a-row>
        <a-col v-bind="wrapperContainerCol">
          <a-form :form="form" @submit.prevent="onSubmit">
            <a-form-item
              :label="$t('asset_type_code')"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :colon="false"
              :required="true"
            >
              <a-auto-complete
                class="global-search"
                placeholder="Search asset type code"
                allowClear
                option-label-prop="title"
                @search="e => (keyFilterCode = e)"
                v-decorator="[
                  'asset_type_code',
                  { rules: [{ required: true, message: $t('asset_type_code') + ' ' + $t('default_error_empty') }] }
                ]"
              >
                <template slot="dataSource">
                  <a-select-option
                    v-for="item in filterCode"
                    :key="item.asset_type_code"
                    :title="item.asset_type_code"
                    class="select_item"
                  >
                    <span className="global-search-item-count">{{ item.asset_type_code }}</span>
                  </a-select-option>
                </template>
              </a-auto-complete>
            </a-form-item>

            <a-form-item
              :label="$t('asset_type_name')"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :colon="false"
              :required="true"
            >
              <a-auto-complete
                class="global-search"
                placeholder="Search asset type name"
                allowClear
                option-label-prop="title"
                @search="e => (keyFilterName = e)"
                v-decorator="[
                  'asset_type_name',
                  { rules: [{ required: true, message: $t('asset_type_name') + ' ' + $t('default_error_empty') }] }
                ]"
              >
                <template slot="dataSource">
                  <a-select-option
                    v-for="item in filterName"
                    :key="item.asset_type_name"
                    :title="item.asset_type_name"
                    class="select_item"
                  >
                    <span className="global-search-item-count">{{ item.asset_type_name }}</span>
                  </a-select-option>
                </template>
              </a-auto-complete>
            </a-form-item>

            <a-form-item :label="$t('description')" :label-col="labelCol" :wrapper-col="wrapperCol" :colon="false">
              <a-textarea
                class="global-search"
                placeholder="Type description"
                allowClear
                :rows="4"
                :auto-size="{ minRows: 3, maxRows: 5 }"
                option-label-prop="title"
                v-decorator="[
                  'description',
                  { rules: [{ required: false, message: $t('description') + ' ' + $t('default_error_empty') }] }
                ]"
              />
            </a-form-item>

            <a-row class="mt-4">
              <a-col class="text-center">
                <a-button type="primary" html-type="submit" :loading="loadingSubmit">
                  {{ isAdd ? $t("add_asset_type") : $t("submit") }}
                </a-button>

                <a-button v-if="!isAdd" type="danger" ghost class="ml-2" :loading="loadingDel" @click="onDelete">
                  {{ $t("delete") }}
                </a-button>
              </a-col>
            </a-row>
          </a-form>
        </a-col>
      </a-row>
    </a-card>
    <DetailAssetType class="mt-3" v-if="!isAdd" :typeId="assetTypeId" />
  </div>
</template>

<script>
import _ from "lodash";
import * as CONST from "@/constants/index.js";
import DetailAssetType from "@/components/AssetManagement/DetailAssetType.vue";

import { mapState, mapActions } from "vuex";
import { columns } from "../const";

export default {
  name: "detail-asset-type-management",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin", "accountant"]
  },
  components: { DetailAssetType },
  data() {
    return {
      form: this.$form.createForm(this, { name: "Form add/edit asset type" }),
      isAdd: true,
      nameAsset: null,
      loadingSubmit: false,
      assetTypeId: null,
      loadingDel: false,
      keyFilterCode: "",
      keyFilterName: "",
      labelCol: CONST.LABEL_COLUMN_SINGLE,
      wrapperCol: CONST.WRAPPER_COLUMN_SINGLE,
      wrapperContainerCol: CONST.WRAPPER_COLUMN_CONTAINER_SINGLE,
      actionCol: CONST.ACTION_COLUMN_SINGLE
    };
  },
  computed: {
    ...mapState({
      listCompany: state => state.modules["asset-management"].listCompany,
      listPurpose: state => state.modules["asset-management"].listPurpose,
      listAssetType: state => state.modules["asset-management"].listAssetType,
      listUser: state => state.modules["asset-management"].listUser,
      storeLoaded: state => state.modules["asset-management"].storeLoaded
    }),
    filterCode() {
      let string = new String(this.keyFilterCode);
      let stringSearch = string.split("").join("([a-zA-Z0-9_]*)");

      let data = this.listAssetType.filter(function(row) {
        let regex = new RegExp(stringSearch, "g");
        return regex.test(row.asset_type_code);
      });

      return data;
    },
    filterName() {
      let string = new String(this.keyFilterName);
      let stringSearch = string.split("").join("([a-zA-Z0-9_]*)");

      let data = this.listAssetType.filter(function(row) {
        let regex = new RegExp(stringSearch, "g");
        return regex.test(row.asset_type_name);
      });

      return data;
    }
  },
  created() {
    this.isAdd = this.$route.params.id == "add" ? true : false;
    this.assetTypeId = this.isAdd ? "add" : parseInt(this.$route.params.id);
  },
  async mounted() {
    if (!this.storeLoaded) await this.fetch();

    if (!this.isAdd) {
      let item = _.cloneDeep(this.listAssetType.find(o => o.id == this.assetTypeId));
      item = _.pick(item, ["asset_type_code", "asset_type_name", "description"]);
      this.nameAsset = item.asset_type_name;

      this.form.setFieldsValue({ ...item });
    }
  },
  methods: {
    ...mapActions({
      createAssetType: "modules/asset-management/createAssetType",
      updateAssetTypeByCode: "modules/asset-management/updateAssetTypeByCode",
      deleteAssetType: "modules/asset-management/deleteAssetType",
      fetch: "modules/asset-management/fetch"
    }),
    async onSubmit() {
      let value = null;
      this.form.validateFields((err, values) => {
        if (!err) {
          value = { ...values, id: this.assetTypeId };
        }
      });

      if (value != null) {
        this.loadingSubmit = true;
        let data;
        if (this.isAdd) {
          data = await this.createAssetType(value);
        } else {
          data = await this.updateAssetTypeByCode(value);
        }
        if (data.status === 200) {
          this.$router.push({
            name: "asset-type-management",
            params: { message: data.data.message }
          });
        } else {
          this.$notification.error({
            message: data.data.message || data.data.errors[0].msg,
            description: data.data.message || data.data.errors[0].msg,
            duration: 2.5
          });
        }
        this.loadingSubmit = false;
      }
    },
    onDelete() {
      const self = this;
      this.$confirm({
        title: this.$t("are_you_sure_to_delete"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          let item = _.find(self.listAssetType, o => o.id == self.assetTypeId);
          self.deleteAssetTypeAPI(item);
        },
        onCancel() {}
      });
    },
    async deleteAssetTypeAPI(item) {
      this.loadingDel = true;
      const data = await this.deleteAssetType(item);
      if (data.status === 200) {
        this.$router.push({
          name: "asset-type-management",
          params: { message: data.data.message }
        });
      } else {
        console.log("failed");
        this.$notification.error({
          message: data.data.message,
          description: data.data.message,
          duration: 2.5
        });
      }

      this.loadingDel = false;
    }
  }
};
</script>

<style lang="less" scoped>
button {
  margin: 2px;
}
</style>
