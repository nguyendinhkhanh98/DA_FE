<template>
  <div class="mr-1">
    <a-tooltip placement="top">
      <template slot="title">
        <span>{{ $t("create_period") }}</span>
      </template>

      <a-button type="primary" @click="visible = !visible">{{ $t("create_period") }}</a-button>
    </a-tooltip>

    <a-modal v-model="visible" :title="$t('create_period')" @ok="onSubmit" class="modal-period" @cancel="handleCancel">
      <template slot="footer">
        <a-button key="cancel" @click="handleCancel">{{ $t("cancel") }}</a-button>
        <a-button :loading="loading" key="submit" type="primary" @click="onSubmit">{{ $t("create") }}</a-button>
      </template>

      <a-form :form="form">
        <a-form-item :label="$t('period_name')">
          <a-input
            :placeholder="$t('place_holder_period_name')"
            v-decorator="[
              'name',
              { rules: [{ required: true, message: `${$t('default_error_empty')} ${$t('period_name')}` }] }
            ]"
          />
        </a-form-item>

        <a-row>
          <a-col :span="12">
            <a-form-item :label="$t('started_date')">
              <a-date-picker
                class="date-picker-custom"
                v-decorator="[
                  'start_date',
                  { rules: [{ required: true, message: `${$t('default_error_empty')} ${$t('started_date')}` }] }
                ]"
                :format="dateFormat"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item :label="$t('end_date')">
              <a-date-picker
                class="date-picker-custom"
                v-decorator="[
                  'end_date',
                  { rules: [{ required: true, message: `${$t('default_error_empty')} ${$t('end_date')}` }] }
                ]"
                :format="dateFormat"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <a-form-item :label="$t('description')">
          <a-input
            :placeholder="$t('place_holder_description')"
            v-decorator="[
              'description',
              { rules: [{ required: false, message: `${$t('default_error_empty')} ${$t('description')}` }] }
            ]"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState, mapActions } from "vuex";
export default {
  name: "CreatePeriod",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "leader"]
  },
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this, {
        name: "Create period"
      }),
      dateFormat: CONST.DATE_FORMAT,
      loading: false
    };
  },
  methods: {
    ...mapActions({
      CreateNewPeriod: "modules/skill-set/CreateNewPeriod"
    }),
    onSubmit() {
      this.form.validateFields(async (err, values) => {
        if (err) return;

        let data = {
          name: values.name,
          start_date: values.start_date.format(this.dateFormat),
          end_date: values.end_date.format(this.dateFormat),
          description: values.description || null
        };
        this.loading = true;
        let result = await this.CreateNewPeriod(data);
        this.loading = false;
        if (result.success) {
          this.visible = false;
          this.form.resetFields();
          this.$notification.success({
            message: result.message,
            description: result.message,
            duration: 2.5
          });
        } else {
          this.$notification.error({
            message: "Đã xảy ra lỗi",
            description: "Kỳ đánh giá này đã tồn tại",
            duration: 2.5
          });
        }
      });
    },
    handleCancel() {
      this.form.resetFields();
      this.visible = false;
    }
  }
};
</script>

<style lang="less">
.modal-period {
  .ant-modal {
    top: 50px;
  }

  .date-picker-custom {
    width: 95%;
  }
}
</style>
