import axios from "axios";
import Constants from "../utils/Constants";
import Utils from "../utils/Utils";
// const jwt = require('jsonwebtoken');

// const centralRestServerServiceBaseURL = 'https://192.168.1.130';
const centralRestServerServiceBaseURL = "https://sap-charge-angels-rest-server.cfapps.eu10.hana.ondemand.com";
const centralRestServerServiceAuthURL = centralRestServerServiceBaseURL + "/client/auth";
const centralRestServerServiceSecuredURL = centralRestServerServiceBaseURL + "/client/api";
var jwtDecode = require("jwt-decode");

// Paste the tokken below
let token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU5MmU5NjlmODlkOGUwN2EyYjE2YTc4ZiIsInJvbGUiOiJBIiwibmFtZSI6IkZBQklBTk8iLCJ0YWdJRHMiOlsiRjNDMEI0REQiXSwiZmlyc3ROYW1lIjoiU2VyZ2lvIiwibG9jYWxlIjoiZW5fVVMiLCJsYW5ndWFnZSI6ImVuIiwiYXV0aHMiOlt7IkF1dGhPYmplY3QiOiJVc2VycyIsIkF1dGhGaWVsZFZhbHVlIjp7IkFjdGlvbiI6WyJMaXN0Il19fSx7IkF1dGhPYmplY3QiOiJVc2VyIiwiQXV0aEZpZWxkVmFsdWUiOnsiVXNlcklEIjoiKiIsIkFjdGlvbiI6WyJDcmVhdGUiLCJSZWFkIiwiVXBkYXRlIiwiRGVsZXRlIiwiTG9nb3V0IiwiVW5sb2NrQ29ubmVjdG9yIl19fSx7IkF1dGhPYmplY3QiOiJDb21wYW5pZXMiLCJBdXRoRmllbGRWYWx1ZSI6eyJBY3Rpb24iOlsiTGlzdCJdfX0seyJBdXRoT2JqZWN0IjoiQ29tcGFueSIsIkF1dGhGaWVsZFZhbHVlIjp7IkNvbXBhbnlJRCI6IioiLCJBY3Rpb24iOlsiQ3JlYXRlIiwiUmVhZCIsIlVwZGF0ZSIsIkRlbGV0ZSJdfX0seyJBdXRoT2JqZWN0IjoiU2l0ZXMiLCJBdXRoRmllbGRWYWx1ZSI6eyJBY3Rpb24iOlsiTGlzdCJdfX0seyJBdXRoT2JqZWN0IjoiU2l0ZSIsIkF1dGhGaWVsZFZhbHVlIjp7IlNpdGVJRCI6IioiLCJBY3Rpb24iOlsiQ3JlYXRlIiwiUmVhZCIsIlVwZGF0ZSIsIkRlbGV0ZSJdfX0seyJBdXRoT2JqZWN0IjoiVmVoaWNsZU1hbnVmYWN0dXJlcnMiLCJBdXRoRmllbGRWYWx1ZSI6eyJBY3Rpb24iOlsiTGlzdCJdfX0seyJBdXRoT2JqZWN0IjoiVmVoaWNsZU1hbnVmYWN0dXJlciIsIkF1dGhGaWVsZFZhbHVlIjp7IlZlaGljbGVNYW51ZmFjdHVyZXJJRCI6IioiLCJBY3Rpb24iOlsiQ3JlYXRlIiwiUmVhZCIsIlVwZGF0ZSIsIkRlbGV0ZSJdfX0seyJBdXRoT2JqZWN0IjoiVmVoaWNsZXMiLCJBdXRoRmllbGRWYWx1ZSI6eyJBY3Rpb24iOlsiTGlzdCJdfX0seyJBdXRoT2JqZWN0IjoiVmVoaWNsZSIsIkF1dGhGaWVsZFZhbHVlIjp7IlZlaGljbGVJRCI6IioiLCJBY3Rpb24iOlsiQ3JlYXRlIiwiUmVhZCIsIlVwZGF0ZSIsIkRlbGV0ZSJdfX0seyJBdXRoT2JqZWN0IjoiU2l0ZUFyZWFzIiwiQXV0aEZpZWxkVmFsdWUiOnsiQWN0aW9uIjpbIkxpc3QiXX19LHsiQXV0aE9iamVjdCI6IlNpdGVBcmVhIiwiQXV0aEZpZWxkVmFsdWUiOnsiU2l0ZUFyZWFJRCI6IioiLCJBY3Rpb24iOlsiQ3JlYXRlIiwiUmVhZCIsIlVwZGF0ZSIsIkRlbGV0ZSJdfX0seyJBdXRoT2JqZWN0IjoiQ2hhcmdpbmdTdGF0aW9ucyIsIkF1dGhGaWVsZFZhbHVlIjp7IkFjdGlvbiI6WyJMaXN0Il19fSx7IkF1dGhPYmplY3QiOiJDaGFyZ2luZ1N0YXRpb24iLCJBdXRoRmllbGRWYWx1ZSI6eyJDaGFyZ2luZ1N0YXRpb25JRCI6IioiLCJBY3Rpb24iOlsiQ3JlYXRlIiwiUmVhZCIsIlVwZGF0ZSIsIkRlbGV0ZSIsIlJlc2V0IiwiQ2xlYXJDYWNoZSIsIkdldENvbmZpZ3VyYXRpb24iLCJDaGFuZ2VDb25maWd1cmF0aW9uIiwiU3RhcnRUcmFuc2FjdGlvbiIsIlN0b3BUcmFuc2FjdGlvbiIsIlVubG9ja0Nvbm5lY3RvciIsIkF1dGhvcml6ZSJdfX0seyJBdXRoT2JqZWN0IjoiVHJhbnNhY3Rpb25zIiwiQXV0aEZpZWxkVmFsdWUiOnsiQWN0aW9uIjpbIkxpc3QiXX19LHsiQXV0aE9iamVjdCI6IlRyYW5zYWN0aW9uIiwiQXV0aEZpZWxkVmFsdWUiOnsiVXNlcklEIjoiKiIsIkFjdGlvbiI6WyJSZWFkIiwiVXBkYXRlIiwiRGVsZXRlIiwiUmVmdW5kVHJhbnNhY3Rpb24iXX19LHsiQXV0aE9iamVjdCI6IkxvZ2dpbmdzIiwiQXV0aEZpZWxkVmFsdWUiOnsiQWN0aW9uIjpbIkxpc3QiXX19LHsiQXV0aE9iamVjdCI6IkxvZ2dpbmciLCJBdXRoRmllbGRWYWx1ZSI6eyJMb2dJRCI6IioiLCJBY3Rpb24iOlsiUmVhZCJdfX0seyJBdXRoT2JqZWN0IjoiUHJpY2luZyIsIkF1dGhGaWVsZFZhbHVlIjp7IkFjdGlvbiI6WyJSZWFkIiwiVXBkYXRlIl19fSx7IkF1dGhPYmplY3QiOiJUZW5hbnRzIiwiQXV0aEZpZWxkVmFsdWUiOnsiQWN0aW9uIjpbXX19LHsiQXV0aE9iamVjdCI6IlRlbmFudCIsIkF1dGhGaWVsZFZhbHVlIjp7IlRlbmFudElEIjoiKiIsIkFjdGlvbiI6W119fV0sImlhdCI6MTU0MTIzNzQ4NiwiZXhwIjoxNTQxMjgwNjg2fQ.ycjmYzXtKS3QKmRnp31ScE4mQRNZpT36fMqmidwAdvE";

