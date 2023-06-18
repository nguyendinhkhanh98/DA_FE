<template>
  <div class="create-item">
    <div class="ant-row title" @click="expand = !expand">
      <a-icon type="plus" />
      <label>{{ title }}</label>
    </div>

    <a-col class="task-item-content mt-3 ml-5" v-show="expand">
      <a-form :form="form" v-bind="formItemLayout">
        <a-form-item :label="$t('name')">
          <a-input
            v-decorator="[
              'name',
              { rules: [{ required: true, message: $t('default_error_empty') + ' ' + $t('name') }] }
            ]"
            :placeholder="$t('name')"
          />
        </a-form-item>

        <a-form-item :label="$t('description')">
          <a-input
            v-decorator="[
              'description',
              { rules: [{ required: false, message: $t('default_error_empty') + ' ' + $t('description') }] }
            ]"
            :placeholder="$t('description')"
          />
        </a-form-item>

        <a-form-item :label="$t('category')">
          <a-select
            size="large"
            show-search
            option-filter-prop="children"
            :filter-option="filterOption"
            v-decorator="[
              'category_id',
              { rules: [{ required: false, message: $t('default_error_empty') + ' ' + $t('category') }] }
            ]"
          >
            <template v-for="category in listCategory">
              <a-select-option :key="category.category_id">
                {{ category.category }}
              </a-select-option>
            </template>
          </a-select>
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
  name: "SkillCreate",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "leader"]
  },
  props: {
    title: String,
    size: String,
    listCategory: Array,
    loading: Boolean
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
      }
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
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
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
