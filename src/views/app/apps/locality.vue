<template>
  <div>

    <b-modal scrollable hide-footer hide-header size="lg" centered hide-backdrop id="conversationModal" v-if="currentConversation != null" @shown="scrollToBottom">
      <div v-if="openConversationLoader == true" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-else>
        <div style="margin-bottom: 20px;">
          <h3><strong>{{openedName}}</strong></h3>
          <h3>{{parseNumber(openedNumber)}}</h3>
        </div>
        <div ref="scrollHistory" style="max-height: 80vh; overflow-y: auto;">
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
                              <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(answeredMessage).lng" :clientLatitude="getLocation(answeredMessage).lat"></MapComponent>

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
                      <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(currentActiveConversationMessage).lng" :clientLatitude="getLocation(currentActiveConversationMessage).lat"></MapComponent>

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
                              <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(answeredMessage).lng" :clientLatitude="getLocation(answeredMessage).lat"></MapComponent>

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
                      <MapComponent mapHeight="250px" mapWidth="600px" :clientLongitude="getLocation(currentActiveConversationMessage).lng" :clientLatitude="getLocation(currentActiveConversationMessage).lat"></MapComponent>

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

    <h4><strong>SINPES (contra entrega) de hoy:</strong></h4>
    <br>
    <div class="card mb-30">
      <div class="card-body p-0">
        <vue-good-table
          :columns="sinpeColumns"
          :line-numbers="false"
          styleClass="order-table vgt-table"
          :rows="sinpeRows1">
          <template slot="table-row" slot-scope="props">

            <div v-if="props.column.field == 'whatsappInvoiceClientPhoneNumber'">
              {{ parseNumber(props.row.whatsappInvoiceClientPhoneNumber) }}
            </div>

            <div v-else-if="props.column.field == 'whatsappInvoiceAmount'">
              ₡{{props.row.whatsappInvoiceAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}            
            </div>
            
            <div v-else-if="props.column.field == 'localityName'">
              <b-badge style="color: black; font-size: small;" :style="{backgroundColor: props.row.localityColor}">{{ props.row.localityName }}</b-badge>
            </div>
            
            <div v-else-if="props.column.field == 'localityAgentName'">
              <b-badge v-if="props.row.localityAgentName" style="color: black; font-size: small;" :style="{backgroundColor: props.row.localityAgentColor}">{{ props.row.localityAgentName }}</b-badge>
              <b-badge v-else style="color: white; font-size: small; background-color: black;">Sin mensajero asignado</b-badge>
            </div>

            <div v-else-if="props.column.field == 'whatsappInvoiceApproveAction'">
              <p @click="updateWhatsappInvoiceSINPE(props.row.whatsappInvoiceID, props.row.whatsappInvoiceSINPEApproved)" style="position: relative; top: 10px">
                {{ props.row.whatsappInvoiceSINPEApproved ? '✅' : '❌'  }}
              </p>
            </div>

            <div v-else-if="props.column.field == 'whatsappConversationOpenAction'">
              <button v-b-modal.conversationModal class="btn btn-primary text-black btn-rounded" @click="whatsappConversationOpenAction(props.row)">Abrir</button>
            </div>
            
            

          </template>
        </vue-good-table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const constants = require('@../../../src/constants.js'); 
import MapComponent from "../../../components/mapComponent.vue";

export default {
  components: {
    MapComponent
  },

  data() {
    return {
     
      agentType: '',
      agentID: '',

      sinpeColumns: 
      [
        {
          label: "ID de la conversación",
          field: "whatsappConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "ID de la orden",
          field: "whatsappInvoiceID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "whatsappInvoiceClientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappInvoiceClientName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Monto",
          field: "whatsappInvoiceAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Localidad",
          field: "localityName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Mensajero",
          field: "localityAgentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Aprovado",
          field: "whatsappInvoiceApproveAction",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Conversación",
          field: "whatsappConversationOpenAction",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      sinpeRows1: [],

      openedName: '',
      openedNumber: '',
      openConversationLoader: false,
      currentConversation: null

    };
  },

  methods: {
    getLocation(whatsappGeneralMessage){
      return {lat: whatsappGeneralMessage.whatsappLocationMessageLatitude, lng: whatsappGeneralMessage.whatsappLocationMessageLongitude}
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
      if (formattedDate.includes('00') && formattedDate.includes('PM')){
        formattedDate = formattedDate.replace('00', '12');
      }
      return formattedDate;
    },
    

    parseDateTime(originalHour){
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
      if (formattedDate.includes('00') && formattedDate.includes('PM')){
        formattedDate = formattedDate.replace('00', '12');
      }
      return formattedDate;
    },

    parseNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    whatsappConversationOpenAction(whatsappConversation){
      this.openedName = whatsappConversation.whatsappInvoiceClientName;
      this.openedNumber = whatsappConversation.whatsappInvoiceClientPhoneNumber;
      var whatsappConversationID = whatsappConversation.whatsappConversationID;
      this.openConversationLoader = true;
      this.currentConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        'whatsappConversationID': whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.currentConversation = response.data.result[whatsappConversationID];
          this.openConversationLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    /*

    reverseTransaction(transaction){
      this.$swal({
        title: "Reversar transacción",
        html: 
        `
        Está a punto de reversar la transacción ${transaction.transactionID}<br>
        <strong>¿Desea continuar?</strong>
        `,
        showCancelButton: true,
        confirmButtonColor: "#1aad55",
        cancelButtonText: "Cancelar",
        cancelButtonColor: "#d33",
        confirmButtonText: "Aceptar"
      }).then((result) => {
        if (result.isConfirmed == true){
          axios.post(constants.routes.backendAPI+'/reverseTransaction', 
          {
            transactionID: transaction.transactionID
          }).then((response) =>{
            if (response.data.success){
              if (this.selectedTransactionStores[transaction.transactionID]){
                delete this.selectedTransactionStores[transaction.transactionID];
              }
              if (this.filtering == true){
                this.filter();
              } else {
                this.selectUsedTransactions();
              }
              this.showNotification('success', 'Transacción reversada', 'Se ha reversado exitosamente la transacción.')
            } else {
              this.showNotification('danger', 'Error al reversar la transacción', 'Ha ocurrido un error inesperado al reversar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
            }
          }).catch(() => {
            this.showNotification('danger', 'Error al reversar la transacción', 'Ha ocurrido un error inesperado al reversar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
          })
        }
      });
    },

    validateTransaction(transaction){
      if (this.agentType == 'locality'){
        if (transaction.transactionApproverLocalityAgentID != 0){
          this.$swal({
            title: "Transacción a validar",
            html: 
            `
            <strong>Número de referencia: </strong> ${transaction.transactionID} <br>
            <strong>Descripción: </strong> ${transaction.transactionNote} <br>
            <strong>Monto: </strong> ${transaction.transactionAmount} <br>
            <strong>Fecha: </strong> ${transaction.transactionDate} <br><br>
            <strong>Aprovado por: </strong> ${this.approverOptions.find(option => option.value === transaction.transactionApproverLocalityAgentID).text} <br>
            <strong>Localidad: </strong> ${this.localityName}
            `,
            showCancelButton: true,
            confirmButtonColor: "#1aad55",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#d33",
            confirmButtonText: "Aceptar"
          }).then((result) => {
            if (result.isConfirmed == true){
              axios.post(constants.routes.backendAPI+'/syncTransaction', 
              {
                transactionID: transaction.transactionID,
                transactionStore: localStorage.getItem('localityID'),
                transactionApprover: transaction.transactionApproverLocalityAgentID,
                transactionRelatedMessageID: null
              }).then((response) =>{
                if (response.data.success){
                  if (this.selectedTransactionApprovers[transaction.transactionID]){
                    delete this.selectedTransactionApprovers[transaction.transactionID];
                  }
                  this.selectNotUsedTransactions();
                  this.showNotification('success', 'Transacción validada', 'Se ha validado exitosamente la transacción.')
                } else {
                  this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
                }
              }).catch(() => {
                this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
              })
            }
          });
        } else {
          this.showNotification('danger', 'Error al validar transacción', 'Debe seleccionar el nombre de quien aprueba la transacción. Seleccione un nombre e intentelo de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }

      } else {

        if (transaction.transactionStoreLocalityID != 0){
          this.$swal({
            title: "Transacción a validar",
            html: 
            `
            <strong>Número de referencia: </strong> ${transaction.transactionID} <br>
            <strong>Descripción: </strong> ${transaction.transactionNote} <br>
            <strong>Monto: </strong> ${transaction.transactionAmount} <br>
            <strong>Fecha: </strong> ${transaction.transactionDate} <br><br>
            <strong>Aprovado por: </strong> ${this.agentName} <br>
            <strong>Localidad: </strong> ${this.localitiesOptions.find(option => option.value === transaction.transactionStoreLocalityID).text}
            `,
            showCancelButton: true,
            confirmButtonColor: "#1aad55",
            cancelButtonText: "Cancelar",
            cancelButtonColor: "#d33",
            confirmButtonText: "Aceptar"
          }).then((result) => {
            if (result.isConfirmed == true){
              axios.post(constants.routes.backendAPI+'/syncTransaction', 
              {
                transactionID: transaction.transactionID,
                transactionStore: transaction.transactionStoreLocalityID,
                transactionApprover: localStorage.getItem('agentID'),
                transactionRelatedMessageID: null
              })
              .then((response) =>{
                if (response.data.success){
                  this.selectNotUsedTransactions();
                  this.showNotification('success', 'Transacción validada', 'Se ha validado exitosamente la transacción.')
                } else {
                  this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
                }
              })
              .catch(() => {
                this.showNotification('danger', 'Error al validar la transacción', 'Ha ocurrido un error inesperado al validar la transacción. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
              })
            }
          });
        } else {
          this.showNotification('danger', 'Error al validar transacción', 'Debe seleccionar el nombre de la sucursal de la transacción. Seleccione un nombre e intentelo de nuevo. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }

      }
    },
    */

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },


    selectWhatsappInvoiceForSINPE(initialDate, endDate){
      axios.post(constants.routes.backendAPI+'/selectWhatsappInvoiceForSINPE',
      {
        'initialDate': initialDate,
        'endDate': endDate
      })
      .then((response) =>{
        if (response.data.success){
          this.sinpeRows1 = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las órdenes con SINPE por confirmar', 'Ha ocurrido un error inesperado al consultar las órdenes con SINPE por confirmar. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las órdenes con SINPE por confirmar', 'Ha ocurrido un error inesperado al consultar las órdenes con SINPE por confirmar. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    updateWhatsappInvoiceSINPE(whatsappInvoiceID, whatsappInvoiceSINPEApproved){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceSINPE',
      {
        'whatsappInvoiceID': whatsappInvoiceID,
        'whatsappInvoiceSINPEApproved': !whatsappInvoiceSINPEApproved,
        'whatsappInvoiceSINPEApprover': this.agentID
      })
      .then((response) =>{
        this.selectWhatsappInvoiceForSINPE();
        if (whatsappInvoiceSINPEApproved == false){
          this.showNotification('success', 'SINPE confirmado', 'Se ha aprobado el SINPE exitosamente.')
        } else {
          this.showNotification('success', 'SINPE rechazado', 'Se ha rechazado el SINPE exitosamente.')
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al confirmar el SINPE', 'Ha ocurrido un error inesperado al confirmar el SINPE. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    }

    
  },


  computed: {},

  mounted(){
    
    this.agentType = localStorage.getItem('agentType');
    this.agentID = localStorage.getItem('agentID');
    this.selectWhatsappInvoiceForSINPE(null, null);

      
    setInterval(() => {
      this.selectWhatsappInvoiceForSINPE(null, null);
    }, 10000);
  },

  created: function() {}

};
</script>

<style>
  
</style>