export default class CentralServerProvider {
  async isAuthenticated() {
    // try {
    //   console.log('====================================');
    //   console.log(jwt);
    //   console.log('====================================');
    //   let result = await jwt.verify(token, Configuration.getJWTSecretKey());

    //   console.log('====================================');
    //   console.log(result);
    //   console.log('====================================');

    // } catch (error) {
    //   console.log('====================================');
    //   console.log(error);
    //   console.log('====================================');
    // }
  }

  async resetPassword(email) {
    // Call
    let result = await axios.post(`${centralRestServerServiceAuthURL}/Reset`,
      { email },
      { headers: this._builHeaders() }
    );
  }

  async login(email, password, eula) {
    // Call
    let result = await axios.post(`${centralRestServerServiceAuthURL}/Login`,
      { email, password, "acceptEula": eula },
      { headers: this._builHeaders() }
    );
    console.log(result.data.token);
    // Keep the token
    token = result.data.token;
  }

  async register(name, firstName, email, passwords, eula) {
    let result = await axios.post(`${centralRestServerServiceAuthURL}/RegisterUser`,
      { name, firstName, email, passwords, "acceptEula": eula },
      { headers: this._builHeaders() }
    );
    return result.data;
  }

  async getChargers(params = {}, paging = Constants.DEFAULT_PAGING, ordering = Constants.DEFAULT_ORDERING) {
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Call
    let result = await axios.get(`${centralRestServerServiceSecuredURL}/ChargingStations`, {
      headers: this._builSecuredHeaders(),
      params
    });
    return result.data;
  }

