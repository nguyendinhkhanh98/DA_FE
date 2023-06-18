<template>
  <a-card class="shadow">
    <a-result status="404" title="404" :sub-title="$t('sorry_not_found')">
      <template #extra>
        <a-button type="primary">
          <nuxt-link to="/">{{ $t("go_to_dashboard") }}</nuxt-link>
        </a-button>
      </template>
    </a-result>
  </a-card>
</template>
<script>
export default {
  data() {
    return {};
  }
};
</script>
