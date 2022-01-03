import EntityList from './EntityList';
import Account from './Account';
import AccountRepository from './AccountRepository';
import AccountTransfer from './AccountTransfer';
import RootAccount from './RootAccount';

export default class AccountService {
  public accountRepository: AccountRepository;

  public constructor(accountRepository: AccountRepository) {
    this.accountRepository = accountRepository;
  }

  public async getAccounts(awsAccountId: string): Promise<EntityList<Account>> {
    return this.accountRepository.getAccounts(awsAccountId);
  }

  public async getAccount(
    awsAccountId: string,
    accountType: string
  ): Promise<Account | undefined> {
    return this.accountRepository.getAccount(awsAccountId, accountType);
  }

  public async createAccount(
    requestAccount: Account,
    isAdmin: boolean
  ): Promise<Account> {
    const account: Account = Object.assign(
      new Account({
        awsAccountId: requestAccount.awsAccountId,
        accountType: requestAccount.accountType,
        balance: requestAccount.balance,
      })
    );

    await this.accountRepository.createOrUpdateRootAccount(
      new RootAccount({
        awsAccountId: requestAccount.awsAccountId,
        admin: isAdmin,
      })
    );

    return this.accountRepository.createAccount(account);
  }

  public async transferAccountBalance(
    awsAccountId: string,
    accountType: string,
    requestAccountTransfer: AccountTransfer
  ): Promise<Account | null> {
    const accountFrom: Account | undefined =
      await this.accountRepository.updateAccountBalance(
        new Account({
          awsAccountId,
          accountType,
          balance: -Math.abs(requestAccountTransfer.transferAmount),
        })
      );

    await this.accountRepository.updateAccountBalance(
      new Account({
        awsAccountId: requestAccountTransfer.transferToAwsAccountId,
        accountType: requestAccountTransfer.transferToAccountType,
        balance: requestAccountTransfer.transferAmount,
      })
    );

    return accountFrom || null;
  }

  public async deleteAccount(
    awsAccountId: string,
    accountType: string
  ): Promise<boolean> {
    return this.accountRepository.deleteAccount(awsAccountId, accountType);
  }
}
