<template>
  <div class="task-item mb-1">
    <div class="ant-row title">
      <label :title="skill.name" @click="expand = !expand">
        <span class="arrow mr-1" :class="expand ? 'asc' : 'dsc'"></span>
        <span>{{ skill.name }}</span>
      </label>

      <div @click.stop="handleSelectSkillTag" class="label-skill-tag p-1">
        <ModalSelectSkillTag :ref="skill.name" :skill-data="skill" />

        <template v-if="Array.isArray(skill.tag) && skill.tag.length">
          <a-tag class="mt-1" color="blue" v-for="tagId in skill.tag" :key="tagId">{{ mapSkillTag(tagId) }}</a-tag>
        </template>

        <a-icon type="tag" />
      </div>

      <a-tag v-if="skill.delete_flag" color="red">
        {{ $t("deprecated") }}
      </a-tag>

      <span class="actions">
        <a-icon class="text-danger" v-if="!skill.delete_flag" type="delete" @click="deleteSkill" />
        <a-icon class="text-danger" v-if="skill.delete_flag" type="redo" @click="restoreSkill" />
      </span>
    </div>

    <a-col class="task-item-content mt-3 ml-5" v-show="expand">
      <a-form v-bind="formLayout" :form="form">
        <a-form-item :label="$t('name')">
          <a-input
            @change="e => (skill.name = e.target.value)"
            v-decorator="[
              'name',
              {
                rules: [{ required: true, message: 'Please input name for category' }],
                initialValue: skill.name
              }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('description')" class="mt-3">
          <a-input
            @change="e => (skill.description = e.target.value)"
            v-decorator="[
              'description',
              { rules: [{ required: false, message: '' }], initialValue: skill.description }
            ]"
          />
        </a-form-item>

        <a-form-item :label="$t('category')" class="mt-3">
          <a-select
            class="w-100"
            size="large"
            v-model="skill.category_id"
            show-search
            option-filter-prop="children"
            :filter-option="filterOption"
          >
            <template v-for="category in listCategory">
              <a-select-option :key="category.category_id">
                {{ category.category }}
              </a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-form>
    </a-col>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import DropDownLabel from "./DropDownLabel";
import ModalSelectSkillTag from "./ModalSelectSkillTag";

export default {
  name: "SkillItem",
  props: {
    listCategory: Array,
    skill: Object
  },
  components: {
    DropDownLabel,
    ModalSelectSkillTag
  },
  data() {
    return {
      expand: false,
      form: this.$form.createForm(this, { name: `Category ${this.skill.name}` }),
      formLayout: {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      }
    };
  },
  computed: {
    ...mapState({
      listSkillTag: state => state.modules["skill-set"].listSkillTag
    })
  },
  methods: {
    deleteSkill() {
      let self = this;
      this.$confirm({
        title: this.$t("are_you_sure_to_delete"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          self.skill.delete_flag = true;
        },
        onCancel() {}
      });
    },
    restoreSkill() {
      let self = this;
      this.$confirm({
        title: this.$t("are_you_sure"),
        okText: this.$t("yes"),
        cancelText: this.$t("no"),
        zIndex: 10000,
        centered: true,
        onOk() {
          self.skill.delete_flag = false;
        },
        onCancel() {}
      });
    },
    filterOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0;
    },
    handleSelectSkillTag() {
      this.$refs[this.skill.name].showModal();
    },
    mapSkillTag(tagId) {
      let tag = this.listSkillTag.find(item => item.id == tagId);
      return tag ? tag.name : "";
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

.label-skill-tag {
  display: inline-block;
  cursor: pointer;

  & * {
    cursor: pointer;
  }

  &:hover {
    background-color: #88888846;
  }
}
</style>
