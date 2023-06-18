<template>
  <div>
    <a-select
      style="width: 100%"
      :filterOption="false"
      :value="listTagsSelected"
      @click.native="evt => onSearch(evt.target.value ? evt.target.value : '')"
      @search="onSearch"
      @change="val => handleChange(val)"
      mode="multiple"
      :placeholder="$t('tag')"
    >
      <a-spin v-if="fetching" slot="notFoundContent" />
      <div v-else slot="notFoundContent">
        <a-row style="color: red">{{ $t("no_result_found") }}</a-row>
        <a-row class="mt-1">
          <a @click="showModal = true">
            <i class="fas fa-plus"></i>
            {{ $t("add_tag") }}
          </a>
        </a-row>
      </div>
      <a-select-option v-for="item in items" :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
    </a-select>

    <!-- Modal add new -->
    <a-modal
      v-model="showModal"
      :title="$t('confirmation')"
      :maskClosable="false"
      :keyboard="false"
      :closable="false"
      centered
    >
      <template slot="footer">
        <a-button key="submit" type="primary" @click="addNew">
          <i class="fas fa-check mr-2"></i>
          {{ $t("save") }}
        </a-button>
        <a-button key="back" @click="closeModal">
          <i class="fas fa-times mr-2"></i>
          {{ $t("cancel") }}
        </a-button>
      </template>
      <div>
        <span class="text-bold">{{ $t("tag") }}</span>
        <span>
          <a-input v-model="tagName" />
        </span>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from "vuex";
export default {
  model: {
    prop: "listTagsSelected",
    event: "change"
  },
  props: {
    listTagsSelected: { type: Array, default: () => [] }
  },
  data() {
    return {
      showModal: false,
      tagName: "",
      fetching: false,
      items: [],
      debouncedSearchingTag: _.debounce(() => this.searchByTagName(), 200)
    };
  },
  computed: {
    ...mapState({
      listTags: state => state.modules["document"].listTags
    })
  },
  mounted() {
    this.items = this.listTags;
  },
  methods: {
    ...mapActions({
      searchTag: "modules/document/searchTag",
      addNewTag: "modules/document/addNewTag"
    }),
    ...mapMutations({
      setListTags: "modules/document/setListTags"
    }),
    onSearch(val) {
      if (!val) this.items = this.listTags;
      else {
        this.tagName = val;
        this.items = [];
        this.fetching = true;
        this.debouncedSearchingTag();
      }
    },
    searchByTagName() {
      this.searchTag(this.tagName).then(res => {
        this.items = res;
        this.fetching = false;
      });
    },
    handleChange(selectedItems) {
      this.$emit("change", selectedItems);
    },
    addNew() {
      this.addNewTag({
        name: this.tagName
      })
        .then(body => {
          this.items.push(body);
          this.listTagsSelected.push(body.id);
          this.showModal = false;
          let newList = _.cloneDeep(this.listTags);
          newList.push(body);
          this.setListTags(newList);
        })
        .catch(error => {
          console.log(error);
        });
    },
    closeModal() {
      this.showModal = false;
      this.tagName = null;
    }
  }
};
</script>
