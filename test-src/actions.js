/* eslint-disable */
import config from '../config'
import {createAction} from '../redux_utils'
import {Map} from 'immutable'
// import {user_info} from './selectors'

let name = ''

export const FETCH_MGRS_FOR_DIR_REQUEST = 'FETCH_MGRS_FOR_DIR_REQUEST'
export const FETCH_MGRS_FOR_DIR_SUCCESS = 'FETCH_MGRS_FOR_DIR_SUCCESS'
export const FETCH_MGRS_FOR_DIR_FAILURE = 'FETCH_MGRS_FOR_DIR_FAILURE'

export const FETCH_TECHS_FOR_MGR_REQUEST = 'FETCH_TECHS_FOR_MGR_REQUEST'
export const FETCH_TECHS_FOR_MGR_SUCCESS = 'FETCH_TECHS_FOR_MGR_SUCCESS'
export const FETCH_TECHS_FOR_MGR_FAILURE = 'FETCH_TECHS_FOR_MGR_FAILURE'

export const FETCH_TECH_GROUPS_FOR_MGR_REQUEST = 'FETCH_TECH_GROUPS_FOR_MGR_REQUEST'
export const FETCH_TECH_GROUPS_FOR_MGR_SUCCESS = 'FETCH_TECH_GROUPS_FOR_MGR_SUCCESS'
export const FETCH_TECH_GROUPS_FOR_MGR_FAILURE = 'FETCH_TECH_GROUPS_FOR_MGR_FAILURE'

export const FETCH_PEERS_FOR_TECH_REQUEST = 'FETCH_PEERS_FOR_TECH_REQUEST'
export const FETCH_PEERS_FOR_TECH_SUCCESS = 'FETCH_PEERS_FOR_TECH_SUCCESS'
export const FETCH_PEERS_FOR_TECH_FAILURE = 'FETCH_PEERS_FOR_TECH_FAILURE'

export const FETCH_CALLOUT_ZONES_FOR_TECH_REQUEST = 'FETCH_CALLOUT_ZONES_FOR_TECH_REQUEST'
export const FETCH_CALLOUT_ZONES_FOR_TECH_SUCCESS = 'FETCH_CALLOUT_ZONES_FOR_TECH_SUCCESS'
export const FETCH_CALLOUT_ZONES_FOR_TECH_FAILURE = 'FETCH_CALLOUT_ZONES_FOR_TECH_FAILURE'

export const FETCH_CALLOUT_ZONES_FOR_MGR_REQUEST = 'FETCH_CALLOUT_ZONES_FOR_MGR_REQUEST'
export const FETCH_CALLOUT_ZONES_FOR_MGR_SUCCESS = 'FETCH_CALLOUT_ZONES_FOR_MGR_SUCCESS'
export const FETCH_CALLOUT_ZONES_FOR_MGR_FAILURE = 'FETCH_CALLOUT_ZONES_FOR_MGR_FAILURE'

export const FETCH_INFO_FOR_USER_REQUEST = 'FETCH_INFO_FOR_USER_REQUEST'
export const FETCH_INFO_FOR_USER_SUCCESS = 'FETCH_INFO_FOR_USER_SUCCESS'
export const FETCH_INFO_FOR_USER_FAILURE = 'FETCH_INFO_FOR_USER_FAILURE'

export const FETCH_PEERS_FOR_USER_REQUEST = 'FETCH_PEERS_FOR_USER_REQUEST'
export const FETCH_PEERS_FOR_USER_SUCCESS = 'FETCH_PEERS_FOR_USER_SUCCESS'
export const FETCH_PEERS_FOR_USER_FAILURE = 'FETCH_PEERS_FOR_USER_FAILURE'

export const FETCH_SWITCHES_FOR_CELL_USER_REQUEST = 'FETCH_SWITCHES_FOR_CELL_USER_REQUEST'
export const FETCH_SWITCHES_FOR_CELL_USER_SUCCESS = 'FETCH_SWITCHES_FOR_CELL_USER_SUCCESS'
export const FETCH_SWITCHES_FOR_CELL_USER_FAILURE = 'FETCH_SWITCHES_FOR_CELL_USER_FAILURE'

export const FETCH_COUNTS_FOR_MANAGER_REQUEST = 'FETCH_COUNTS_FOR_MANAGER_REQUEST'
export const FETCH_COUNTS_FOR_MANAGER_SUCCESS = 'FETCH_COUNTS_FOR_MANAGER_SUCCESS'
export const FETCH_COUNTS_FOR_MANAGER_FAILURE = 'FETCH_COUNTS_FOR_MANAGER_FAILURE'

