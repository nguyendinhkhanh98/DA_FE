<template>
  <a-row type="flex" justify="center" align="middle" style="background:#ECECEC; height: 100vh; padding-bottom: 150px;">
    <a-col :md="6" :xs="24">
      <a-card style="border-radius: 5px;" class="m-2 shadow">
        <h1>{{ $t("reset_password") }}</h1>
        <ValidationObserver v-slot="{ handleSubmit }">
          <a-form id="form-login" @submit.prevent="handleSubmit(onResetPassword)">
            <ValidationProvider :name="$t('password')" rules="required" v-slot="{ errors }">
              <a-form-item :label="$t('password')" :validate-status="errors[0] ? 'error' : 'success'" :help="errors[0]">
                <a-input
                  :placeholder="$t('enter_your_new_password_to_reset')"
                  v-model="password"
                  name="password"
                  type="password"
                />
              </a-form-item>
            </ValidationProvider>
            <a-button class="mt-3" type="primary" htmlType="submit" block>
              {{ $t("reset") }}
            </a-button>
            <a-row class="mt-1">
              <nuxt-link style="float: right;" to="/login">{{ $t("login") }}</nuxt-link>
            </a-row>
          </a-form>
        </ValidationObserver>
      </a-card>
    </a-col>
  </a-row>
</template>

<script>
import { mapActions } from "vuex";
export default {
  layout: "guest",
  data() {
    return {
      password: ""
    };
  },
  mounted() {
    localStorage.removeItem("token");
  },
  methods: {
    ...mapActions({
      resetPassword: "modules/auth/resetPassword"
    }),
    onResetPassword() {
      this.resetPassword({ password: this.password, token: this.$route.query.token })
        .then(response => {
          this.$notification.success({
            message: response.data.message,
            description: response.data.message,
            duration: 2.5
          });
          this.$router.push("/login");
        })
        .catch(error => {
          this.$notification.error({
            message: error.response.data.error,
            description: error.response.data.error,
            duration: 2.5
          });
        });
    }
  }
};
</script>

<style></style>
