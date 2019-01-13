/**
 * Database actions related to accounts
 * Andrew Henry
 * 12/27/18
 */

import { psql as db, pgp } from '../config/psqlAdapter';

const findUserByDeviceId = deviceId => {
  console.log(`db:findUserByDeviceId`);
  const findUserByDeviceId =
    'select account_id, device_id, username, role_type from account_info where device_id = $(deviceId)';
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
  console.log(`db:findUserByAccountId`);
  const findUserByAccountId =
    'select account_id, device_id, username, role_type from account_info where account_id = $(accountId)';
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
  console.log(`db:createUser`);
  const username = `randomname${Math.round(Math.random() * 100000)}`;
  console.log(`username:${username}`);

  return db
    .func('create_account', { username, deviceId })
    .then(res => {
      const accountId = res[0].create_account;

      if (accountId != -1) {
        return findUserByAccountId(accountId);
      } else {
        return null;
      }
    })
    .catch(err => {
      console.log(`Error inserting account with err: ${err}`);
      return null;
    });
};

export { findUserByDeviceId, findUserByAccountId, createUser };