// Mgrs by Dir
name = 'fetchMgrsForDir'
export const fetchMgrsForDirRequest = createAction(FETCH_MGRS_FOR_DIR_REQUEST, name, 'id')
export const fetchMgrsForDirSuccess = createAction(FETCH_MGRS_FOR_DIR_SUCCESS, name, 'id', 'mgrs')
export const fetchMgrsForDirFailure = createAction(FETCH_MGRS_FOR_DIR_FAILURE, name, 'id', 'errors')
export function fetchMgrsForDir (userid) {
  return dispatch => {
    dispatch(fetchMgrsForDirRequest(userid))
    return config.ajax.get(`/contact/dir/${userid}/mgrs`)
      .then(res => dispatch(fetchMgrsForDirSuccess(userid, res.data.mgrs)))
      .catch(errors => dispatch(fetchMgrsForDirFailure(userid, errors)))
  }
}

export const companyEndpoint = '/companies'

export const blah = '/companies/test'
const test = 'test'
export const path = `/foo/${blah}/companies/${test}`

// Techs by Mgr
name = 'fetchTechsForMgr'
export const fetchTechsForMgrRequest = createAction(FETCH_TECHS_FOR_MGR_REQUEST, name, 'id')
export const fetchTechsForMgrSuccess = createAction(FETCH_TECHS_FOR_MGR_SUCCESS, name, 'id', 'techs')
export const fetchTechsForMgrFailure = createAction(FETCH_TECHS_FOR_MGR_FAILURE, name, 'id', 'errors')
export function fetchTechsForMgr (userid) {
  return dispatch => {
    dispatch(fetchTechsForMgrRequest(userid))
    return config.ajax.get(`/contact/mgr/${userid}/techs`)
      .then(res => dispatch(fetchTechsForMgrSuccess(userid, res.data.techs)))
      .catch(ex => dispatch(fetchTechsForMgrFailure(userid, ex)))
  }
}

// Techs by Mgr - Group
name = 'fetchTechGroupsForMgr'
export const fetchTechGroupsForMgrRequest = createAction(FETCH_TECH_GROUPS_FOR_MGR_REQUEST, name, 'id')
export const fetchTechGroupsForMgrSuccess = createAction(FETCH_TECH_GROUPS_FOR_MGR_SUCCESS, name, 'id', 'techs')
export const fetchTechGroupsForMgrFailure = createAction(FETCH_TECH_GROUPS_FOR_MGR_FAILURE, name, 'id', 'errors')
export function fetchTechGroupsForMgr (userid) {
  return dispatch => {
    dispatch(fetchTechGroupsForMgrRequest(userid))
    return config.ajax.get(`/contact/mgr/${userid}/techs/grouped`)
      .then(res => dispatch(fetchTechGroupsForMgrSuccess(userid, res.data.techs)))
      .catch(ex => dispatch(fetchTechGroupsForMgrFailure(userid, ex)))
  }
}

// Peers by Tech
name = 'fetchPeersForTech'
export const fetchPeersForTechRequest = createAction(FETCH_PEERS_FOR_TECH_REQUEST, name, 'id')
export const fetchPeersForTechSuccess = createAction(FETCH_PEERS_FOR_TECH_SUCCESS, name, 'id', 'techs')
export const fetchPeersForTechFailure = createAction(FETCH_PEERS_FOR_TECH_FAILURE, name, 'id', 'errors')
export function fetchPeersForTech (userid) {
  return dispatch => {
    dispatch(fetchPeersForTechRequest(userid))
    return config.ajax.get(`/contact/tech/${userid}/techs`)
      .then(res => dispatch(fetchPeersForTechSuccess(userid, res.data.techs)))
      .catch(ex => dispatch(fetchPeersForTechFailure(userid, ex)))
  }
}

// Callout zones by Tech
name = 'fetchCZonesForTech'
export const fetchCZonesForTechRequest = createAction(FETCH_CALLOUT_ZONES_FOR_TECH_REQUEST, name, 'id')
export const fetchCZonesForTechSuccess = createAction(FETCH_CALLOUT_ZONES_FOR_TECH_SUCCESS, name, 'id', 'czones', 'market', 'submarket')
export const fetchCZonesForTechFailure = createAction(FETCH_CALLOUT_ZONES_FOR_TECH_FAILURE, name, 'id', 'errors')
export function fetchCZonesForTech (userid) {
  return dispatch => {
    dispatch(fetchCZonesForTechRequest(userid))
    return config.ajax.get(`/contact/tech/${userid}/czone`)
      .then(res => dispatch(fetchCZonesForTechSuccess(userid, res.data.calloutzones, res.data.market, res.data.submarket)))
      .catch(ex => dispatch(fetchCZonesForTechFailure(userid, ex)))
  }
}

