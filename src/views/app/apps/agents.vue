<template>
  <div class="main-content">
    <b-card>
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

          <b-modal id="modalEditar" title="Edit agent" hide-footer ref="modalEditar">
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

          <b-modal id="modal-1" title="BootstrapVue">
            <b-form>
              <b-form-group
                id="input-group-1"
                label="Email address:"
                label-for="input-1"
                description="We'll never share your email with anyone else."
              >
                <b-form-input
                  id="input-1"
                  type="email"
                  required
                  placeholder="Enter email"
                ></b-form-input>
              </b-form-group>

              <b-form-group
                id="input-group-2"
                label="Your Name:"
                label-for="input-2"
              >
                <b-form-input
                  id="input-2"
                  required
                  placeholder="Enter name"
                ></b-form-input>
              </b-form-group>

              

              <b-form-group id="input-group-4">
                <b-form-checkbox-group id="checkboxes-4">
                  <b-form-checkbox value="me">Check me out</b-form-checkbox>
                  <b-form-checkbox value="that">Check that out</b-form-checkbox>
                </b-form-checkbox-group>
              </b-form-group>
            </b-form>
          </b-modal>


          
        </div>

        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'button'">
              <i class="i-Eraser-2 text-25 text-success mr-2" style="cursor: pointer;" @click="openEditAgent(props.row.button)"  v-b-modal.modalEditar></i>
              <i class="i-Close-Window text-25 text-danger" @click="deleteAgent(props.row.button)" style="cursor: pointer;"></i>
          </span>
          <span v-else-if="props.column.field == 'status'">
            <span @click="changeAgentStatus(props.row.button, props.row.status)" style="cursor:pointer;" v-if="props.row.status == 'ONLINE'" class="badge badge-success">ONLINE</span>
            <span @click="changeAgentStatus(props.row.button, props.row.status)" style="cursor:pointer;" v-else class="badge badge-danger">OFFLINE</span>

          </span>
          <span v-else-if="props.column.field == 'name'">
            <div class="ul-widget-app__profile-pic">
              <img
                class="profile-picture avatar-sm mb-2 rounded-circle img-fluid"
                v-if="props.row.avatar != ''"
                :src="props.row.avatar"
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
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');


export default {
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "Task Manager",
  },
  data() {
    return {
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
    this.agentDefaultProfilePicture = constants.agentDefaultProfilePicture;
    this.getAllAgents();

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);

        if (websocketMessageJSON['websocketMessageID'] == 'updateAgentStatus'){
          const agentID = websocketMessageJSON['agentID'];
          var agentStatus = websocketMessageJSON['agentStatus'];
          if (agentStatus == 'online'){
            agentStatus = 'ONLINE';
          } else {
            agentStatus = 'OFFLINE';
          }
          for (var agentIndex in this.agents){
            if (this.agents[agentIndex]['id'] == agentID){
              this.agents[agentIndex]['status'] = agentStatus; 
            }
          }
          this.allAgentsInformation[agentID]['agentStatus'] = agentStatus;
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

    changeAgentStatus(agentID, agentCurrentStatus){
      var temp = '';
      var aux = '';
      if (agentCurrentStatus == 'ONLINE'){
        temp = 'offline';
        aux = 'OFFLINE';
      } else {
        temp = 'online';
        aux = 'ONLINE';
      }
      axios.post(constants.routes.backendAPI+'/updateAgentStatus',{
        agentID: agentID,
        agentStatus: temp 
      })
      .then(() =>{ 
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
      axios.post(constants.routes.backendAPI+'/createAgent', {'agentID': this.creatingID, 'agentName': this.creatingName, 'agentUsername': this.creatingUsername, 'agentPassword': this.creatingPassword, 'agentType': this.creatingType})
      .then(() =>{ 
        this.agents = [];
        this.getAllAgents();
        this.$refs['modalCrear'].hide();
        this.$bvToast.toast("Se ha creado exitosamente el agente con la cédula '" + this.creatingID + "'.", {
          title: "Agente creado",
          variant: "success",
          solid: true
        });
      })
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al crear el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al crear el agente",
          variant: "danger",
          solid: true
        });
      });
    },

    submit(){
      axios.post(constants.routes.backendAPI+'/updateAgentFromAdminPortal', {'agentID': this.editingID, 'agentName': this.editingName, 'agentUsername': this.editingUsername, 'agentPassword': this.editingPassword})
      .then(() =>{ 
        this.agents = [];
        this.getAllAgents();
        this.$refs['modalEditar'].hide();
        this.$bvToast.toast("Se ha editado exitosamente el agente con la cédula '" + this.editingID + "'.", {
          title: "Agente editado",
          variant: "success",
          solid: true
        });
      })
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al editar el agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al editar el agente",
          variant: "danger",
          solid: true
        });
      });
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
        .then(() =>{ 
          this.agents = [];
          this.getAllAgents();
          this.$bvToast.toast("Se ha eliminado exitosamente el agente con la cédula '" + agentID + "'.", {
            title: "Agente eliminado",
            variant: "success",
            solid: true
          });
        })
        .catch(() =>{
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
      axios.get(constants.routes.backendAPI+'/getAllAgents').then(response =>{ 
        for (var agentID in response.data){
          var status = '';
          if (response.data[agentID].agentStatus == 'online'){
            status = 'ONLINE';
          } else {
            status = 'OFFLINE';
          }
          this.agents.push(
            { 
              avatar: response.data[agentID].agentProfilePicture,
              name: response.data[agentID].agentName,
              id: agentID,
              username: response.data[agentID].agentUsername,
              status: status,
              button: agentID
            }
          );
          this.allAgentsInformation[agentID] = {agentName: response.data[agentID].agentName, agentUsername: response.data[agentID].agentUsername, agentPassword: response.data[agentID].agentPassword};
        }
      })
      .catch(() =>{
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