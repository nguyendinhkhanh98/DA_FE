<template>
  <div class="bind-cell">
    <a-tooltip placement="top">
      <template slot="title">
        <span>{{ $t("bind_manager") }}</span>
      </template>
      <div v-if="type != 'cell'">
        <a-button type="primary" @click="visible = !visible">{{ $t("bind_manager") }}</a-button>
      </div>
      <div v-else class="editable-cell-text-wrapper">
        {{ record.manager }}
        <a-icon type="carry-out" class="editable-cell-icon" @click="visible = !visible" size="large" />
      </div>
    </a-tooltip>

    <a-modal
      v-model="visible"
      :title="$t('bind_manager')"
      :okButtonProps="{ props: { loading: loading } }"
      @ok="obAssign"
    >
      <a-form :form="form">
        <a-form-item :label="$t('manager_id')">
          <a-select
            :placeholder="$t('manager_id_empty')"
            :filterOption="filterOptionForManager"
            show-search
            v-decorator="[
              'manager_id',
              {
                initialValue: getId,
                rules: [{ required: true, message: $t('manager_id_empty') }]
              }
            ]"
          >
            <a-select-option v-for="(item, index) in listUser" :key="index.id" :value="item.id">{{
              item.full_name
            }}</a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  name: "AssignAsset",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  props: {
    type: String,
    record: Object
  },
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this, {
        name: "Bind manager"
      }),
      loading: false
    };
  },
  computed: {
    ...mapState({
      userListOnlyName: state => state.modules["user-management"].userListOnlyName
    }),
    listUser() {
      return [{ id: -1, full_name: this.$t("empty_manager") }, ...this.userListOnlyName];
    },
    getId() {
      return this.record && this.record.manager_id ? this.record.manager_id : -1;
    }
  },
  methods: {
    ...mapActions({
      getAssetByID: "modules/asset-management/getAssetByID"
    }),
    bindManager(e, values) {
      e.preventDefault();
      this.$emit("BindManager", { record: this.record, ...values });
      this.form.resetFields();
      this.visible = false;
    },
    obAssign(e) {
      const self = this;
      this.form.validateFields((err, values) => {
        if (!err) {
          if (this.record.manager_id == values.manager_id) {
            this.$notification.error({
              message: "Value duplicate",
              description: "Value duplicate",
              duration: 2.5
            });
          } else {
            this.$confirm({
              title:
                values.manager_id > 0
                  ? this.$t("are_you_sure_assign_manager")
                  : this.$t("empty_are_you_sure_assign_manager"),
              okText: this.$t("yes"),
              cancelText: this.$t("no"),
              zIndex: 10000,
              centered: true,
              onOk() {
                self.bindManager(e, values);
              },
              onCancel() {}
            });
          }
        }
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
.bind-cell {
  display: inline-block;
  position: relative;
  width: 100%;
  margin-top: 2px;
}

.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}

.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}

.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}

.editable-cell-icon {
  line-height: 18px;
  display: inline-block;
}

.editable-cell-icon-check {
  line-height: 28px;
}
</style>
