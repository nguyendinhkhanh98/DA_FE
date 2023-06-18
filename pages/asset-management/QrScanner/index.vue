<template>
  <div>
    <p class="error">{{ error }}</p>

    <p class="decode-result">
      {{ $t("total_result") }}: <b>{{ result }}</b>
    </p>

    <qrcode-stream @decode="onDecode" @init="onInit" />
  </div>
</template>

<script>
import { QrcodeStream } from "vue-qrcode-reader";
import { mapState, mapActions } from "vuex";

export default {
  name: "QRScanner",
  middleware: "permissions",
  meta: {
    permissions: ["admin", "manager", "leader", "developer", "tester", "asset_admin"]
  },
  components: { QrcodeStream },
  data() {
    return {
      result: "",
      error: ""
    };
  },
  computed: {
    ...mapState({
      listAsset: state => state.modules["asset-management"].data,
      storeLoaded: state => state.modules["asset-management"].storeLoaded
    })
  },
  methods: {
    ...mapActions({
      fetch: "modules/asset-management/fetch"
    }),
    async onDecode(result) {
      const regex = /^\d+$/g;
      if (regex.test(result)) {
        let item = _.find(this.listAsset, o => o.id == result);
        let userId = item ? item.id : -1;

        if (userId >= 0) this.$router.push(`/asset-management/${userId}`);
        else this.result = `CODE: [${result}]`;
      } else this.result = `CODE-[${result}]`;
    },

    async onInit(promise) {
      try {
        await promise;
      } catch (error) {
        if (error.name === "NotAllowedError") {
          this.error = "ERROR: you need to grant camera access permisson";
        } else if (error.name === "NotFoundError") {
          this.error = "ERROR: no camera on this device";
        } else if (error.name === "NotSupportedError") {
          this.error = "ERROR: secure context required (HTTPS, localhost)";
        } else if (error.name === "NotReadableError") {
          this.error = "ERROR: is the camera already in use?";
        } else if (error.name === "OverconstrainedError") {
          this.error = "ERROR: installed cameras are not suitable";
        } else if (error.name === "StreamApiNotSupportedError") {
          this.error = "ERROR: Stream API is not supported in this browser";
        } else {
          this.error = "Value scan invalid";
        }
      }
    }
  },
  mounted() {
    if (!this.storeLoaded) {
      this.fetch().then();
    }
  }
};
</script>

<style scoped>
.error {
  font-weight: bold;
  color: red;
}
</style>
