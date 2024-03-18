<template>
  <div>

    <b-modal id="deliveredInvoicesModal" size="lg" centered hide-header hide-footer>
      <div v-if="loaderDelivered" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-else>
        <vue-good-table
          :columns="deliveredInvoicesTable"
          :rows="deliveredInvoices"
          styleClass="order-table vgt-table"
          :line-numbers="false">
          <template slot="table-row" slot-scope="props">
            <div v-if="props.column.field == 'whatsappInvoiceAgentID'">
              <i v-b-modal.informacionModal @click="openWhatsappInvoiceInformation(props.row)" class="i-Information" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>

              <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(props.row)" class="i-Shopping-Cart" style="font-size: xx-large; cursor: pointer;"></i>
            </div>
            <div v-else-if="props.column.field == 'whatsappInvoiceClientPhoneNumber'">
              {{ parsePhoneNumber(props.row.whatsappInvoiceClientPhoneNumber) }}
            </div>
            <div v-else-if="props.column.field == 'whatsappInvoiceAmount'">
              ₡{{ parseInt(props.row.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}
            </div>
            
          </template>
        </vue-good-table>
      </div>
    </b-modal>

    <b-modal id="localityAgentInvoicesModal" size="m" centered hide-header hide-footer>
      <div v-if="loaderDelivered" style="text-align: center;">
        <br><span class="spinner-glow spinner-glow-primary"></span>
      </div>
      <div v-else>
        <h1>hola</h1>
      </div>
    </b-modal>

    <b-modal id="notShippedModal" size="sm" centered hide-header @ok="notShippedInvoice()">
      <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque un motivo para no entregar" v-model="notShippedReason"/>
    </b-modal>

    <b-modal id="shippingModal" size="sm" centered hide-header hide-footer>
      <div style="text-align: center" v-if="shippingInvoice">
        <h5><strong>ID: </strong>{{ shippingInvoice.whatsappInvoiceID }}</h5>
        <h5><strong>Nombre: </strong>{{ shippingInvoice.whatsappInvoiceClientName }}</h5>
        <h5><strong>Número: </strong>{{ parsePhoneNumber(shippingInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
        <br><br>
        <b-button @click="clickOnShippingInvoice(shippingInvoice)" variant="success">Entregado</b-button>
        <br><br>
        <b-button v-b-modal.notShippedModal variant="danger">No entregado</b-button>
      </div>

    </b-modal>

    <b-modal id="assignLocalityAgentModal" size="sm" centered hide-header @ok="assignLocalityAgent()">
      <b-form-select v-model="assignedLocalityAgent" :options="localityAgentOptions"></b-form-select>
    </b-modal>

    
    <b-modal id="updateWhatsappInvoiceClientNameModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceClientName()">
      <b-form-input v-model="updatedWhatsappInvoiceClientName" placeholder="Coloque un nombre"></b-form-input>
    </b-modal>

    <b-modal id="updateWhatsappInvoiceClientPhoneNumberModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceClientPhoneNumber()">
      <b-form-input v-model="updatedWhatsappInvoiceClientPhoneNumber" placeholder="Coloque un número de teléfono"></b-form-input>
    </b-modal>

    <b-modal id="updateWhatsappInvoiceAmountModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceAmount()">
      <b-form-input v-model="updatedWhatsappInvoiceAmount" placeholder="Coloque un monto"></b-form-input>
    </b-modal>

    <b-modal id="updateWhatsappInvoiceAgentIDModal" size="sm" centered hide-header @ok="updateWhatsappInvoiceAgentID()">
      <b-form-select v-model="updatedWhatsappInvoiceAgentID" :options="updateWhatsappInvoiceAgentIDOptions"></b-form-select>
    </b-modal>

    <b-modal id="whatsappInvoiceProductsModal" size="lg" centered hide-header hide-footer>
      <vue-good-table
        :columns="whatsappInvoiceProductsColumns"
        :line-numbers="false"
        styleClass="order-table vgt-table"
        :rows="whatsappInvoiceProducts">
        <template slot="table-row" slot-scope="props">  
          <div v-if="props.column.field == 'CodigoP'">
            <VueBarcode :value="props.row.CodigoP" width="1" height="50">
            </VueBarcode>
          </div>
          <div v-else-if="props.column.field == 'precio'">
            ₡{{ parseInt(props.row.precio).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}
          </div>
          <div v-else-if="props.column.field == 'descuento'">
            {{ props.row.descuento }} %
          </div>
        </template>
      </vue-good-table>
    </b-modal>

    <b-modal id="localityWhatsappInvoiceInformationModal" size="lg" centered hide-header hide-footer>
      <div style="display: flex;">
        <div style="width: 50%; margin-right: 50px;">
          <h5><strong>Estado: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceState" :options="updateWhatsappInvoiceStateOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceState()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Método de envío: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceShippingMethod" :options="updateWhatsappInvoiceShippingMethodOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingMethod()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Método de pago: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoicePaymentMethod" :options="updateWhatsappInvoicePaymentMethodOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoicePaymentMethod()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Estado de pago: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoicePaymentState" :options="updateWhatsappInvoicePaymentStateOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoicePaymentState()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Nota de la dirección: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceLocationNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
          </div>
          <br>

          <h5><strong>Nota del envío: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
          </div>
          <br>

          <div v-if="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason">
            <h5><strong>Motivo del fallo en la entrega: </strong></h5>
            <div style="display: flex;">
              <b-form-textarea no-resize rows="5" class="form-control" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason"/>    
            </div>
            <br>
          </div>
          
          <br>
        </div>

        <div style="width: 50%;">
          <div v-if="updatedWhatsappInvoice.localityAgentName">
            <h5><strong>Mensajero: </strong></h5>
            <div style="display: flex;">
              <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceLocalityAgentID" :options="localityAgentOptions"></b-form-select>
              <div class="flex-grow-1"></div>
              <i @click="updateWhatsappInvoiceLocalityAgentID()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
            </div>
          </div>
          <h5 v-else><strong>Mensajero: </strong>No asignado</h5> 
          <br>

          <h5><strong>Enlace de la ubicación: </strong></h5>
          <div style="display: flex;">
            <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceClientLocationURL()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Ubicación: </strong></h5>
          <GmapMap :center="getWhatsappInvoiceClientLocation()" :zoom="13" style="width: 100%; height: 460px" v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation">
            <GmapMarker :position="getWhatsappInvoiceClientLocation()" :draggable="false"/>
            <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
          </GmapMap>
          <br>
          <div style="display: flex;">
            <b-form-select @change="changeWhatsappInvoiceLocation()" v-model="updatedWhatsappInvoiceLocation" :options="updateWhatsappInvoiceLocationOptions"></b-form-select>
            <i @click="selectWhatsappInvoiceLocations()" class="i-Data-Search text-25 text-info ml-3" style="cursor: pointer"></i>    
            <i @click="updateWhatsappInvoiceClientLocation()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
          </div>
        </div>
      </div>

      <br><br>

      <div style="text-align: center;">
        <div v-if="loaderReturned" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
        <b-button v-else @click="returnWhatsappConversation()" variant="info">Regresar al call center</b-button>

      </div>

    </b-modal>

    
    <b-modal id="informacionModal" size="lg" centered hide-footer hide-header>
      <h5><strong>ID: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceID }}</h5>
      <h5><strong>Nombre del cliente: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceClientName }}</h5>
      <h5><strong>Número del cliente: </strong> {{ parsePhoneNumber(updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
      <h5><strong>Monto: </strong> ₡{{ parseInt(updatedWhatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>

      <br>

      <h5><strong>Nombre del agente: </strong> {{ updatedWhatsappInvoice.agentName }}</h5>
      <h5><strong>Nombre del mensajero: </strong> {{ updatedWhatsappInvoice.localityAgentName }}</h5>

      <br>

      <h5><strong>Método de envío: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceShippingMethod }}</h5>
      <h5><strong>Método de pago: </strong> {{updatedWhatsappInvoice.whatsappInvoicePaymentMethod}}</h5>
      <h5><strong>Estado de pago: </strong> {{ updatedWhatsappInvoice.whatsappInvoicePaymentState }}</h5>

      <br>

      <h5><strong>Nota de la dirección: </strong></h5>
      <div style="display: flex;">
        <b-form-textarea disabled no-resize rows="3" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
        <div class="flex-grow-1"></div>
      </div>
      <br>

      <h5><strong>Nota del envío: </strong></h5>
      <div style="display: flex;">
        <b-form-textarea disabled no-resize rows="3" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
        <div class="flex-grow-1"></div>
      </div>
      <br>

      <div v-if="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason">
        <h5><strong>Motivo del fallo en la entrega: </strong></h5>
        <div style="display: flex;">
          <b-form-textarea no-resize rows="3" class="form-control" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason"/>    
        </div>
        <br>
      </div>

      <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL != ''">
        <h5><strong>Enlace de la ubicación: </strong></h5>
        <div style="display: flex;">
          <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" disabled class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
        </div>
        <br>
      </div>
      
      <h5><strong>Ubicación: </strong></h5>
      <GmapMap :center="getWhatsappInvoiceClientLocation()" :zoom="13" style="width: 100%; height: 300px" v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation">
        <GmapMarker :position="getWhatsappInvoiceClientLocation()" :draggable="false"/>
        <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
        <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
        <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
        <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
        <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
        <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
        <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
        <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
      </GmapMap>
      <br>

    </b-modal>



    <b-modal id="mensajeroModal" size="lg" centered hide-footer title="Información del envío">
          <h5><strong>Estado: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceState }}</h5>
          <h5><strong>Método de envío: </strong> {{ updatedWhatsappInvoice.whatsappInvoiceShippingMethod }}</h5>
          <h5><strong>Método de pago: </strong> {{updatedWhatsappInvoice.whatsappInvoicePaymentMethod}}</h5>
          <h5><strong>Estado de pago: </strong> {{ updatedWhatsappInvoice.whatsappInvoicePaymentState }}</h5>

          <br>
          <h5><strong>Nota de la dirección: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea disabled no-resize rows="5" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
            <div class="flex-grow-1"></div>
          </div>
          <br>

          <h5><strong>Nota del envío: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea disabled no-resize rows="5" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
            <div class="flex-grow-1"></div>
          </div>
          <br>

          <div v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL != ''">
            <h5><strong>Enlace de la ubicación: </strong></h5>
            <div style="display: flex;">
              <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" disabled class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
              <img @click="goToURL(updatedWhatsappInvoice.whatsappInvoiceClientLocationURL)" src="@/assets/pageAssets/map.png" alt style="cursor:pointer; width: 35px; margin-left: 20px; height: 35px;"/>
              <img @click="goToURL(updatedWhatsappInvoice.whatsappInvoiceClientLocationURL)" src="@/assets/pageAssets/z.png" alt style="cursor:pointer; margin-left: 10px; width: 35px; height: 35px;"/>
            </div>
            <br>
          </div>
          
          <h5><strong>Ubicación: </strong></h5>
          <GmapMap :center="getWhatsappInvoiceClientLocation()" :zoom="13" style="width: 100%; height: 300px" v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation">
            <GmapMarker :position="getWhatsappInvoiceClientLocation()" :draggable="false"/>
            <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
          </GmapMap>
          <br>

          <div style="text-align: center;">
            <div style="display: flex;">
              <img @click="contactClient()" src="@/assets/pageAssets/w.png" alt style="width: 50px; margin-right: 20px; height: auto;"/>
              <img @click="goWithMaps()" src="@/assets/pageAssets/map.png" alt style="width: 50px; margin-right: 20px; height: auto;"/>
              <img @click="goWithWaze()" src="@/assets/pageAssets/z.png" alt style="width: 50px; height: auto;"/>

            </div>
          </div>


    </b-modal>

    <b-modal id="updateWhatsappInvoiceInformation" size="lg" centered hide-header hide-footer>
      <div style="display: flex;">
        <div style="width: 50%; margin-right: 50px;">
          <h5><strong>Estado: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceState" :options="updateWhatsappInvoiceStateOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceState()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Método de envío: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoiceShippingMethod" :options="updateWhatsappInvoiceShippingMethodOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingMethod()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Método de pago: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoicePaymentMethod" :options="updateWhatsappInvoicePaymentMethodOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoicePaymentMethod()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Estado de pago: </strong></h5>
          <div style="display: flex;">
            <b-form-select v-model="updatedWhatsappInvoice.whatsappInvoicePaymentState" :options="updateWhatsappInvoicePaymentStateOptions"></b-form-select>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoicePaymentState()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Nota de la dirección: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="5" class="form-control" placeholder="Coloque una nota de la dirección" v-model="updatedWhatsappInvoice.whatsappInvoiceLocationNote"/>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceLocationNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
          </div>
          <br>

          <h5><strong>Nota del envío: </strong></h5>
          <div style="display: flex;">
            <b-form-textarea no-resize rows="3" class="form-control" placeholder="Coloque una nota del envío" v-model="updatedWhatsappInvoice.whatsappInvoiceShippingNote"/>    
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceShippingNote()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
          </div>
          <br>

          <div v-if="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason">
            <h5><strong>Motivo del fallo en la entrega: </strong></h5>
            <div style="display: flex;">
              <b-form-textarea no-resize rows="3" class="form-control" disabled v-model="updatedWhatsappInvoice.whatsappInvoiceNotShippedReason"/>
            </div>
            <br>
          </div>

          <br>
        </div>

        <div style="width: 50%;">
          <h5 v-if="updatedWhatsappInvoice.localityAgentName"><strong>Mensajero: </strong>{{ updatedWhatsappInvoice.localityAgentName }}</h5>
          <h5 v-else><strong>Mensajero: </strong>No asignado</h5> 
          <br>

          <h5><strong>Enlace de la ubicación: </strong></h5>
          <div style="display: flex;">
            <b-form-input v-model="updatedWhatsappInvoice.whatsappInvoiceClientLocationURL" class="mb-3" placeholder="Enlace de la ubicación"></b-form-input>
            <div class="flex-grow-1"></div>
            <i @click="updateWhatsappInvoiceClientLocationURL()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>
          </div>
          <br>

          <h5><strong>Ubicación: </strong></h5>
          <GmapMap :center="getWhatsappInvoiceClientLocation()" :zoom="13" style="width: 100%; height: 415px" v-if="updatedWhatsappInvoice.whatsappInvoiceClientLocation">
            <GmapMarker :position="getWhatsappInvoiceClientLocation()" :draggable="false"/>
            <GmapMarker id="zapoteTag" :position="{lat: 9.920173, lng: -84.051987}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="escazuTag" :position="{lat: 9.949093, lng: -84.163117}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="cartagoTag" :position="{lat: 9.864751, lng: -83.925354}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapMarker id="herediaTag" :position="{lat: 9.99168, lng: -84.135}" :draggable="false" :icon="{ url: require('../../../assets/pageAssets/2.png')}" />"/>
            <GmapPolygon :paths="cartagoMap" :options="cartagoMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="zapoteMap" :options="zapoteMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="herediaMap" :options="herediaMapOptions" :editable="false"></GmapPolygon>
            <GmapPolygon :paths="escazuMap" :options="escazuMapOptions" :editable="false"></GmapPolygon>
          </GmapMap>
          <br>
          <div style="display: flex;">
            <b-form-select @change="changeWhatsappInvoiceLocation()" v-model="updatedWhatsappInvoiceLocation" :options="updateWhatsappInvoiceLocationOptions"></b-form-select>
            <i @click="selectWhatsappInvoiceLocations()" class="i-Data-Search text-25 text-info ml-3" style="cursor: pointer"></i>    
            <i @click="updateWhatsappInvoiceClientLocation()" class="i-Eraser-2 text-25 text-success ml-3" style="cursor: pointer"></i>    
          </div>
        </div>
      </div>

      <br><br>

      <div style="text-align: center;">
        <div v-if="loaderReturned" style="text-align: center;">
          <br><span class="spinner-glow spinner-glow-primary"></span>
        </div>
        <b-button v-else @click="returnWhatsappConversation()" variant="info">Regresar al call center</b-button>
      </div>

    </b-modal>


    <div style="display: flex" v-if="agentType == 'central'">
      
      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #fed330;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h1 style="margin-top: auto; margin-bottom: auto;"><strong>ZAPOTE</strong></h1>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="danger">{{zapoteCentralWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="warning">{{zapoteLocalityWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large;" pill variant="success">{{zapoteShippingWhatsappInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          <br>
          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="whatsappInvoice in zapoteWhatsappInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h4 style="color:red" v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated"><strong>COMANDA MODIFICADA</strong></h4>
                  <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                    <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-card>
      </div>

      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #e44f9c;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h1 style="margin-top: auto; margin-bottom: auto;"><strong>ESCAZÚ</strong></h1>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="danger">{{escazuCentralWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="warning">{{escazuLocalityWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large;" pill variant="success">{{escazuShippingWhatsappInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          <br>
          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="whatsappInvoice in escazuWhatsappInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h4 style="color:red" v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated"><strong>COMANDA MODIFICADA</strong></h4>
                  <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                    <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-card>
      </div>

      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #9f7cd0;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h1 style="margin-top: auto; margin-bottom: auto;"><strong>HEREDIA</strong></h1>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="danger">{{herediaCentralWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="warning">{{herediaLocalityWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large;" pill variant="success">{{herediaShippingWhatsappInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          <br>
          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="whatsappInvoice in herediaWhatsappInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h4 style="color:red" v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated"><strong>COMANDA MODIFICADA</strong></h4>
                  <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                    <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-card>
      </div>

      <div style="width: 25%; margin-right: 1%;">
        <b-card style="height: 90vh; background-color: #26a699;">
          <div style="justify-content: center; display: flex;">
            <div style="display: flex;">
              <h1 style="margin-top: auto; margin-bottom: auto;"><strong>CARTAGO</strong></h1>
              <div style="margin-left: 30px;">
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="danger">{{cartagoCentralWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="warning">{{cartagoLocalityWhatsappInvoiceAmount}}</b-badge>
                <b-badge style="font-size: x-large;" pill variant="success">{{cartagoShippingWhatsappInvoiceAmount}}</b-badge>
              </div>
            </div>
          </div>
          <br>
          <div style="height: 80vh; overflow-y: auto;">
            <div v-for="whatsappInvoice in cartagoWhatsappInvoices">
              <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white;">
                <div style="width: 60%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                  <h4 style="color:red" v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated"><strong>COMANDA MODIFICADA</strong></h4>
                  <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientNameModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientName(whatsappInvoice)"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceClientPhoneNumberModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice)"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAmountModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAmount(whatsappInvoice)"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                  <h5 v-b-modal.updateWhatsappInvoiceAgentIDModal style="cursor: pointer;" @click="openUpdateWhatsappInvoiceAgentID(whatsappInvoice)"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="danger">{{ whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="width: 20%; margin-top: auto; margin-bottom: auto;">
                  <div style="text-align: end;"> 
                    <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                    <i v-b-modal.updateWhatsappInvoiceInformation @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  </div>
                  <div style="text-align: end;">
                    <br>
                    <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'C'" @click="clickOnCentralInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="danger">C</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                    <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </b-card>
      </div>
    </div>

    <div v-if="agentType == 'locality'">
      <b-card>
        <div style="justify-content: center; display: flex;">
          <div style="display: flex;">
            <h1 style="margin-top: auto; margin-bottom: auto;"><strong>{{ localityName }}</strong></h1>
            <div style="margin-left: 30px;">
              <b-badge style="font-size: x-large; margin-right: 7px;" pill variant="warning">{{localityWhatsappInvoiceAmount}}</b-badge>
              <b-badge style="font-size: x-large;" pill variant="success">{{shippingWhatsappInvoiceAmount}}</b-badge>
            </div>
            <div style="display: flex; margin-left: 30px;">
              <h1 v-b-modal.deliveredInvoicesModal @click="selectTodayDeliveredInvoices()" style="margin-right: 7px; cursor: pointer;">📦</h1>
              <h1 v-b-modal.deliveredInvoicesModal @click="selectTodayInvoicesByLocalityAgent()" style="margin-right: 7px; cursor: pointer;">🏍️</h1>
              <h1 v-b-modal.deliveredInvoicesModal @click="selectTodayCanceledInvoices()" style="cursor: pointer;">❌</h1>

            </div>
          </div>
        </div>
        <br>
        
        <div style="max-height: 75vh; overflow-y: auto; display: flex; gap: 10px; flex-wrap: wrap;  width: 100%;">
          <div v-for="whatsappInvoice in localityWhatsappInvoices">
            <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white; width: 100%;">
              <div style="width: 70%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                <h4 style="color:red" v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated"><strong>COMANDA MODIFICADA</strong></h4>
                <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                <h5 style="cursor: pointer;"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                <h5 style="cursor: pointer;"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                <h5 style="cursor: pointer;"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                <h5 style="cursor: pointer;"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
              </div>
              <div style="width: 30%; margin-top: auto; margin-bottom: auto;">
                <div style="display: flex; margin-top: 10px;"> 
                  <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  <i v-b-modal.localityWhatsappInvoiceInformationModal @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                </div>
                <div style="margin-top: 10px; margin-bottom: 10px; margin-right: 10px;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="text-align: end; margin-bottom: 10px;">
                  <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'S'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="warning">S</b-badge>
                  <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'R'" @click="clickOnShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                  <b-badge v-else-if="whatsappInvoice.whatsappInvoiceState == 'NE'" @click="clickOnLocalityInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="info">NE</b-badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-card>
    </div>

    
    <div v-if="agentType == 'localityAgent'">
      <b-card :style="localityColor">
        <div style="justify-content: center; display: flex;">
          <b-badge style="font-size: x-large;" pill variant="success">{{localityAgentInvoicesAmount}}</b-badge>
        </div>
        <br>
        
        <div style="max-height: 75vh; overflow-y: auto; display: flex; gap: 10px; flex-wrap: wrap;  width: 100%;">
          <div v-for="whatsappInvoice in localityAgentInvoices">
            <div style="display: flex; border: 1px solid gray; border-radius: 10px; margin-bottom: 10px; background-color: white; width: 100%;">
              <div style="width: 70%; margin-top: auto; margin-bottom: auto; margin-right: 10px; margin-left: 10px;">
                <h4 style="color:red" v-if="whatsappInvoice.whatsappInvoiceHasBeenUpdated"><strong>COMANDA MODIFICADA</strong></h4>
                <h5 style="cursor: pointer; margin-top: 10px;"><strong>ID: </strong>{{ whatsappInvoice.whatsappInvoiceID }}</h5>
                <h5 style="cursor: pointer;"><strong>Nombre: </strong>{{ whatsappInvoice.whatsappInvoiceClientName }}</h5>
                <h5 style="cursor: pointer;"><strong>Número: </strong>{{ parsePhoneNumber(whatsappInvoice.whatsappInvoiceClientPhoneNumber) }}</h5>
                <h5 style="cursor: pointer;"><strong>Monto: </strong>₡{{ parseInt(whatsappInvoice.whatsappInvoiceAmount).toLocaleString('en-US', {minimumFractionDigits: 3, maximumFractionDigits: 3}) }}</h5>
                <h5 style="cursor: pointer;"><strong>Agente: </strong>{{ whatsappInvoice.agentName }}</h5>
              </div>
              <div style="width: 30%; margin-top: auto; margin-bottom: auto;">
                <div style="display: flex; margin-top: 10px;"> 
                  <i v-b-modal.whatsappInvoiceProductsModal @click="openWhatsappInvoiceProducts(whatsappInvoice)" class="i-Shopping-Cart" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                  <i v-b-modal.mensajeroModal @click="openWhatsappInvoiceInformation(whatsappInvoice)" class="i-Information text-info" style="font-size: xx-large; margin-right: 10px; cursor: pointer;"></i>
                </div>
                <div style="margin-top: 10px; margin-bottom: 10px; margin-right: 10px;">
                  <b-badge style="font-size: larger; margin-bottom: 10px;" pill variant="warning">{{ whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation }}</b-badge>
                  <br>
                  <b-badge style="font-size: larger;" pill variant="success">{{ whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation }}</b-badge>
                </div>
                <div style="text-align: end; margin-bottom: 10px;">
                  <b-badge v-if="whatsappInvoice.whatsappInvoiceState == 'R'" v-b-modal.shippingModal @click="tryToShippingInvoice(whatsappInvoice)" style="cursor: pointer; margin-right:10px; margin-bottom: 0px; font-size: x-large;" pill variant="success">R</b-badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-card>
    </div>


  </div>
</template>

<style>

@keyframes aja {
    0% {
    }
    50% {
      background-color: #e44f9c;
    }
    100% {
    }
  }

  .hotAnimation {
    animation: aja 1.4s infinite;
  }


  @keyframes test {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);

    }
  }

  .animationHot{
    animation: test 1.4s infinite;

  }



</style>


<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js');
import VueBarcode from 'vue-barcode';


export default {
  components: {VueBarcode},

  data() {
    return {
      deliveredInvoicesTable: [
        {
          label: "",
          field: "whatsappInvoiceAgentID",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Nombre",
          field: "whatsappInvoiceClientName",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Número",
          field: "whatsappInvoiceClientPhoneNumber",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Monto",
          field: "whatsappInvoiceAmount",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],

      localityAgentInvoices: [],
      localityAgentInvoicesAmount: 0,

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

      zapoteWhatsappInvoices: [],
      zapoteCentralWhatsappInvoiceAmount: 0,
      zapoteLocalityWhatsappInvoiceAmount: 0,
      zapoteShippingWhatsappInvoiceAmount: 0,

      escazuWhatsappInvoices: [],
      escazuCentralWhatsappInvoiceAmount: 0,
      escazuLocalityWhatsappInvoiceAmount: 0,
      escazuShippingWhatsappInvoiceAmount: 0,

      herediaWhatsappInvoices: [],
      herediaCentralWhatsappInvoiceAmount: 0,
      herediaLocalityWhatsappInvoiceAmount: 0,
      herediaShippingWhatsappInvoiceAmount: 0,

      cartagoWhatsappInvoices: [],
      cartagoCentralWhatsappInvoiceAmount: 0,
      cartagoLocalityWhatsappInvoiceAmount: 0,
      cartagoShippingWhatsappInvoiceAmount: 0,

      localityName: '',
      localityColor: '',
      localityWhatsappInvoiceAmount: 0,
      shippingWhatsappInvoiceAmount: 0,
      localityWhatsappInvoices: [],

      updatedWhatsappInvoiceID: 0,
      updatedWhatsappInvoiceClientName: '',
      updatedWhatsappInvoiceClientPhoneNumber: '',
      updatedWhatsappInvoiceAmount: '',

      updateWhatsappInvoiceAgentIDOptions: [],
      updatedWhatsappInvoiceAgentID: '',

      whatsappInvoiceProductsColumns: [
        {
          label: "Código",
          field: "CodigoP",
          thClass: "text-left pl-3",
          tdClass: "text-left pl-3",
        },
        {
          label: "Nombre",
          field: "descripcion",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Cantidad",
          field: "cantidad",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Precio",
          field: "precio",
          thClass: "text-left",
          tdClass: "text-left",
        },
        {
          label: "Descuento",
          field: "descuento",
          thClass: "text-left",
          tdClass: "text-left",
        }
      ],
      whatsappInvoiceProducts: [],

      updatedWhatsappInvoice: {},

      updateWhatsappInvoiceStateOptions: [{value: 'C', text: 'Central'}, , {value: 'S', text: 'Sucursal'}, {value: 'E', text: 'Entregado'}, {value: 'X', text: 'Cancelado'}],
      updateWhatsappInvoiceShippingMethodOptions: [{value: 'Envío por motorizado', text: 'Envío por motorizado'}, {value: 'Retiro en sucursal', text: 'Retiro en sucursal'}, {value: 'Correos de CR', text: 'Correos de CR'}, {value: 'Encomienda', text: 'Encomienda'}, {value: 'Uber Flash', text: 'Uber Flash'}],
      updateWhatsappInvoicePaymentMethodOptions: [{value: 'Efectivo', text: 'Efectivo'}, {value: 'Tarjeta', text: 'Tarjeta'}, {value: 'SINPE (confirmado)', text: 'SINPE (confirmado)'}, {value: 'SINPE (contra entrega)', text: 'SINPE (contra entrega)'}, {value: 'Transferencia', text: 'Transferencia'}, {value: 'Pago mixto', text: 'Pago mixto'}],
      updateWhatsappInvoicePaymentStateOptions: [{value: 'Pago', text: 'Pago'}, {value: 'Pendiente', text: 'Pendiente'}, {value: 'Pago parcial', text: 'Pago parcial'}],


      updatedWhatsappInvoiceLocation: 'Ubicación original',
      updateWhatsappInvoiceLocationOptions: [{value: 'Ubicación original', text: 'Ubicación original'}],

      localityAgentOptions: [],
      assignedLocalityAgent: 0,
      assignedWhatsappInvoice: {},

      queryInterval: null,
      agentType: 'central',

      shippingInvoice: null,
      notShippedReason: '',

      deliveredInvoices: [],
      loaderDelivered: false,
      loaderReturned: false

    };
  },
  
  methods: {
    playSound(soundType){
      if (soundType == 'invoice'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/invoice.wav'));
      } else if (soundType == 'update'){
        var soundToPlay = new Audio(require('../../../assets/pageAssets/update.wav'));
      }
      soundToPlay.play();
    },

    returnWhatsappConversation(){
      this.loaderReturned = true;
      axios.post(constants.routes.backendAPI+'/returnWhatsappConversation', 
      {
        whatsappConversationRecipientPhoneNumber: this.updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber,
        whatsappConversationID: this.updatedWhatsappInvoice.whatsappInvoiceWhatsappConversationID,
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID
      })
      .then((response) =>{
        if (response.data.success){
          this.$root.$emit('bv::hide::modal', 'localityWhatsappInvoiceInformationModal');
          this.$root.$emit('bv::hide::modal', 'updateWhatsappInvoiceInformation');
          this.loaderReturned = false;
          this.showNotification('success', 'Comanda regresada al call center', 'Se ha regresado la comanda al call center. Para que la conversación se refleje en el sistema del usuario, recuerde actualizar la aplicación');
        } else {
          if (response.data.result == 1){
            this.showNotification('danger', 'Error al regresar la comanda al call center', 'Ha ocurrido un error inesperado al regresar la comanda al call center. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          } else if (response.data.result == 2){
            this.showNotification('danger', 'Error al regresar la comanda al call center', 'El cliente tiene una conversación activa en este momento. Si necesita regresar la comanda, por favor cierre la conversación activa con el cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          } else if (response.data.result == 3){
            this.showNotification('danger', 'Error al eliminar la comanda', 'Ha ocurrido un error inesperado al regresar la eliminar la comanda. Si necesita regresar la comanda, por favor cierre la conversación activa con el cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          } else if (response.data.result == 4){
            this.showNotification('danger', 'Error al reactivar la conversación', 'Ha ocurrido un error inesperado al reactivar la conversación. Si necesita regresar la comanda, por favor cierre la conversación activa con el cliente. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
          this.loaderReturned = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al regresar la comanda al call center', 'Ha ocurrido un error inesperado al regresar la comanda al call center. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderReturned = false;
      })

    },

    selectTodayInvoicesByLocalityAgent(){
      this.loaderDelivered = true;
      axios.post(constants.routes.backendAPI+'/selectTodayInvoicesByLocalityAgent', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.loaderDelivered = false;
          this.deliveredInvoices = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.loaderDelivered = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al no entregar la comanda', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderDelivered = false;
      })
    },

    selectTodayDeliveredInvoices(){
      this.loaderDelivered = true;
      axios.post(constants.routes.backendAPI+'/selectTodayDeliveredInvoicesByLocality', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.loaderDelivered = false;
          this.deliveredInvoices = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.loaderDelivered = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al no entregar la comanda', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderDelivered = false;
      })
    },

    selectTodayCanceledInvoices(){
      this.loaderDelivered = true;
      axios.post(constants.routes.backendAPI+'/selectTodayCanceledInvoicesByLocality', 
      {
        whatsappInvoiceLocalityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          this.loaderDelivered = false;
          this.deliveredInvoices = response.data.result;
        } else {
          this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          this.loaderDelivered = false;
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al no entregar la comanda', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        this.loaderDelivered = false;
      })
    },

    notShippedInvoice(){
      const regularExpressionChecker = /\S/;
      if (regularExpressionChecker.test(this.notShippedReason)){
        axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: this.shippingInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'NE',
          whatsappInvoiceLocalityID: this.shippingInvoice.whatsappInvoiceLocalityID,
          returnedFromShippingToLocality: true,
          whatsappInvoiceNotShippedReason: this.notShippedReason
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda marcada como no entregada', 'Se ha marcado la comanda como no entregada exitosamente.');
            this.$root.$emit('bv::hide::modal', 'shippingModal');
          } else {
            this.showNotification('danger', 'Error al no entregar la comanda', 'Ha ocurrido un error inesperado al no entregar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al no entregar la comanda', 'Ha ocurrido un error inesperado al no entregar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      } else {
        this.showNotification('danger', 'Error al no entregar la comanda', 'Por favor, coloque un motivo para no entregar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      }
    },

    tryToShippingInvoice(whatsappInvoice){
      this.shippingInvoice = whatsappInvoice;
      this.notShippedReason = '';
    },

    contactClient(){
      const whatsappNumber = this.updatedWhatsappInvoice.whatsappInvoiceClientPhoneNumber;
      const agentName = localStorage.getItem('localityAgentName');
      const whatsappInvoiceID = this.updatedWhatsappInvoice.whatsappInvoiceID;

      const texto = '¡Hola! Mi nombre es ' + agentName + ', soy el mensajero de King Vape. El día de hoy estaré entregando tu pedido con el número de órden ' + whatsappInvoiceID + '. Estaré lo más pronto posible en tu ubicación. ¡Muchas gracias por tu espera! 🏍️🔥';
      var url = 'https://api.whatsapp.com/send?phone=' + whatsappNumber + '&text=' + texto
      window.open(url, '_blank');

    },

    goToURL(url){
      window.open(url, '_blank');
    },

    goWithMaps(){
      const location = JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation);
      var url = 'https://maps.google.com?q=' + location.latitude  + ',' + location.longitude;
      window.open(url, '_blank');
    },

    goWithWaze(){
      const location = JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation);
      var url = 'https://www.waze.com/ul?ll=' + location.latitude + ',' + location.longitude;
      window.open(url, '_blank');
    },

    clickOnCentralInvoice(whatsappInvoice){
      if (this.agentType == 'central'){
        axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: whatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'S',
          whatsappInvoiceLocalityID: whatsappInvoice.whatsappInvoiceLocalityID,
          returnedFromShippingToLocality: false
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda enviada', 'Se ha enviado la comanda existosamente.');
          } else {
            this.showNotification('danger', 'Error al enviar la comanda', 'Ha ocurrido un error inesperado al enviar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al enviar la comanda', 'Ha ocurrido un error inesperado al enviar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      }
    },

    clickOnLocalityInvoice(whatsappInvoice){
      if (this.agentType == 'locality'){
        this.$root.$emit('bv::show::modal', 'assignLocalityAgentModal');
        this.assignedWhatsappInvoice = whatsappInvoice;
        this.assignedLocalityAgent = null;
      }
    },
    
    clickOnShippingInvoice(whatsappInvoice){
      if (this.agentType == 'localityAgent'){
        axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: whatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'E'
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda entregada', 'Se ha entregado la comanda existosamente.');
            this.$root.$emit('bv::hide::modal', 'shippingModal');
          } else {
            this.showNotification('danger', 'Error al entregar la comanda', 'Ha ocurrido un error inesperado al entregar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al entregar la comanda', 'Ha ocurrido un error inesperado al entregar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      }
    },


    assignLocalityAgent(){
      if (this.assignedLocalityAgent != null){
        axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceState', 
        {
          whatsappInvoiceID: this.assignedWhatsappInvoice.whatsappInvoiceID,
          whatsappInvoiceState: 'R',
          whatsappInvoiceLocalityID: this.assignedWhatsappInvoice.whatsappInvoiceLocalityID,
          whatsappInvoiceLocalityAgentID: this.assignedLocalityAgent
        })
        .then((response) =>{
          if (response.data.success){
            this.showNotification('success', 'Comanda asignada', 'Se ha asignado la comanda existosamente.');
          } else {
            this.showNotification('danger', 'Error al asignar la comanda', 'Ha ocurrido un error inesperado al asignar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
          }
        })
        .catch(() => {
          this.showNotification('danger', 'Error al asignar la comanda', 'Ha ocurrido un error inesperado al asignar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        })
      }
    },

    updateWhatsappInvoiceClientName(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceClientName', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceClientName: this.updatedWhatsappInvoiceClientName
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Nombre modificado', 'Se ha modificado el nombre de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceClientPhoneNumber(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceClientPhoneNumber', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceClientPhoneNumber: this.updatedWhatsappInvoiceClientPhoneNumber
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Número modificado', 'Se ha modificado el número de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceAmount(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceAmount', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceAmount: this.updatedWhatsappInvoiceAmount
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Monto modificado', 'Se ha modificado el monto de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceAgentID(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceAgentID', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoiceID,
        whatsappInvoiceAgentID: this.updatedWhatsappInvoiceAgentID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Agente modificado', 'Se ha modificado el agente de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceState(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceState', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceState: this.updatedWhatsappInvoice.whatsappInvoiceState,
        whatsappInvoiceLocalityID: this.updatedWhatsappInvoice.whatsappInvoiceLocalityID,
        returnedFromShippingToLocality: true
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Estado modificado', 'Se ha modificado el estado de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al cambiar el estado de la comanda', 'Ha ocurrido un error inesperado al cambiar el estado de la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al cambiar el estado de la comanda', 'Ha ocurrido un error inesperado al cambiar el estado de la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceShippingMethod(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceShippingMethod', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceShippingMethod: this.updatedWhatsappInvoice.whatsappInvoiceShippingMethod
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Método de envío modificado', 'Se ha modificado el método de envío de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoicePaymentMethod(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoicePaymentMethod', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoicePaymentMethod: this.updatedWhatsappInvoice.whatsappInvoicePaymentMethod
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Método de pago modificado', 'Se ha modificado el método de pago de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoicePaymentState(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoicePaymentState', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoicePaymentState: this.updatedWhatsappInvoice.whatsappInvoicePaymentState
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Estado de pago modificado', 'Se ha modificado el estado de pago de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceLocationNote(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceLocationNote', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceLocationNote: this.updatedWhatsappInvoice.whatsappInvoiceLocationNote
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Nota de la dirección modificada', 'Se ha modificado la nota de la dirección de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceShippingNote(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceShippingNote', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceShippingNote: this.updatedWhatsappInvoice.whatsappInvoiceShippingNote
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Nota de la ubicación modificada', 'Se ha modificado la nota de la ubicación de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceLocalityAgentID(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceLocalityAgentID', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceLocalityAgentID: this.updatedWhatsappInvoice.whatsappInvoiceLocalityAgentID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Mensajero reasignado', 'Se ha reasignado el mensajero de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceClientLocation(){
      var whatsappInvoiceLocationID = '';
      for (var whatsappInvoiceLocationIndex in this.updateWhatsappInvoiceLocationOptions){
        const whatsappInvoiceLocation = this.updateWhatsappInvoiceLocationOptions[whatsappInvoiceLocationIndex];
        const whatsappInvoiceLocationLocation = whatsappInvoiceLocation.value;
        if (whatsappInvoiceLocationLocation != 'Ubicación original'){
          var a = JSON.stringify(JSON.parse(whatsappInvoiceLocationLocation));
          var b = JSON.stringify(JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation));
          if (a === b){
            whatsappInvoiceLocationID = whatsappInvoiceLocation.id;
          }
        }
      }
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceClientLocation', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceClientLocation: this.updatedWhatsappInvoice.whatsappInvoiceClientLocation,
        'whatsappInvoiceLocationID': whatsappInvoiceLocationID
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Ubicación modificada', 'Se ha modificado la ubicación de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    updateWhatsappInvoiceClientLocationURL(){
      axios.post(constants.routes.backendAPI+'/updateWhatsappInvoiceClientLocationURL', 
      {
        whatsappInvoiceID: this.updatedWhatsappInvoice.whatsappInvoiceID,
        whatsappInvoiceClientLocationURL: this.updatedWhatsappInvoice.whatsappInvoiceClientLocationURL
      })
      .then((response) =>{
        if (response.data.success){
          this.showNotification('success', 'Enlace de ubicación modificada', 'Se ha modificado el enlace de la ubicación de la comanda existosamente.');
        } else {
          this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al modificar la comanda', 'Ha ocurrido un error inesperado al modificar la comanda. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },
    

    openUpdateWhatsappInvoiceClientName(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceClientName = whatsappInvoice.whatsappInvoiceClientName;
    },

    openUpdateWhatsappInvoiceClientPhoneNumber(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceClientPhoneNumber = whatsappInvoice.whatsappInvoiceClientPhoneNumber;
    },

    openUpdateWhatsappInvoiceAmount(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceAmount = whatsappInvoice.whatsappInvoiceAmount;
    },

    openUpdateWhatsappInvoiceAgentID(whatsappInvoice){
      this.updatedWhatsappInvoiceID = whatsappInvoice.whatsappInvoiceID;
      this.updatedWhatsappInvoiceAgentID = whatsappInvoice.whatsappInvoiceAgentID;
    },

    openWhatsappInvoiceProducts(whatsappInvoice){
      this.whatsappInvoiceProducts = JSON.parse(whatsappInvoice.whatsappInvoiceProducts);
    },

    openWhatsappInvoiceInformation(whatsappInvoice){
      this.updatedWhatsappInvoice = whatsappInvoice;
    },


    showNotification(notificationType, notificationTitle, notificationContent){
      this.$bvToast.toast(notificationContent, {
        title: notificationTitle,
        variant: notificationType,
        solid: true
      });
    },

    parsePhoneNumber(phoneNumber){
      const cleaned = ('' + phoneNumber).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})$/);
      if (match) {
        return `(${match[1]}) ${match[2]}${match[3]}${match[4]}${match[5]}`;
      }
      return phoneNumber;
    },

    selectAllActiveWhatsappInvoice(onBoot){
      axios.post(constants.routes.backendAPI+'/selectAllActiveWhatsappInvoice')
      .then((response) =>{
        if (response.data.success){
          const currentInvoicesAmount = this.zapoteWhatsappInvoices.length + this.escazuWhatsappInvoices.length + this.herediaWhatsappInvoices.length + this.cartagoWhatsappInvoices.length;
          const currentUpdatedInvoicesAmount = [this.zapoteWhatsappInvoices, this.escazuWhatsappInvoices, this.herediaWhatsappInvoices, this.cartagoWhatsappInvoices].reduce((total, invoices) => total + invoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length, 0);


          this.zapoteWhatsappInvoices = [];
          this.zapoteCentralWhatsappInvoiceAmount = 0;
          this.zapoteLocalityWhatsappInvoiceAmount = 0;
          this.zapoteShippingWhatsappInvoiceAmount = 0;
          this.escazuWhatsappInvoices = [];
          this.escazuCentralWhatsappInvoiceAmount = 0;
          this.escazuLocalityWhatsappInvoiceAmount = 0;
          this.escazuShippingWhatsappInvoiceAmount = 0;
          this.herediaWhatsappInvoices = [];
          this.herediaCentralWhatsappInvoiceAmount = 0;
          this.herediaLocalityWhatsappInvoiceAmount = 0;
          this.herediaShippingWhatsappInvoiceAmount = 0;
          this.cartagoWhatsappInvoices = [];
          this.cartagoCentralWhatsappInvoiceAmount = 0;
          this.cartagoLocalityWhatsappInvoiceAmount = 0;
          this.cartagoShippingWhatsappInvoiceAmount = 0;

          const whatsappInvoices = response.data.result;
          for (var whatsappInvoiceIndex in whatsappInvoices){
            const whatsappInvoice = whatsappInvoices[whatsappInvoiceIndex];

            whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceShippingDateTime))/1000), whatsappInvoice.whatsappInvoiceShippingDateTime);

            if (whatsappInvoice.localityName == 'King Vape Zapote'){ 
              this.zapoteWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.zapoteCentralWhatsappInvoiceAmount = this.zapoteCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.zapoteLocalityWhatsappInvoiceAmount = this.zapoteLocalityWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
                this.zapoteShippingWhatsappInvoiceAmount = this.zapoteShippingWhatsappInvoiceAmount + 1;
              }

            } else if (whatsappInvoice.localityName == 'King Vape Escazú'){
              this.escazuWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.escazuCentralWhatsappInvoiceAmount = this.escazuCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.escazuLocalityWhatsappInvoiceAmount = this.escazuLocalityWhatsappInvoiceAmount + 1;
              } else {
                this.escazuShippingWhatsappInvoiceAmount = this.escazuShippingWhatsappInvoiceAmount + 1;
              }

            } else if (whatsappInvoice.localityName == 'King Vape Heredia'){
              this.herediaWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.herediaCentralWhatsappInvoiceAmount = this.herediaCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.herediaLocalityWhatsappInvoiceAmount = this.herediaLocalityWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
                this.herediaShippingWhatsappInvoiceAmount = this.herediaShippingWhatsappInvoiceAmount + 1;
              }

            } else if (whatsappInvoice.localityName == 'King Vape Cartago'){
              this.cartagoWhatsappInvoices.push(whatsappInvoice);
              if (whatsappInvoice.whatsappInvoiceState == 'C'){
                this.cartagoCentralWhatsappInvoiceAmount = this.cartagoCentralWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'S'){
                this.cartagoLocalityWhatsappInvoiceAmount = this.cartagoLocalityWhatsappInvoiceAmount + 1;
              } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
                this.cartagoShippingWhatsappInvoiceAmount = this.cartagoShippingWhatsappInvoiceAmount + 1;
              }
            }
          }

          const newInvoicesAmount = this.zapoteWhatsappInvoices.length + this.escazuWhatsappInvoices.length + this.herediaWhatsappInvoices.length + this.cartagoWhatsappInvoices.length;
          const newUpdatedInvoicesAmount = [this.zapoteWhatsappInvoices, this.escazuWhatsappInvoices, this.herediaWhatsappInvoices, this.cartagoWhatsappInvoices].reduce((total, invoices) => total + invoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length, 0);

          if (onBoot == false){
            if (newInvoicesAmount > currentInvoicesAmount){
              this.playSound('invoice');
            }
            if (newUpdatedInvoicesAmount > currentUpdatedInvoicesAmount){
              this.playSound('update');
            }
          }    
    

        } else {
          this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    selectAllActiveWhatsappInvoiceFromLocality(onBoot){
      axios.post(constants.routes.backendAPI+'/selectAllActiveWhatsappInvoiceFromLocality',
      {
        localityID: localStorage.getItem('localityID')
      })
      .then((response) =>{
        if (response.data.success){
          const currentInvoicesAmount = this.localityWhatsappInvoices.length;
          const currentUpdatedInvoicesAmount = this.localityWhatsappInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;

          this.localityWhatsappInvoices = [];
          this.localityWhatsappInvoiceAmount = 0;
          this.shippingWhatsappInvoiceAmount = 0;

          const whatsappInvoices = response.data.result;
          for (var whatsappInvoiceIndex in whatsappInvoices){
            const whatsappInvoice = whatsappInvoices[whatsappInvoiceIndex];
            whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceShippingDateTime))/1000), whatsappInvoice.whatsappInvoiceShippingDateTime);
            this.localityWhatsappInvoices.push(whatsappInvoice);
            if (whatsappInvoice.whatsappInvoiceState == 'S'){
              this.localityWhatsappInvoiceAmount = this.localityWhatsappInvoiceAmount + 1;
            } else if (whatsappInvoice.whatsappInvoiceState == 'R'){
              this.shippingWhatsappInvoiceAmount = this.shippingWhatsappInvoiceAmount + 1;
            }
          }

          const newInvoicesAmount = this.localityWhatsappInvoices.length;
          const newUpdatedInvoicesAmount = this.localityWhatsappInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;

          if (onBoot == false){
            if (newInvoicesAmount > currentInvoicesAmount){
              this.playSound('invoice');
            }
            if (newUpdatedInvoicesAmount > currentUpdatedInvoicesAmount){
              this.playSound('update');
            }
          }   
        } else {
          this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    selectAllActiveWhatsappInvoiceFromLocalityAgent(onBoot){
      axios.post(constants.routes.backendAPI+'/selectAllActiveWhatsappInvoiceFromLocalityAgent', 
      {
        localityAgentID: localStorage.getItem('localityAgentID')
      })
      .then((response) =>{
        if (response.data.success){
          const currentInvoicesAmount = this.localityAgentInvoices.length;
          const currentUpdatedInvoicesAmount = this.localityAgentInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;


          this.localityAgentInvoices = [];
          this.localityAgentInvoicesAmount = 0;
          const whatsappInvoices = response.data.result;
          for (var whatsappInvoiceIndex in whatsappInvoices){
            const whatsappInvoice = whatsappInvoices[whatsappInvoiceIndex];
            whatsappInvoice.whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceCentralDateTime))/1000), whatsappInvoice.whatsappInvoiceCentralDateTime);
            whatsappInvoice.whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceLocalityDateTime))/1000), whatsappInvoice.whatsappInvoiceLocalityDateTime);
            whatsappInvoice.whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(whatsappInvoice.whatsappInvoiceShippingDateTime))/1000), whatsappInvoice.whatsappInvoiceShippingDateTime);
            this.localityAgentInvoices.push(whatsappInvoice);
            this.localityAgentInvoicesAmount = this.localityAgentInvoicesAmount + 1;
          }

          const newInvoicesAmount = this.localityAgentInvoices.length;
          const newUpdatedInvoicesAmount = this.localityAgentInvoices.filter(invoice => invoice.whatsappInvoiceHasBeenUpdated == true).length;

          if (onBoot == false){
            if (newInvoicesAmount > currentInvoicesAmount){
              this.playSound('invoice');
            }
            if (newUpdatedInvoicesAmount > currentUpdatedInvoicesAmount){
              this.playSound('update');
            }
          }
        } else {
          this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las comandas', 'Ha ocurrido un error inesperado al consultar las comandas. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    selectAgentNames(){
      axios.get(constants.routes.backendAPI+'/selectAgentNames').then((response) =>{
        if (response.data.success){
          const agentNames = response.data.result;
          for (var agentIndex in response.data.result){
            this.updateWhatsappInvoiceAgentIDOptions.push({value: agentNames[agentIndex].agentID, text: agentNames[agentIndex].agentName});
          }
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectLocalityAgentNames(){
      axios.post(constants.routes.backendAPI+'/selectLocalityAgentNames', 
      {
        localityAgentLocalityID: localStorage.getItem('localityID')
      }).then((response) =>{
        if (response.data.success){
          this.localityAgentOptions = [];
          const localityAgents = response.data.result;
          for (var localityAgentIndex in response.data.result){
            this.localityAgentOptions.push({value: localityAgents[localityAgentIndex].localityAgentID, text: localityAgents[localityAgentIndex].localityAgentName});
          }
        } else {
          this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
        }
      })
      .catch(() =>{
        this.showNotification('danger', 'Error al solicitar la lista de agentes', 'Ha ocurrido un error inesperado al solicitar la lista de agentes. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.')
      })
    },

    selectWhatsappInvoiceLocations(){
      axios.post(constants.routes.backendAPI+'/selectWhatsappInvoiceLocations')
      .then((response) =>{
        if (response.data.success){
          this.updateWhatsappInvoiceLocationOptions = [{value: 'Ubicación original', text: 'Ubicación original'}];
          const whatsappInvoiceLocations = response.data.result;
          for (var whatsappInvoiceLocationIndex in whatsappInvoiceLocations){
            const whatsappInvoiceLocation = whatsappInvoiceLocations[whatsappInvoiceLocationIndex];
            this.updateWhatsappInvoiceLocationOptions.push({id: whatsappInvoiceLocation.whatsappInvoiceLocationID, value: whatsappInvoiceLocation.whatsappInvoiceLocationLocation, text: whatsappInvoiceLocation.whatsappInvoiceLocationName});
          }
        } else {
          this.showNotification('danger', 'Error al consultar las ubicaciones', 'Ha ocurrido un error inesperado al consultar las ubicaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
        }
      })
      .catch(() => {
        this.showNotification('danger', 'Error al consultar las ubicaciones', 'Ha ocurrido un error inesperado al consultar las ubicaciones. Si el problema persiste, contacte con su administrador del sistema o con soporte técnico.');
      })
    },

    runTimers(){
      setInterval(() => {
        for (var zapoteWhatsappInvoiceIndex in this.zapoteWhatsappInvoices){
          this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime))/1000), this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime);
          this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.zapoteWhatsappInvoices[zapoteWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

        for (var escazuWhatsappInvoiceIndex in this.escazuWhatsappInvoices){
          this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime))/1000), this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime);
          this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.escazuWhatsappInvoices[escazuWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

        for (var herediaWhatsappInvoiceIndex in this.herediaWhatsappInvoices){
          this.herediaWhatsappInvoices[herediaWhatsappInvoiceIndex].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[herediaWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime))/1000), this.herediaWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime);
          this.herediaWhatsappInvoices[herediaWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[herediaWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.herediaWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.herediaWhatsappInvoices[herediaWhatsappInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.herediaWhatsappInvoices[herediaWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.herediaWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

        for (var cartagoWhatsappInvoiceIndex in this.herediaWhatsappInvoices){
          this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceCentralDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime))/1000), this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceCentralDateTime);
          this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.cartagoWhatsappInvoices[cartagoWhatsappInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

        for (var localityInvoiceIndex in this.localityWhatsappInvoices){
          this.localityWhatsappInvoices[localityInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityWhatsappInvoices[localityInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.localityWhatsappInvoices[localityInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.localityWhatsappInvoices[localityInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityWhatsappInvoices[localityInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.localityWhatsappInvoices[localityInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

        for (var localityAgentInvoiceIndex in this.localityAgentInvoices){
          this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceLocalityDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceLocalityDateTime))/1000), this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceLocalityDateTime);
          this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTimeRepresentation = this.getTimerRepresentation(Math.round((new Date() - new Date(this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTime))/1000), this.localityAgentInvoices[localityAgentInvoiceIndex].whatsappInvoiceShippingDateTime);
        }

      }, 1000);
    },

    getTimerRepresentation(timeInSeconds, validation){
      if (!isNaN(timeInSeconds) && (validation != null)){
        const hours = Math.floor(timeInSeconds / 3600);
        const minutes = Math.floor((timeInSeconds % 3600) / 60);
        const remainingSeconds = timeInSeconds % 60;
        const timeFormat = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        return timeFormat;
      } else {
        return '00:00:00';
      }
    },

    getWhatsappInvoiceClientLocation(){
      const whatsappInvoiceClientLocation = JSON.parse(this.updatedWhatsappInvoice.whatsappInvoiceClientLocation);
      return {lat: whatsappInvoiceClientLocation.latitude, lng: whatsappInvoiceClientLocation.longitude};
    },

    changeWhatsappInvoiceLocation(){
      this.updatedWhatsappInvoice.whatsappInvoiceClientLocation = this.updatedWhatsappInvoiceLocation;
    }
  },

  mounted(){
    if (localStorage.getItem('agentType') == 'agent' || localStorage.getItem('agentType') == 'admin' || localStorage.getItem('agentType') == 'central'){
      this.agentType = 'central';
      this.selectAllActiveWhatsappInvoice(true);
      this.selectAgentNames();
      this.runTimers();

    } else if (localStorage.getItem('agentType') == 'locality'){
      this.agentType = 'locality';

      if (localStorage.getItem('localityID') == '1'){
        this.localityName = 'ZAPOTE';
        this.localityColor = 'height: 85vh; background-color: #fed330;';
      } else if (localStorage.getItem('localityID') == '3'){
        this.localityName = 'CARTAGO';
        this.localityColor = 'height: 85vh; background-color: #26a699;';
      } else if (localStorage.getItem('localityID') == '4'){
        this.localityName = 'ESCAZÚ';
        this.localityColor = 'height: 85vh; background-color: #e44f9c;';
      } else {
        this.localityName = 'HEREDIA';
        this.localityColor = 'height: 85vh; background-color: #e44f9c;';
      }   

      this.selectAllActiveWhatsappInvoiceFromLocality(true);
      this.selectLocalityAgentNames();
      this.runTimers();

    } else if (localStorage.getItem('agentType') == 'localityAgent'){
      this.agentType = 'localityAgent';
      this.selectAllActiveWhatsappInvoiceFromLocalityAgent(true);
      this.runTimers();

    }

    this.cartagoMap = constants.routes.cartagoMap;
    this.herediaMap = constants.routes.herediaMap;
    this.zapoteMap = constants.routes.zapoteMap;
    this.escazuMap = constants.routes.escazuMap;

    this.queryInterval = setInterval(() => {
      if (this.agentType == 'central'){
        this.selectAllActiveWhatsappInvoice(false);
      } else if (this.agentType == 'locality'){
        this.selectAllActiveWhatsappInvoiceFromLocality(false);
      } else if (this.agentType == 'localityAgent'){
        this.selectAllActiveWhatsappInvoiceFromLocalityAgent(false);
      }
    }, 5000);
  },

  beforeDestroy(){
    clearInterval(this.queryInterval);
  }
};
</script>