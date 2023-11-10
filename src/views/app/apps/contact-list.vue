<template>
  
  <div class="main-content">
    <b-card>
      <vue-good-table
        :columns="columns"
        :line-numbers="false"
        :search-options="{
          enabled: true,
          placeholder: 'Coloca el nombre o número del contacto',
        }"
        styleClass="tableOne vgt-table"
        :rows="rows"
      >
        <div slot="table-actions" class="m-3">
          <b-button
            @click="openCreateContactModal()"
            variant="primary"
            class="btn-icon btn d-none d-sm-block"
            v-b-modal.modalCrear
            ><i class="i-Add-User mr-2"> </i>Crear contacto
          </b-button>
        </div>

        <template slot="table-row" slot-scope="props">
          <span v-if="props.column.field == 'button'">
              <i class="i-Notepad text-25 text-warning" @click="openContact(props.row.button)" v-b-modal.modalContactar style="cursor: pointer; margin-right: 7px;"></i>
              
              <i class="i-Eraser-2 text-25 text-success mr-2" @click="openEdit(props.row.button)" v-b-modal.modalEditar style="cursor: pointer"></i>
            
              <i class="i-Close-Window text-25 text-danger" @click="deleteContact(props.row.button)" style="cursor: pointer"></i>

          </span>
          <span v-else-if="props.column.field == 'name'">
              <div class="ul-widget-app__profile-pic">
                {{ props.row.name }}
              </div>
          </span>

          <span v-else-if="props.column.field == 'location'">
            <div style="border-radius: 15px; width: 250px; overflow: hidden;">
            <GmapMap :center="props.row.location" :zoom="15" style="width: 300px; height: 200px;">
              <GmapMarker
                    :position="props.row.location"
                              :draggable="false"
                            /></GmapMap>
            </div>
          </span>
        </template>
      </vue-good-table>


      <b-modal id="modalContactar" title="Enviar mensaje al contacto" @ok="sendMessage()" ref="modalContactar" centered>
        <div class="p-3">

          <b-form-group label="Mensaje a enviar:" style="font-size: medium;">
            <b-form-textarea
              class="form-control"
              label="note"
              v-model="sendingMessage"
              rows="3"
            >
            </b-form-textarea>
            <br>
          </b-form-group>
        </div>
      </b-modal>


      <b-modal id="modalEditar" title="Editar contacto" hide-footer ref="modalEditar" centered> 
        <div class="p-3">
          <b-form @submit.prevent="submit">
            <b-form-group label="Nombre del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="Name"
                v-model="editingName"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Número del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="editingID"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Correo electrónico del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="email"
                v-model="editingEmail"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Nota de la dirección del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-textarea
                class="form-control"
                label="locationDetails"
                v-model="editingLocationDetails"
                rows="3"
              >
              </b-form-textarea>
            </b-form-group>

            <b-form-group label="Nota del envío del contacto:" style="font-size: medium;">
              <b-form-textarea
                class="form-control"
                label="note"
                v-model="editingNote"
                rows="3"
              >
              </b-form-textarea>
              <br>
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



      <b-modal id="modalCrear" title="Crear contacto" hide-footer ref="modalCrear" centered>
        <div class="p-3">
          <b-form @submit.prevent="createContact">
            <b-form-group label="Nombre del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="Name"
                v-model="creatingName"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Número del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="creatingPhoneNumber"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Correo electrónico del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="email"
                v-model="creatingEmail"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Nota de la dirección del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-textarea
                class="form-control"
                label="locationDetails"
                v-model="creatingLocationDetails"
                rows="3"
              >
              </b-form-textarea>
            </b-form-group>

            <b-form-group label="Nota del envío del contacto:" style="font-size: medium;">
              <b-form-textarea
                class="form-control"
                label="note"
                v-model="creatingNote"
                rows="3"
              >
              </b-form-textarea>
            </b-form-group>
            <br>
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
    </b-card>
  </div>
</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
import * as VueGoogleMaps from 'vue2-google-maps'