// Callout zones by Mgr
name = 'fetchCZonesForMgr'
export const fetchCZonesForMgrRequest = createAction(FETCH_CALLOUT_ZONES_FOR_MGR_REQUEST, name, 'id')
export const fetchCZonesForMgrSuccess = createAction(FETCH_CALLOUT_ZONES_FOR_MGR_SUCCESS, name, 'id', 'czones', 'market', 'submarket')
export const fetchCZonesForMgrFailure = createAction(FETCH_CALLOUT_ZONES_FOR_MGR_FAILURE, name, 'id', 'errors')
export function fetchCZonesForMgr (userid) {
  return dispatch => {
    dispatch(fetchCZonesForMgrRequest(userid))
    return config.ajax.get(`/contact/mgr/${userid}/czone`)
      .then(res => dispatch(fetchCZonesForMgrSuccess(userid, res.data.calloutzones, res.data.market, res.data.submarket)))
      .catch(ex => dispatch(fetchCZonesForMgrFailure(userid, ex)))
  }
}

// User info
name = 'fetchInfoForUser'
export const fetchInfoForUserRequest = createAction(FETCH_INFO_FOR_USER_REQUEST, name, 'id')
export const fetchInfoForUserSuccess = createAction(FETCH_INFO_FOR_USER_SUCCESS, name, 'id', 'user')
export const fetchInfoForUserFailure = createAction(FETCH_INFO_FOR_USER_FAILURE, name, 'id', 'errors')
export function fetchInfoForUser (userid) {
  return (dispatch, getState) => {
    const user = getState().getIn(['contact', 'entities', 'users', userid], Map())
    if (!user.get('techid') && !user.get('managerid')) {
      dispatch(fetchInfoForUserRequest(userid))
      return config.ajax.get(`/contact/tech/${userid}/info`)
        .then(res => dispatch(fetchInfoForUserSuccess(userid, res.data.techs)))
        .catch(ex => dispatch(fetchInfoForUserFailure(userid, ex)))
    }
  }
}

// Peers by User
name = 'fetchPeersForUser'
export const fetchPeersForUserRequest = createAction(FETCH_PEERS_FOR_USER_REQUEST, name, 'id')
export const fetchPeersForUserSuccess = createAction(FETCH_PEERS_FOR_USER_SUCCESS, name, 'id', 'users')
export const fetchPeersForUserFailure = createAction(FETCH_PEERS_FOR_USER_FAILURE, name, 'id', 'errors')
export function fetchPeersForUser (userid) {
  return dispatch => {
    dispatch(fetchPeersForUserRequest(userid))
    return config.ajax.get(`/contact/user/${userid}/peers`)
      .then(res => dispatch(fetchPeersForUserSuccess(userid, res.data.users)))
      .catch(ex => dispatch(fetchPeersForUserFailure(userid, ex)))
  }
}

// Switches by User
name = 'fetchSwitchesForCellUser'
export const fetchSwitchesForCellUserRequest = createAction(FETCH_SWITCHES_FOR_CELL_USER_REQUEST, name, 'id')
export const fetchSwitchesForCellUserSuccess = createAction(FETCH_SWITCHES_FOR_CELL_USER_SUCCESS, name, 'id', 'switches')
export const fetchSwitchesForCellUserFailure = createAction(FETCH_SWITCHES_FOR_CELL_USER_FAILURE, name, 'id', 'errors')
export function fetchSwitchesForCellUser (userid) {
  return dispatch => {
    dispatch(fetchSwitchesForCellUserRequest(userid))
    return config.ajax.get(`/contact/user/${userid}/switch`)
      .then(res => dispatch(fetchSwitchesForCellUserSuccess(userid, res.data.switches)))
      .catch(ex => dispatch(fetchSwitchesForCellUserFailure(userid, ex)))
  }
}

// Show Counts for Manager Table
name = 'fetchCountsForManager'
export const fetchCountsForManagerRequest = createAction(FETCH_COUNTS_FOR_MANAGER_REQUEST, name, 'id')
export const fetchCountsForManagerSuccess = createAction(FETCH_COUNTS_FOR_MANAGER_SUCCESS, name, 'id', 'counts')
export const fetchCountsForManagerFailure = createAction(FETCH_COUNTS_FOR_MANAGER_FAILURE, name, 'id', 'errors')
export function fetchCountsForManager (userid) {
  return dispatch => {
    dispatch(fetchCountsForManagerRequest(userid))
    return config.ajax.get(`/contact/dir/${userid}/mgrs/counts`)
      .then(res => dispatch(fetchCountsForManagerSuccess(userid, res.data.mgr_counts)))
      .catch(ex => dispatch(fetchCountsForManagerFailure(userid, ex)))
  }
}
