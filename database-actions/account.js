/**
 * Database actions related to accounts
 * Andrew Henry
 * 12/27/18
 */

import { psql as db } from '../config/psqlAdapter';

const findUserByDeviceId = deviceId => {
  const findUserByDeviceId =
    'select account_id, device_id from account_info where device_id = $(deviceId)';
  return db
    .oneOrNone(findUserByDeviceId, { deviceId })
    .then(res => {
      return res;
    })
    .catch(err => {
      console.log(
        `Error retrieving details for deviceId:${deviceId} with err:${err}`
      );
      return null;
    });
};

const findUserByAccountId = accountId => {
  const findUserByAccountId =
    'select account_id, device_id from account_info where account_id = $(accountId)';
  return db
    .oneOrNone(findUserByAccountId, { accountId })
    .then(res => {
      return res;
    })
    .catch(err => {
      console.log(
        `Error retrieving details for accountId:${accountId} with err:${err}`
      );
      return null;
    });
};

const createUser = deviceId => {
  const username = `randomname${Math.round(Math.random() * 100000)}`;
  console.log(`username:${username}`);
  const createAccount =
    'insert into account_info(current_username, device_id) values($(username), $(deviceId)) returning account_id, device_id';
  return db
    .one(createAccount, { username, deviceId })
    .then(res => {
      return res;
    })
    .catch(err => {
      console.log(
        `Error creating account for deviceId:${deviceId} with err:${err}`
      );
      return null;
    });
};

export { findUserByDeviceId, findUserByAccountId, createUser };
