<template>
  <div>

    <b-modal scrollable hide-footer hide-header size="lg" centered hide-backdrop id="mapConversationModal" @shown="scrollToBottom">
      <div v-if="openConversationLoader == true" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-else>
        <div style="margin-bottom: 20px;">
          <div style="display: flex;">
            <h3><strong>{{openedName}}</strong></h3>
            <div class="flex-grow-1"></div>
          </div>
          <h3>{{parseNumber(openedNumber)}}</h3>
        </div>


        <div v-if="currentConversation != null" ref="scrollHistory" style="max-height: 80vh; overflow-y: auto;">
          <div v-for="currentActiveConversationMessage in currentConversation.whatsappConversationMessages">
            
            <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
              <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                <div class="d-flex">
                  <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                      <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                        
                        <div v-if="currentConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentConversation.whatsappConversationMessages">
                          <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                            
                            <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                            <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                              <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                              <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                              <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                              <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                              <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                              <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                              Mapa de ubicación (no se puede renderizar dentro de este componente)
                              <br>
                              <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                              <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                              <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                            </div>
                            
                            <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                              <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                              <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                    <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                    </div>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                      <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                    </div>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='video'"> 
                      <video controls width="400" :src="`data:video/mp4;base64,${currentActiveConversationMessage.whatsappVideoMessageFile}`"></video>
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappVideoMessageCaption}}</p>
                    </div>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                      Mapa de ubicación (no se puede renderizar dentro de este componente)

                      <br>
                      <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                      <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                    </div>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='document'" class="m-0">
                      <a style="color: black;" :href="`data:${currentActiveConversationMessage.whatsappDocumentMessageMimeType};base64,${currentActiveConversationMessage.whatsappDocumentMessageFile}`" :download="currentActiveConversationMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{currentActiveConversationMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                    </div>
                    
                    <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                      <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>

                    </div>
                  
                  </div>
                  <span v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null" style="display:flex; margin-left: 0; margin-right:auto;" class="text-small text-muted">
                    <img :id="'r'+currentActiveConversationMessage.whatsappGeneralMessageID" v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/read.png">
                    <img :id="'d'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null" style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/delivered.png">
                    <img :id="'s'+currentActiveConversationMessage.whatsappGeneralMessageID" v-else style="cursor: pointer; width: 25px; height: 25px; margin-right: 5px;" src="@/assets/send.png">
                    <b-tooltip :target="'r'+currentActiveConversationMessage.whatsappGeneralMessageID">
                      <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                    </b-tooltip>
                    <b-tooltip :target="'d'+currentActiveConversationMessage.whatsappGeneralMessageID">
                      <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                    </b-tooltip>
                    <b-tooltip :target="'s'+currentActiveConversationMessage.whatsappGeneralMessageID">
                      <p>Envíado: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime != null">Recibido: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageDeliveringDateTime)}}</p>
                      <p v-if="currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime != null">Leído: {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageReadingDateTime)}}</p>
                    </b-tooltip>
                    {{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}
                  </span>
                  <span v-else style="margin-left: auto; margin-right:0;" class="text-small text-muted">{{parseHour(currentActiveConversationMessage.whatsappGeneralMessageCreationDateTime)}}</span>
                  <div class="m-0" style="margin-left: auto; margin-right:0;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber == null">
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                      <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                        
                        <div v-if="currentConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentConversation.whatsappConversationMessages">

                          <div v-if="answeredMessage.whatsappGeneralMessageID == currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID">
                            
                            <p v-if="answeredMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{answeredMessage.whatsappTextMessageBody}}</p>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType == 'contact'"> 
                              <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{answeredMessage.whatsappContactMessageName}}</p>
                              <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{answeredMessage.whatsappContactMessagePhoneNumber}}</p>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType == 'image'"> 
                              <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${answeredMessage.whatsappImageMessageFile}`">
                              <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappImageMessageCaption}}</p>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType=='video'"> 
                              <video controls width="400" :src="`data:video/mp4;base64,${answeredMessage.whatsappVideoMessageFile}`"></video>
                              <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappImageMessageCaption != null">{{answeredMessage.whatsappVideoMessageCaption}}</p>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType=='location'" class="m-0">
                              Mapa de ubicación (no se puede renderizar dentro de este componente)

                              <br>
                              <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{answeredMessage.whatsappLocationMessageLatitude}}</p>
                              <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{answeredMessage.whatsappLocationMessageLongitude}}</p><br>
                            </div>
                            
                            <div v-if="answeredMessage.whatsappGeneralMessageType=='document'" class="m-0">
                              <a style="color: black;" :href="`data:${answeredMessage.whatsappDocumentMessageMimeType};base64,${answeredMessage.whatsappDocumentMessageFile}`" :download="answeredMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{answeredMessage.whatsappDocumentMessageFileName}}</strong></p></a>
                            </div>
                            
                            <audio controls v-if="answeredMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${answeredMessage.whatsappAudioMessageFile}`"></audio>
                          
                            <div v-if="answeredMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                              <img v-b-modal.bigImageModal @click="openBigImage(answeredMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="answeredMessage.whatsappFavoriteImageMessageDriveURL">
                              <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="answeredMessage.whatsappFavoriteImageMessageCaption != null">{{answeredMessage.whatsappFavoriteImageMessageCaption}}</p>
                            </div>
                          
                          </div>
                        </div>
                      </div>
                    </div>
                    <p v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{currentActiveConversationMessage.whatsappTextMessageBody}}</p>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'contact'"> 
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{currentActiveConversationMessage.whatsappContactMessageName}}</p>
                      <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{currentActiveConversationMessage.whatsappContactMessagePhoneNumber}}</p>
                    </div>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'image'"> 
                      <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${currentActiveConversationMessage.whatsappImageMessageFile}`">
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappImageMessageCaption != null">{{currentActiveConversationMessage.whatsappImageMessageCaption}}</p>
                    </div>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='location'" class="m-0">
                      Mapa de ubicación (no se puede renderizar dentro de este componente)

                      <br>
                      <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLatitude}}</p>
                      <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{currentActiveConversationMessage.whatsappLocationMessageLongitude}}</p><br>
                    </div>
                    
                    <audio controls v-if="currentActiveConversationMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${currentActiveConversationMessage.whatsappAudioMessageFile}`"></audio>
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
                      <img v-b-modal.bigImageModal @click="openBigImage(currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="currentActiveConversationMessage.whatsappFavoriteImageMessageDriveURL">
                      <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="currentActiveConversationMessage.whatsappFavoriteImageMessageCaption != null">{{currentActiveConversationMessage.whatsappFavoriteImageMessageCaption}}</p>
                    </div>
                  
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </b-modal>


    <b-modal scrollable size="lg" centered id="modalMapaConversacion" hide-footer hide-header>
      <div v-if="openedConversation" style="padding: 10px;">
        <h4><strong>ID: </strong>{{ openedConversation.whatsappConversationID }}</h4>
        <h4><strong>Nombre: </strong>{{ openedConversation.whatsappConversationRecipientProfileName }}</h4>
        <h4><strong>Número: </strong>{{ openedConversation.whatsappConversationRecipientPhoneNumber }}</h4>
        <h4><strong>Monto: </strong>₡{{ openedConversation.amount }}</h4>
        <br>
        <button @click="openConversation(openedConversation)" class="btn btn-icon btn-primary" v-b-modal.mapConversationModal>Abrir conversación</button>

      </div>
    </b-modal>

    <b-modal scrollable size="lg" centered id="modalMapaTienda" hide-footer hide-header>
      <div v-if="openedConversation" style="padding: 10px;">
        <h4><strong>ID: </strong>{{ openedConversation.whatsappInvoiceID }}</h4>
        <h4><strong>Nombre: </strong>{{ openedConversation.clientName }}</h4>
        <h4><strong>Número: </strong>{{ parseNumber(openedConversation.clientPhoneNumber) }}</h4>
        <h4><strong>Monto: </strong>₡{{ openedConversation.amount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h4>

        <div v-if="openedConversation.localityAgentName == null">
          <br>
          <button @click="openAssignLocalityAgentModal(openedConversation)" class="btn btn-primary mr-2">Asignar a mensajero</button>
        </div>
        <div v-else>
          <h4><strong>Mensajero: </strong>{{ openedConversation.localityAgentName }}</h4>
        </div>

      </div>
    </b-modal>

    <b-modal id="assignLocalityAgentModal2" size="sm" centered hide-header @ok="assignLocalityAgent()">

      <h5><strong>Seleccione un mensajero: </strong></h5>
      <b-form-select v-model="assignedLocalityAgent">
        <b-form-select-option
        v-for="(localityAgentOption, localityAgentOptionIndex) in localityAgentOptions"
        :key="localityAgentOptionIndex"
        :value="localityAgentOption.value"
        :title="localityAgentOption.title"> 
          <p>{{localityAgentOption.text}}</p>
        </b-form-select-option>
      </b-form-select>

      <br><br>

      <h5><strong>Seleccione un facturador: </strong></h5>
      <b-form-select v-model="assignedLocalityAgentBiller">
        <b-form-select-option
        v-for="(localityAgentOption, localityAgentOptionIndex) in localityAgentBillerOptions"
        :key="localityAgentOptionIndex"
        :value="localityAgentOption.value"
        :title="localityAgentOption.title"> 
          <p>{{localityAgentOption.text}}</p>
        </b-form-select-option>
      </b-form-select>

    </b-modal>



    <div :id="navigation.mapID" :style="`width: ${mapWidth}; height: ${mapHeight}`">
    </div> 



  </div>
</template>

<script>
import axios from 'axios';

import { Feature, Map, View } from 'ol';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { OSM, Vector as VectorSource } from 'ol/source';

import { fromLonLat } from "ol/proj";
import { Point, Polygon } from "ol/geom";
import { Fill, Icon, Stroke, Style} from "ol/style";
import { FullScreen, defaults as defaultControls } from 'ol/control.js';

const constants = require('@../../../src/constants.js'); 


export default {
  name: 'mapComponent',
  

  methods: {},

  data: () => ({
    navigation: 
    {
      mapComponent: null,
      mapID: `map-${Math.random().toString(36).substr(2, 9)}`
    },

    display:
    {
      storeMaps: null,
      smallStoreMaps: null,
      redZoneMaps: null
    },

    currentConversation: null,
    openedConversation: null,
    
    openConversationLoader: false,


    whatsappInvoiceID: null,
    whatsappInvoiceLocalityID: null,
    assignedLocalityAgentBiller: null,
    assignedLocalityAgent: null,

    backendURL: 'https://payitcr.com'
  }),

  props: {
    mapWidth: String,
    mapHeight: String,
    clientLongitude: Number,
    clientLatitude: Number,
    multipleClients: Array,
    route: Boolean,
    localityMap: Boolean,
    localityAgentOptions: Array,
    localityAgentBillerOptions: Array
  },

  methods: {
    assignLocalityAgent(){
      if ((this.assignedLocalityAgent != null) && (this.assignedLocalityAgentBiller != null)){        
        axios.post(this.backendURL+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: this.whatsappInvoiceID,
          whatsappInvoiceState: 'R',
          whatsappInvoiceLocalityID: this.whatsappInvoiceLocalityID,
          whatsappInvoiceLocalityAgentID: this.assignedLocalityAgent,
          whatsappInvoiceLocalityAgentBillerID: this.assignedLocalityAgentBiller
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda asignada', 'Se ha asignado la comanda existosamente.');
          } else {
            this.showNotification('danger', 'Error al asignar la comanda', 'Ha ocurrido un error inesperado al asignar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch((e) => {
          console.log(e)
          this.showNotification('danger', 'Error al asignar la comanda', 'Ha ocurrido un error inesperado al asignar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al asignar la comanda', 'Complete el mensajero asignado y el facturador e intente nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    openAssignLocalityAgentModal(whatsappInvoice){
      this.whatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.whatsappInvoiceLocalityID = whatsappInvoice.whatsappInvoiceLocalityID;
      this.assignedLocalityAgent = null;
      this.assignedLocalityAgentBiller = null;
      this.$root.$emit('bv::show::modal', 'assignLocalityAgentModal2');

    },
    

    parseNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    parseHour(originalHour){
      const parsingDate = new Date(originalHour);
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      };
      var formattedDate = parsingDate.toLocaleString('en-GB', options);
      if (formattedDate.slice(-2) == 'am'){
        formattedDate = formattedDate.slice(0,-2) + 'AM'
      } else if (formattedDate.slice(-2) == 'pm') {
        formattedDate = formattedDate.slice(0,-2) + 'PM'
      }
      return formattedDate;
    },

    openConversation(conversation){
      this.openConversationLoader = true;
      this.openedName = conversation.whatsappConversationRecipientProfileName;
      this.openedNumber = conversation.whatsappConversationRecipientPhoneNumber;
      this.currentConversation = null;
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        'whatsappConversationID': conversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.currentConversation = response.data.result[conversation.whatsappConversationID];
          console.log(this.currentConversation);
          this.openConversationLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        console.log(error);
        this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },


    renderMapDivision(mapDivisionPoints, mapDivisionColor, mapDivisionColorWithOpacity){
      const mapDivisionPointsFormatted = mapDivisionPoints.map(mapPoint => {
        return fromLonLat([mapPoint['lng'], mapPoint['lat']]);
      });
      const mapDivisionStrokeStyle = new Stroke
      ({
        'color': mapDivisionColor,
        'width': 3
      });
      const mapDivisionFillStyle = new Fill({'color': mapDivisionColorWithOpacity});
      const mapDivisionStyle = new Style
      ({
        'stroke': mapDivisionStrokeStyle,
        'fill': mapDivisionFillStyle
      });
      const mapDivisionPolygon = new Polygon([mapDivisionPointsFormatted]);
      const mapDivisionFeature = new Feature(mapDivisionPolygon);
      const mapDivisionVectorSource = new VectorSource();
      mapDivisionVectorSource.addFeature(mapDivisionFeature);
      const mapDivisionVectorLayer = new VectorLayer
      ({
        'source': mapDivisionVectorSource, 
        'style': mapDivisionStyle
      });
      this.navigation.mapComponent.addLayer(mapDivisionVectorLayer);
    },

    renderStoreMaps(){
      this.display.storeMaps.forEach(storeMap => {
        this.renderMapDivision(storeMap.storeMapPoints, storeMap.storeColor, storeMap.storeColorWithOpacity);
      });
    },

    renderRedZoneMaps(){
      this.display.redZoneMaps.redZoneMapDivisions.forEach(redZoneMapDivision => {
        this.renderMapDivision(redZoneMapDivision, this.display.redZoneMaps.redZoneColor, this.display.redZoneMaps.redZoneColorWithOpacity);
      });
    },

    renderMapIcon(mapIconSource, mapIconLatitude, mapIconLongitude){
      const mapIconIcon = new Icon
      ({
        'anchor': [0.5, 1],
        'src': mapIconSource
      });
      const mapIconStyle = new Style({'image': mapIconIcon});
      const mapIconFeature = new Feature({'geometry': new Point(fromLonLat([mapIconLongitude, mapIconLatitude]))});
      const mapIconVectorSource = new VectorSource({'features': [mapIconFeature]});
      const mapIconVectorLayer = new VectorLayer
      ({
        'source': mapIconVectorSource, 
        'style': mapIconStyle
      });
      this.navigation.mapComponent.addLayer(mapIconVectorLayer);
    },

    renderStoreIcons(){
      this.display.storeMaps.forEach(storeMap => {
        this.renderMapIcon(storeMap.storeIconSource, storeMap.storeLatitude, storeMap.storeLongitude);
      });
      this.display.smallStoreMaps.forEach(smallStoreMap => {
        this.renderMapIcon(smallStoreMap.smallStoreIconSource, smallStoreMap.smallStoreLatitude, smallStoreMap.smallStoreLongitude);
      });
    },

    getMessageOwnerStyle(messageOwner){
      if(messageOwner != null){
        return 'user';
      } 
    },

    getMessageOwnerColor(messageOwner){
      if(messageOwner == null){
        return "background-color:#ceefff";
      } 
      return "background-color:#dedede";
    },

    scrollToBottom(){
      let scrollInterval = setInterval(() => {
        this.$nextTick(() => {
          if (this.$refs.scrollHistory) {
            const scrollableDiv = this.$refs.scrollHistory;
            scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
            clearInterval(scrollInterval);
          }
        });
      }, 1);
    },

  },

  mounted(){
    this.display.storeMaps = constants.storeMaps;
    this.display.smallStoreMaps = constants.smallStoreMaps;
    this.display.redZoneMaps = constants.redZoneMaps;

    const mapCenter = fromLonLat([this.clientLongitude || -84.0585289, this.clientLatitude || 9.9242503]);

    this.navigation.mapComponent = new Map
    ({
      'controls': defaultControls().extend([new FullScreen()]),
      'target': this.navigation.mapID,
      'layers': [new TileLayer({'source': new OSM()})],
      'view': new View
      ({
        'center': mapCenter, 
        'zoom': this.clientLatitude ? 13 : 10
      }),
    });

    this.renderStoreMaps();
    this.renderRedZoneMaps();
    this.renderStoreIcons();
    
    (this.clientLatitude && this.clientLongitude) && this.renderMapIcon('https://i.postimg.cc/ncgWWjcP/1.webp', this.clientLatitude, this.clientLongitude);




    if (this.multipleClients){
      if (this.localityMap){

        const colorPins = 
        {
          'C1E0F5': 'https://i.postimg.cc/wvhvzfV2/C1E0F5.webp',
          'CB9BDE': 'https://i.postimg.cc/50qxTH4k/CB9BDE.webp',
          'DEFF9C': 'https://i.postimg.cc/cCxsSs61/DEFF9C.webp',
          'F7D547': 'https://i.postimg.cc/j2MRqGJH/F7D547.webp',
          'C1DD83': 'https://i.postimg.cc/W449kCKW/C1DD83.webp',
          '34EBC3': 'https://i.postimg.cc/nzj0d7nq/34EBC3.webp',
          '6E81FF': 'https://i.postimg.cc/zGGwtWj3/6E81FF.webp',
          'FC7A56': 'https://i.postimg.cc/GtRGkstL/FC7A56.webp'
        }

        for (var clientIndex in this.multipleClients){
          const client = this.multipleClients[clientIndex];
          const color = client.localityAgentColor ? (colorPins[client.localityAgentColor.substr(1)] ? colorPins[client.localityAgentColor.substr(1)] : 'https://i.postimg.cc/ncgWWjcP/1.webp') : 'https://i.postimg.cc/ncgWWjcP/1.webp'


          let clientLocationImage = new Icon({
            anchor: [0.5, 1],
            src: color
          });
          let clientLocationStyle = new Style({image: clientLocationImage});
          let clientLocationStoreFeature = new Feature({
            geometry: new Point(fromLonLat([client.longitude, client.latitude]))
          });
          clientLocationStoreFeature.setId(client);
          let clientLocationStoreVectorSource = new VectorSource({features: [clientLocationStoreFeature]});
          let clientLocationStoreVectorLayer = new VectorLayer({source: clientLocationStoreVectorSource, style: clientLocationStyle})
          this.navigation.mapComponent.addLayer(clientLocationStoreVectorLayer);

          this.navigation.mapComponent.on('singleclick', (evt) => {
            const feature = this.navigation.mapComponent.forEachFeatureAtPixel(evt.pixel,
              (feature) => {
                return feature;
              });

            if (feature) {
              if(feature.id_){
                this.openedConversation = feature.id_;
                this.$root.$emit('bv::show::modal', 'modalMapaTienda');
              }
            }
          });
        }

      } else {

        let clientLocationImage = new Icon({
          anchor: [0.5, 1],
          src: this.route ? 'https://i.postimg.cc/Qxyx3j8m/1.webp' : 'https://i.postimg.cc/FFW1jzYn/2.webp'
        });

        let clientLocationStyle = new Style({image: clientLocationImage});

        let featureList = [];
        for (var clientIndex in this.multipleClients){
          const client = this.multipleClients[clientIndex];

          let clientLocationStoreFeature = new Feature({
            geometry: new Point(fromLonLat([client.longitude, client.latitude]))
          });
          clientLocationStoreFeature.setId(`client-${clientIndex}`);
          clientLocationStoreFeature.setProperties(client)
          featureList.push(clientLocationStoreFeature);
        }
                let clientLocationStoreVectorSource = new VectorSource({features: featureList});


        let clientLocationStoreVectorLayer = new VectorLayer({source: clientLocationStoreVectorSource, style: clientLocationStyle})
        this.navigation.mapComponent.addLayer(clientLocationStoreVectorLayer);

        
        this.navigation.mapComponent.on('singleclick', (evt) => {
          const feature = this.navigation.mapComponent.forEachFeatureAtPixel(evt.pixel,
            (feature) => {
              return feature;
            });

          if (feature) {
            if(feature.values_){
              this.openedConversation = feature.values_;
              this.currentConversation = null;
              this.$root.$emit('bv::show::modal', 'modalMapaConversacion');
            }
          }
        });
      }

      
    }


    



  }
};
</script>
