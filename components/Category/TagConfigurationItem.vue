<template>
  <div class="tag-item py-1">
    <span v-if="!editting">{{ tag.name }}</span>
    <a-input ref="input-edit" v-else :defaultValue="tag.name" style="width: auto;" />

    <span class="tag-item-actions">
      <template v-if="!editting">
        <a-icon type="edit" class="text-link" @click="editting = true"></a-icon>
        <a-popconfirm
          :title="$t('are_you_sure')"
          :ok-text="$t('yes')"
          :cancel-text="$t('no')"
          @confirm="handleDeleteTag(tag)"
        >
          <a-icon type="delete" class="text-danger"></a-icon>
        </a-popconfirm>
      </template>
      <template v-else>
        <a-icon type="save" class="text-link" @click="handleSaveTag"></a-icon>
        <a-icon type="close" class="text-danger" @click="handleCancel"></a-icon>
      </template>
    </span>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  props: {
    tag: Object,
    mode: String
  },
  data() {
    return {
      cachedTag: {},
      editting: this.mode == "add" ? true : false
    };
  },
  mounted() {
    this.updateCachedTag();
  },
  methods: {
    ...mapActions({
      updateSkillTag: "modules/skill-set/updateSkillTag",
      deleteSkillTag: "modules/skill-set/deleteSkillTag",
      fetchAndFillSkillConfigure: "modules/skill-set/fetchAndFillSkillConfigure",
      fetchSkillTag: "modules/skill-set/fetchSkillTag"
    }),
    updateCachedTag() {
      this.cachedTag = { ...this.tag };
    },
    async handleSaveTag() {
      if (this.mode == "add") {
        let targetValue = this.$refs["input-edit"].$el.value;
        this.$emit("create", { ...this.tag, name: targetValue });
        return;
      }
      let targetValue = this.$refs["input-edit"].$el.value;
      let response = await this.updateSkillTag({ ...this.tag, name: targetValue });
      this.handleNotifyAPI(response);
      if (response.error) {
        this.editting = false;
        return;
      }

      this.tag.name = targetValue;
      this.editting = false;
      this.updateCachedTag();
    },
    async handleDeleteTag() {
      let response = await this.deleteSkillTag(this.tag);
      this.handleNotifyAPI(response);
      this.fetchAndFillSkillConfigure();
      this.fetchSkillTag();
    },
    handleCancel() {
      this.editting = false;
      this.$emit("cancel");
    }
  }
};
</script>

<style lang="less" scoped>
.tag-item {
  &:hover {
    background-color: rgb(230, 247, 254);

    .tag-item-actions {
      display: inline-block;
    }
  }

  &-actions {
    // display: none;
    float: right;

    & > * {
      padding: 4px;
      cursor: pointer;

      & * {
        cursor: pointer;
      }
    }
  }
}
</style>
