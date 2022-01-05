import EntityList from './EntityList';
import Account from './Account';
import AccountRepository from './AccountRepository';
import AccountTransfer from './AccountTransfer';
import BusinessPartner from './BusinessPartner';

export default class AccountService {
  public accountRepository: AccountRepository;

  public constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  /**
   * Fetches a list of accounts, either by a query utilizing the partitionKey for a one to many lookup,
   * or, in the case of the businessPartner being an admin, will perform a scan and filter on specific entity type.
   */
  public async getAccounts(
    awsAccountId: string,
    limit?: number,
    cursor?: string
  ): Promise<EntityList<Account>> {
    console.log('AccountService:getAccounts', {
      awsAccountId,
      limit,
      cursor,
    });
    const partner = await this.accountRepository.getBusinessPartner(awsAccountId);

    if (partner && !partner.admin) {
      return this.accountRepository.getAccounts(awsAccountId, limit, cursor);
    } else {
      return this.accountRepository.scanAccounts(limit, cursor);
    }
  }

  public async getAccount(
    awsAccountId: string,
    accountType: string
  ): Promise<Account | undefined> {
    console.log('AccountService.getAccount', { awsAccountId, accountType });
    return this.accountRepository.getAccount(
      new Account({ awsAccountId, accountType })
    );
  }

  public async createAccount(
    requestAccount: Account,
    isAdmin: boolean
  ): Promise<Account | undefined> {
    console.log('AccountService.createAccount', { requestAccount, isAdmin });
    return this.accountRepository.createAccount(
      new Account(requestAccount),
      isAdmin
    );
  }

  public async transferAccountBalance(
    awsAccountId: string,
    accountType: string,
    requestAccountTransfer: AccountTransfer
  ): Promise<Account | undefined> {
    console.log('AccountService.transferAccountBalance', {
      awsAccountId,
      accountType,
      requestAccountTransfer,
    });
    const accountFrom: Account | undefined =
      await this.accountRepository.transferAccountBalance(
        new Account({
          awsAccountId,
          accountType,
        }),
        new Account({
          awsAccountId: requestAccountTransfer.transferToAwsAccountId,
          accountType: requestAccountTransfer.transferToAccountType,
        }),
        requestAccountTransfer.transferAmount
      );

    return accountFrom || undefined;
  }

  public async deleteAccount(
    awsAccountId: string,
    accountType: string
  ): Promise<boolean> {
    console.log('AccountService.deleteAccount', { awsAccountId, accountType });
    const deleted = await this.accountRepository.deleteAccount(
      new Account({
        awsAccountId,
        accountType,
      })
    );

    return deleted;
  }

  public async getBusinessPartner(
    awsAccountId: string
  ): Promise<BusinessPartner | undefined> {
    console.log('AccountService.getBusinessPartner', { awsAccountId });
    return this.accountRepository.getBusinessPartner(awsAccountId);
  }

  public async updateBusinessPartner(
    awsAccountId: string,
    admin: boolean
  ): Promise<BusinessPartner | undefined> {
    console.log('AccountService.updateBusinessPartner', {
      awsAccountId,
      admin,
    });
    return this.accountRepository.updateBusinessPartner(awsAccountId, admin);
  }
}
