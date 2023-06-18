<template>
  <div class="task-item mb-1">
    <div class="ant-row title">
      <label @click="expand = !expand">
        <span class="arrow mr-1" :class="expand ? 'asc' : 'dsc'"></span>
        <span>{{ skill.skill_name }}</span>
      </label>

      <a-tag v-if="skill.skill_delete_flag" color="red">
        {{ $t("deprecated") }}
      </a-tag>

      <span class="actions">
        <a-popconfirm
          v-if="skill.skill_delete_flag"
          placement="topRight"
          :title="$t('are_you_sure')"
          :ok-text="$t('yes')"
          :cancel-text="$t('no')"
          @confirm="$emit('restore-skill', skill)"
        >
          <a-spin :spinning="loading">
            <a-icon class="text-danger" type="undo" />
          </a-spin>
        </a-popconfirm>

        <a-popconfirm
          v-else
          placement="topRight"
          :title="$t('are_you_sure_archive')"
          :ok-text="$t('yes')"
          :cancel-text="$t('no')"
          @confirm="$emit('delete-skill', skill)"
        >
          <a-spin :spinning="loading"> <a-icon class="text-danger" type="delete"/></a-spin>
        </a-popconfirm>
      </span>
    </div>

    <a-col class="task-item-content mt-3 ml-5" v-if="expand">
      <a-form v-bind="formLayout" :form="form">
        <a-form-item :label="$t('name')">
          <a-input
            v-decorator="[
              'name',
              {
                rules: [{ required: true, message: 'Please input name for category' }],
                initialValue: skill.skill_name
              }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('description')" class="mt-3">
          <a-input
            v-decorator="[
              'description',
              { rules: [{ required: false, message: '' }], initialValue: skill.skill_description }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('business_skill_category')" class="mt-3">
          <a-select
            class="w-100"
            size="large"
            allow-clear
            show-search
            option-filter-prop="children"
            :filter-option="filterOption"
            v-decorator="[
              'category_id',
              { rules: [{ required: false, message: '' }], initialValue: skill.category_id }
            ]"
          >
            <template v-for="category in listCategory">
              <a-select-option :key="category.category_id" :value="category.category_id">
                {{ category.category_name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-form>

      <a-row class="actions-detail mt-3">
        <a-button type="primary" :loading="loading" @click="handleSaveSkill">
          {{ $t("save") }}
        </a-button>

        <a-button @click="expand = false">
          {{ $t("cancel") }}
        </a-button>
      </a-row>
    </a-col>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "BusinessSkillItem",
  props: {
    skill: Object
  },
  data() {
    return {
      expand: false,
      form: this.$form.createForm(this, { name: `Business skill ${this.skill.skill_name}` }),
      formLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      loading: false
    };
  },
  computed: {
    ...mapState({
      listSkillTag: state => state.modules["skill-set"].listSkillTag,
      listCategory: state => state.modules["business-skill-category"].listCategory
    })
  },
  methods: {
    ...mapActions({
      updateBusinessSkill: "modules/business-skill/updateBusinessSkill"
    }),
    filterOption(input, option) {
      return option.componentOptions?.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },
    handleSaveSkill() {
      this.form.validateFields(async (err, values) => {
        if (err) return;
        this.loading = true;
        let response = await this.updateBusinessSkill({
          ...values,
          delete_flag: this.skill.skill_delete_flag,
          id: this.skill.skill_id
        });
        this.handleNotifyAPI(response);
        this.loading = false;
        if (!response.error) {
          this.expand = false;
          this.$emit("refetch");
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
@shadow-color: rgba(153, 153, 153, 0.342);
.task-item {
  padding: 12px;
  background-color: white;
  border-left: 4px solid #001529;
  box-shadow: 0 1px 1px @shadow-color;

  .title {
    .actions {
      display: block;
      float: right;
    }
  }

  & .title:hover {
    label,
    .arrow {
      cursor: pointer;
    }

    .actions {
      cursor: pointer;
    }
  }

  label {
    display: inline-block;
  }

  .arrow {
    display: inline-block;
    vertical-align: middle;
    width: 0;
    height: 0;
    opacity: 0.66;

    &.asc {
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 6px solid rgb(46, 46, 46);
    }

    &.dsc {
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 6px solid rgb(46, 46, 46);
    }
  }
}

.actions-detail {
  direction: rtl;
}
</style>
