// vuex/modules/global.js
import {
  SET_MODEL
} from '../mutation-types'

// initial state
const state = {
  User: '',
  Summary: '',
  Message: '',
  Feedback: ''
}

// mutations
const mutations = {
  [SET_MODEL](state, User, Summary, Message, Feedback) {
    state.User = User
    state.Summary = Summary
    state.Message = Message
    state.Feedback = Feedback
  }
}

export default {
  state,
  mutations
}
