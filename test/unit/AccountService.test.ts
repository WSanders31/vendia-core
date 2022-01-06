import { accountRepository, accountService } from '../../src';
import Account from '../../src/Account';
import EntityList from '../../src/EntityList';
import BusinessPartner from '../../src/BusinessPartner';
import AccountTransfer from '../../src/AccountTransfer';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('getAccounts', () => {
  it('should call AccountRepository getAccounts and return a promise as non-admin', async () => {
    const accountRepositoryGetAccountsSpy = jest.spyOn(
      accountRepository,
      'getAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryGetAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: false,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337'
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryGetAccountsSpy).toHaveBeenCalledWith(
      '1337',
      undefined,
      undefined
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository getAccounts with limit and return a promise as non-admin', async () => {
    const accountRepositoryGetAccountsSpy = jest.spyOn(
      accountRepository,
      'getAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryGetAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: false,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337',
      5
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryGetAccountsSpy).toHaveBeenCalledWith(
      '1337',
      5,
      undefined
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository getAccounts with limit and cursor and return a promise as non-admin', async () => {
    const accountRepositoryGetAccountsSpy = jest.spyOn(
      accountRepository,
      'getAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryGetAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: false,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337',
      undefined,
      'fakeCursor'
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryGetAccountsSpy).toHaveBeenCalledWith(
      '1337',
      undefined,
      'fakeCursor'
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository getAccounts with cursor and return a promise as non-admin', async () => {
    const accountRepositoryGetAccountsSpy = jest.spyOn(
      accountRepository,
      'getAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryGetAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: false,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337',
      5,
      'fakeCursor'
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryGetAccountsSpy).toHaveBeenCalledWith(
      '1337',
      5,
      'fakeCursor'
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository scanAccounts and return a promise as admin', async () => {
    const accountRepositoryScanAccountsSpy = jest.spyOn(
      accountRepository,
      'scanAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryScanAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: true,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337'
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryScanAccountsSpy).toHaveBeenCalledWith(
      undefined,
      undefined
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository scanAccounts with limit and return a promise as admin', async () => {
    const accountRepositoryScanAccountsSpy = jest.spyOn(
      accountRepository,
      'scanAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryScanAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: true,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337',
      5
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryScanAccountsSpy).toHaveBeenCalledWith(5, undefined);
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository scanAccounts with cursor and return a promise as admin', async () => {
    const accountRepositoryScanAccountsSpy = jest.spyOn(
      accountRepository,
      'scanAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryScanAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: true,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337',
      undefined,
      'fakeCursor'
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryScanAccountsSpy).toHaveBeenCalledWith(
      undefined,
      'fakeCursor'
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });

  it('should call AccountRepository scanAccounts with limit and cursor and return a promise as admin', async () => {
    const accountRepositoryScanAccountsSpy = jest.spyOn(
      accountRepository,
      'scanAccounts'
    );
    const accountRepositoryGetBusinessPartnerSpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    const entityListResult = {
      items: [
        new Account({
          awsAccountId: '1337',
          accountType: 'Testing',
        }),
      ],
      count: 1,
    };
    accountRepositoryScanAccountsSpy.mockImplementation(
      (): Promise<EntityList<Account>> => {
        return Promise.resolve(entityListResult);
      }
    );

    accountRepositoryGetBusinessPartnerSpy.mockImplementation(
      (): Promise<BusinessPartner> => {
        return Promise.resolve(
          new BusinessPartner({
            awsAccountId: '1337',
            admin: true,
          })
        );
      }
    );

    const results: EntityList<Account> = await accountService.getAccounts(
      '1337',
      5,
      'fakeCursor'
    );

    expect(accountRepositoryGetBusinessPartnerSpy).toHaveBeenCalledWith('1337');
    expect(accountRepositoryScanAccountsSpy).toHaveBeenCalledWith(
      5,
      'fakeCursor'
    );
    expect(results).toBeDefined();
    expect(results).toEqual(entityListResult);
  });
});

describe('getAccount', () => {
  it('should call accountRepository getAccount and return an account', async () => {
    const accountRepositorySpy = jest.spyOn(accountRepository, 'getAccount');
    const returnAccount = new Account({
      awsAccountId: '1337',
      accountType: 'Testing',
    });
    accountRepositorySpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(returnAccount);
    });

    const result = await accountService.getAccount('1337', 'Testing');

    expect(accountRepositorySpy).toHaveBeenCalledWith(returnAccount);
    expect(result).toBeDefined();
    expect(result).toEqual(returnAccount);
  });

  it('should call accountRepository getAccount and return undefined', async () => {
    const accountRepositorySpy = jest.spyOn(accountRepository, 'getAccount');
    const returnAccount = new Account({
      awsAccountId: '1337',
      accountType: 'Testing',
    });
    accountRepositorySpy.mockImplementation((): Promise<undefined> => {
      return Promise.resolve(undefined);
    });

    const result = await accountService.getAccount('1337', 'Testing');

    expect(accountRepositorySpy).toHaveBeenCalledWith(returnAccount);
    expect(result).toBeUndefined();
  });
});

describe('createAccount', () => {
  it('should call accountRepository createAccount not as admin and return a promise', async () => {
    const accountRepositorySpy = jest.spyOn(accountRepository, 'createAccount');
    const returnAccount = new Account({
      awsAccountId: '1337',
      accountType: 'Testing',
    });
    accountRepositorySpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(returnAccount);
    });

    const result = await accountService.createAccount(returnAccount, false);

    expect(accountRepositorySpy).toHaveBeenCalledWith(returnAccount, false);
    expect(result).toBeDefined();
    expect(result).toEqual(returnAccount);
  });

  it('should call accountRepository createAccount as admin and return a promise', async () => {
    const accountRepositorySpy = jest.spyOn(accountRepository, 'createAccount');
    const returnAccount = new Account({
      awsAccountId: '1337',
      accountType: 'Testing',
    });
    accountRepositorySpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(returnAccount);
    });

    const result = await accountService.createAccount(returnAccount, true);

    expect(accountRepositorySpy).toHaveBeenCalledWith(returnAccount, true);
    expect(result).toBeDefined();
    expect(result).toEqual(returnAccount);
  });
});

