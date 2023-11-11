<template>
  <div style="display: flex; ">
    <div style="flex: 1; padding: 40px; min-height: 100%;">
      <div style="overflow-y: auto;">
        
        <div style="text-align: center;">
          <h1 style="font-size: 50px">MENSAJES RESPONDIDOS:</h1>
        </div>
        <br><br>
        <div v-for="(agent,index) in agents">
          <div :style="calcularClase(index + 1)">
            <div style="flex: 1;">
              <h1 style="font-size: 35px;"><strong>{{ index + 1 }}</strong> - {{agent.agentName}}</h1>
            </div>
            <div style="flex: 0; margin-right: 20px;">
              <h1>{{agent.agentMessages}}</h1>
            </div>
          </div>
          <br>
        </div>
      </div>
    </div>
    <div style="flex: 1; padding: 40px;">
      <div style="overflow-y: auto;">
        
        <div style="text-align: center;">
          <h1 style="font-size: 50px">VENTAS CONCRETADAS:</h1>
        </div>
        
        <br><br>
        <div v-for="(agent,index) in agents2">
          <div :style="calcularClase(index + 1)">
            <div style="flex: 1;">
              <h1 style="font-size: 35px;"><strong>{{ index + 1 }}</strong> - {{agent.agentName}}</h1>
            </div>
            <div style="flex: 0; margin-right: 20px;">
              <h1>{{agent.agentConversations}}</h1>
            </div>
          </div>
          <br>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import axios from 'axios';
const constants = require('@../../../src/constants.js'); 
const webSocket = new WebSocket('wss:'+constants.routes.websocketAPI);
import router from "../../../router";

export default {

  data() {
    return {
      agents: [],
      agents2: []
    };
  },

  methods: {
    getAllAgents(){
      axios.get(constants.routes.backendAPI+'/getAllAgents')
      .then(response =>{
        this.agents = [];
        this.agents2 = [];
        for (var agentID in response.data){
          const newAgent = {
            agentID: agentID,
            agentName: response.data[agentID].agentName,
            agentUsername: response.data[agentID].agentUsername,
            agentMessages: response.data[agentID].agentSendedMessages,
            agentConversations: response.data[agentID].agentActiveConversations.length + response.data[agentID].agentFinishedConversations.length
          }
          this.agents.push(newAgent);
          this.agents2.push(newAgent);
        }
        this.agents.sort((a, b) => b.agentMessages - a.agentMessages);
        this.agents2.sort((a, b) => b.agentConversations - a.agentConversations);

      })
      .catch(error =>{
        console.log(error);
      })
    },

    calcularClase(index){
      if ((index == 1) || (index == 2) || (index == 3)){
        return 'display: flex; background-color: #BDECB6; border-radius: 10px;';
      } else if (index == this.agents.length){
        return 'display: flex; background-color: #FF6961; border-radius: 10px;';
      } else {
        return 'display: flex; background-color: #FFB347; border-radius: 10px;';
      }
    }
  },

  
  

  computed: {

  },

  mounted(){
    this.getAllAgents();

    try {
      webSocket.onmessage = (websocketMessage) => {
        const websocketMessageJSON = JSON.parse(websocketMessage.data);

        if (websocketMessageJSON['websocketMessageID'] == 'addMessageCount'){
          const agentID = websocketMessageJSON['agentID'];
          var tempAgents = this.agents;
          this.agents = []
          for (var agentIndex in this.tempAgents){
            if (this.tempAgents[agentIndex]['agentID'] == agentID){
              this.tempAgents[agentIndex]['agentMessages'] = this.tempAgents[agentIndex]['agentMessages'] + 1;
            }
          }
          this.agents = tempAgents;
          this.agents.sort((a, b) => b.agentMessages - a.agentMessages);

        }
      }
    } catch {

    }
  },
  created: function() {
   
  },
};
</script>

<style>
  
</style>
