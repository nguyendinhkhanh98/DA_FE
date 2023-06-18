<template>
  <div class="task-group">
    <div class="wapper">
      <div class="task-head">
        <h1 class="title">{{ title }}</h1>
        <div class="actions">
          <a-button type="primary" ghost @click="expandAllChild">
            <template>
              <i class="fas fa-arrows-alt-v"></i>
              <span class="ml-2">{{ $t("expand") }}</span>
            </template>
          </a-button>

          <a-button type="primary" icon="save" :loading="loading" @click="$emit('submit')">{{ $t("save") }}</a-button>
          <SkillConfig
            :loading="loading"
            :list-category="listCategory"
            @update-skill="$emit('update-skill', $event)"
            @create="$emit('create-skill', $event)"
          />
        </div>
      </div>
      <a-row>
        <CategoryCreate
          size="small"
          :loading="loading"
          :title="$t('create_category')"
          @create="$emit('create', $event)"
        />
      </a-row>
      <draggable class="task-content mt-2" :list="listCategory" v-bind="dragOptions">
        <category-item
          :loading="loading"
          class="task-content-item"
          ref="task-item"
          v-for="item in listCategory"
          :key="item.category_id"
          :data-source="dataSource"
          :category="item"
          @delete-category="$emit('delete-category', $event)"
        />
      </draggable>
    </div>
  </div>
</template>

<script>
import CategoryItem from "@/components/Category/CategoryItem";
import CategoryCreate from "@/components/Category/CategoryCreate";
import SkillConfig from "@/components/Category/SkillConfig";

import Draggable from "vuedraggable";
const dragOptions = {
  sort: true,
  scroll: true,
  scrollSpeed: 2,
  animation: 150,
  ghostClass: "dragable-ghost",
  chosenClass: "dragable-chose",
  dragClass: "dragable-drag"
};
export default {
  name: "TaskGroup",
  components: { Draggable, CategoryItem, CategoryCreate, SkillConfig },
  props: {
    title: String,
    dataSource: Array,
    listCategory: Array
  },
  data() {
    return {
      group: "task",
      dragOptions: { ...dragOptions, group: this.group },
      expandAll: false,
      loading: false
    };
  },
  computed: {
    count() {
      return this.listCategory.length;
    }
  },
  methods: {
    expandAllChild() {
      this.expandAll = !this.expandAll;
      this.$refs["task-item"].forEach(item => (item.expand = this.expandAll));
    }
  }
};
</script>

<style lang="less">
@shadow-color: rgba(153, 153, 153, 0.342);
.task-group {
  width: 100%;
  height: 100%;
  box-sizing: border-box;

  .wapper {
    border-radius: 3px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    max-height: 100%;

    .task-head {
      margin-bottom: 8px;
      .title {
        display: inline-block;
      }
      .actions {
        float: right;
        font-size: 18px;
        font-weight: bold;
        display: inline-flex;
        button:not(:last-child) {
          margin-right: 5px;
        }
      }
    }

    .task-content {
      z-index: 1;
      height: 100%;

      &::-webkit-scrollbar {
        width: 8px;
      }
      &::-webkit-scrollbar-track-piece {
        box-shadow: inset 0 0 5px grey;
        border-radius: 5px;
        background: rgba(196, 196, 196, 0.582);
      }
      &::-webkit-scrollbar-track {
        box-shadow: inset 0 0 5px grey;
        border-radius: 5px;
        background: rgba(196, 196, 196, 0.582);
      }
      &::-webkit-scrollbar-thumb {
        background: #d40b0b;
        height: 15px;
        border-radius: 5px;
      }
      &::-webkit-scrollbar-thumb:hover {
        background: #555;
      }

      &-item {
        cursor: move;
        &:first-child {
          box-shadow: 0 -1px 1px @shadow-color, 0 1px 1px @shadow-color;
        }
      }
    }
  }
}
</style>

<style lang="less">
.dragable-ghost {
  border: 1px dashed chocolate;
  opacity: 1;
}
.dragable-chose {
  // border: 1px dashed blue;
  opacity: 1;
}
.dragable-drag {
  border: 1px dashed red;
  opacity: 0;
}
</style>
