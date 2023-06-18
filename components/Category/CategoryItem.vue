<template>
  <div class="task-item mb-1">
    <div class="ant-row title">
      <span class="arrow mr-1" :class="expand ? 'asc' : 'dsc'" @click="expand = !expand"></span>
      <label :title="category.category" :key="category.category_id" @click="expand = !expand">{{
        category.category
      }}</label>
      <span class="actions">
        <a-spin :spinning="loading">
          <a-icon type="delete" @click="deleteCategory" />
        </a-spin>
      </span>
    </div>

    <a-col class="task-item-content mt-3 ml-5" v-show="expand">
      <a-form v-bind="formLayout" :form="form">
        <a-form-item :label="$t('name')">
          <a-input
            @change="e => (category.category = e.target.value)"
            v-decorator="[
              'name',
              {
                rules: [{ required: true, message: 'Please input name for category' }],
                initialValue: category.category
              }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('description')" class="mt-3">
          <a-input
            @change="e => (category.description = e.target.value)"
            v-decorator="[
              'description',
              { rules: [{ required: false, message: '' }], initialValue: category.description }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('skill')" class="mt-3">
          <a-select
            class="w-100"
            mode="multiple"
            size="large"
            :value="list.map(item => `${item.name}@${item.id}`)"
            @change="handleChange"
          >
            <template v-for="skill in dataSourcePriority">
              <a-select-option
                v-if="skill.id"
                :key="`${skill.name}@${skill.id}`"
                :class="{ 'text-success': !skill.category_id }"
              >
                {{ skill.name }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </a-col>
  </div>
</template>

<script>
export default {
  name: "TaskItem",
  props: {
    dataSource: Array,
    category: Object,
    loading: Boolean
  },
  data() {
    return {
      expand: false,
      form: this.$form.createForm(this, { name: `Category ${this.category.category}` }),
      formLayout: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      }
    };
  },
  computed: {
    list() {
      return this.dataSource.filter(item => item.category_id == this.category.category_id && item.id);
    },
    dataSourcePriority() {
      let data = _.cloneDeep(this.dataSource);
      data = _.sortBy(data, item => item.category_id).reverse();
      return data;
    }
  },
  watch: {
    dataSource: {
      handler() {
        if (this.expand) this.$forceUpdate();
      },
      deep: true
    }
  },
  methods: {
    handleChange(value) {
      value = value.map(item => {
        if (typeof item == "string") {
          let split = item.split(/@/g);
          return parseInt(split[1]);
        }
        return item;
      });
      let self = this;
      value.forEach(element => {
        let found = _.find(self.list, child => child.id == element);
        if (!found) {
          // Moving skill from another category to this category
          let originSkill = _.find(self.dataSource, item => item.id == element);
          if (originSkill) {
            originSkill.category = self.category.category;
            originSkill.category_id = self.category.category_id;
          }
        }
      });

      this.list.forEach(element => {
        let found = _.find(value, item => item == element.id);
        if (!found) {
          //Remove skill of this category
          let originSkill = _.find(self.dataSource, item => item.id == element.id);
          if (originSkill) {
            originSkill.category = null;
            originSkill.category_id = null;
          }
        }
      });
    },
    deleteCategory() {
      let self = this;
      this.$confirm({
        title: this.$t("are_you_sure_to_delete"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          self.$emit("delete-category", self.category);
        },
        onCancel() {}
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
