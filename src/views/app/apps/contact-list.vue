<template>
  
  <div class="main-content">
    <b-modal scrollable size="lg" centered id="bigImageModal" hide-footer hide-header>
      <img style="width: 1000px;" :src="bigImageSource">
    </b-modal>

    <b-form-select v-model="contactLetter" class="mb-3" :options="contactLettersOptions" @change="getContacts">
    </b-form-select>

    <div v-if="loaderContact==true" style="text-align: center;">
      <br>
      <span class="spinner-glow spinner-glow-primary"></span>
    </div>

    <b-card v-else>
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
              <i class="i-Clock text-25 text-info" @click="getHistoryConversations(props.row.phone)" v-b-modal.modalHistorial style="cursor: pointer; margin-right: 10px;"></i>

              <i class="i-Notepad text-25 text-warning" @click="openContact(props.row.button)" v-b-modal.modalContactar style="cursor: pointer; margin-right: 7px;"></i>
              
              <i class="i-Eraser-2 text-25 text-success mr-2" @click="openEdit(props.row.button)" v-b-modal.modalEditar style="cursor: pointer"></i>
            
              <i class="i-Close-Window text-25 text-danger" @click="deleteContact(props.row.button)" style="cursor: pointer"></i>

          </span>
          

          <span v-else-if="props.column.field == 'location'">
            <div style="width: 150px; overflow: hidden;">
              <b-button @click="openContactLocation(props.row.location)" variant="primary" class="btn d-sm-block" v-b-modal.modalOpenContact>Abrir ubicación</b-button>
            </div>
          </span>

          <span v-else-if="props.column.field == 'id'">
            <p v-if="props.row.id != '0'">✅</p>
            <p v-else>❌</p>
          </span>

        </template>
      </vue-good-table>

      <b-modal scrollable size="m" centered hide-footer id="modalHistorial" title="Historial de conversaciones">
        <div v-if="historyLoader == false">
          <div style="display: flex;">
            
            <b-list-group style="width: 80%">
              <b-list-group-item v-if="historyConversations.length == 0">
                No hay conversaciones en el historial
              </b-list-group-item>
              <b-list-group-item v-b-modal.historyOpenModal style="cursor: pointer" v-for="historyConversation in historyConversations" @click="openHistoryConversation(historyConversation)" button>
                <div style="height: 100px; display: flex; align-items: center;">
                  <div>
                    <strong>Atendido por:</strong> {{historyConversation.agentName}}<br>
                    <strong>Resultado:</strong> {{historyConversation.whatsappConversationCloseComment}}<br>
                    <strong>Inicio:</strong> {{parseHour(historyConversation.whatsappConversationStartDateTime)}}<br>
                    <strong>Fin:</strong> {{parseHour(historyConversation.whatsappConversationEndDateTime)}}<br>
                  </div>
                </div>
              </b-list-group-item>
            </b-list-group>

            <b-list-group style="width: 20%">
              <b-list-group-item v-if="historySells.length == 0">
                NA
              </b-list-group-item>
              <b-list-group-item style="cursor: pointer;" v-for="historySell in historySells" button>
                <div v-b-modal.openSell @click="openSell(historySell)" v-if="historySell.length != 0" style="height: 100px; display: flex; justify-content: center; align-items: center;">
                  <p style="font-size: 30px;">🛒</p>
                </div>
                <div v-else style="height: 100px; display: flex; justify-content: center; align-items: center;">
                  <p style="font-size: 30px;">❌</p>
                </div>              
              </b-list-group-item>
            </b-list-group>

          </div>
        </div>
        <div v-else style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
      </b-modal>

      <b-modal scrollable size="m" centered hide-footer id="openSell" hide-header>
        <b-list-group>
          <b-list-group-item v-for="product in currentSell">
            <div>
              <strong>Código:</strong> {{product.CodigoP}}<br>
              <strong>Nombre:</strong> {{product.descripcion}}<br>
              <strong>Cantidad:</strong> {{product.cantidad}}<br>
              <strong>Precio:</strong> {{product.precio}}<br>
              <strong>Descuento:</strong> {{product.descuento}}<br>
            </div>
          </b-list-group-item>
        </b-list-group>
      </b-modal>

      <b-modal scrollable size="lg" centered hide-footer id="historyOpenModal" hide-header v-if="currentHistoryConversation != null">
        <div v-if="openHistoryLoader == true" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
        <div v-else>
          <div v-for="currentActiveConversationMessage in currentHistoryConversation.whatsappConversationMessages">
            
            <div class="d-flex mb-30" :class="getMessageOwnerStyle(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)">
              <div :style="getMessageOwnerColor(currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber)" class="message flex-grow-1">
                <div class="d-flex">
                  <div class="m-0" style="margin-left: 0; margin-right:auto;" v-if="currentActiveConversationMessage.whatsappGeneralMessageOwnerPhoneNumber != null">
                    
                    <div v-if="currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID != null">
                      <div style="background-color: rgb(226, 255, 206); border-radius: 10px; padding: 10px; margin-bottom: 10px;">
                        
                        <div v-if="currentHistoryConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentHistoryConversation.whatsappConversationMessages">
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
                              <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 600px; height: 250px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
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
                      <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 600px; height: 250px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
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
                        
                        <div v-if="currentHistoryConversation.whatsappConversationMessages.map(whatsappGeneralMessage => whatsappGeneralMessage.whatsappGeneralMessageID).includes(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID) == false">
                          <button @click="getHistoryMessage(currentActiveConversationMessage.whatsappGeneralMessageRepliedMessageID)" class="btn btn-icon btn-primary mr-2" v-b-modal.historyMessageModal><i class="i-Clock"></i>Abrir mensaje del historial</button>
                        </div>
                        
                        <div v-for="answeredMessage in currentHistoryConversation.whatsappConversationMessages">

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
                              <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 600px; height: 250px"><GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/></GmapMap><br>
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
                      <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 600px; height: 450px"><GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/></GmapMap><br>
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
      </b-modal>

      <b-modal id="modalOpenContact" size="lg" hide-footer hide-header centered>
        <div class="p-2" style="text-align: center;">
          <GmapMap :center="selectedContactLocation" :zoom="15" style="width: 740px; height: 500px; margin: 0 auto;">
          <GmapMarker :position="selectedContactLocation" :draggable="false"/></GmapMap>
        </div>
      </b-modal>

      <b-modal id="modalContactar" title="Enviar mensaje al contacto" @ok="sendWhatsappTextMessage()" ref="modalContactar" centered>
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
            <b-form-group label="Número del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="editingPhoneNumber"
              >
              </b-form-input>
            </b-form-group>
            
            <b-form-group label="Nombre del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="Name"
                v-model="editingName"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Cédula del contacto:" style="font-size: medium;" class="pb-2">
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
            
            <b-form-group label="Número del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="creatingPhoneNumber"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Nombre del contacto:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="Name"
                v-model="creatingName"
              >
              </b-form-input>
            </b-form-group>

            <b-form-group label="Cédula del cliente:" style="font-size: medium;" class="pb-2">
              <b-form-input
                class="form-control"
                label="ID"
                v-model="creatingID"
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
      historyLoader: false,
      historyConversations: [],
      historySells: [],

      contactLetter: null,
      contactLettersOptions: [{value:null,text:'Seleccione una letra para buscar los contactos'},{value:'A',text:'A'},{value:'B',text:'B'},{value:'C',text:'C'},{value:'D',text:'D'},{value:'E',text:'E'},{value:'F',text:'F'},{value:'G',text:'G'},{value:'H',text:'H'},{value:'I',text:'I'},{value:'J',text:'J'},{value:'K',text:'K'},{value:'L',text:'L'},{value:'M',text:'M'},{value:'N',text:'N'},{value:'O',text:'O'},{value:'P',text:'P'},{value:'Q',text:'Q'},{value:'R',text:'R'},{value:'S',text:'S'},{value:'T',text:'T'},{value:'U',text:'U'},{value:'V',text:'V'},{value:'W',text:'W'},{value:'X',text:'X'},{value:'Y',text:'Y'},{value:'Z',text:'Z'},{value:'Todo',text:'Todo'}],

      selectedContactLocation: '',
      loaderContact: false,

      allContactsInformation: [],

      sendingMessage: '',

      columns: [
        {
          label: "Cédula",
          field: "id",
        },
        {
          label: "Nombre",
          field: "name",
        },
        {
          label: "Número",
          field: "displayedPhone",
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

      originalEditingPhoneNumber: '',
      editingPhoneNumber: '',
      editingID: '',
      editingName: '',
      editingEmail: '',
      editingLocationDetails: '',
      editingNote: '',

      creatingPhoneNumber: '',
      creatingID: '',
      creatingName: '',
      creatingEmail: '',
      creatingLocationDetails: '',
      creatingNote: '',

      sendingID: '',
      agentType: '',

      currentHistoryConversation: null,
      zoom: 15,
      currentSell: [],
      
      bigImageSource: null
    };

    
  },

  mounted(){
    this.sendingMessage = localStorage.getItem('agentStartMessage');
    this.agentType = localStorage.getItem('agentType');
  },

  methods: {
    openBigImage(bigImageSource){
      this.bigImageSource = bigImageSource;
    },

    parseNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    openSell(historySell){
      this.currentSell = historySell;
      this.$root.$emit('bv::hide::modal','historyConversationsModal');
    },

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

    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
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

    openHistoryConversation(historyConversation){
      this.openHistoryLoader = true;
      this.currentHistoryConversation = {};
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: historyConversation.whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.$root.$emit('bv::hide::modal','historyConversationsModal');
          this.currentHistoryConversation = response.data.result[historyConversation.whatsappConversationID];
          this.openHistoryLoader = false;
        } else {
          this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir la conversación del historial', 'Ha ocurrido un error inesperado al abrir la conversación del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    getHistoryConversations(phone){
      this.historyLoader = true;
      this.historyConversations = [];
      this.historySells = [];
      axios.post(constants.routes.backendAPI+'/selectWhatsappClosedConversationFromWhatsappConversationRecipientPhoneNumber', 
      {
        whatsappConversationRecipientPhoneNumber: phone
      })
      .then((response) =>{
        if (response.data.success){
          this.historyConversations = response.data.result;
          this.historyLoader = false;
          for (var historyConversation in this.historyConversations){
            const historySell = JSON.parse(this.historyConversations[historyConversation].whatsappConversationProducts);
            this.historySells.push(historySell);
          }
        } else {
          this.showNotification('danger', 'Error al consultar las conversaciones del historial', 'Ha ocurrido un error inesperado al consultar las conversaciones del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al consultar las conversaciones del historial', 'Ha ocurrido un error inesperado al consultar las conversaciones del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    openContactLocation(location){
      this.selectedContactLocation = location;
    },

    openCreateContactModal(){
      this.creatingPhoneNumber = '';
      this.creatingID = '';
      this.creatingName = '';
      this.creatingEmail = '';
      this.creatingLocationDetails = '';
      this.creatingNote = '';
    },

    sendWhatsappTextMessage(){
      const whatsappConversationRecipientPhoneNumber = this.allContactsInformation[this.sendingID].contactPhoneNumber;
      const whatsappConversationRecipientProfileName = this.allContactsInformation[this.sendingID].contactName;

      axios.post(constants.routes.backendAPI+'/sendWhatsappTextMessageFromContactList',
      {
        whatsappConversationRecipientPhoneNumber: whatsappConversationRecipientPhoneNumber,
        whatsappConversationRecipientProfileName: whatsappConversationRecipientProfileName,
        whatsappTextMessageBody: this.sendingMessage,
        whatsappConversationAssignedAgentID: parseInt(localStorage.getItem('agentID'))
      })
      .then((response) =>{ 
        if (response.data.success){
          this.$bvToast.toast("Se ha enviado exitosamente el mensaje al contacto con el número '" + whatsappConversationRecipientPhoneNumber + "'.", {
            title: "Mensaje enviado",
            variant: "success",
            solid: true
          });
        } else {
          this.$bvToast.toast("Ha ocurrido un error inesperado al enviar el mensaje. Esto puede deberse a que el contact ya tiene una conversación activa con un agente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al enviar el mensaje",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al enviar el mensaje. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al enviar el mensaje",
          variant: "danger",
          solid: true
        });
      })
    },

    createContact(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.creatingPhoneNumber) && regularExpressionChecker.test(this.creatingID) && regularExpressionChecker.test(this.creatingName) && regularExpressionChecker.test(this.creatingEmail) && regularExpressionChecker.test(this.creatingLocationDetails) && regularExpressionChecker.test(this.creatingNote)) {
        axios.post(constants.routes.backendAPI+'/insertContact', 
        {
          'contactPhoneNumber': this.creatingPhoneNumber, 
          'contactID': this.creatingID, 
          'contactName': this.creatingName, 
          'contactEmail': this.creatingEmail, 
          'contactLocationDetails': this.creatingLocationDetails, 
          'contactNote': this.creatingNote
        })
        .then((response) =>{ 
          if (response.data.success){
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
            this.$refs['modalCrear'].hide();
            this.getContacts();
          } else {
            this.$bvToast.toast("Ya existe un contacto asociado al número '" + this.creatingPhoneNumber + "', por favor modifique la información e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Número de contacto duplicado",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch(error =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al crear el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al crear el contacto",
          variant: "danger",
          solid: true
          });
        })
      } else {
        this.$bvToast.toast('El contenido de la información del contacto no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al crear el contacto',
          variant: 'danger',
          solid: true
        });
      }
    },

    deleteContact(contactID){
      axios.post(constants.routes.backendAPI+'/deleteContact', {'contactPhoneNumber': this.allContactsInformation[contactID].contactPhoneNumber})
      .then((response) =>{ 
        console.log(response.data);
        if (response.data.success){
          this.$bvToast.toast("Se ha eliminado exitosamente el contacto con el número '" + this.allContactsInformation[contactID].contactPhoneNumber + "'.", {
            title: "Contacto eliminado",
            variant: "success",
            solid: true
          });
          this.rows = [];
          this.getContacts();
        } else {
          this.$bvToast.toast("Ha ocurrido un error inesperado al eliminar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al eliminar el contacto",
            variant: "danger",
            solid: true
          });
        }
      })
      .catch((error) =>{
        this.$bvToast.toast("Ha ocurrido un error inesperado al eliminar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al eliminar el contacto",
          variant: "danger",
          solid: true
        });
      })
    },

    openEdit(contactID){
      this.originalEditingPhoneNumber = this.allContactsInformation[contactID].contactPhoneNumber;
      this.editingPhoneNumber = this.allContactsInformation[contactID].contactPhoneNumber;
      this.editingID = this.allContactsInformation[contactID].contactID;
      this.editingName = this.allContactsInformation[contactID].contactName;
      this.editingEmail = this.allContactsInformation[contactID].contactEmail;
      this.editingLocationDetails = this.allContactsInformation[contactID].contactLocationDetails;
      this.editingNote = this.allContactsInformation[contactID].contactNote;
    },

    openContact(contactID){
      this.sendingMessage = localStorage.getItem('agentStartMessage');
      this.sendingID = contactID;
    },

    submit(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.editingPhoneNumber) && regularExpressionChecker.test(this.editingID) && regularExpressionChecker.test(this.editingName) && regularExpressionChecker.test(this.editingEmail) && regularExpressionChecker.test(this.editingLocationDetails) && regularExpressionChecker.test(this.editingNote)) {
        axios.post(constants.routes.backendAPI+'/updateContact', 
        {
          'originalContactPhoneNumber': this.originalEditingPhoneNumber,
          'editedContactPhoneNumber': this.editingPhoneNumber,
          'contactID': this.editingID,
          'contactName': this.editingName, 
          'contactEmail': this.editingEmail, 
          'contactLocationDetails': this.editingLocationDetails, 
          'contactNote': this.editingNote
        }).then((response) =>{ 
          if (response.data.success){
            this.$bvToast.toast("Se ha editado exitosamente el contacto con el número '" + this.editingPhoneNumber + "'.", {
              title: "Contacto editado",
              variant: "success",
              solid: true
            });
            this.rows = [];
            this.$refs['modalEditar'].hide();
            this.getContacts();
          } else {
            this.$bvToast.toast("Ya existe un cliente asociado al número '" + this.editingPhoneNumber + "', por favor modifique la información e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
              title: "Número de contacto duplicado",
              variant: "danger",
              solid: true
            });
          }
        })
        .catch(error =>{
          this.$bvToast.toast("Ha ocurrido un error inesperado al editar el contacto. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
            title: "Error al editar el contacto",
            variant: "danger",
            solid: true
          });
        })
      } else {
        this.$bvToast.toast('El contenido de la información del cliente no puede estar vacío. Por favor complete los espacios requeridos e intentelo nuevamente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.', {
          title: 'Error al editar el cliente',
          variant: 'danger',
          solid: true
        });
      }
    },

    getContacts(){
      this.loaderContact = true;
      axios.post(constants.routes.backendAPI+'/selectContactsFromStartingLetter', 
      {
        'startingLetter': this.contactLetter
      })
      .then((response) =>{ 
        this.allContactsInformation = [];
        this.rows = [];
        this.allContactsInformation = response.data.result;
        for (var contact in response.data.result){
          const locations = JSON.parse(response.data.result[contact].contactLocations);
          var center = {lat: parseInt(locations['CASA'].latitude), lng: parseInt(locations['CASA'].longitude)}
          this.rows.push
          ({
            name: response.data.result[contact].contactName,
            location: center,
            email: response.data.result[contact].contactEmail,
            phone: response.data.result[contact].contactPhoneNumber,
            displayedPhone: this.parseNumber(response.data.result[contact].contactPhoneNumber),
            id: response.data.result[contact].contactID,
            locationDetails: response.data.result[contact].contactLocationDetails,
            note: response.data.result[contact].contactNote,
            button: contact
          })
        }
        this.loaderContact = false;
      })
      .catch((error) =>{
        console.log(error);
        this.$bvToast.toast("Ha ocurrido un error inesperado al consultar la lista de clientes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.", {
          title: "Error al consultar la lista de clientes",
          variant: "danger",
          solid: true
        });
      })
    }
  },
};
</script>
<style></style>
