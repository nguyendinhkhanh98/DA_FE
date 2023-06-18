<template>
  <a-modal v-model="visible" :title="getTitle()" :footer="null">
    <div class="mb-2">
      <a-input-search
        style="display: inline-block; width: 300px;"
        allow-clear
        :value="keySearch"
        @change="e => (keySearch = e.target.value)"
      />

      <a-button type="link" style="float: right;" @click="handleSwitchMode">
        <span>{{ $t(isSelectTag ? "tag_configuration" : "select_tag") }} <a-icon type="caret-right"/></span>
      </a-button>
    </div>

    <template v-if="isSelectTag">
      <template v-for="tag in listSkillTagFilter">
        <a-tag
          style="cursor: pointer;"
          class="my-1"
          :key="tag.id"
          :color="skillHasTag(tag) ? 'blue' : ''"
          @click="handleToggleSkillTag(tag)"
        >
          <span>{{ tag.name }}</span>
        </a-tag>
      </template>
      <template v-if="!listSkillTagFilter.length">
        <p class="text-danger my-0">{{ $t("no_result_found") }}</p>
        <span class="text-link pointer" @click="handleCreateTag"><a-icon type="plus-circle" /> {{ $t("create") }}</span>
      </template>
    </template>

    <template v-else>
      <span class="text-link pointer" @click="handleCreateTag"><a-icon type="plus-circle" /> {{ $t("create") }}</span>

      <TagConfigurationItem
        v-if="newTagName"
        :tag="{ name: newTagName, color: 'white' }"
        mode="add"
        @create="handleCreatedTag"
        @cancel="newTagName = null"
      />

      <hr />

      <div v-if="listSkillTagFilter.length" class="wrapper-tag">
        <TagConfigurationItem v-for="tag in listSkillTagFilter" :key="tag.id" :tag="tag" />
      </div>
      <template v-else>
        <p class="text-danger my-0">{{ $t("no_result_found") }}</p>
      </template>
    </template>
  </a-modal>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import TagConfigurationItem from "./TagConfigurationItem";

export default {
  props: {
    skillData: Object
  },
  components: {
    TagConfigurationItem
  },
  data() {
    return {
      visible: false,
      keySearch: "",
      isSelectTag: true,
      newTagName: null
    };
  },
  computed: {
    ...mapState({
      listSkillTag: state => state.modules["skill-set"].listSkillTag
    }),
    listSkillTagFilter() {
      let clone = [...this.listSkillTag];
      clone = this.filterTagByKeySearch(clone);
      return clone;
    }
  },
  methods: {
    ...mapActions({
      createSkillTag: "modules/skill-set/createSkillTag"
    }),
    showModal() {
      this.keySearch = "";
      this.visible = true;
      this.isSelectTag = true;
    },
    skillHasTag(tag) {
      if (!this.skillData || !this.skillData.tag || !this.skillData.tag.length) return false;
      return this.skillData.tag.includes(tag.id);
    },
    handleToggleSkillTag(tag) {
      let includes = this.skillHasTag(tag);
      if (includes) {
        this.skillData.tag = this.skillData.tag.filter(item => item != tag.id);
      } else {
        if (!this.skillData.tag) this.skillData.tag = [tag.id];
        else this.skillData.tag.push(tag.id);
      }
    },
    filterTagByKeySearch(clone) {
      if (!this.keySearch) return clone;

      return clone.filter(item => {
        let vietnameseKey = removeVietnameseTones(this.keySearch);
        let vietnameseTag = removeVietnameseTones(item.name);

        return vietnameseTag.includes(vietnameseKey);
      });
    },
    handleSwitchMode() {
      this.isSelectTag = !this.isSelectTag;
      this.keySearch = "";
    },
    getTitle() {
      let message = "";
      if (this.isSelectTag) message = this.$t("tag") + " " + this.skillData.name;
      else message = this.$t("tag_configuration");

      return message;
    },
    handleCreateTag() {
      this.newTagName = new String(this.keySearch).valueOf() || "new tag";
      this.isSelectTag = false;
      this.keySearch = "";
    },
    async handleCreatedTag(e) {
      this.newTagName = null;
      let response = await this.createSkillTag(e);
      this.handleNotifyAPI(response);
    }
  }
};
</script>

<style lang="less" scoped>
.wrapper-tag {
  max-height: 400px;
  overflow-y: auto;
}
</style>
