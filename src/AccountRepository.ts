import {
  EntityManager,
  TransactionManager,
  WriteTransaction,
} from '@typedorm/core/public-api';
import EntityList from './EntityList';
import Account from './Account';
import BusinessPartner from './BusinessPartner';
import AWS from 'aws-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TransactionCancelledException } from '@typedorm/common';

export default class AccountRepository {
  public entityManager: EntityManager;
  public transactionManager: TransactionManager;
  public dynamodbClient: DocumentClient;

  public constructor(
    entityManager: EntityManager,
    transactionManager: TransactionManager,
    dynamodbClient: DocumentClient
  ) {
    this.entityManager = entityManager;
    this.transactionManager = transactionManager;
    AWS.config.update({
      region: process.env.REGION,
    });
    this.dynamodbClient = dynamodbClient;
  }

  public async getAccounts(
    awsAccountId: string,
    pageSize?: number,
    cursor?: string
  ): Promise<EntityList<Account>> {
    console.log('AccountRepository.getAccounts', {
      awsAccountId,
      pageSize,
      cursor,
    });
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

  /**
   * The TypedORM scan implementation lacks documentation, and I was getting strange behavior from it,
   * so I opted for a hand rolled solution, a recursive scan based on what limit the user provided
   * utilizing the standard aws-sdk dynamodb client.
   *
   **/
  public async scanAccounts(
    limit?: number,
    cursor?: string,
    recursiveResults?: EntityList<Account>
  ): Promise<EntityList<Account>> {
    console.log('AccountRepository.scanAccounts', {
      limit,
      cursor,
      recursiveResults,
    });
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
      limit > (results.Items?.length || 0)
    ) {
      recursiveResults = await this.scanAccounts(
        limit - (results.Items?.length || 0),
        recursiveResults.cursor,
        recursiveResults
      );
    }

    return recursiveResults;
  }

  public async getAccount(account: Account): Promise<Account | undefined> {
    console.log('AccountRepository.getAccount', {
      account,
    });
    return this.entityManager.findOne(Account, account);
  }

  public async getBusinessPartner(
    awsAccountId: string
  ): Promise<BusinessPartner | undefined> {
    console.log('AccountRepository.getBusinessPartner', {
      awsAccountId,
    });
    return this.entityManager.findOne(BusinessPartner, { awsAccountId });
  }

  /**
   * Creates an account, and creates/updates a businessPartner record to track total accounts.
   * Sequence of writes are managed by a transaction.
   */
  public async createAccount(
    account: Account,
    admin?: boolean
  ): Promise<Account | undefined> {
    console.log('AccountRepository.createAccount', {
      account,
      admin,
    });
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

    try {
      await this.transactionManager.write(transactions);
    } catch (e) {
      if (
        e instanceof TransactionCancelledException &&
        e.cancellationReasons.some(
          (cancel: Record<string, string>) =>
            cancel.code === 'ConditionalCheckFailed'
        )
      ) {
        console.error('ConditionalCheckFailed: ', e);
        throw new Error(
          'Account Type already exists or limit of 10 account types reached.'
        );
      } else {
        console.error('Something went wrong', e);
        throw new Error('Something went wrong');
      }
    }
    
    return this.entityManager.findOne(Account, {
      awsAccountId: account.awsAccountId,
      accountType: account.accountType,
    });
  }

  /**
   * Transfers account balances between accounts, conditional checks used to insure
   * proper balance and accounts exist.
   *
   * Managed by a single transaction with multiple writes to insure proper rollbacks in failure.
   */
  public async transferAccountBalance(
    fromAccount: Account,
    toAccount: Account,
    transferAmount: number
  ): Promise<Account | undefined> {
    console.log('AccountRepository.transferAccountBalance', {
      fromAccount,
      toAccount,
      transferAmount,
    });
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
    try {
      await this.transactionManager.write(transactions);
    } catch (e) {
      if (
        e instanceof TransactionCancelledException &&
        e.cancellationReasons.some(
          (cancel: Record<string, string>) =>
            cancel.code === 'ConditionalCheckFailed'
        )
      ) {
        console.error('ConditionalCheckFailed: ', e);
        throw new Error(
          `Source/Destination Account doesn't exist, or not enough balance to transfer funds.`
        );
      } else {
        console.error('Something went wrong', e);
        throw new Error('Something went wrong');
      }
    }

    return this.entityManager.findOne(Account, fromAccount);
  }

  /**
   * Deletes an account / accountType key pair, and updates businessPartner record account count.
   *
   * Uses a transaction to manage sequence of writes, to rollback upon any failures.
   */
  public async deleteAccount(account: Account): Promise<boolean> {
    console.log('AccountRepository.deleteAccount', {
      account,
    });
    const transactions: WriteTransaction = new WriteTransaction();
    transactions.addDeleteItem(Account, account, {
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
    });

    transactions.addUpdateItem(
      BusinessPartner,
      { awsAccountId: account.awsAccountId },
      {
        accountCount: {
          ADD: -1,
        },
      }
    );
    try {
      const results = await this.transactionManager.write(transactions);

      return results.success;
    } catch (e) {
      if (
        e instanceof TransactionCancelledException &&
        e.cancellationReasons.some(
          (cancel: Record<string, string>) =>
            cancel.code === 'ConditionalCheckFailed'
        )
      ) {
        console.error('ConditionalCheckFailed: ', e);
        throw new Error(`Account doesn't exist or balance not equal to 0.`);
      } else {
        console.log('Something went wrong', e);
        throw new Error('Something went wrong');
      }
    }
  }

  public updateBusinessPartner(
    awsAccountId: string,
    isAdmin: boolean
  ): Promise<BusinessPartner | undefined> {
    console.log('AccountRepository.updateBusinessPartner', {
      awsAccountId,
      isAdmin,
    });
    return this.entityManager.update(
      BusinessPartner,
      { awsAccountId },
      {
        admin: {
          SET: isAdmin,
        },
      }
    );
  }

  /**
   * Helper functions to encode and decode pagination cursors.
   */
  public decodeCursor(cursor?: string): Record<string, unknown> | undefined {
    console.log('AccountRepository.decodeCursor', cursor);
    let cursorKey: Record<string, unknown> | undefined = undefined;
    if (cursor) {
      cursorKey = JSON.parse(Buffer.from(cursor, 'base64').toString());
    }

    return cursorKey;
  }

  public encodeCursor(
    cursor?: Record<string, unknown> | undefined
  ): string | undefined {
    console.log('AccountRepository.encodeCursor', cursor);
    let cursorKey: string | undefined = undefined;
    if (cursor) {
      cursorKey = Buffer.from(JSON.stringify(cursor), 'binary').toString(
        'base64'
      );
    }
    return cursorKey;
  }
}
