<template>
  <a-card class="shadow">
    <div class="h1">{{ $t("knowledge_graph") }}</div>
    <a-form-model ref="modal-upload-document" :model="formSearch">
      <!-- Project select -->
      <a-form-model-item :label="$t('project')" :colon="false" prop="projectId">
        <a-select style="width: 180px" :placeholder="$t('project')" v-model="formSearch.projectId">
          <a-select-option v-for="item in listProjects" :key="item.id" :value="item.id">{{
            item.name
          }}</a-select-option>
        </a-select>
      </a-form-model-item>
    </a-form-model>
    <network ref="network" :nodes="nodes" :edges="edges" :options="options" @select-node="onNodeSelected"> </network>
    <div>
      <span class="requirement-spec"></span>
      <small class="mr-2">Requirement Specification</small>
      <span class="outline-spec"></span>
      <small class="mr-2">Outline Specification</small>
      <span class="programming-spec"></span>
      <small>Programming Specification</small>
    </div>
    <div>
      ━━
      <small class="mr-2">Upper/Lower document</small>
      ---->
      <small class="mr-2">Reference document</small>
    </div>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  data() {
    return {
      formSearch: {
        specId: null,
        listTags: [],
        filterName: "",
        projectId: 1
      },
      options: {
        nodes: {
          borderWidth: 4,
          size: 10
        },
        edges: {
          color: {
            color: "#848484",
            highlight: "#000000",
            hover: "#000000",
            inherit: "from",
            opacity: 1.0
          }
        },
        interaction: {
          dragNodes: true,
          hover: true,
          tooltipDelay: 100
        },
        physics: {
          barnesHut: {
            springConstant: 0.02
          },
          stabilization: {
            enabled: true,
            iterations: 1000,
            updateInterval: 100,
            onlyDynamicEdges: true,
            fit: true
          }
        },
        height: `500px`
      },
      numberOfUpperDocs: 0,
      numberOfLowerDocs: 0,
      numberOfOutlineDocs: 0,
      upperDocIndex: 0,
      lowerDocIndex: 0,
      outlineDocIndex: 0,
      determinedXPositionNodes: [],
      determinedYPositionNodes: [],
      didFinishDeterminingOutlineGroups: false
    };
  },
  computed: {
    ...mapState({
      listProjects: state => state.modules["management-task"].listTask,
      items: state => state.modules["document"].items
    }),
    nodes() {
      if (!this.items.length || !this.didFinishDeterminingOutlineGroups) return [];
      return this.items.map(doc => ({
        id: doc.id,
        label: `${doc.docNumber}`,
        title: `${doc.docNumber}-${doc.title}`,
        shape: "dot",
        color: { background: this.getNodeColor(doc.specId) },
        borderWidth: 0,
        physics: false,
        font:
          doc.specId == 2
            ? {
                vadjust: -50
              }
            : undefined,
        x: this.getCoordinateValue(doc.specId, doc.id, "x"),
        y: this.getCoordinateValue(doc.specId, doc.id, "y")
      }));
    },
    edges() {
      let allEdges = [];
      this.items.forEach(doc => {
        if (doc.lowerDocs.length)
          doc.lowerDocs.forEach(lowerDoc => {
            allEdges.push({ from: doc.id, to: lowerDoc.id });
          });
        if (doc.upperDocs.length)
          doc.upperDocs.forEach(upperDoc => {
            allEdges.push({ from: doc.id, to: upperDoc.id });
          });
        if (doc.refDocs.length)
          doc.refDocs.forEach(refDoc => {
            allEdges.push({ from: doc.id, to: refDoc.id, arrows: { to: { enabled: true } }, dashes: true });
          });
      });
      return allEdges;
    },
    maximumNumberOfItemsPerRow() {
      return Math.ceil(Math.sqrt(this.items.length));
    }
  },
  watch: {
    async "formSearch.projectId"(newVal) {
      this.didFinishDeterminingOutlineGroups = false;
      this.numberOfOutlineDocs = 0;
      await this.searchDocument(this.formSearch);
      this.determineOutlineGroups();
      this.didFinishDeterminingOutlineGroups = true;
    }
  },
  async created() {
    if (!this.listProjects.length) await this.fetchListTask();
    await this.searchDocument(this.formSearch);
    this.determineOutlineGroups();
    this.didFinishDeterminingOutlineGroups = true;
  },
  methods: {
    ...mapActions({
      fetchListTask: "modules/management-task/fetchListTask",
      searchDocument: "modules/document/searchDocument"
    }),
    getNodeColor(specId) {
      return specId == 1 ? "blue" : specId == 2 ? "orange" : "green";
    },
    determineOutlineGroups() {
      this.upperDocIndex = 0;
      this.lowerDocIndex = 0;
      this.outlineDocIndex = 0;
      this.numberOfLowerDocs = 0;
      this.numberOfUpperDocs = 0;
      this.numberOfOutlineDocs = 0;
      this.determinedYPositionNodes = [];
      this.determinedXPositionNodes = [];
      this.items.forEach(doc => {
        if (doc.specId == 1) this.numberOfOutlineDocs++;
        else if (doc.specId == 2) this.numberOfUpperDocs++;
        else if (doc.specId == 3) this.numberOfLowerDocs++;
      });
    },
    getCoordinateValue(specId, id, direction) {
      const baseYDistance = 100;
      const baseXDistance = 150;

      // Try to make sure the initial graph position is in center of the screen
      let offsets = Math.ceil(this.maximumNumberOfItemsPerRow / 2) * -100;

      // Determine coordinates of requirement specification docs
      if (specId == 2 && direction == "x") {
        this.determinedXPositionNodes.push(id);
        return offsets + (this.upperDocIndex % this.maximumNumberOfItemsPerRow) * baseXDistance;
      } else if (specId == 2 && direction == "y") {
        this.determinedYPositionNodes.push(id);
        let yCoordinate = Math.floor(this.upperDocIndex / this.maximumNumberOfItemsPerRow) * baseYDistance;
        if (this.determinedYPositionNodes.includes(id) && this.determinedXPositionNodes.includes(id))
          this.upperDocIndex++;
        return offsets + yCoordinate;

        // Determine coordinates of outline specification docs
      } else if (specId == 1 && direction == "x") {
        this.determinedXPositionNodes.push(id);
        return offsets + (this.outlineDocIndex % this.maximumNumberOfItemsPerRow) * baseXDistance;
      } else if (specId == 1 && direction == "y") {
        this.determinedYPositionNodes.push(id);
        let yCoordinate =
          (Math.ceil(this.numberOfUpperDocs / this.maximumNumberOfItemsPerRow) +
            Math.floor(this.outlineDocIndex / this.maximumNumberOfItemsPerRow)) *
          baseYDistance;
        if (this.determinedYPositionNodes.includes(id) && this.determinedXPositionNodes.includes(id))
          this.outlineDocIndex++;
        return offsets + yCoordinate;

        // Determine coordinates of programming specification docs
      } else if (specId == 3 && direction == "x") {
        this.determinedXPositionNodes.push(id);
        return offsets + (this.lowerDocIndex % this.maximumNumberOfItemsPerRow) * baseXDistance;
      } else if (specId == 3 && direction == "y") {
        this.determinedYPositionNodes.push(id);
        let yCoordinate =
          (Math.ceil(this.numberOfUpperDocs / this.maximumNumberOfItemsPerRow) +
            Math.ceil(this.numberOfOutlineDocs / this.maximumNumberOfItemsPerRow) +
            Math.floor(this.lowerDocIndex / this.maximumNumberOfItemsPerRow)) *
          baseYDistance;
        if (this.determinedYPositionNodes.includes(id) && this.determinedXPositionNodes.includes(id))
          this.lowerDocIndex++;
        return offsets + yCoordinate;
      }
    },
    onNodeSelected(nodes) {
      let selectedNodeId = nodes.nodes[0];
      let selectedDocUrl = this.items.find(doc => doc.id == selectedNodeId).url;
      window.open(
        selectedDocUrl,
        "_blank",
        "height=870,width=920,location=0,status=1,scrollbars=1, resizable=1, directories=1, toolbar=1, titlebar=1"
      );
    }
  }
};
</script>

<style>
.requirement-spec {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  background-color: orange;
  vertical-align: middle;
  margin-bottom: 2px;
}
.outline-spec {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  background-color: blue;
  vertical-align: middle;
  margin-bottom: 2px;
}
.programming-spec {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: inline-block;
  background-color: green;
  vertical-align: middle;
  margin-bottom: 2px;
}
</style>
