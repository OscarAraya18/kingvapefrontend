const state = {
  backendURL: 'http://localhost:8081',
  websocketURL: 'wss:payitcr.com',
  applicationVersion: '1.10'
};

const getters = {
  getBackendURL: state => state.backendURL,
  getWebsocketURL: state => state.websocketURL,
  getApplicationVersion: state => state.applicationVersion
};

const actions = {
  changeBackendURL({commit}, backendURL) {
    commit('updateBackendURL', backendURL);
  },
  changeWebsocketURL({commit}, websocketURL) {
    commit('updateWebsocketURL', websocketURL);
  }
};

const mutations = {
  updateBackendURL(state, backendURL) {
    state.backendURL = backendURL;
  },

  updateWebsocketURL(state, websocketURL) {
    state.backendURL = websocketURL;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