describe('transferAccountBalance', () => {
  it('should call accountRepository transferAccountBalance and return the senders account', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'transferAccountBalance'
    );
    const returnAccount = new Account({
      awsAccountId: '1337',
      accountType: 'Testing',
      balance: 1337,
    });
    const accountTransfer: AccountTransfer = {
      transferToAwsAccountId: '1338',
      transferToAccountType: 'Savings',
      transferAmount: 50,
    };
    accountRepositorySpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(returnAccount);
    });

    const result = await accountService.transferAccountBalance(
      '1337',
      'Testing',
      accountTransfer
    );

    expect(accountRepositorySpy).toHaveBeenCalledWith(
      new Account({
        awsAccountId: returnAccount.awsAccountId,
        accountType: returnAccount.accountType,
      }),
      new Account({
        awsAccountId: accountTransfer.transferToAwsAccountId,
        accountType: accountTransfer.transferToAccountType,
      }),
      accountTransfer.transferAmount
    );
    expect(result).toBeDefined();
    expect(result).toEqual(returnAccount);
  });

  it('should call accountRepository transferAccountBalance and return undefined', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'transferAccountBalance'
    );
    const returnAccount = new Account({
      awsAccountId: '1337',
      accountType: 'Testing',
      balance: 1337,
    });
    const accountTransfer: AccountTransfer = {
      transferToAwsAccountId: '1338',
      transferToAccountType: 'Savings',
      transferAmount: 50,
    };
    accountRepositorySpy.mockImplementation((): Promise<undefined> => {
      return Promise.resolve(undefined);
    });

    const result = await accountService.transferAccountBalance(
      '1337',
      'Testing',
      accountTransfer
    );

    expect(accountRepositorySpy).toHaveBeenCalledWith(
      new Account({
        awsAccountId: returnAccount.awsAccountId,
        accountType: returnAccount.accountType,
      }),
      new Account({
        awsAccountId: accountTransfer.transferToAwsAccountId,
        accountType: accountTransfer.transferToAccountType,
      }),
      accountTransfer.transferAmount
    );
    expect(result).toBeUndefined();
  });
});