  async getCharger(params = {}, paging = Constants.DEFAULT_PAGING, ordering = Constants.DEFAULT_ORDERING) {
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Call
    let result = await axios.get(`${centralRestServerServiceSecuredURL}/ChargingStation`, {
      headers: this._builSecuredHeaders(),
      params
    });
    return result.data;
  }

  async getSites(params = {}, paging = Constants.DEFAULT_PAGING, ordering = Constants.DEFAULT_ORDERING) {
    // Build Paging
    this._buildPaging(paging, params);
    // Build Ordering
    this._buildOrdering(ordering, params);
    // Call
    let result = await axios.get(`${centralRestServerServiceSecuredURL}/Sites`, {
      headers: this._builSecuredHeaders(),
      params
    });
    return result.data;
  }

  async getSiteAreas(params = {}, paging = Constants.DEFAULT_PAGING, ordering = Constants.DEFAULT_ORDERING) {
    // Call
    let result = await axios.get(`${centralRestServerServiceSecuredURL}/SiteAreas`, {
      headers: this._builSecuredHeaders(),
      params
    });
    return result.data;
  }

  async getEndUserLicenseAgreement(language) {
    let result = await axios.get(`${centralRestServerServiceAuthURL}/EndUserLicenseAgreement?Language=${language}`, {
      headers: this._builHeaders()
    });
    return result.data;
  }

  async startTransaction(chargeBoxID, connectorID) {
    let getTagId = Utils.getTokenProperty(token, "tagIDs");
    let result = await axios.post(`${centralRestServerServiceSecuredURL}/ChargingStationStartTransaction`,
      {
        chargeBoxID,
        "args": {
          "tagID": getTagId[0],
          connectorID
        }
      },
      { headers: this._builSecuredHeaders() }
    );
    console.log(result.data);
  }

  async stopTransaction(chargeBoxID, transactionId) {
    let result = await axios.post(`${centralRestServerServiceSecuredURL}/ChargingStationStopTransaction`,
      {
        chargeBoxID,
        "args": {
          transactionId
        }
      },
      { headers: this._builSecuredHeaders() }
    );
    console.log(result.data);
  }

  _isAdmin() {
    let decodedToken = jwtDecode(token);
    let getRole = decodedToken.role;

    if (getRole === "A") {
        return true;
    }
    return false;
  }

  _buildPaging(paging, queryString) {
    // Check
    if (paging) {
      // Limit
      if (paging.limit) {
        queryString.Limit = paging.limit;
      }
      // Skip
      if (paging.skip) {
        queryString.Skip = paging.skip;
      }
    }
  }

  _buildOrdering(ordering, queryString) {
    // Check
    if (ordering && ordering.length) {
      if (!queryString.SortFields) {
        queryString.SortFields = [];
        queryString.SortDirs = [];
      }
      // Set
      ordering.forEach((order) => {
        queryString.SortFields.push(order.field);
        queryString.SortDirs.push(order.direction);
      });
    }
  }

  _builHeaders() {
    return {
      "Accept": "application/json",
      "Content-Type": "application/json"
    };
  }

  _builSecuredHeaders() {
    return {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": "Bearer " + token,
    };
  }
}
