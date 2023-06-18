<template>
  <a-modal v-model="visible" :title="$t('role_setting')" :footer="null">
    <a-input-search
      style="display: inline-block; width: 300px;"
      allow-clear
      :value="keySearch"
      @change="e => (keySearch = e.target.value)"
    />
    <br />

    <div class="text-link pointer mt-1" @click="handleCreateRole" style="display: inline-block;">
      <a-icon type="plus-circle" /> <span>{{ $t("create") }}</span>
    </div>

    <RoleItemSetting
      v-if="newRoleName"
      :role-data="{ name: newRoleName }"
      mode="create"
      @create="handleCreatedRole"
      @cancel="newRoleName = null"
    />

    <hr />

    <template v-for="role in listRoleFilter">
      <RoleItemSetting
        :key="role.name"
        :role-data="role"
        @deprecate="handleDeprecateRole(role)"
        @update="e => handleUpdateRole(e)"
        @restore="handleRestore(role)"
      ></RoleItemSetting>
    </template>

    <p v-if="!listRoleFilter.length" class="text-danger my-0">{{ $t("no_result_found") }}</p>
  </a-modal>
</template>

<script>
import { mapState, mapActions } from "vuex";
import RoleItemSetting from "./RoleItemSetting";
import { removeVietnameseTones } from "@/utils/skillSet/skillSet.utils.js";

export default {
  data() {
    return {
      visible: false,
      newRoleName: null,
      keySearch: ""
    };
  },
  components: {
    RoleItemSetting
  },
  computed: {
    ...mapState({
      roleList: state => state.modules["user-management"].roleList
    }),
    listRoleFilter() {
      let clone = [...this.roleList];
      clone = this.filterRoleKeySearch(clone);
      return clone;
    }
  },
  created() {
    this.getRoleList();
  },
  methods: {
    ...mapActions({
      getRoleList: "modules/user-management/getRoleList",
      updateRole: "modules/user-management/updateRole",
      deprecateRole: "modules/user-management/deprecateRole",
      restoreRole: "modules/user-management/restoreRole",
      createRole: "modules/user-management/createRole"
    }),
    showModal() {
      this.visible = true;
    },
    async handleDeprecateRole(role) {
      let response = await this.deprecateRole(role);
      this.handleNotifyAPI(response);
    },
    async handleUpdateRole(newRole) {
      let response = await this.updateRole(newRole);
      this.handleNotifyAPI(response);
    },
    async handleRestore(role) {
      let response = await this.restoreRole(role);
      this.handleNotifyAPI(response);
    },
    handleCreateRole() {
      this.newRoleName = new String(this.keySearch).valueOf() || "new role";
      this.keySearch = "";
    },
    async handleCreatedRole(e) {
      this.newRoleName = null;
      let response = await this.createRole(e);
      this.handleNotifyAPI(response);
    },
    filterRoleKeySearch(clone) {
      if (!this.keySearch) return clone;

      return clone.filter(item => {
        let vietnameseKey = removeVietnameseTones(this.keySearch).toLowerCase();
        let vietnameseTag = removeVietnameseTones(item.name).toLowerCase();

        return vietnameseTag.includes(vietnameseKey);
      });
    }
  }
};
</script>