describe('deleteAccount', () => {
  it('should call accountRepository deleteAccount and return true', async () => {
    const accountRepositorySpy = jest.spyOn(accountRepository, 'deleteAccount');

    accountRepositorySpy.mockImplementation((): Promise<boolean> => {
      return Promise.resolve(true);
    });

    const result = await accountService.deleteAccount('1337', 'Checking');

    expect(accountRepositorySpy).toHaveBeenCalledWith(
      new Account({
        awsAccountId: '1337',
        accountType: 'Checking',
      })
    );
    expect(result).toBeDefined();
    expect(result).toEqual(true);
  });

  it('should call accountRepository deleteAccount and return false', async () => {
    const accountRepositorySpy = jest.spyOn(accountRepository, 'deleteAccount');

    accountRepositorySpy.mockImplementation((): Promise<boolean> => {
      return Promise.resolve(false);
    });

    const result = await accountService.deleteAccount('1337', 'Checking');

    expect(accountRepositorySpy).toHaveBeenCalledWith(
      new Account({
        awsAccountId: '1337',
        accountType: 'Checking',
      })
    );
    expect(result).toBeDefined();
    expect(result).toEqual(false);
  });
});

describe('getBusinessPartner', () => {
  it('should call accountRepository getAccount and return an account', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );
    const returnPartner = new BusinessPartner({
      awsAccountId: '1337',
    });
    accountRepositorySpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(returnPartner);
    });

    const result = await accountService.getBusinessPartner('1337');

    expect(accountRepositorySpy).toHaveBeenCalledWith('1337');
    expect(result).toBeDefined();
    expect(result).toEqual(returnPartner);
  });

  it('should call accountRepository getAccount and return undefined', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'getBusinessPartner'
    );

    accountRepositorySpy.mockImplementation((): Promise<undefined> => {
      return Promise.resolve(undefined);
    });

    const result = await accountService.getBusinessPartner('1337');

    expect(accountRepositorySpy).toHaveBeenCalledWith('1337');
    expect(result).toBeUndefined();
  });
});

describe('updateBusinessPartner', () => {
  it('should call accountRepository updateBusinessPartner with admin true and return a partner', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'updateBusinessPartner'
    );
    const returnPartner = new BusinessPartner({
      awsAccountId: '1337',
      admin: true,
    });
    accountRepositorySpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(returnPartner);
    });

    const result = await accountService.updateBusinessPartner('1337', true);

    expect(accountRepositorySpy).toHaveBeenCalledWith('1337', true);
    expect(result).toBeDefined();
    expect(result).toEqual(returnPartner);
  });

  it('should call accountRepository updateBusinessPartner with admin false and return a partner', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'updateBusinessPartner'
    );
    const returnPartner = new BusinessPartner({
      awsAccountId: '1337',
      admin: false,
    });
    accountRepositorySpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(returnPartner);
    });

    const result = await accountService.updateBusinessPartner('1337', false);

    expect(accountRepositorySpy).toHaveBeenCalledWith('1337', false);
    expect(result).toBeDefined();
    expect(result).toEqual(returnPartner);
  });

  it('should call accountRepository updateBusinessPartner and return undefined', async () => {
    const accountRepositorySpy = jest.spyOn(
      accountRepository,
      'updateBusinessPartner'
    );

    accountRepositorySpy.mockImplementation((): Promise<undefined> => {
      return Promise.resolve(undefined);
    });

    const result = await accountService.updateBusinessPartner('1337', false);

    expect(accountRepositorySpy).toHaveBeenCalledWith('1337', false);
    expect(result).toBeUndefined();
  });
});
