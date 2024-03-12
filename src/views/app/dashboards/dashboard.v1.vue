<template>
  <div class="main-content">

    <b-modal scrollable size="m" centered hide-footer id="historyMessageModal" hide-header>
      <div v-if="historyMessageLoader == false && historyMessage != null">
        <p v-if="historyMessage.whatsappGeneralMessageType == 'text'" class="m-0" style="white-space: pre-line; font-size: large;">{{historyMessage.whatsappTextMessageBody}}</p>
        
        <div v-if="historyMessage.whatsappGeneralMessageType == 'contact'"> 
          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Nombre: </strong>{{historyMessage.whatsappContactMessageName}}</p>
          <p class="m-0" style="white-space: pre-line; font-size: medium;"><strong>Número: </strong>{{historyMessage.whatsappContactMessagePhoneNumber}}</p>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType == 'image'"> 
          <img v-b-modal.bigImageModal @click="openBigImage(`data:image/png;base64,${historyMessage.whatsappImageMessageFile}`)" style="width: 250px;" :src="`data:image/png;base64,${historyMessage.whatsappImageMessageFile}`">
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappImageMessageCaption != null">{{historyMessage.whatsappImageMessageCaption}}</p>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType=='video'"> 
          <video controls width="400" :src="`data:video/mp4;base64,${historyMessage.whatsappVideoMessageFile}`"></video>
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappImageMessageCaption != null">{{historyMessage.whatsappVideoMessageCaption}}</p>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType=='location'" class="m-0">
          <GmapMap :center="getLocation(historyMessage)" :zoom="zoom" style="width: 1000px; height: 450px">
            <GmapMarker :position="getLocation(historyMessage)" :draggable="false"/>

            <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>

            <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
          </GmapMap><br>
          <p class="m-0" style="font-size: large;"><strong>Latitud:</strong> {{historyMessage.whatsappLocationMessageLatitude}}</p>
          <p class="m-0" style="font-size: large;"><strong>Longitud:</strong> {{historyMessage.whatsappLocationMessageLongitude}}</p><br>
          <b-dropdown variant="primary" dropup text="Guardar ubicación" style="margin-right: 10px;">
            <b-dropdown-item @click="saveLocation('CASA', historyMessage)" style="z-index: 1000;">CASA</b-dropdown-item>
            <b-dropdown-item @click="saveLocation('TRABAJO', historyMessage)" style="z-index: 1000;">TRABAJO</b-dropdown-item>
            <b-dropdown-item @click="saveLocation('OTRO', historyMessage)" style="z-index: 1000;">OTRO</b-dropdown-item>
          </b-dropdown>
        </div>
        
        <div v-if="historyMessage.whatsappGeneralMessageType=='document'" class="m-0">
          <a style="color: black;" :href="`data:${historyMessage.whatsappDocumentMessageMimeType};base64,${historyMessage.whatsappDocumentMessageFile}`" :download="historyMessage.whatsappDocumentMessageFileName"><p style="size: 10%;">Archivo: <strong>{{historyMessage.whatsappDocumentMessageFileName}}</strong></p></a>
        </div>
        
        <audio controls v-if="historyMessage.whatsappGeneralMessageType=='audio'" :src="`data:audio/ogg;base64,${historyMessage.whatsappAudioMessageFile}`"></audio>
        
        <div v-if="historyMessage.whatsappGeneralMessageType == 'favoriteImage'"> 
          <img v-b-modal.bigImageModal @click="openBigImage(historyMessage.whatsappFavoriteImageMessageDriveURL)" style="width: 250px;" :src="historyMessage.whatsappFavoriteImageMessageDriveURL">
          <p class="m-0" style="white-space: pre-line; font-size: medium; padding-top: 10px;" v-if="historyMessage.whatsappFavoriteImageMessageCaption != null">{{historyMessage.whatsappFavoriteImageMessageCaption}}</p>
        </div>
      </div>
      <div v-else style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
    </b-modal>


    <b-modal scrollable size="lg" centered id="bigImageModal" hide-footer hide-header>
      <img style="width: 1000px;" :src="bigImageSource">
    </b-modal>

    <b-modal scrollable size="m" centered id="closeModal" title="Finalizar conversación" @ok="closeWhatsappConversation()">
      <b-form-select v-model="selectedCloseLocality" :options="closeLocalityOptions"></b-form-select>
      <br><br><br>

      <b-dropdown variant="primary" text="Motivos frecuentes" style="width: 100%">
        <b-dropdown-item @click="addCloseConversationReason('Venta perdida')">Venta perdida</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Venta para otro día')">Venta para otro día</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Consulta sobre productos')">Consulta sobre productos</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('No contestó')">No contestó</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Pasa a tienda')">Pasa a tienda</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Consulta de horario/ubicación')">Consulta de horario/ubicación</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Vuelve a escribir')">Vuelve a escribir</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Reclamo o garantía')">Reclamo o garantía</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Menor de edad')">Menor de edad</b-dropdown-item>
        <b-dropdown-item @click="addCloseConversationReason('Error')">Error</b-dropdown-item>
      </b-dropdown><br><br>
      <b-form-textarea no-resize rows="5" class="form-control" placeholder="Motivo de la finalización de la conversación" v-model="closeConversationReason"/>    
      <br>
      <b-form-checkbox id="checkbox-1" v-model="sendEndMessage">Enviar mensaje de despedida</b-form-checkbox>
    </b-modal>

    <br>
    <b-row>

      <b-col lg="4" md="4" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="view='activeConversations'"
          :style="getTagStyle(1)"
        >
          <i class="i-Tag-3"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Hoy</p>
            <p class="text-primary text-24 line-height-1 mb-2">{{activeConversationsRows.length}}</p>
          </div>
        </b-card>
      </b-col>
      
      <b-col lg="4" md="4" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="getClosedConversations()"
          :style="getTagStyle(2)"
        >
          <i class="i-Checkout"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Reportes</p>
          </div>
        </b-card>
      </b-col>

      <b-col lg="4" md="4" sm="12">
        <b-card
          class="card-icon-bg card-icon-bg-primary o-hidden mb-30 text-center"
          @click="getEstadisticas()"
          :style="getTagStyle(3)"
        >
          <i class="i-Male"></i>
          <div class="content">
            <p class="text-muted mt-2 mb-0">Estadísticas</p>
          </div>
        </b-card>
      </b-col>
      
      
    </b-row>
    
    <div v-if="view == 'closedConversations'">
      <br>
      <b-card>
        <h4><strong>Filtro por fecha inicial:</strong></h4>
        <b-form-datepicker v-model="initialDateFiltered"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por fecha final:</strong></h4>
        <b-form-datepicker v-model="endDateFiltered"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por número:</strong></h4>
        <b-form-input v-model="numberFiltered" class="mb-3" placeholder="Coloque un número"></b-form-input>
        <h4><strong>Filtro por agente:</strong></h4>
        <b-form-select v-model="agentFiltered" class="mb-3" :options="agentOptions"></b-form-select>
        <br>
        <h4><strong>Filtro por sucursal de envío:</strong></h4>
        <b-form-select v-model="storeFiltered" class="mb-3" :options="storeOptions"></b-form-select>
        <br>
        <h4><strong>Filtro por conversión:</strong></h4>
        <b-form-select v-model="conversionFiltered" class="mb-3" :options="conversionOptions"></b-form-select>
        <br><br>
        <button class="btn btn-icon" style="background-color: #F9E530; font-size: 15px" @click="filter()"><i class="i-Search-People"></i>Aplicar filtro</button>
        <button class="btn btn-icon" style="background-color: rgb(255, 184, 32); font-size: 15px; margin-left: 30px;" @click="cleanFilter()"><i class="i-Folder-Trash"></i>Limpiar filtros</button>
      </b-card>
      <br><br><br><br>
    </div>

    <div v-if="view == 'estadisticas'">
      <br>
      <b-card>
        <h4><strong>Dato a graficar:</strong></h4>
        <b-form-select v-model="plotTypeOption" class="mb-3" :options="plotTypeOptions"></b-form-select>
        <br>
        <h4><strong>Filtro por fecha inicial:</strong></h4>
        <b-form-datepicker v-model="initialDateOption"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por fecha final:</strong></h4>
        <b-form-datepicker v-model="endDateOption"></b-form-datepicker>
        <br>
        <h4><strong>Filtro por agente:</strong></h4>
        <div style="border: 1px solid rgb(140, 140, 140); border-radius: 5px; height: 150px; overflow-y: auto; padding-top: 10px; padding-bottom: 10px;">
          <div v-for="agent in agentOptionsMultiple">
            <input type="checkbox" v-model="agent.selected" style="accent-color: #FFD733; margin-left:10px; margin-right: 10px;">
            {{ agent.text }}
          </div>
        </div>
        <br>
        <div v-if="plotTypeOption != 4">
          <h4><strong>Filtro por sucursal de envío:</strong></h4>
          <div style="border: 1px solid rgb(140, 140, 140); border-radius: 5px; height: 100px; overflow-y: auto; padding-top: 10px; padding-bottom: 10px;">
            <div v-for="store in storeOptionsMultiple">
              <input type="checkbox" v-model="store.selected" style="accent-color: #FFD733; margin-left:10px; margin-right: 10px;">
              {{ store.text }}
            </div>
          </div>
        </div>
        <br><br>
        
        <div style="display: flex;">
          <div style="width: 100px;">
            <button v-if="loaderPlot == false" class="btn btn-icon" style="background-color: #F9E530; font-size: 15px" @click="plot()"><i class="i-Search-People"></i>Graficar</button>
            <div v-else style="text-align: center;">
              <span class="spinner-glow spinner-glow-primary"></span>
            </div>
          </div>

          <button class="btn btn-icon" style="background-color: rgb(255, 184, 32); font-size: 15px; margin-left: 30px;" @click="cleanPlotFilter()"><i class="i-Folder-Trash"></i>Limpiar filtros</button>
        </div>
      </b-card>
      
      <br><br><br>
      
      <div v-if="displayPlot">
        <b-card>
          <apexchart type="pie" width="100" :options="opcionesGraficoCircular" :series="facturadoPorAgente"></apexchart>
        </b-card>
        <br><br>
      </div>

    </div>

    <div class="col-md-12">


      <div v-if="view == 'activeConversations'">
        <br>
        
        <div style="display: flex;">
          <b-card style="width: 65%; margin-right: 1.5%; background-color: rgb(214, 214, 214);">
            <br>
            <div style="display: flex;">
              
              <div>
                <p style="font-size: 40px; margin-top: 10px;"><strong>TOTAL:</strong></p>
                <br><br>
                <p style="font-size: 25px;"><strong>Conversaciones totales:</strong> {{whatsappTotalConversations}}</p>
                <p style="font-size: 25px;"><strong>Conversaciones vendidas:</strong> {{whatsappSelledConversations}}</p>
                <p style="font-size: 25px;"><strong>Conversaciones no vendidas:</strong> {{whatsappNotSelledConversations}}</p>
                <p style="font-size: 25px;"><strong>Conversaciones pendientes:</strong> {{whatsappPendingConversations}}</p>
                <p style="font-size: 25px;"><strong>Ventas totales:</strong> ₡{{whatsappTotalSells}}</p>
              </div>

              <div class="flex-grow-1"></div>
              
              <div style="text-align: center;">
                
                <div v-if="opcionesGraficoPaquetes != null">
                  
                  <apexchart type="pie" :options="opcionesGraficoPaquetes" :series="datosGraficoPaquetes"></apexchart>
                  <br>
                  <apexchart type="pie" :options="opcionesGraficoPaquetes" :series="datosGraficoDinero"></apexchart>
                </div>
              </div>
            </div>
            
          </b-card>

          <div style="width: 35%; margin-left: 1.5%;">
            <div style="display: flex; margin-bottom: 25px;">
              <b-card style="width: 50%; margin-right: 1.5%; background-color: rgb(251, 118, 30);">
                <p style="font-size: 25px; margin-top: 5px;"><strong>ZAPOTE:</strong></p>
                <p style="font-size: 18px; margin: 3px;"><strong>Recibidas:</strong> {{zapoteSelled + zapoteNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Vendidas:</strong> {{zapoteSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>No vendidas:</strong> {{zapoteNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Ventas:</strong> ₡{{zapoteSales.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}</p>
              </b-card>
              <b-card style="width: 50%; margin-left: 1.5%; background-color: rgb(255, 149, 184);">
                <p style="font-size: 25px; margin-top: 5px;"><strong>ESCAZÚ:</strong></p>
                <p style="font-size: 18px; margin: 3px;"><strong>Recibidas:</strong> {{escazuSelled + escazuNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Vendidas:</strong> {{escazuSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>No vendidas:</strong> {{escazuNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Ventas:</strong> ₡{{escazuSales.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}</p>
              </b-card>
            </div>

            <div style="display: flex; margin-top: 25px;">
              <b-card style="width: 50%; margin-right: 1.5%; background-color: rgb(177, 193, 26);">
                <p style="font-size: 25px; margin-top: 5px;"><strong>CARTAGO:</strong></p>
                <p style="font-size: 18px; margin: 3px;"><strong>Recibidas:</strong> {{cartagoNotSelled + cartagoSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Vendidas:</strong> {{cartagoSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>No vendidas:</strong> {{cartagoNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Ventas:</strong> ₡{{cartagoSales.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}</p>
              </b-card>
              <b-card style="width: 50%; margin-left: 1.5%; background-color: rgb(0, 227, 212);">
                <p style="font-size: 25px; margin-top: 5px;"><strong>HEREDIA:</strong></p>
                <p style="font-size: 18px; margin: 3px;"><strong>Recibidas:</strong> {{herediaSelled + herediaNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Vendidas:</strong> {{herediaSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>No vendidas:</strong> {{herediaNotSelled}}</p>
                <p style="font-size: 18px; margin: 3px;"><strong>Ventas:</strong> ₡{{herediaSales.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}</p>
              </b-card>
            </div>
            
          </div>
        </div>
        
        <div v-if="feedbackRows.length != 0">
          <br><br>
          <b-card style="background-color: rgb(214, 214, 214);">
            <vue-good-table
              :columns="feedbackColumns"
              :line-numbers="false"
              styleClass="order-table vgt-table"
              :rows="feedbackRows"
              v-if="view == 'activeConversations'">
              
              <template slot="table-row" slot-scope="props">
                
                <div v-if="props.column.field == 'whatsappConversationRecipientPhoneNumber'">
                  {{parseNumber(props.row.whatsappConversationRecipientPhoneNumber)}}
                </div>

                <div v-else-if="props.column.field == 'whatsappConversationEndDateTime'">
                  {{parseHour(props.row.whatsappConversationEndDateTime)}}
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackDateTime'">
                  {{parseHour(props.row.whatsappFeedbackDateTime)}}
                </div>

                <div v-else-if="props.column.field == 'whatsappConversationLocalityName'">
                  <div v-if="props.row.whatsappConversationLocalityName == 'King Vape Zapote'">
                    <span class="badge badge-pill p-2" style="background-color: rgb(251, 118, 30);">Zapote</span>
                  </div>
                  <div v-else-if="props.row.whatsappConversationLocalityName == 'King Vape Escazu'">
                    <span class="badge badge-pill p-2" style="background-color: rgb(255, 149, 184);">Escazu</span>
                  </div>
                  <div v-else-if="props.row.whatsappConversationLocalityName == 'King Vape Cartago'">
                    <span class="badge badge-pill p-2" style="background-color: rgb(177, 193, 26);">Cartago</span>
                  </div>
                  <div v-else-if="props.row.whatsappConversationLocalityName == 'King Vape Heredia'">
                    <span class="badge badge-pill p-2" style="background-color: rgb(0, 227, 212);">Heredia</span>
                  </div>
                  <div v-else>
                    <span class="badge badge-pill p-2" style="background-color: rgb(214, 214, 214);">Sin localidad</span>
                  </div>
                </div>

                <div v-else-if="props.column.field == 'whatsappConversationResult'">
                  <div v-if="props.row.whatsappConversationResult == 0">
                    <span class="badge badge-pill badge-danger p-2">Sin venta</span>
                  </div>
                  <div v-else>
                    <span class="badge badge-pill badge-success p-2">Venta por  ₡{{props.row.whatsappConversationResult.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3})}}</span>
                  </div>
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackOne'">
                  <star-rating v-model="props.row.whatsappFeedbackOne" :read-only="true" :star-size="13" :increment="0.5" :border-width="3" :show-rating="false"></star-rating>
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackTwo'">
                  <star-rating v-model="props.row.whatsappFeedbackTwo" :read-only="true" :star-size="13" :increment="0.5" :border-width="3" :show-rating="false"></star-rating>
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackThree'">
                  <star-rating v-model="props.row.whatsappFeedbackThree" :read-only="true" :star-size="13" :increment="0.5" :border-width="3" :show-rating="false"></star-rating>
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackFour'">
                  <star-rating v-model="props.row.whatsappFeedbackFour" :read-only="true" :star-size="13" :increment="0.5" :border-width="3" :show-rating="false"></star-rating>
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackTotal'">
                  <star-rating v-model="props.row.whatsappFeedbackTotal" :read-only="true" :star-size="13" :increment="0.5" :border-width="3" :show-rating="false"></star-rating>
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackSix'">
                  <div v-if="props.row.whatsappFeedbackSix == ''">
                    Sin comentario
                  </div>
                  <div v-else>
                    {{props.row.whatsappFeedbackSix}}
                  </div>      
                </div>

                <div v-else-if="props.column.field == 'whatsappFeedbackAction'">
                  <button v-if="props.row.whatsappFeedbackLoading==false" class="btn btn-primary" @click="closeFeedback(props.row)">Recibir</button>
                  <div v-else>
                    <span class="spinner-glow spinner-glow-primary"></span>
                  </div>
                </div>

              </template>
              
            </vue-good-table>
          </b-card>
        </div>

        <br><br><br>

        <b-card style="background-color: rgb(214, 214, 214);">
          <h4><strong>Búsqueda por número:</strong></h4>
            <div style="display: flex;">  
              <b-form-input style="width: 90%;" v-model="numberSearched" class="mb-2" placeholder="Coloque un número para buscar" @keyup="searchByNumber()"></b-form-input>
              <button class="btn btn-icon" style="background-color: rgb(255, 184, 32); top:-5px; position:relative; margin-left: 20px;" @click="searchAllNumbers()"><i class="i-Folder-Trash"></i>Mostrar todo</button>
            </div>
          <br>
          <h4><strong>Filtro por agente:</strong></h4>
            <div style="display: flex;">  
              <b-form-select style="width: 90%;" v-model="agentFiltered" class="mb-2" :options="agentOptions" @change="filterByAgent()"></b-form-select>
              <button class="btn btn-icon" style="background-color: rgb(255, 184, 32); top:-5px; position:relative; margin-left: 20px;" @click="cleanAgentFilter()"><i class="i-Folder-Trash"></i>Mostrar todo</button>

            </div>
        </b-card>
        

        <br><br>
      </div>

      <div class="card mb-30">

        
        <div class="card-body p-0">

          
          <vue-good-table
            :columns="activeConversationsColumns"
            :line-numbers="false"
            styleClass="order-table vgt-table"
            :rows="activeConversationsRows"
            v-if="view == 'activeConversations'"
          >
            <template slot="table-row" slot-scope="props">
              <button v-b-modal.conversationModal v-if="props.column.field == 'whatsappConversationOpenAction'" class="btn btn-outline-primary text-black btn-rounded" @click="whatsappConversationOpenAction(props.row)">Abrir</button>
              <button v-b-modal.transferModal v-else-if="props.column.field == 'whatsappConversationTransferAction'" class="btn btn-outline-info text-black btn-rounded" @click="whatsappTransferOpenAction(props.row)">Transferir</button>
              <button v-b-modal.closeModal v-else-if="props.column.field == 'whatsappConversationCloseAction'" class="btn btn-outline-danger text-black btn-rounded" @click="whatsappCloseOpenAction(props.row)">Cerrar</button>
              <div v-else-if="props.column.field == 'whatsappConversationRecipientPhoneNumber'">
                {{parseNumber(props.row.whatsappConversationRecipientPhoneNumber)}}
              </div>
            </template>
          </vue-good-table>

          <vue-good-table
            :columns="closedConversationsColumns"
            :line-numbers="false"
            styleClass="order-table vgt-table"
            :rows="closedConversationsRows"
            v-if="view == 'closedConversations'"
          >
            <template slot="table-row" slot-scope="props">
              <button v-b-modal.conversationModal  v-if="props.column.field == 'whatsappConversationOpenAction'" class="btn btn-outline-primary text-black btn-rounded" @click="whatsappConversationOpenAction(props.row.whatsappConversationID)">Abrir</button>
            </template>
          </vue-good-table>

        </div>
      </div>
    </div>

    <b-modal scrollable size="m" centered id="transferModal" title="Transferir la conversación" @ok="transferConversation()">
      <b-list-group v-if="loaderTransferConversationAgents == false">
        <b-form-select v-model="agentToTransfer" class="mb-3 mt-3" :options="transferAgentOptions"></b-form-select>
        
      </b-list-group>
      <div v-else style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
    </b-modal>

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
                              <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 600px; height: 250px">
                                <GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/>

                                  <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                                  <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                                  <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                                  <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>

                                  <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
                                  <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
                                  <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
                                  <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
                              
                              </GmapMap><br>
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
                      <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 600px; height: 250px">
                        <GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/>

                        <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                        <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                        <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                        <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>

                        <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
                        <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
                        <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
                        <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
                      </GmapMap><br>
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
                              <GmapMap :center="getLocation(answeredMessage)" :zoom="zoom" style="width: 600px; height: 250px">
                                <GmapMarker :position="getLocation(answeredMessage)" :draggable="false"/>
                                
                                <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                                <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                                <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                                <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>

                                <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
                                <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
                                <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
                                <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
                              
                              </GmapMap><br>
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
                      <GmapMap :center="getLocation(currentActiveConversationMessage)" :zoom="zoom" style="width: 600px; height: 250px">
                        <GmapMarker :position="getLocation(currentActiveConversationMessage)" :draggable="false"/>
                        
                        <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                        <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                        <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
                        <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>

                        <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
                        <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
                        <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
                        <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
                      </GmapMap><br>
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


    


  </div>
</template>
<script>
import {
  dashboardOne,
  dashboardTwo,
  splineAreaWidgetTwo,
  splineAreaWidgetThree,
} from "@/data/dashboard1";

import axios from 'axios';
import ApexCharts from 'apexcharts'
import router from "../../../router"; 
import StarRating from 'vue-star-rating'

const constants = require('@../../../src/constants.js'); 

const webSocket = new WebSocket('wss:kingvapebackend2.onrender.com');


export default {
  metaInfo: {
    title: "Dashboard",
  },

  components: {
    StarRating
  },
  
  data() {
    return {
      openedName: '',
      openedNumber: '',

      cartagoMap: [],
      cartagoMapOptions: {
        strokeColor: "#26a699",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#26a699",
        fillOpacity: 0.4,
      },

      zapoteMap: [],
      zapoteMapOptions: {
        strokeColor: "#fed330",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#fed330",
        fillOpacity: 0.4,
      },

      herediaMap: [],
      herediaMapOptions: {
        strokeColor: "#9f7cd0",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#9f7cd0",
        fillOpacity: 0.4,
      },

      escazuMap: [],
      escazuMapOptions: {
        strokeColor: "#e44f9c",
        strokeOpacity: 0.5,
        strokeWeight: 3,
        fillColor: "#e44f9c",
        fillOpacity: 0.4,
      },

      opcionesGraficoPaquetes: {},
      datosGraficoPaquetes: [],
      datosGraficoDinero: [],

      selectedCloseLocality: null,
      closeLocalityOptions: ["King Vape Escazu", "King Vape Zapote","King Vape Cartago", "King Vape Heredia"],

      zapoteSelled: 0,
      zapoteNotSelled: 0,
      escazuSelled: 0,
      escazuNotSelled: 0,
      cartagoSelled: 0,
      cartagoNotSelled: 0,
      herediaSelled: 0,
      herediaNotSelled: 0,

      zapoteSales: 0,
      herediaSales: 0,
      escazuSales: 0,
      cartagoSales: 0,


      loaderPlot: false,

      closeConversationPhoneNumber: null,
      closeConversationReason: '',
      sendEndMessage: false,

      historyMessageLoader: false,
      historyMessage: null,

      loaderTransferConversationAgents: false,

      opcionesGraficoLinea: {},
      datosGraficoLinea: [],
      displayPlot: false,

      plotTypeOptions: [{value:1, text:'Cantidad de dinero'}, {value:2, text:'Cantidad de conversaciones vendidas'}, {value:3, text:'Cantidad de conversaciones no vendidas'}, {value:4, text:'Conexión'}],
      plotTypeOption: 1,

      initialDateOption: '',
      endDateOption: '',

      agentOptionsMultiple: [],
      agentArrayOption: [],
      transferAgentOptions: [],

      storeOptionsMultiple: [{value:'Escazu', text:'Escazú', selected: false}, {value:'Zapote', text:'Zapote', selected: false}, {value:'Cartago', text:'Cartago', selected: false}, {value:'Heredia', text:'Heredia', selected: false}],
      storeArrayOption: [],

      conversacionesTotales: 0,
      conversacionesVendidas: 0,
      conversacionesNoVendidas: 0,

      facturadoPorAgente: [],
      opcionesGraficoCircular: {},

      conversacionesPorAgente: [],
      opcionesGraficoBarra: {},
      vendedoraDelDia: '',

      zoom: 15,

      selected: 0,
      options: [
        {text: 'Fecha (más reciente a más antiguo)', value: 1},
        {text: 'Fecha (más antiguo a más reciente)', value: 2},
        {text: 'Monto vendido (mayor cantidad a menor cantidad)', value: 3},
        {text: 'Monto vendido (menor cantidad a mayor cantidad)', value: 4},
        {text: 'Cantidad de mensajes (mayor cantidad a menor cantidad)', value: 5},
        {text: 'Cantidad de mensajes (menor cantidad a mayor cantidad)', value: 6}
      ],

      whatsappTotalConversations: 0,
      whatsappSelledConversations: 0,
      whatsappNotSelledConversations: 0,
      whatsappPendingConversations: 0,
      whatsappReceivedMessages: 0,
      whatsappSendedMessages: 0,
      whatsappTotalSells: 0,

      todayReport: {},

      initialDateFiltered: '',
      endDateFiltered: '',
      numberFiltered: '',

      agentOptions: [{value:null,text:''}],
      agentFiltered: null,

      agentToTransfer: null,

      storeOptions: [{value:null, text:''}, {value:'Escazú', text:'Escazú'}, {value:'Zapote', text:'Zapote'}, {value:'Cartago', text:'Cartago'}, {value:'Heredia', text:'Heredia'}],
      storeFiltered: '',

      conversionOptions: [{value:null, text:''}, {value:'Vendido', text:'Vendido'}, {value:'No vendido', text:'No vendido'}],
      conversionFiltered: '',

      

      activeConversations: [],

      closedConversations: [],

      currentConversation: {},
      openConversationLoader: false,
      
      view: 'activeConversations',

      feedbackColumns: [
        {
          label: "Número del cliente",
          field: "whatsappConversationRecipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappConversationRecipientProfileName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Localidad",
          field: "whatsappConversationLocalityName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de la conversación",
          field: "whatsappConversationEndDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha del feedback",
          field: "whatsappFeedbackDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "agentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Resultado",
          field: "whatsappConversationResult",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Calidad de atención",
          field: "whatsappFeedbackOne",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Velocidad de respuesta",
          field: "whatsappFeedbackTwo",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Calidad del producto",
          field: "whatsappFeedbackThree",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Probabilidad de recomendación",
          field: "whatsappFeedbackFour",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Puntaje general",
          field: "whatsappFeedbackTotal",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Comentario",
          field: "whatsappFeedbackSix",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "",
          field: "whatsappFeedbackAction",
          thClass: "text-left",
          tdClass: "text-left",
        },
      ],

      feedbackRows: [],

      activeConversationsColumns: [
        {
          label: "ID de la conversación",
          field: "whatsappConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "whatsappConversationRecipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappConversationRecipientProfileName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "agentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Estado",
          field: "whatsappConversationState",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de inicio",
          field: "whatsappConversationStartDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Tiempo transcurrido",
          field: "whatsappConversationElapsedTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Conversación",
          field: "whatsappConversationOpenAction",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cerrar",
          field: "whatsappConversationCloseAction",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Transferir",
          field: "whatsappConversationTransferAction",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      activeConversationsRows: [],
      originalActiveConversationsRows: [],
      closedConversationsRows: [],

      closedConversationsColumns: [
        {
          label: "Estado",
          field: "whatsappConversationIsActive",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "ID",
          field: "whatsappConversationID",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Número del cliente",
          field: "whatsappConversationRecipientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del cliente",
          field: "whatsappConversationRecipientProfileName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre del agente",
          field: "agentName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "whatsappConversationAmount",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Fecha de inicio",
          field: "whatsappConversationStartDateTime",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Motivo",
          field: "whatsappConversationCloseComment",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Conversación",
          field: "whatsappConversationOpenAction",
          html: true,
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      bigImageSource: null,

      transferWhatsappConversationID: null,
      transferCurrentAgentID: null,

      numberSearched: ''
    };
  },

  mounted(){
    this.cartagoMap = constants.routes.cartagoMap;
    this.herediaMap = constants.routes.herediaMap;
    this.zapoteMap = constants.routes.zapoteMap;
    this.escazuMap = constants.routes.escazuMap;

    if (localStorage.getItem('agentID') == null){
      router.push("/app/sessions/signIn");
    }
    
    this.selectNotResolvedWhatsappFeedbacks();

    this.selectTodayInformation();
    this.selectAgentNames();
    this.getInformation();

    setInterval(() => {
      this.getInformation();
    }, 30000);
    
    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);
        const websocketMessageID = websocketMessageJSON.websocketMessageID;
        const websocketMessageContent = websocketMessageJSON.websocketMessageContent.result;

        if (websocketMessageID == '/receiveWhatsappConversation'){
          this.selectTodayInformation();
        } else if (websocketMessageID == '/receiveWhatsappPendingConversation'){
          this.selectTodayInformation();
        } else if (websocketMessageID == '/grabPendingConversation') {
          this.selectTodayInformation();
        } else if (websocketMessageID == '/grabStoreConversation') {
          this.selectTodayInformation();
        } else if (websocketMessageID == '/updateRanking') {
          this.selectTodayInformation();
        }
      }
    } catch (error) {
      console.log(error);
    }

  },

  methods: {
    scrollToBottom(){
      let scrollInterval = setInterval(() => {
        if (this.openConversationLoader == false){
          this.$nextTick(() => {
            if (this.$refs.scrollHistory) {
              const scrollableDiv = this.$refs.scrollHistory;
              scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
            }
          });
          clearInterval(scrollInterval);
        }
      }, 100);
    },

    cleanAgentFilter(){
      this.agentFiltered = '';
      this.activeConversationsRows = this.originalActiveConversationsRows;
    },

    searchAllNumbers(){
      this.numberSearched = '';
      this.activeConversationsRows = this.originalActiveConversationsRows;
    },

    searchByNumber(){
      this.activeConversationsRows = this.originalActiveConversationsRows;
      this.activeConversationsRows = this.originalActiveConversationsRows.filter(activeConversationRow => activeConversationRow.whatsappConversationRecipientPhoneNumber.includes(this.numberSearched.split(' ').join('')));
    },

    closeFeedback(feedback){
      feedback.whatsappFeedbackLoading = true;
      axios.post(constants.routes.backendAPI+'/updateWhatsappFeedback', {'whatsappFeedbackID': feedback.whatsappFeedbackAction}).then((response) =>{ 
        feedback.whatsappFeedbackLoading = false;
        if (response.data.success){
          this.selectNotResolvedWhatsappFeedbacks();
        } else {
          this.showNotification('danger', 'Error al recibir el feedback', 'Ha ocurrido un error inesperado al recibir el feedback. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() =>{
        feedback.whatsappFeedbackLoading = false;
        this.showNotification('danger', 'Error al recibir el feedback', 'Ha ocurrido un error inesperado al recibir el feedback. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    selectNotResolvedWhatsappFeedbacks(){
      axios.post(constants.routes.backendAPI+'/selectNotResolvedWhatsappFeedback').then((response) =>{ 
        if (response.data.success){
          this.feedbackRows = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar el feedback', 'Ha ocurrido un error inesperado al consultar el feedback. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al consultar el feedback', 'Ha ocurrido un error inesperado al consultar el feedback. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    closeWhatsappConversation(){
      if (this.selectedCloseLocality == null){
        this.showNotification('danger', 'Error al cerrar la conversación', 'Por favor, complete la sucursal relacionada a la conversación por cerrar. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      } else {
        const regularExpressionChecker = /\S/;
        if (regularExpressionChecker.test(this.closeConversationReason)){
          axios.post(constants.routes.backendAPI+'/closeWhatsappConversation',
          {
            whatsappConversationRecipientPhoneNumber: this.closeConversationPhoneNumber,
            whatsappConversationCloseComment: this.closeConversationReason,
            whatsappConversationAmount: 0,
            whatsappTextMessageBody: localStorage.getItem('agentEndMessage'),
            whatsappConversationProducts: [],
            whatsappConversationLocalityName: this.selectedLocality,
            sendAgentEndMessage: this.sendEndMessage
          })
          .then((response) =>{ 
            if (response.data.success){
              this.showNotification('success', 'Conversación cerrada', "Se ha cerrado la conversación asociada al número '" + this.closeConversationPhoneNumber + "'.");
              this.selectTodayInformation();
            } else {
              this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
            }
          })
          .catch(() =>{
            this.showNotification('danger', 'Error al cerrar la conversación', 'Ha ocurrido un error inesperado al cerrar la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          })
        } else {
          this.showNotification('danger', 'Error al cerrar la conversación', 'Por favor, complete el motivo de cierre de la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      }
    },


    addCloseConversationReason(reason){
      this.closeConversationReason = reason;
    },

    plot(){
      this.loaderPlot = true;

      this.agentArrayOption = [];
      for (var agentIndex in this.agentOptionsMultiple){
        if (this.agentOptionsMultiple[agentIndex].selected == true){
          this.agentArrayOption.push(this.agentOptionsMultiple[agentIndex].value);
        }
      }

      this.storeArrayOption = [];
      for (var storeIndex in this.storeOptionsMultiple){
        if (this.storeOptionsMultiple[storeIndex].selected == true){
          this.storeArrayOption.push(this.storeOptionsMultiple[storeIndex].value);
        }
      }

      if ((this.agentArrayOption.length == 0) && (this.storeArrayOption.length == 0)){
        this.showNotification('danger', 'Filtros incompletos', 'Debe colocar al menos un agente o una tienda para filtrar. Agregue al menos una opción para filtrar e intentelo nuevamente.');
        this.loaderPlot = false;
      } else {
        axios.post(constants.routes.backendAPI+'/selectPlotInformation',
        {
          plotType: this.plotTypeOption,
          initialDate: this.initialDateOption,
          endDate: this.endDateOption,
          agents: this.agentArrayOption,
          stores: this.storeArrayOption
        }).then((response) =>{
          this.loaderPlot = false;

          if (response.data.success){
            this.displayPlot = true;
            if (this.plotTypeOption == 4){
              this.opcionesGraficoLinea = {
                chart: {
                  type: 'line',
                  height: 350,
                },
                stroke: {
                  curve: 'stepline',
                },
                xaxis: {
                  type: 'datetime',
                  labels: {
                    datetimeUTC: true,
                    format: 'yyyy-MM-dd HH:mm:ss',
                  },
                },
                yaxis: {
                  min: 0,
                  max: 1
                }
              };
              this.datosGraficoLinea = response.data.result;

            } else {
              this.opcionesGraficoLinea = {
                chart: {
                  height: 350,
                  type: 'line',
                  zoom: {
                    enabled: false
                  }
                },
                dataLabels: {
                  enabled: false
                },
                stroke: {
                  curve: 'straight'
                },
                title: {
                  text: '',
                  align: 'left'
                },
                grid: {
                  row: {
                    colors: ['#f3f3f3', 'transparent'],
                    opacity: 0.5
                  },
                },
                xaxis: {
                  categories: response.data.result.dates,
                }
              }
              this.datosGraficoLinea = response.data.result.agents;
            }
          } else {
            this.showNotification('danger', 'Error al generar la gráfica', 'Ha ocurrido un error inesperado al generar la gráfica. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() =>{
          this.loaderPlot = false;

          this.showNotification('danger', 'Error al generar la gráfica', 'Ha ocurrido un error inesperado al generar la gráfica. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      }
    },

    getTagStyle(tagID){
      var style = 'cursor: pointer;';
      if (tagID == 1){
        if (this.view == 'activeConversations'){
          style = style + 'background-color: #e0e0e0;'
        }
      } else if (tagID == 2){
        if (this.view == 'closedConversations'){
          style = style + 'background-color: #e0e0e0;'
        }
      } else {
        if (this.view == 'estadisticas'){
          style = style + 'background-color: #e0e0e0;'
        }
      }
      return style;
    },

    openBigImage(bigImageSource){
      this.bigImageSource = bigImageSource;
    },

    getInformation(){
      axios.get(constants.routes.backendAPI+'/selectTodayInformation').then((response) =>{
        this.conversacionesTotales = response.data.result.total.whatsappTotalConversations;
        this.conversacionesVendidas = response.data.result.total.whatsappSelledConversations;
        this.conversacionesNoVendidas = response.data.result.total.whatsappNotSelledConversations;

        if (response.data.result.localities['King Vape Zapote']){
          this.zapoteSelled = response.data.result.localities['King Vape Zapote'].whatsappSelledConversations;
          this.zapoteNotSelled = response.data.result.localities['King Vape Zapote'].whatsappNotSelledConversations;
          this.zapoteSales = response.data.result.localities['King Vape Zapote'].amount;
        } else {
          this.zapoteSelled = 0;
          this.zapoteNotSelled = 0;
          this.zapoteSales = 0;
        }

        if (response.data.result.localities['King Vape Escazu']){
          this.escazuSelled = response.data.result.localities['King Vape Escazu'].whatsappSelledConversations;
          this.escazuNotSelled = response.data.result.localities['King Vape Escazu'].whatsappNotSelledConversations;
          this.escazuSales = response.data.result.localities['King Vape Escazu'].amount;
        } else {
          this.escazuSelled = 0;
          this.escazuNotSelled = 0;
          this.escazuSales = 0;
        }

        if (response.data.result.localities['King Vape Cartago']){
          this.cartagoSelled = response.data.result.localities['King Vape Cartago'].whatsappSelledConversations;
          this.cartagoNotSelled = response.data.result.localities['King Vape Cartago'].whatsappNotSelledConversations;
          this.cartagoSales = response.data.result.localities['King Vape Cartago'].amount;
        } else {
          this.cartagoSelled = 0;
          this.cartagoNotSelled = 0;
          this.cartagoSales = 0;
        }

        if (response.data.result.localities['King Vape Heredia']){
          this.herediaSelled = response.data.result.localities['King Vape Heredia'].whatsappSelledConversations;
          this.herediaNotSelled = response.data.result.localities['King Vape Heredia'].whatsappNotSelledConversations;
          this.herediaSales = response.data.result.localities['King Vape Heredia'].amount;
        } else {
          this.herediaSelled = 0;
          this.herediaNotSelled = 0;
          this.herediaSales = 0;
        }

        this.opcionesGraficoPaquetes = {chart: {width: 330, type: 'pie', fontSize: 20}, tooltip: {enabled: true}, labels: ['Zapote', 'Escazú', 'Cartago', 'Heredia'], colors: ['#FB761E', '#FF95B8', '#B1C11A', '#00E3D4']};
        this.datosGraficoPaquetes = [this.zapoteSelled, this.escazuSelled, this.cartagoSelled, this.herediaSelled];
        this.datosGraficoDinero = [this.zapoteSales, this.escazuSales, this.cartagoSales, this.herediaSales];

      });
    },

    filterByAgent(){
      this.activeConversationsRows = this.originalActiveConversationsRows;
      if (this.agentFiltered != null){
        this.activeConversationsRows = this.originalActiveConversationsRows.filter(activeConversationRow => activeConversationRow.agentID == this.agentFiltered);
        this.activeConversationsRows.sort((a, b) => a.whatsappConversationState.localeCompare(b.whatsappConversationState));
      }
    },

    selectAgentNames(){
      this.agentOptions = [{value:null,text:''}];
      this.agentOptionsMultiple = [];
      axios.get(constants.routes.backendAPI+'/selectAgentNames').then((response) =>{
        if (response.data.success){
          for (var agentIndex in response.data.result){
            this.agentOptions.push({value: response.data.result[agentIndex].agentID, text: response.data.result[agentIndex].agentName});
            this.agentOptionsMultiple.push({value: response.data.result[agentIndex].agentID, text: response.data.result[agentIndex].agentName, selected: false});
          }
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    getHistoryMessage(whatsappGeneralMessageID){
      this.historyMessageLoader = true;
      axios.post(constants.routes.backendAPI+'/selectWhatsappGeneralMessage', 
      {
        whatsappGeneralMessageID: whatsappGeneralMessageID
      })
      .then((response) => {
        if (response.data.success){
          this.historyMessage = response.data.result;
          this.historyMessageLoader = false;
        } else {
          this.historyMessageLoader = false;
          this.showNotification('danger', 'Error al abrir el mensaje del historial', 'Ha ocurrido un error inesperado al abrir el mensaje del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al abrir el mensaje del historial', 'Ha ocurrido un error inesperado al abrir el mensaje del historial. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    transferConversation(){
      axios.post(constants.routes.backendAPI+'/acceptTransferWhatsappConversation', 
      {
        currentAgentID: this.transferCurrentAgentID,
        newAgentID: this.agentToTransfer,
        whatsappConversationID: this.transferWhatsappConversationID
      }).then((response) =>{
        if (response.data.success){
          this.selectTodayInformation();
          this.showNotification('success', 'Conversación transferida', 'Se ha transferido la conversación exitosamente.')
        } else {
          this.showNotification('danger', 'Error al realizar la transferencia', 'Ha ocurrido un error inesperado al realizar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al realizar la transferencia', 'Ha ocurrido un error inesperado al realizar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectTodayInformation(){
      axios.get(constants.routes.backendAPI+'/selectAllActiveConversationBasicInformation').then((response) =>{
        if (response.data.success){
          this.activeConversations = response.data.result;
          this.activeConversationsRows = [];
          for (var activeConversationIndex in this.activeConversations){
            this.activeConversationsRows.push
            ({
              whatsappConversationID: this.activeConversations[activeConversationIndex].whatsappConversationID,
              whatsappConversationRecipientPhoneNumber: this.activeConversations[activeConversationIndex].whatsappConversationRecipientPhoneNumber,
              whatsappConversationRecipientProfileName: this.activeConversations[activeConversationIndex].whatsappConversationRecipientProfileName,
              agentName: this.activeConversations[activeConversationIndex].agentName || 'Sin asignar',
              agentID: this.activeConversations[activeConversationIndex].agentID,
              whatsappGeneralMessageCreationDateTime: this.activeConversations[activeConversationIndex].whatsappGeneralMessageCreationDateTime,
              whatsappGeneralMessageOwnerPhoneNumber: this.activeConversations[activeConversationIndex].whatsappGeneralMessageOwnerPhoneNumber,
              whatsappConversationState: this.getWhatsappConversationState(this.activeConversations[activeConversationIndex]),
              whatsappConversationStartDateTime: this.parseHour(this.activeConversations[activeConversationIndex].whatsappConversationStartDateTime),
              whatsappConversationElapsedTime: this.getWhatsappConversationElapsedTime(Math.round((new Date() - new Date(this.activeConversations[activeConversationIndex].whatsappConversationStartDateTime))/1000)),
              whatsappConversationOpenAction: '',
              whatsappConversationTransferAction: '',
              whatsappConversationCloseAction: ''
            });
            this.activeConversationsRows.sort((a, b) => a.whatsappConversationState.localeCompare(b.whatsappConversationState));

            this.originalActiveConversationsRows = this.activeConversationsRows;
            this.filterByAgent();
          }

          setInterval(() => {
            for (var activeConversationIndex in this.activeConversationsRows){
              this.activeConversationsRows[activeConversationIndex].whatsappConversationState = this.getWhatsappConversationState(this.activeConversationsRows[activeConversationIndex]);
              this.activeConversationsRows[activeConversationIndex].whatsappConversationElapsedTime = this.getWhatsappConversationElapsedTime(Math.round((new Date() - new Date(this.activeConversations[activeConversationIndex].whatsappConversationStartDateTime))/1000))
            }
            
          }, 1000);

          axios.get(constants.routes.backendAPI+'/selectTodayDashboardInformation').then((response) =>{
            this.whatsappTotalConversations = response.data.result.whatsappTotalConversations;
            this.whatsappSelledConversations = response.data.result.whatsappSelledConversations;
            this.whatsappNotSelledConversations = response.data.result.whatsappNotSelledConversations;
            this.whatsappPendingConversations = response.data.result.whatsappPendingConversations;
            this.whatsappTotalSells = response.data.result.whatsappTotalSells.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3});
            this.whatsappSendedMessages = response.data.result.whatsappSendedMessages;
            this.whatsappReceivedMessages = response.data.result.whatsappReceivedMessages;
          })
          .catch((error) =>{
            console.log(error);
          })
        } else {
          
        }
      })
      .catch((error) =>{
        console.log(error);
      })
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
      if (formattedDate.includes('00') && formattedDate.includes('PM')){
        formattedDate = formattedDate.replace('00', '12');
      }
      return formattedDate;
    },
    
    filter(){
      axios.post(constants.routes.backendAPI+'/selectFilteredConversations', 
      {
        initialDateFiltered: this.initialDateFiltered,
        endDateFiltered: this.endDateFiltered,
        numberFiltered: this.numberFiltered,
        agentFiltered: this.agentFiltered,
        storeFiltered: this.storeFiltered,
        conversionFiltered: this.conversionFiltered
      })
      .then((response) =>{
        if (response.data.success){
          this.closedConversations = response.data.result;
          this.closedConversationsRows = [];
          for (var closedConversationIndex in this.closedConversations){
            var temp = '' 
            if (this.closedConversations[closedConversationIndex].whatsappConversationIsActive){
              temp = '🟢'
            } else {
              temp = '🔴'
            }
            this.closedConversationsRows.push
            ({
              whatsappConversationID: this.closedConversations[closedConversationIndex].whatsappConversationID,
              whatsappConversationRecipientPhoneNumber: this.parseNumber(this.closedConversations[closedConversationIndex].whatsappConversationRecipientPhoneNumber),
              whatsappConversationRecipientProfileName: this.closedConversations[closedConversationIndex].whatsappConversationRecipientProfileName,
              whatsappConversationAmount: this.closedConversations[closedConversationIndex].whatsappConversationAmount.toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}),
              agentName: this.closedConversations[closedConversationIndex].agentName || 'Sin asignar',
              whatsappConversationStartDateTime: this.parseHour(this.closedConversations[closedConversationIndex].whatsappConversationStartDateTime),
              whatsappConversationCloseComment: this.closedConversations[closedConversationIndex].whatsappConversationCloseComment,
              whatsappConversationIsActive: temp,
              whatsappConversationOpenAction: ''
            });
          }
        } else {
          this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        
        this.showNotification('danger', 'Error al abrir la conversación', 'Ha ocurrido un error inesperado al abrir la conversación. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    
    cleanFilter(){
      this.initialDateFiltered = '';
      this.endDateFiltered = '';
      this.endDateFiltered = '';
      this.agentFiltered = '';
      this.numberFiltered = '';
      this.storeFiltered = '';
      this.conversionFiltered = '';
    },

    cleanPlotFilter(){
      this.displayPlot = false;
      this.initialDateOption = '';
      this.endDateOption = '';

      for (var agentIndex in this.agentOptionsMultiple){
        this.agentOptionsMultiple[agentIndex].selected = false;
      }

      for (var storeIndex in this.storeOptionsMultiple){
        this.storeOptionsMultiple[storeIndex].selected = false;
      }

    },



    getClosedConversations(){
      this.view = 'closedConversations';
    },

    getEstadisticas(){
      this.view = 'estadisticas';
    },


    getWhatsappConversationState(whatsappConversation){
      var whatsappLastGeneralMessageCreationDateTime = whatsappConversation.whatsappGeneralMessageCreationDateTime;
      var whatsappLastGeneralMessageElapsedTime = this.getWhatsappConversationElapsedTime(Math.round((new Date() - new Date(whatsappLastGeneralMessageCreationDateTime))/1000));
      if (whatsappConversation.agentName == 'Sin asignar'){
        return '<span class="badge badge-pill badge-warning p-2 " style="background-color="red"">Pendiente ('+whatsappLastGeneralMessageElapsedTime+')</span>';
      }
      else if (whatsappConversation.whatsappGeneralMessageOwnerPhoneNumber == null){
        return '<span class="badge badge-pill badge-success p-2 ">Esperando al cliente ('+whatsappLastGeneralMessageElapsedTime+')</span>';
      } else {
        return '<span class="badge badge-pill badge-danger p-2 " style="background-color="red"">Esperando al agente ('+whatsappLastGeneralMessageElapsedTime+')</span>';
      }
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

    whatsappConversationOpenAction(whatsappConversation){

      this.openedName = whatsappConversation.whatsappConversationRecipientProfileName;
      this.openedNumber = whatsappConversation.whatsappConversationRecipientPhoneNumber;

      var whatsappConversationID = whatsappConversation.whatsappConversationID;
      this.openConversationLoader = true;
      this.currentConversation = {};
      const me = this;
      axios.post(constants.routes.backendAPI+'/selectAgentConversation', 
      {
        whatsappConversationID: whatsappConversationID
      })
      .then((response) =>{
        if (response.data.success){
          this.currentConversation = response.data.result[whatsappConversationID];
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

    whatsappTransferOpenAction(whatsappConversation){
      this.transferWhatsappConversationID = whatsappConversation.whatsappConversationID;
      this.transferCurrentAgentID = whatsappConversation.agentID;

      this.loaderTransferConversationAgents = true;
      this.transferAgentOptions = [{value:null, text:''}];
      this.agentToTransfer = null;
      axios.get(constants.routes.backendAPI+'/selectTransferableAgents')
      .then((response) =>{
        if (response.data.success){
          for (var agentIndex in response.data.result){
            this.transferAgentOptions.push({value: response.data.result[agentIndex].agentID, text: response.data.result[agentIndex].agentName});
          }
          this.loaderTransferConversationAgents = false;
        } else {
          this.showNotification('danger', 'Error al solicitar los agentes para realizar la transferencia', 'Ha ocurrido un error inesperado al solicitar los agentes para realizar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch((error) => {
        this.showNotification('danger', 'Error al solicitar los agentes para realizar la transferencia', 'Ha ocurrido un error inesperado al solicitar los agentes para realizar la transferencia. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    whatsappCloseOpenAction(whatsappConversation){
      this.closeConversationPhoneNumber = whatsappConversation.whatsappConversationRecipientPhoneNumber;
      this.selectedCloseLocality = null;
      this.closeConversationReason = '';
    },

    getWhatsappConversationElapsedTime(seconds){
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const remainingSeconds = seconds % 60;
      const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
      return timeFormat;
    }
  }
};
</script>
