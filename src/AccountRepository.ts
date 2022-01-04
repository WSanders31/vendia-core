import {
  Connection,
  EntityManager,
  TransactionManager,
  WriteTransaction,
} from '@typedorm/core/public-api';
import EntityList from './EntityList';
import Account from './Account';
import BusinessPartner from './BusinessPartner';
import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';

export default class AccountRepository {
  public connection: Connection;

  public entityManager: EntityManager;
  public transactionManager: TransactionManager;
  public dynamodbClient: DocumentClient;

  public constructor(
    connection: Connection,
    entityManager: EntityManager,
    transactionManager: TransactionManager
  ) {
    this.connection = connection;
    this.entityManager = entityManager;
    this.transactionManager = transactionManager;
    AWS.config.update({
      region: process.env.REGION,
    });
    this.dynamodbClient = new AWS.DynamoDB.DocumentClient();
  }

  public async getAccounts(
    awsAccountId: string,
    pageSize?: number,
    cursor?: string
  ): Promise<EntityList<Account>> {
    const results = await this.entityManager.find(
      Account,
      { awsAccountId },
      {
        limit: pageSize,
        ...(cursor && { cursor: this.decodeCursor(cursor) }),
        select: ['awsAccountId', 'accountType'],
      }
    );

    return {
      items: results.items,
      count: results.items?.length || 0,
      cursor: this.encodeCursor(results.cursor),
    };
  }

  public async scanAccounts(
    limit?: number,
    cursor?: string,
    recursiveResults?: EntityList<Account>
  ): Promise<EntityList<Account>> {
    const results = await this.dynamodbClient
      .scan({
        TableName: process.env.DYNAMODB || 'DynamoDB Table not defined.',
        FilterExpression: '#en = :en',
        ExpressionAttributeNames: {
          '#en': '__en',
          '#at': 'accountType',
          '#aa': 'awsAccountId',
        },
        ExpressionAttributeValues: {
          ':en': Account.ENTITY_NAME,
        },
        ProjectionExpression: '#at, #aa',
        Limit: limit,
        ExclusiveStartKey: this.decodeCursor(cursor),
      })
      .promise();

    recursiveResults = {
      items: [
        ...(recursiveResults?.items || []),
        ...(results.Items as Account[]),
      ],
      count: (recursiveResults?.count || 0) + (results.Count || 0),
      cursor: this.encodeCursor(results.LastEvaluatedKey),
    };

    if (
      recursiveResults.cursor &&
      limit &&
      limit > (recursiveResults.items?.length || 0)
    ) {
      recursiveResults = await this.scanAccounts(
        limit - (recursiveResults.items?.length || 0),
        recursiveResults.cursor,
        recursiveResults
      );
    }

    return recursiveResults;
  }

  public async getAccount(
    account: Account
  ): Promise<Account | undefined> {
    return this.entityManager.findOne(Account, account);
  }

  public async getBusinessPartner(
    awsAccountId: string
  ): Promise<BusinessPartner | undefined> {
    return this.entityManager.findOne(BusinessPartner, { awsAccountId });
  }

  public async createAccount(
    account: Account,
    admin?: boolean
  ): Promise<Account | undefined> {
    const businessPartner = await this.entityManager.findOne(BusinessPartner, {
      awsAccountId: account.awsAccountId,
    });
    const transactions: WriteTransaction = new WriteTransaction();

    if (businessPartner) {
      transactions.addUpdateItem(
        BusinessPartner,
        { awsAccountId: account.awsAccountId },
        {
          accountCount: {
            ADD: 1,
          },
        },
        {
          where: {
            accountCount: {
              LT: 10,
            },
          },
        }
      );
    } else {
      transactions.addCreateItem(
        new BusinessPartner({
          awsAccountId: account.awsAccountId,
          accountCount: 1,
          admin,
        })
      );
    }

    transactions.addCreateItem(account);

    await this.transactionManager.write(transactions);

    return this.entityManager.findOne(Account, {
      awsAccountId: account.awsAccountId,
      accountType: account.accountType,
    });
  }

  public async transferAccountBalance(
    fromAccount: Account,
    toAccount: Account,
    transferAmount: number
  ): Promise<Account | undefined> {
    const transactions: WriteTransaction = new WriteTransaction();

    transactions.addUpdateItem(
      Account,
      fromAccount,
      {
        balance: {
          ADD: -Math.abs(transferAmount),
        },
      },
      {
        where: {
          balance: {
            GE: Math.abs(transferAmount),
          },
        },
      }
    );

    transactions.addUpdateItem(
      Account,
      toAccount,
      {
        balance: {
          ADD: Math.abs(transferAmount),
        },
      },
      {
        where: {
          AND: {
            awsAccountId: 'ATTRIBUTE_EXISTS',
            accountType: 'ATTRIBUTE_EXISTS',
          },
        },
      }
    );

    await this.transactionManager.write(transactions);

    return this.entityManager.findOne(Account, fromAccount);
  }

  public async deleteAccount(
    account: Account
  ): Promise<boolean> {
    const transactions: WriteTransaction = new WriteTransaction();
    transactions.addDeleteItem(
      Account,
      account,
      {
        where: {
          AND: {
            awsAccountId: {
              EQ: account.awsAccountId,
            },
            accountType: {
              EQ: account.accountType,
            },
            balance: {
              EQ: 0,
            },
          },
        },
      }
    );

    transactions.addUpdateItem(BusinessPartner,
      { awsAccountId: account.awsAccountId },
      {
        accountCount: {
          ADD: -1,
        },
      });

    const results = await this.transactionManager.write(transactions);

    return results.success;
  }

  public decodeCursor(cursor?: string): Record<string, unknown> | undefined {
    let cursorKey: Record<string, unknown> | undefined = undefined;
    if (cursor) {
      cursorKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    return cursorKey;
  }

  public encodeCursor(
    cursor?: Record<string, unknown> | undefined
  ): string | undefined {
    let cursorKey: string | undefined = undefined;
    if (cursor) {
      cursorKey = Buffer.from(JSON.stringify(cursor), 'binary').toString(
        'base64'
      );
    }
    return cursorKey;
  }
}