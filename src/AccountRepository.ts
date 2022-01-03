import {
  Connection,
  EntityManager,
  TransactionManager,
} from '@typedorm/core/public-api';
import EntityList from './EntityList';
import Account from './Account';
import { ScanManager } from '@typedorm/core/src/classes/manager/scan-manager';
import RootAccount from './RootAccount';

export default class AccountRepository {
  public connection: Connection;

  public entityManager: EntityManager;
  public scanManager: ScanManager;
  public transactionManager: TransactionManager;

  public constructor(
    connection: Connection,
    entityManager: EntityManager,
    scanManager: ScanManager,
    transactionManager: TransactionManager
  ) {
    this.connection = connection;
    this.entityManager = entityManager;
    this.scanManager = scanManager;
    this.transactionManager = transactionManager;
  }

  public async getAccounts(awsAccountId: string): Promise<EntityList<Account>> {
    return this.entityManager.find(Account, { awsAccountId });
  }

  public async scanAccounts(): Promise<EntityList<Account>> {
    return this.scanManager.scan({ entity: Account });
  }

  public async getAccount(
    awsAccountId: string,
    accountType: string
  ): Promise<Account | undefined> {
    return this.entityManager.findOne(Account, { awsAccountId, accountType });
  }

  public async createAccount(account: Account): Promise<Account> {
    return this.entityManager.create(account);
  }

  public async createOrUpdateRootAccount(
    root: RootAccount
  ): Promise<RootAccount | undefined> {
    return this.entityManager.update(
      RootAccount,
      { awsAccountId: root.awsAccountId },
      {
        ...(root.admin && {
          admin: {
            SET: root.admin ? true : false,
          },
        }),
        accountCount: {
          ADD: 1
        },
      }, 
      {
        where: {
          accountCount: {
            LE: 10
          }
        }
      }
    );
  }

  public async updateAccountBalance(
    account: Account
  ): Promise<Account | undefined> {
    return this.entityManager.update(
      Account,
      account,
      {
        balance: {
          ADD: account.balance,
        },
      },
      {
        ...(account.balance < 0 && {
          where: {
            balance: {
              GE: Math.abs(account.balance),
            },
          },
        }),
      }
    );
  }

  public async deleteAccount(
    awsAccountId: string,
    accountType: string
  ): Promise<boolean> {
    return (
      await this.entityManager.delete(Account, { awsAccountId, accountType })
    ).success;
  }
}
