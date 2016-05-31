// global actions
export const setModel = makeAction('SET_MODEL')

// login actions
export const toggleLoading = makeAction('TOGGLE_LOADING')
export const toggleLogin = makeAction('TOGGLE_LOGIN')
export const setUser = makeAction('SET_USER')
export const setErrorMsg = makeAction('SET_ERROR_MSG')
export const updateUser = makeAction('UPDATE_USER')

// main actions
export const setMescontent = makeAction('SET_MESCONTENT')
export const addFeedback = makeAction('ADD_FEEDBACK')

function makeAction (type) {
  return ({ dispatch }, ...args) => dispatch(type, ...args)
}
