<template>
  <div>
    <a-row :gutter="8">
      <a-col span="21">
        <a-select
          :disabled="!projectId"
          show-search
          v-model="fileUrl.id"
          :placeholder="$t('select_file')"
          :filterOption="filterOptionVietnamese"
          @change="trigger = !trigger"
        >
          <template>
            <a-select-option v-for="item in listFileFiltered" :key="item.id">
              {{ item.docNumber }}-{{ item.title }}
            </a-select-option>
          </template>
        </a-select>
      </a-col>
      <a-col span="3" v-if="!fileUrl.mark">
        <a-button type="primary" @click="viewDoc" icon="folder-open" size="small" />
        <a-button type="danger" @click="$emit('onDelete')" icon="delete" size="small" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
import { mapState } from "vuex";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
export default {
  props: {
    fileUrl: {
      type: Object,
      default: () => {}
    },
    listFiles: Array,
    mode: {
      type: String,
      required: true,
      validator: function(value) {
        return ["upper", "lower", "refer"].indexOf(value) !== -1;
      }
    },
    projectId: Number,
    specId: Number,
    currentFileId: String
  },
  data() {
    return {
      trigger: true
    };
  },
  computed: {
    items() {
      // A document should not refer to itself
      return this.$store.state.modules["document"].items.filter(doc => doc.id != this.currentFileId);
    },
    filled() {
      return this.fileUrl.id;
    },
    listFileFiltered() {
      switch (this.mode) {
        case "upper":
          return this.filterListUpperNotSelected;

        case "lower":
          return this.filterListLowerNotSelected;

        default:
          return this.filterListReferNotSelected;
      }
    },
    filterListUpperNotSelected() {
      const specId = this.specId == 1 ? 2 : 1;
      const listUpperExist = this.listFiles;
      let listUpperFile = this.items && this.items.length ? this.items.filter(item => item.specId == specId) : [];
      if (!listUpperExist || !listUpperExist.length) return listUpperFile;

      const listUpperIdExist = listUpperExist.map(item => item.id).filter(item => item != this.fileUrl.id);
      const listUpperIdOriginal = listUpperFile.map(item => item.id);
      const listDiffId = _.xor(listUpperIdExist, listUpperIdOriginal);
      return listUpperFile.filter(item => listDiffId.includes(item.id));
    },
    filterListLowerNotSelected() {
      const specId = this.specId == 1 ? 3 : 1;
      const listLowerExist = this.listFiles;
      let listLowerFile = this.items && this.items.length ? this.items.filter(item => item.specId == specId) : [];
      if (!listLowerExist || !listLowerExist.length) return listLowerFile;

      const listUpperIdExist = listLowerExist.map(item => item.id).filter(item => item != this.fileUrl.id);
      const listUpperIdOriginal = listLowerFile.map(item => item.id);
      const listDiffId = _.xor(listUpperIdExist, listUpperIdOriginal);
      return listLowerFile.filter(item => listDiffId.includes(item.id));
    },
    filterListReferNotSelected() {
      const listLowerExist = this.listFiles;
      let listLowerFile = this.items && this.items.length ? this.items : [];
      if (!listLowerExist || !listLowerExist.length) return listLowerFile;

      const listUpperIdExist = listLowerExist.map(item => item.id).filter(item => item != this.fileUrl.id);
      const listUpperIdOriginal = listLowerFile.map(item => item.id);
      const listDiffId = _.xor(listUpperIdExist, listUpperIdOriginal);
      return listLowerFile.filter(item => listDiffId.includes(item.id));
    }
  },
  watch: {
    trigger() {
      if (!this.filled) return;
      if (this.fileUrl.mark) delete this.fileUrl.mark;
      this.$emit("onAdd");
    }
  },
  methods: {
    filterOptionVietnamese(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    viewDoc() {
      window.open(`/document/${this.fileUrl.id}`, "_blank");
    }
  }
};
</script>
<style lang="less" scoped></style>
