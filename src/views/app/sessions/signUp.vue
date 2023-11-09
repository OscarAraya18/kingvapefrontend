<template>
  <div
    class="auth-layout-wrap"
    :style="{ backgroundImage: 'url(' + bgImage + ')' }"
  >
    <div class="auth-content">
      <div class="card o-hidden">
        <div class="row">
          

          <b-col>
            <div class="p-4">
              <h1 class="mb-3 text-18">Sign Up</h1>
              <b-form @submit.prevent="submit">
                <b-form-group label="Agent name">
                  <b-form-input
                    class="form-control form-control-rounded"
                    label="Name"
                    v-model="agentName"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Agent username">
                  <b-form-input
                    class="form-control form-control-rounded"
                    label="Name"
                    type="email"
                    v-model="agentUsername"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Password">
                  <b-form-input
                    class="form-control form-control-rounded"
                    label="Name"
                    type="password"
                    v-model="password"
                  >
                  </b-form-input>

                </b-form-group>
                <br>
                <b-button
                  type="submit"
                  block
                  variant="primary"
                  class="btn-rounded"
                  
                  >Create agent</b-button
                >

              </b-form>
            </div>
          </b-col>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const constants = require('@../../../src/constants.js'); 

import { required, sameAs, minLength } from "vuelidate/lib/validators";
import { mapGetters, mapActions } from "vuex";
import router from "../../../router";
export default {
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "SignUp",
  },

  data() {
    return {
      agentName: "",
      agentUsername: "",
      password: "",
    };
  },

  computed: {
    ...mapGetters(["loggedInUser", "loading", "error"]),
  },

  methods: {
    ...mapActions(["signUserUp"]),
    //   validate form
    submit() {
      axios.post(constants.routes.backendAPI+'/createAgent',{
        agentUsername: this.agentUsername,
        agentPassword: this.password,
        agentName: this.agentName
      })
      .then(response =>{ 
        router.push('/app/sessions/signIn')
      })
      
      .catch(error =>{
        console.log(error);
      })
      
    },
    makeToast(variant = null) {
      this.$bvToast.toast("Please fill the form correctly.", {
        title: `Variant ${variant || "default"}`,
        variant: variant,
        solid: true,
      });
    },
    makeToastTwo(variant = null) {
      this.$bvToast.toast("Successfully Created Account", {
        title: `Variant ${variant || "default"}`,
        variant: variant,
        solid: true,
      });
    },

    inputSubmit() {
      // console.log("submitted");
    },
  },
};
</script>
<style>
.spinner.sm {
  height: 2em;
  width: 2em;
}
</style>
