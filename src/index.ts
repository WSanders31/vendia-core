import AWS from 'aws-sdk';
import 'reflect-metadata';
import AccountRepository from './AccountRepository';
import AccountService from './AccountService';
import { Connection, createConnection, getConnection } from '@typedorm/core';
import dynamodbTable from './DynamoDB';
import Account from './Account';
import BusinessPartner from './BusinessPartner';

/**
 * All required modules to run the application. When the handler imports the service layer from this file,
 *the rest of the required modules will be bootstrapped at runtime.
 */

console.log('Initializing Account Service.');

// This is set to be able to utilize ts-node at the command line, reducing deploy cycles and allow code to be tested locally.
AWS.config.update({
  region: process.env.REGION,
});
// TypedORM requires creating a connection and establishing an entity manager.
let connection: Connection;
try {
  connection = createConnection({
    table: dynamodbTable, // Table definition
    entities: [BusinessPartner, Account], // Must register data models at runtime. Glob pattern not working.
  });
} catch (e) {
  console.log(
    'Error creating connection, attempting to get active connection. Error -->',
    e
  );
  connection = getConnection(); // Error creating connection, attempting to fetch default.
}

const entityManager = connection.entityManager;
const transactionManager = connection.transactionManger;

const accountRepository = new AccountRepository(
  entityManager,
  transactionManager,
  new AWS.DynamoDB.DocumentClient()
);
const accountService = new AccountService(accountRepository);

export { entityManager, accountService, accountRepository };
