<template>
  <div class="main-content">
    <div v-if="loaderList==true" style="text-align: center;">
      <br>
      <span class="spinner-glow spinner-glow-primary"></span>
    </div>

    <b-card v-else>
      <vue-good-table
        :columns="columns"
        :line-numbers="false"
        :search-options="{
          enabled: true,
          placeholder: 'Coloca el nombre del agente',
        }"
        styleClass="tableOne vgt-table"
        :rows="agents"
      >
        <div slot="table-actions" class="m-3">
          <b-button
            @click="openCreateAgentModal()"
            variant="primary"
            class="btn-icon btn d-none d-sm-block"
            v-b-modal.createAgentModal
            ><i class="i-Add-User text-white mr-2"> </i>Crear agente
          </b-button>

          <b-modal id="createAgentModal" centered title="Crear agente" hide-footer ref="modalCrear">
            <div class="p-3">
              <b-form @submit.prevent="createAgent">
                <b-form-group label="Nombre del agente:" style="font-size: medium;" class="pb-2">
                  <b-form-input
                    class="form-control"
                    label="Name"
                    v-model="creatingName"
                  >
                  </b-form-input>
                </b-form-group>
                
                <b-form-group label="Cédula del agente:" style="font-size: medium;" class="pb-2">
                  <b-form-input
                    class="form-control"
                    label="ID"
                    v-model="creatingID"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Nombre de usuario del agente:" style="font-size: medium;" class="pb-2">
                  <b-form-input
                    class="form-control"
                    label="Username"
                    v-model="creatingUsername"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Contraseña del agente:" style="font-size: medium;" class="pb-2">
                  <b-form-input
                    class="form-control"
                    label="Password"
                    v-model="creatingPassword"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Tipo de agente:" style="font-size: medium;" class="pb-4">
                  <b-form-select v-model="creatingType" :options="dropdownOptions"></b-form-select>
                </b-form-group>

                <b-button
                  type="submit"
                  block
                  variant="primary"
                  class="btn-icon btn"
                  >Guardar cambios</b-button
                >

              </b-form>
            </div>
          </b-modal>

          <b-modal id="modalEditar" title="Editar agente" hide-footer ref="modalEditar" centered>
            <div class="p-3">
              <b-form @submit.prevent="submit">
                
                <b-form-group label="Nombre del agente" style="font-size: medium;" class="pb-2">
                  <b-form-input
                    class="form-control"
                    label="Name"
                    v-model="editingName"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Nombre de usuario del agente" style="font-size: medium;" class="pb-2">
                  <b-form-input
                    class="form-control"
                    label="Username"
                    v-model="editingUsername"
                  >
                  </b-form-input>
                </b-form-group>

                <b-form-group label="Contraseña del agente" style="font-size: medium;" class="pb-1">
                  <b-form-input
                    class="form-control"
                    label="Password"
                    v-model="editingPassword"
                  >
                  </b-form-input>

                </b-form-group>
                <br>
                <b-button
                  type="submit"
                  block
                  variant="primary"
                  class="btn btn-icon"
                  >Guardar cambios</b-button
                >

              </b-form>
            </div>
          </b-modal>

        </div>

        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'button'">
              <i class="i-Eraser-2 text-25 text-success mr-2" style="cursor: pointer;" @click="openEditAgent(props.row.button)"  v-b-modal.modalEditar></i>
              <i class="i-Close-Window text-25 text-danger" @click="deleteAgent(props.row.button)" style="cursor: pointer;"></i>
          </span>
          <span v-else-if="props.column.field == 'status'">
            <span @click="updateAgentStatus(props.row.button, props.row.status)" style="cursor:pointer;" v-if="props.row.status == 'ONLINE'" class="badge badge-success">ONLINE</span>
            <span @click="updateAgentStatus(props.row.button, props.row.status)" style="cursor:pointer;" v-else class="badge badge-danger">OFFLINE</span>
          </span>
          <span v-else-if="props.column.field == 'name'">
            <div class="ul-widget-app__profile-pic">
              <img
                class="profile-picture avatar-sm mb-2 rounded-circle img-fluid"
                v-if="props.row.avatar != ''"
                :src="`data:image/png;base64,${props.row.avatar}`"
                alt=""
                style="margin-right: 20px;"
              />
              <img
                class="profile-picture avatar-sm mb-2 rounded-circle img-fluid"
                v-else
                :src="agentDefaultProfilePicture"
                alt=""
                style="margin-right: 20px;"
              />
              {{ props.row.name }}
            </div>
          </span>
        </template>
      </vue-good-table>
    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
