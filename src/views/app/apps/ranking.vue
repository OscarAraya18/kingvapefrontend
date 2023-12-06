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
          <h1 style="font-size: 50px">CONVERSACIONES ATENDIDAS:</h1>
        </div>
        
        <br><br>
        <div v-for="(agent,index) in agents2">
          <div :style="calcularClase(index + 1)">
            <div style="flex: 1;">
              <h1 style="font-size: 35px;"><strong>{{ index + 1 }}</strong> - {{agent.agentName}}</h1>
            </div>
            <div style="flex: 0; margin-right: 20px;">
              <h1>{{agent.agentActiveConversations}}</h1>
            </div>
          </div>
          <br>
        </div>
      </div>
    </div>


    <div style="flex: 1; padding: 40px;">
      <div style="overflow-y: auto;">
        
        <div style="text-align: center;">
          <h1 style="font-size: 50px">CONVERSACIONES VENDIDAS:</h1>
        </div>
        
        <br><br>
        <div v-for="(agent,index) in agents3">
          <div :style="calcularClase(index + 1)">
            <div style="flex: 1;">
              <h1 style="font-size: 35px;"><strong>{{ index + 1 }}</strong> - {{agent.agentName}}</h1>
            </div>
            <div style="flex: 0; margin-right: 20px;">
              <h1>{{agent.agentFinishedConversations}}</h1>
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
const webSocket = new WebSocket('wss:telasmasbackend.onrender.com');

export default {

  data() {
    return {
      agents: [],
      agents2: [],
      agents3: []
    };
  },

  methods: {
    getAllAgents(){
      axios.post(constants.routes.backendAPI+'/selectAgentRankingInformation').then(response =>{
        console.log(response.data);

      })

      /*
      axios.get(constants.routes.backendAPI+'/getAgentRankingInformation')
      .then(response =>{
        
        this.agents = [];
        this.agents2 = [];
        this.agents3 = [];

        for (var agentID in response.data){
          if (response.data[agentID].agentType == 'agent'){
            const newAgent = {
              agentID: agentID,
              agentName: response.data[agentID].agentName,
              agentUsername: response.data[agentID].agentUsername,
              agentMessages: response.data[agentID].agentSendedMessages,
              agentActiveConversations: response.data[agentID].agentActiveConversations.length + response.data[agentID].agentFinishedConversations.length,
              agentFinishedConversations: response.data[agentID].agentFinishedConversations.length
            }
            this.agents.push(newAgent);
            this.agents2.push(newAgent);
            this.agents3.push(newAgent);
          }

        }
        this.agents.sort((a, b) => b.agentMessages - a.agentMessages);
        this.agents2.sort((a, b) => b.agentActiveConversations - a.agentActiveConversations);
        this.agents3.sort((a, b) => b.agentFinishedConversations - a.agentFinishedConversations);

      })
      .catch(error =>{
        console.log(error);
      })


      */
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
        alert(websocketMessage);
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
