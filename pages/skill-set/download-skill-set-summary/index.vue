<template>
  <a-card>
    <a-row>
      <a-col :span="16">
        <span class="h1">{{ $t("download_skill_set_summary") }}</span>
      </a-col>

      <a-col :span="8" style="text-align: end">
        <a-button
          :disabled="!selectedRowKeys.length"
          @click="handleExportSumarryReport"
          type="primary"
          :loading="loading"
          >{{ $t("export") }}</a-button
        >
      </a-col>
    </a-row>

    <div class="ant-table ant-table-bordered">
      <table class="table-bordered">
        <thead class="ant-table-thead">
          <tr>
            <th class="text-center" style="width: 50px">
              <a-checkbox @change="handleToggleAllUser"> </a-checkbox>
            </th>
            <th class="ant-table-column-has-actions ant-table-column-sort">
              <div style="display: inline-block">
                <span>{{ $t("full_name") }}</span>
                <br />

                <a-select
                  v-model="filter.full_name"
                  mode="multiple"
                  allow-clear
                  style="width: 250px"
                  :filterOption="filterOptionForUser"
                >
                  <a-select-option
                    v-for="(item, index) in listUsers"
                    :key="index"
                    :label="item.full_name"
                    :value="item.full_name"
                  >
                    {{ item.full_name }}
                  </a-select-option>
                </a-select>
              </div>
              <div style="display: inline-block">
                <TableSorter v-model="sorter.full_name" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="ant-table-tbody">
          <tr v-for="user in listUserFilter" :key="user.id">
            <td class="text-center">
              <a-checkbox :checked="user.checked" @change="e => handleSelectUser(user, e)"> </a-checkbox>
            </td>
            <td>
              <span>{{ user.full_name }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </a-card>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { columns } from "./const";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";
import TableSorter from "@/components/Common/TableSorter";

export default {
  name: "SumarryReportSkillSetByUser",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager"]
  },
  components: {
    TableSorter
  },
  data() {
    return {
      columns,
      loading: false,
      selectedRowKeys: [],
      filter: {
        full_name: []
      },
      sorter: {
        full_name: "ascend"
      },
      searchForcus: null,
      loading: false
    };
  },
  computed: {
    ...mapState({
      listUsers: state => state.modules["skill-set"].listUsers
    }),
    listUserFilter() {
      let clone = _.cloneDeep(this.listUsers);
      clone = this.filterDataByName(clone);
      clone = this.sortByName(clone);

      return clone;
    }
  },
  async created() {
    this.loading = true;
    await this.getAllDevUser();
    this.loading = false;
  },
  methods: {
    ...mapActions({
      getAllDevUser: "modules/skill-set/getAllDevUser",
      exportSumarrySkillSetByUserId: "modules/skill-set/exportSumarrySkillSetByUserId"
    }),
    async handleExportSumarryReport() {
      this.loading = true;
      try {
        let response = await this.exportSumarrySkillSetByUserId({ user_id: this.selectedRowKeys });
        const fileName = response.headers["content-disposition"].split("=")[1];
        const url = URL.createObjectURL(
          new Blob([response.data], {
            type: response.headers["content-type"]
          })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      } catch (error) {
        console.log(error);
        this.$notification.error({
          message: "Bad request",
          description: "Bad request",
          duration: 2.5
        });
      }
      this.loading = false;
    },
    filterDataByName(clone) {
      if (this.filter.full_name && this.filter.full_name.length) {
        return clone.filter(item => {
          return this.filter.full_name.includes(item.full_name);
        });
      }
      return clone;
    },
    filterOptionForUser(input, option) {
      let textOption = option.componentOptions.children[0].text.toLowerCase();
      textOption = removeVietnameseTones(textOption);
      input = removeVietnameseTones(input.toLowerCase());
      return textOption.includes(input);
    },
    handleSelectUser(user, e) {
      user.checked = e.target.checked;

      if (e.target.checked) {
        this.selectedRowKeys.push(user.id);
      } else {
        this.selectedRowKeys = this.selectedRowKeys.filter(item => item != user.id);
      }
    },
    handleToggleAllUser(e) {
      let checked = e.target.checked;
      this.listUserFilter.forEach(user => (user.checked = checked));
      this.selectedRowKeys = checked ? this.listUserFilter.map(user => user.id) : [];
    },
    sortByName(clone) {
      let order = this.sorter.full_name == "ascend" ? 1 : this.sorter.full_name == "descend" ? -1 : 0;

      return clone.sort((a, b) => {
        let nameOrder = a.full_name?.localeCompare(b.full_name);
        return nameOrder == order ? 1 : nameOrder == -order ? -1 : 0;
      });
    }
  }
};
</script>

<style lang="less" scoped>
.table-bordered {
  border-collapse: collapse;
  width: 1200px;
  min-width: 100%;
  border-radius: 4px 4px 0 0;

  & table,
  th,
  td {
    border: 1px solid #e8e8e8;
  }
}
</style>
