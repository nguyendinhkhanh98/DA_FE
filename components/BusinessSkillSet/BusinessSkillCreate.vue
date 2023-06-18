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

        <a-form-item :label="$t('business_skill_category')">
          <a-select
            size="large"
            show-search
            allow-clear
            option-filter-prop="children"
            :filter-option="filterOption"
            v-decorator="[
              'category_id',
              { rules: [{ required: false, message: $t('default_error_empty') + ' ' + $t('category') }] }
            ]"
          >
            <template v-for="category in listCategory">
              <a-select-option :key="category.category_id">
                {{ category.category_name }}
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
import { mapState } from "vuex";

export default {
  name: "SkillCreate",
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
  watch: {
    expand(newVal, oldVal) {
      if (newVal) {
        this.form.resetFields();
      }
    }
  },
  computed: {
    ...mapState({
      listCategory: state => state.modules["business-skill-category"].listCategory
    }),
    formItemLayout() {
      return this.size.localeCompare("large") != 0 ? this.formItemLayoutLarge : this.formItemLayoutSmall;
    }
  },
  methods: {
    handleSubmit() {
      this.form.validateFields(async (err, values) => {
        if (err) return;
        this.$emit("create-business", values);
        this.form.resetFields();
        this.expand = false;
      });
    },
    filterOption(input, option) {
      console.log("option", option)
      return option.componentOptions?.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    }
  }
};
</script>

<style lang="less" scoped>
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

.actions {
  direction: rtl;
}
</style>
