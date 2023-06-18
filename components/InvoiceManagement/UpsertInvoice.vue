<template>
  <div style="display: inline-block">
    <span>
      <a-tooltip :title="mode == 'update' ? $t('edit') : $t('create')">
        <a-button @click="visible = !visible" :icon="mode == 'update' ? 'edit' : 'plus'" type="primary">{{
          mode == "update" ? "" : $t("create")
        }}</a-button>
      </a-tooltip>
    </span>

    <a-modal
      v-model="visible"
      :title="mode == 'update' ? $t('update_invoice') : $t('create_invoice')"
      :maskClosable="false"
      @cancel="handleResetForm"
    >
      <template slot="footer">
        <a-button key="submit" type="primary" icon="save" :loading="loading" @click="handleSave">
          {{ $t("save") }}
        </a-button>
      </template>

      <a-form-model ref="modal-upsert-invoice" v-bind="formLayout" :model="formInvoice" :rules="getRules()">
        <a-form-model-item :label="$t('name')" prop="name">
          <a-input :placeholder="$t('name')" v-model="formInvoice.name" />
        </a-form-model-item>

        <a-form-model-item :label="$t('invoice_number')" prop="invoice_number">
          <a-input :placeholder="$t('invoice_number')" v-model="formInvoice.invoice_number" />
        </a-form-model-item>

        <a-form-model-item :label="$t('status')" prop="status_id">
          <a-select :placeholder="$t('status')" style="width: 150px" v-model="formInvoice.status_id">
            <a-select-option v-for="(item, index) in listInvoiceStatus" :key="index" :value="item.id">{{
              item.name
            }}</a-select-option>
          </a-select>
        </a-form-model-item>

        <a-form-model-item :label="$t('payment_due_date')" prop="due_date">
          <a-date-picker :format="dateFormat" v-model="formInvoice.due_date" :allowClear="false" />
        </a-form-model-item>

        <a-form-model-item :label="$t('started_date')" prop="start_date">
          <a-date-picker :format="dateFormat" v-model="formInvoice.start_date" :allowClear="false" />
        </a-form-model-item>

        <a-form-model-item :label="$t('end_date')" prop="end_date">
          <a-date-picker :format="dateFormat" v-model="formInvoice.end_date" :allowClear="false" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </div>
</template>

<script>
import * as CONST from "@/constants/index.js";
import { mapState } from "vuex";
export default {
  props: {
    mode: {
      type: String,
      validator: function(value) {
        // The value must match one of these strings
        return ["create", "update"].indexOf(value) !== -1;
      },
      required: true
    },
    record: Object,
    projectName: String
  },
  data() {
    return {
      visible: false,
      formLayout: {
        labelCol: { span: 24 },
        wrapperCol: { span: 24 }
      },
      dateFormat: CONST.DATE_FORMAT,
      formInvoice: {
        id: null,
        name: null,
        start_date: null,
        end_date: null,
        due_date: null,
        status_id: null,
        invoice_number: null
      },
      loading: false
    };
  },
  computed: {
    ...mapState({
      listInvoiceStatus: state => state.modules["invoice-management"].listInvoiceStatus
    })
  },
  created() {
    if (this.mode == "update") this.fillDataUpdate();
    else {
      this.formInvoice.start_date = this.$moment();
      this.formInvoice.status_id = 1;
      this.formInvoice.invoice_number = `${this.projectName.slice(0, 2).toUpperCase()}_${this.$moment().format(
        "YYYYMMDD"
      )}`;
    }
  },
  methods: {
    getRules() {
      const DEFAULT_REQUIRED = this.$t("default_error_empty");
      const validateNonValue = (rule, value, callback) => {
        if (value) return callback();
        else return callback(new Error(DEFAULT_REQUIRED));
      };

      return {
        name: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
        invoice_number: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
        start_date: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }],
        end_date: [{ validator: validateNonValue, required: true, message: DEFAULT_REQUIRED, trigger: "change" }]
      };
    },
    async handleSave() {
      await this.$refs["modal-upsert-invoice"].validate();
      this.$emit(this.mode, this.formInvoice);
    },
    async handleResetForm() {
      await this.$refs["modal-upsert-invoice"].resetFields();
    },
    parseStringToStartDateMoment(stringTime) {
      if (!stringTime) return this.$moment().startOf("day");
      return this.$moment(stringTime, CONST.DATE_FORMAT_AND_TIME).startOf("day");
    },
    parseStringToEndDateMoment(stringTime) {
      if (!stringTime) return this.$moment().endOf("day");
      return this.$moment(stringTime, CONST.DATE_FORMAT_AND_TIME).endOf("day");
    },
    convertToStartDateMoment(date) {
      if (!date) return null;
      return date.startOf("day").clone();
    },
    convertToEndDateMoment(date) {
      if (!date) return null;
      return date.endOf("day").clone();
    },
    fillDataUpdate() {
      this.formInvoice.name = this.record.name;
      this.formInvoice.invoice_number = this.record.invoice_number;
      this.formInvoice.id = this.record.invoice_id;
      this.formInvoice.start_date = this.record.start_date;
      this.formInvoice.end_date = this.record.end_date;
      this.formInvoice.due_date = this.record.due_date;
      const lastHistory = this.record.history.reduce((a, b) => {
        return this.$moment(a.updated_at).isAfter(b.updated_at) ? a : b;
      });
      this.formInvoice.status_id = lastHistory.id;
      if (this.formInvoice.status_id == 3 && !this.record.due_date)
        this.formInvoice.due_date = this.$moment(lastHistory.updated_at)
          .add(31, "days")
          .format(CONST.DATE_FORMAT_AND_TIME);
      if (!this.record.invoice_number)
        this.formInvoice.invoice_number = `${this.projectName.slice(0, 2).toUpperCase()}_${this.$moment().format(
          "YYYYMMDD"
        )}`;
    }
  }
};
</script>

<style lang="less">
.upsert-invoice-modal {
  .ant-modal {
    top: 50px;
    width: 1200px !important;
    max-width: 100% !important;
  }
}
</style>

<style lang="less" scoped>
.plan-status {
  color: #008ffb;
}

.acceptance-status {
  color: #00e396;
}

.payment-confirmed-status {
  color: #feb019;
}
</style>