import router from "../../../router"; 
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:payitcr.com');


export default {
  data() {
    return {
      loaderList: false,

      dropdownOptions: [{value:"agent", text:"Agente"}, {value:"admin", text:"Administrador"}],
      creatingID: '',
      creatingName: '',
      creatingUsername: '',
      creatingPassword: '',
      creatingType: '',

      editingID: '',
      editingName: '',
      editingUsername: '',
      editingPassword: '',

      agentDefaultProfilePicture: ``,
      columns: [
        {
          label: "Nombre",
          field: "name",
        },
        {
          label: "Cédula",
          field: "id",
        },
        {
          label: "Nombre de usuario",
          field: "username",
        },
        {
          label: "Estado",
          field: "status",
          html: true,
        },
        {
          label: "Button",
          field: "button",
          html: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
      ],
      agents: [],

      allAgentsInformation: {}
    };
  },

  mounted(){
    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }

    this.agentDefaultProfilePicture = constants.agentDefaultProfilePicture;
    this.getAllAgents();

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;

        if (websocketMessageID == '/agent/update/agentStatus'){
          for (var agentIndex in this.agents){
            if (this.agents[agentIndex].id == websocketMessageContent.agentID){
              var status = '';
              if (websocketMessageContent.agentStatus == 'online'){
                status = 'ONLINE';
              } else {
                status = 'OFFLINE';
              }
              this.agents[agentIndex].status = status;
            }
          }
        }
      }
    } catch {
  
    }
  },
  methods: {
    openCreateAgentModal(){
      this.creatingID = '';
      this.creatingName = '';
      this.creatingUsername = '';
      this.creatingPassword = '';
      this.creatingType = '';
    },

    updateAgentStatus(agentID, agentCurrentStatus){
      var temp = '';
      var aux = '';
      if (agentCurrentStatus == 'ONLINE'){
        temp = 'offline';
        aux = 'OFFLINE';
      } else {
        temp = 'online';
        aux = 'ONLINE';
      }
      axios.post(constants.routes.backendAPI+'/agent/update/agentStatus',
      {
        agentID: agentID,
        agentName: this.allAgentsInformation[agentID].agentName,
        agentStatus: temp 
      })
      .then((response) =>{
        if (response.data.success){
          for (var agentIndex in this.agents){
            if (this.agents[agentIndex].id == agentID){
              this.agents[agentIndex].status = aux;
            }
          }
          this.$bvToast.toast("Se ha modificado el estado del agente con la cédula '" + agentID + "'.", {
            title: "Estado del agente modificado",
            variant: "success",
            solid: true
          });
        } else {
          this.$bvToast.toast("Ha ocurrido un error inesperado al modificar el estado del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al modificar el estado del agente",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al modificar el estado del agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al modificar el estado del agente",
          variant: "danger",
          solid: true
        });
      });

    },

    createAgent(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.creatingID) && regularExpressionChecker.test(this.creatingName) && regularExpressionChecker.test(this.creatingUsername) && regularExpressionChecker.test(this.creatingPassword) && regularExpressionChecker.test(this.creatingType)){
        axios.post(constants.routes.backendAPI+'/insertAgent', 
        {
          'agentID': this.creatingID,
          'agentName': this.creatingName,
          'agentUsername': this.creatingUsername,
          'agentPassword': this.creatingPassword, 
          'agentType': this.creatingType
        })
        .then((response) =>{ 
          if (response.data.success){
            this.getAllAgents();
            this.$refs['modalCrear'].hide();
            this.$bvToast.toast("Se ha creado exitosamente el agente con la cédula '" + this.creatingID + "'.", {
              title: "Agente creado",
              variant: "success",
              solid: true
            });
          } else {
            this.$bvToast.toast("Ha ocurrido un error inesperado al crear el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Error al crear el agente",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch((error) =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al crear el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al crear el agente",
            variant: "danger",
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido de la información del agente no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear el agente',
          variant: 'danger',
          solid: true
        });
      }
    },

    submit(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.editingID) && regularExpressionChecker.test(this.editingName) && regularExpressionChecker.test(this.editingUsername) && regularExpressionChecker.test(this.editingPassword)){
        axios.post(constants.routes.backendAPI+'/agent/update', 
        {
          'agentID': this.editingID, 
          'agentUsername': this.editingUsername, 
          'agentPassword': this.editingPassword,
          'agentName': this.editingName
        }
        ).then((response) =>{ 
          console.log(response)
          if (response.data.success){
            this.getAllAgents();
            this.$refs['modalEditar'].hide();
            this.$bvToast.toast("Se ha editado exitosamente el agente con la cédula '" + this.editingID + "'.", {
              title: "Agente editado",
              variant: "success",
              solid: true
            });
          } else {
            this.$bvToast.toast("Ha ocurrido un error inesperado al editar el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Error al editar el agente",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch((error) =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al editar el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al editar el agente",
            variant: "danger",
            solid: true
          });
        });
      } else {
        this.$bvToast.toast('El contenido de la información del agente no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar el agente',
          variant: 'danger',
          solid: true
        });
      }
    },

    openEditAgent(agentID){
      this.editingID = agentID;
      this.editingName = this.allAgentsInformation[agentID].agentName;
      this.editingUsername = this.allAgentsInformation[agentID].agentUsername;
      this.editingPassword = this.allAgentsInformation[agentID].agentPassword;
    },

    deleteAgent(agentID){
      if (agentID != localStorage.getItem('agentID')){
        axios.post(constants.routes.backendAPI+'/deleteAgent', {'agentID': agentID})
        .then((response) =>{ 
          if (response.data.success){
            this.getAllAgents();
            this.$bvToast.toast("Se ha eliminado exitosamente el agente con la cédula '" + agentID + "'.", {
              title: "Agente eliminado",
              variant: "success",
              solid: true
            });
          } else {
            this.$bvToast.toast("Ha ocurrido un error inesperado al eliminar el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Error al eliminar el agente",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch((error) =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al eliminar el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al eliminar el agente",
            variant: "danger",
            solid: true
          });
        })
      } else {
        this.$bvToast.toast("No es posible eliminar su propia cuenta. Por favor, solicitelo a su administrador del sistema o a soporte técnico.", {
          title: "Error al eliminar el agente",
          variant: "danger",
          solid: true
        });
      }
    },

    getAllAgents(){
      this.allAgentsInformation = {};
      this.agents = [];
      this.loaderList = true;
      axios.get(constants.routes.backendAPI+'/agent/select')
      .then((response) => {
        const agentsInformation = response.data.result;

        for (var agentIndex in agentsInformation){
          var status = '';
          if (agentsInformation[agentIndex].agentStatus == 'online'){
            status = 'ONLINE';
          } else {
            status = 'OFFLINE';
          }
          this.agents.push(
          { 
            avatar: agentsInformation[agentIndex].agentProfileImage,
            name: agentsInformation[agentIndex].agentName,
            id: agentsInformation[agentIndex].agentID,
            username: agentsInformation[agentIndex].agentUsername,
            status: status,
            button: agentsInformation[agentIndex].agentID,
          });
          this.allAgentsInformation[agentsInformation[agentIndex].agentID] = {agentName: agentsInformation[agentIndex].agentName, agentUsername: agentsInformation[agentIndex].agentUsername, agentPassword: agentsInformation[agentIndex].agentPassword};
        }
        this.loaderList = false;
      })
      .catch((error) =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar la lista de agentes",
          variant: "danger",
          solid: true
        });
      });
    }

  },
};
</script>

<style></style>