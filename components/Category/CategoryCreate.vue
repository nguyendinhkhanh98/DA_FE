<template>
  <div class="create-item">
    <div class="ant-row title" @click="expand = !expand">
      <a-icon type="plus" />
      <label>{{ title }}</label>
    </div>

    <a-col class="task-item-content mt-3 ml-5" v-show="expand">
      <a-form :form="form">
        <a-form-item :label="$t('name')" v-bind="formItemLayout">
          <a-input
            v-decorator="[
              'name',
              { rules: [{ required: true, message: $t('default_error_empty') + ' ' + $t('name') }] }
            ]"
            :placeholder="$t('name')"
          />
        </a-form-item>

        <a-form-item :label="$t('description')" v-bind="formItemLayout">
          <a-input
            v-decorator="[
              'description',
              { rules: [{ required: false, message: $t('default_error_empty') + ' ' + $t('description') }] }
            ]"
            :placeholder="$t('description')"
          />
        </a-form-item>
      </a-form>

      <a-row class="actions mt-3">
        <a-button type="primary" :loading="loading" @click="handleSubmit">
          {{ $t("create") }}
        </a-button>

        <a-button @click="expand = false">
          {{ $t("cancel") }}
        </a-button>
      </a-row>
    </a-col>
  </div>
</template>

<script>
export default {
  name: "CreateCategory",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "leader"]
  },
  props: {
    title: String,
    size: String
  },
  data() {
    return {
      expand: false,
      form: this.$form.createForm(this, {
        name: `Form create ${this.title}`
      }),
      formItemLayoutSmall: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      formItemLayoutLarge: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      loading: false
    };
  },
  computed: {
    formItemLayout() {
      return this.size.localeCompare("large") != 0 ? this.formItemLayoutLarge : this.formItemLayoutSmall;
    }
  },
  methods: {
    handleSubmit() {
      this.form.validateFields(async (err, values) => {
        if (err) return;
        this.$emit("create", values);
        this.form.resetFields();
        this.expand = false;
      });
    }
  }
};
</script>

<style lang="less">
.create-item {
  .title {
    &:hover {
      background-color: #00152938;
      border-radius: 2px;
    }

    & * {
      cursor: pointer;
    }

    width: fit-content;
  }
}
</style>

<style lang="less" scoped>
.actions {
  direction: rtl;
}
</style>
