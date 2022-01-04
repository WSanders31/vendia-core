import EntityList from './EntityList';
import Account from './Account';
import AccountRepository from './AccountRepository';
import AccountTransfer from './AccountTransfer';

export default class AccountService {
  public accountRepository: AccountRepository;

  public constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

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
    const root = await this.accountRepository.getBusinessPartner(awsAccountId);

    if (root && !root.admin) {
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
  ): Promise<Account | null> {
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

    return accountFrom || null;
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
}
