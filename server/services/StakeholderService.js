const Session = require('../database/Session');
const Stakeholder = require('../models/Stakeholder');

class StakeholderService {
  constructor() {
    this._session = new Session();
    this._stakeholder = new Stakeholder(this._session);
  }

  async getAllStakeholders(filter, limitOptions) {
    return this._stakeholder.getAllStakeholders(filter, limitOptions);
  }

  async getAllStakeholdersById(id, filter, limitOptions) {
    return this._stakeholder.getAllStakeholdersById(id, filter, limitOptions);
  }

  async createStakeholder(id, requestObject) {
    try {
      await this._session.beginTransaction();
      const createdStakeholder = await this._stakeholder.createStakeholder(
        id,
        requestObject,
      );
      await this._stakeholder.createRelation(id, {
        type: requestObject.relation,
        data: { ...createdStakeholder, relation_id: requestObject.relation_id },
      });
      await this._session.commitTransaction();

      return id ? this.getAllStakeholdersById(id) : this.getAllStakeholders();
    } catch (e) {
      if (this._session.isTransactionInProgress()) {
        await this._session.rollbackTransaction();
      }
      throw e;
    }
  }

  async deleteStakeholder(id, requestObject) {
    try {
      await this._session.beginTransaction();
      //   remove id?? id not used in the model
      await this._stakeholder.deleteStakeholder(id, requestObject.data);
      await this._stakeholder.deleteRelation(id, {
        type: requestObject.type,
        data: requestObject.data,
      });
      await this._session.commitTransaction();

      return id ? this.getAllStakeholdersById(id) : this.getAllStakeholders();
    } catch (e) {
      if (this._session.isTransactionInProgress()) {
        await this._session.rollbackTransaction();
      }
      throw e;
    }
  }

  async updateStakeholder(id, requestObject) {
    try {
      await this._session.beginTransaction();
      //   should it be {id, ...requestObject}???
      const result = await this._stakeholder.updateStakeholder(
        id,
        requestObject,
      );
      await this._session.commitTransaction();

      return result;
    } catch (e) {
      if (this._session.isTransactionInProgress()) {
        await this._session.rollbackTransaction();
      }
      throw e;
    }
  }
}

module.exports = StakeholderService;