export default {
  metaInfo: {
    // if no subcomponents specify a metaInfo.title, this title will be used
    title: "Task Manager",
  },
  data() {
    return {
      allContactsInformation: [],

      sendingMessage: '',

      foods: ["apple", "orrange"],
      columns: [
        {
          label: "Nombre",
          field: "name",
        },
        {
          label: "Número",
          field: "phone",
        },
        {
          label: "Ubicación",
          field: "location",
          html: true,
        },
        {
          label: "Correo electrónico",
          field: "email",
        },
        {
          label: "Nota de la dirección",
          field: "locationDetails",
        },
        {
          label: "Nota del envío",
          field: "note",
        },
        {
          label: "Opciones",
          field: "button",
          html: true,
          tdClass: "text-right",
          thClass: "text-right",
        },
      ],
      rows: [],

      editingID: '',
      editingName: '',
      editingEmail: '',
      editingLocationDetails: '',
      editingNote: '',

      creatingPhoneNumber: '',
      creatingName: '',
      creatingEmail: '',
      creatingLocationDetails: '',
      creatingNote: '',

      sendingID: ''
    };

    
  },

  mounted(){
    this.getAllContacts();
    this.sendingMessage = localStorage.getItem('agentWelcomeMessage');
  },

  methods: {
    openCreateContactModal(){
      this.creatingPhoneNumber = '';
      this.creatingName = '';
      this.creatingEmail = '';
      this.creatingLocationDetails = '';
      this.creatingNote = '';
    },

    sendMessage(){
      const phoneNumber = this.allContactsInformation[this.sendingID].contactPhoneNumber;
      axios.get(constants.routes.backendAPI
            +'/sendWhatsappMessage?'
            +'type=text'
            +'&recipientPhoneNumber='+phoneNumber
            +'&messageContent='+this.sendingMessage
            +'&agentID='+localStorage.getItem('agentID')
            +'&sendedProduct=0')
      .then(() =>{ 
        this.$bvToast.toast("Se ha enviado exitosamente el mensaje al contacto con el número '" + phoneNumber + "'.", {
          title: "Mensaje enviado",
          variant: "success",
          solid: true
        });
      })
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al enviar el mensaje",
          variant: "danger",
          solid: true
        });
      })
    },

    createContact(){
      axios.post(constants.routes.backendAPI+'/createContactFromContactList', {'contactID': this.creatingPhoneNumber, 'contactName': this.creatingName, 'contactEmail': this.creatingEmail, 'contactLocationDetails': this.creatingLocationDetails, 'contactNote': this.creatingNote})
      .then(() =>{ 
        this.$bvToast.toast("Se ha creado exitosamente el contacto con el número '" + this.creatingPhoneNumber + "'.", {
          title: "Contacto creado",
          variant: "success",
          solid: true
        });
        this.creatingPhoneNumber = '';
        this.creatingName = '';
        this.creatingEmail = '';
        this.creatingLocationDetails = '';
        this.creatingNote = '';
        this.rows = [];
        this.getAllContacts();
        this.$refs['modalCrear'].hide();
      })
      
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al crear el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
        title: "Error al crear el contacto",
        variant: "danger",
        solid: true
        });
      })
    },

    deleteContact(contactID){
      axios.post(constants.routes.backendAPI+'/deleteContact', {'contactID': contactID})
      .then(() =>{ 
        this.$bvToast.toast("Se ha eliminado exitosamente el contacto con el número '" + contactID + "'.", {
          title: "Contacto eliminado",
          variant: "success",
          solid: true
        });
        this.rows = [];
        this.getAllContacts();
      })
      
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al eliminar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al eliminar el contacto",
          variant: "danger",
          solid: true
        });
      })
    },
    openEdit(contactID){
      this.editingID = contactID;
      this.editingName = this.allContactsInformation[contactID].contactName;
      this.editingEmail = this.allContactsInformation[contactID].contactEmail;
      this.editingLocationDetails = this.allContactsInformation[contactID].contactLocationDetails;
      this.editingNote = this.allContactsInformation[contactID].contactNote;
    },

    openContact(contactID){
      this.sendingMessage = localStorage.getItem('agentWelcomeMessage');
      this.sendingID = contactID;
    },

    submit(){
      axios.post(constants.routes.backendAPI+'/updateContact', {'contactID': this.editingID, 'contactName': this.editingName, 'contactEmail': this.editingEmail, 'contactLocationDetails': this.editingLocationDetails, 'contactNote': this.editingNote})
      .then(() =>{ 
        this.$bvToast.toast("Se ha editado exitosamente el contacto con el número '" + this.editingID + "'.", {
          title: "Contacto editado",
          variant: "success",
          solid: true
        });
        this.rows = [];
        this.getAllContacts();
        this.$refs['modalEditar'].hide();
      })
      
      .catch(error =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al editar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al editar el contacto",
          variant: "danger",
          solid: true
        });
      })
    },

    getAllContacts(){
      axios.get(constants.routes.backendAPI+'/getAllContacts')
      .then(response =>{ 
        console.log(response.data)
        this.allContactsInformation = response.data;
        for (var contact in response.data){
          if (response.data[contact]['contactLocation'] != undefined){
            var center = {lat: parseInt(response.data[contact]['CASA'].contactLocation.latitude), lng: parseInt(response.data[contact]['CASA'].contactLocation.longitude)}
            var email = '';
            if (response.data[contact].contactEmail != ''){
              email = response.data[contact].contactEmail;
            } else {
              email = 'No email';
            }
            this.rows.push(
              {
                name: response.data[contact].contactName,
                location: center,
                email: email,
                phone: response.data[contact].contactPhoneNumber,
                locationDetails: response.data[contact].contactLocationDetails,
                note: response.data[contact].contactNote,
                button: contact
              }
            )
          }
        }
        

      })
      
      .catch(error =>{
        console.log(error);
      })
    }
  },
};
</script>
<style></style>
