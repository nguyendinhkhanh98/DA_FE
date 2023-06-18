<template>
  <div class="task-item mb-1">
    <!-- <div class="ant-row title">
      <span class="arrow mr-1" :class="expand ? 'asc' : 'dsc'" @click="expand = !expand"></span>
      <label @click="expand = !expand">{{ category.category_name }}</label>

      <span class="actions">
        <a-popconfirm
          placement="topRight"
          :title="$t('are_you_sure_to_delete')"
          :ok-text="$t('yes')"
          :cancel-text="$t('no')"
          @confirm="$emit('delete-category', category)"
        >
          <a-spin :spinning="loading">
            <a-icon type="delete" />
          </a-spin>
        </a-popconfirm>
      </span>
    </div>

    <a-col class="task-item-content mt-3 ml-5" v-show="expand">
      <a-form v-bind="formLayout" :form="form">
        <a-form-item :label="$t('name')">
          <a-input
            @change="e => (category.category_name = e.target.value)"
            v-decorator="[
              'category_name',
              {
                rules: [{ required: true, message: 'Please input name for category' }],
                initialValue: category.category_name
              }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('description')" class="mt-3">
          <a-input
            @change="e => (category.category_description = e.target.value)"
            v-decorator="[
              'category_description',
              { rules: [{ required: false }], initialValue: category.category_description }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('business_skill')" class="mt-3">
          <a-select
            class="w-100"
            mode="multiple"
            size="large"
            :value="listSkillInCategory.map(item => `${item.skill_name}@${item.skill_id}`)"
            @change="handleChangeSkill"
          >
            <template v-for="skill in listSkillHasPriority">
              <a-select-option
                v-if="skill.skill_id"
                :key="`${skill.skill_name}@${skill.skill_id}`"
                :class="{ 'text-success': !skill.category_id }"
              >
                {{ skill.skill_name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </a-col> -->
  </div>
</template>

<script>
import { mapState, mapMutations, mapActions } from "vuex";

export default {
  name: "TaskItem",
  props: {
    category: Object
  },
  data() {
    return {
      expand: false,
      form: this.$form.createForm(this, { name: `Category ${this.category.category_name}` }),
      formLayout: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      loading: false
    };
  },
  computed: {
    ...mapState({
      listSkill: state => state.modules["business-skill"].listSkill
    }),
    listSkillInCategory() {
      let listSkill = this.listSkill.filter(item => item.category_id == this.category.category_id && item.skill_name);
      let listSkillActive = listSkill.filter(item => !item.skill_delete_flag);
      return listSkillActive;
    },
    listSkillHasPriority() {
      let data = _.cloneDeep(this.listSkill);
      data = data.filter(item => !item.skill_delete_flag);
      data = _.sortBy(data, item => item.category_id).reverse();
      return data;
    }
  },
  watch: {
    listSkill: {
      handler() {
        if (this.expand) this.$forceUpdate();
      },
      deep: true
    }
  },
  methods: {
    ...mapMutations({
      setSkillEdited: "modules/business-skill-category/setSkillEdited"
    }),
    handleChangeSkill(value) {
      let self = this;

      // Extract skill_name@skill_id => list of skill_id
      value = value.map(item => {
        if (typeof item == "string") {
          let split = item.split(/@/g);
          return parseInt(split[1]);
        }
        return item;
      });

      // Change category infor of each skill
      value.forEach(skill_id => {
        let targetSkill = self.listSkill.find(skill => skill.skill_id == skill_id);
        if (!targetSkill) return;

        // Select skill that skill not in any category
        if (targetSkill.category_id != this.category.category_id) {
          this.setSkillEdited({ skill_id: targetSkill.skill_id, category_id: this.category.category_id });
          targetSkill.category_id = this.category.category_id;
          targetSkill.category_name = this.category.category_name;
          targetSkill.category_description = this.category.category_description;
          targetSkill.category_delete_flag = this.category.category_delete_flag;
        }
      });

      // Remove skill
      let listSkillRemoved = this.listSkillInCategory.filter(item => !value.includes(item.skill_id));
      listSkillRemoved.forEach(targetSkill => {
        targetSkill.category_id = null;
        targetSkill.category_name = null;
        targetSkill.category_description = null;
        targetSkill.category_delete_flag = null;
        this.setSkillEdited({ skill_id: targetSkill.skill_id, category_id: null });
      });
    },
    validateCategoryInfo() {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          resolve(err ? false : true);
        });
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
      float: right;
      display: none;
      color: red;
    }
  }

  & .title:hover {
    label,
    .arrow {
      cursor: pointer;
    }

    .actions {
      cursor: pointer;
      display: block;
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
</style>
