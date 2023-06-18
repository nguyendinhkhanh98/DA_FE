<template>
  <div class="change-status">
    <span :class="[size == 'large' ? 'title-large' : 'title-small']">
      <a-tag @click="visible = !visible" :color="color">
        <a-icon type="edit" />
        {{ record.status }}
      </a-tag>
    </span>

    <a-modal
      v-model="visible"
      :title="$t('change_status')"
      :okButtonProps="{ props: { loading: loading } }"
      @ok="obAssign"
    >
      <a-form :form="form">
        <a-form-item :label="$t('status')">
          <a-select
            :placeholder="$t('status')"
            v-decorator="[
              'status',
              {
                initialValue: record.status_id,
                rules: [{ required: true, message: `${$t('status')} ${$t('default_error_empty')}` }]
              }
            ]"
          >
            <a-select-option v-for="item in filterStatus" :key="item.id" :value="item.id">{{
              item.name
            }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item :label="$t('description')">
          <a-textarea
            :placeholder="$t('description')"
            v-decorator="[
              'comment',
              {
                initialValue: record.status_comment,
                rules: [{ required: false, message: $t('description') + ' ' + $t('default_error_empty') }]
              }
            ]"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "ChangeStatus",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  props: {
    record: Object,
    size: {
      type: String,
      default: "large"
    }
  },
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this, {
        name: "Change Status"
      }),
      loading: false
    };
  },
  computed: {
    ...mapState({
      listStatus: state => state.modules["asset-management"].listStatus
    }),
    filterStatus() {
      return this.listStatus.filter(o => o.id != 5 && o.id != 6);
    },
    color() {
      if (this.record && this.record.status) {
        return this.record.status_id == 2 ? "green" : this.record.status_id == 3 ? "#ffd36b" : "#4b5d67";
      } else return "green";
    }
  },
  methods: {
    ...mapActions({
      fetch: "modules/asset-management/fetch",
      changeStatus: "modules/asset-management/changeStatus"
    }),
    obAssign(e) {
      const self = this;
      this.form.validateFields(async (err, values) => {
        if (!err && (this.record.status_comment != values.comment || this.record.status_id != values.status)) {
          let param = {
            status_id: values.status,
            comment: values.comment || "",
            id: this.record.id
          };
          this.loading = true;
          const data = await this.changeStatus(param);
          this.loading = false;
          this.visible = false;

          if (data.status === 200) {
            this.$emit("FetchStatus", param);
            this.$notification.success({
              message: data.data.message,
              description: data.data.message,
              duration: 2.5
            });
          } else {
            this.$notification.error({
              message: data.data.message,
              description: data.data.message,
              duration: 2.5
            });
          }
        } else {
          this.$notification.error({
            message: "Cannot change status",
            description: "Data duplicate",
            duration: 2.5
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.change-status {
  display: inline-block;
  position: relative;
  width: fit-content;
  height: 100%;

  span.title-large {
    color: black;
    & span {
      line-height: normal;
      margin-left: 20px;
      cursor: pointer;
    }
    @media (max-width: 767px) {
      font-size: 5vw;
      & span {
        font-size: 5vw;
      }
    }

    @media (min-width: 768px) {
      @width: calc(1.5vw + 1px);
      font-size: @width;
      & span {
        font-size: @width;
      }
    }
  }

  span.title-small {
    color: black;
    & span {
      line-height: normal;
      margin-left: 20px;
      cursor: pointer;
    }
  }
}
</style>
