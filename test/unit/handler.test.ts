import * as handler from '../../src/handler';
import { accountService } from '../../src';
import Account from '../../src/Account';
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import EntityList from '../../src/EntityList';
import AccountTransfer from '../../src/AccountTransfer';
import BusinessPartner from '../../src/BusinessPartner';

beforeEach(() => {
  jest.resetAllMocks();
});

describe('getAccountBalance', () => {
  it('should get an Accounts balance and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.getAccountBalance({
        requestContext: {
          identity: {
            accountId: '1337',
          },
        },
        pathParameters: {
          accountType: 'Checking',
        },
      } as unknown as APIGatewayEvent);

    const resultBody: Account = JSON.parse(apiGatewayResult.body) as Account;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockResult.awsAccountId,
      mockResult.accountType
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.balance).toEqual(mockResult.balance);
  });

  it('should not find an Account and return 404', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account | undefined> => {
      return Promise.resolve(undefined);
    });

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.getAccountBalance({
        requestContext: {
          identity: {
            accountId: '1337',
          },
        },
        pathParameters: {
          accountType: 'Checking',
        },
      } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockResult.awsAccountId,
      mockResult.accountType
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(404);
    expect(apiGatewayResult.body).toEqual('Account not found');
  });

  it('should recieve a malformed request missing awsAccountId and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account | undefined> => {
      return Promise.resolve(undefined);
    });

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.getAccountBalance({
        requestContext: {
          identity: {},
        },
        pathParameters: {
          accountType: 'Checking',
        },
      } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toEqual(
      'AWS Account Id or Account Type not specified.'
    );
  });

  it('should recieve a malformed request missing accountType and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account | undefined> => {
      return Promise.resolve(undefined);
    });

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.getAccountBalance({
        requestContext: {
          identity: {
            accountId: '1337',
          },
        },
        pathParameters: {
          accountType: '',
        },
      } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toEqual(
      'AWS Account Id or Account Type not specified.'
    );
  });
});

describe('getAccounts', () => {
  it('should get an Account list and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccounts');
    const mockAccountResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });
    const mockResult: EntityList<Account> = {
      items: [mockAccountResult],
      count: 1,
    };

    accountServiceSpy.mockImplementation((): Promise<EntityList<Account>> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.getAccounts({
      requestContext: {
        identity: {
          accountId: '1337',
        },
      },
    } as unknown as APIGatewayEvent);

    const resultBody: EntityList<Account> = JSON.parse(
      apiGatewayResult.body
    ) as EntityList<Account>;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockAccountResult.awsAccountId,
      undefined,
      undefined
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.count).toEqual(mockResult.count);
    expect(resultBody.items?.length).toEqual(mockResult.items?.length);
    expect(resultBody.items?.[0].accountType).toEqual(
      mockResult.items?.[0].accountType
    );
    expect(resultBody.items?.[0].awsAccountId).toEqual(
      mockResult.items?.[0].awsAccountId
    );
  });

  it('should get an empty Account list and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccounts');
    const mockAccountResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });
    const mockResult: EntityList<Account> = {
      items: [],
      count: 1,
    };

    accountServiceSpy.mockImplementation((): Promise<EntityList<Account>> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.getAccounts({
      requestContext: {
        identity: {
          accountId: '1337',
        },
      },
    } as unknown as APIGatewayEvent);

    const resultBody: EntityList<Account> = JSON.parse(
      apiGatewayResult.body
    ) as EntityList<Account>;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockAccountResult.awsAccountId,
      undefined,
      undefined
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.count).toEqual(mockResult.count);
    expect(resultBody.items?.length).toEqual(mockResult.items?.length);
  });

  it('should get an Account list a page limit and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccounts');
    const mockAccountResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });
    const mockResult: EntityList<Account> = {
      items: [mockAccountResult],
      count: 1,
    };

    accountServiceSpy.mockImplementation((): Promise<EntityList<Account>> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.getAccounts({
      requestContext: {
        identity: {
          accountId: '1337',
        },
      },
      queryStringParameters: {
        limit: 5,
      },
    } as unknown as APIGatewayEvent);

    const resultBody: EntityList<Account> = JSON.parse(
      apiGatewayResult.body
    ) as EntityList<Account>;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockAccountResult.awsAccountId,
      5,
      undefined
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.count).toEqual(mockResult.count);
    expect(resultBody.items?.length).toEqual(mockResult.items?.length);
    expect(resultBody.items?.[0].accountType).toEqual(
      mockResult.items?.[0].accountType
    );
    expect(resultBody.items?.[0].awsAccountId).toEqual(
      mockResult.items?.[0].awsAccountId
    );
  });

  it('should get an Account list with a cursor and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccounts');
    const mockAccountResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });
    const mockResult: EntityList<Account> = {
      items: [mockAccountResult],
      count: 1,
    };

    accountServiceSpy.mockImplementation((): Promise<EntityList<Account>> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.getAccounts({
      requestContext: {
        identity: {
          accountId: '1337',
        },
      },
      queryStringParameters: {
        cursor: 'aFakeCursor123',
      },
    } as unknown as APIGatewayEvent);

    const resultBody: EntityList<Account> = JSON.parse(
      apiGatewayResult.body
    ) as EntityList<Account>;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockAccountResult.awsAccountId,
      undefined,
      'aFakeCursor123'
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.count).toEqual(mockResult.count);
    expect(resultBody.items?.length).toEqual(mockResult.items?.length);
    expect(resultBody.items?.[0].accountType).toEqual(
      mockResult.items?.[0].accountType
    );
    expect(resultBody.items?.[0].awsAccountId).toEqual(
      mockResult.items?.[0].awsAccountId
    );
  });

  it('should get an Account list with a page limit & cursor and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccounts');
    const mockAccountResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });
    const mockResult: EntityList<Account> = {
      items: [mockAccountResult],
      count: 1,
    };

    accountServiceSpy.mockImplementation((): Promise<EntityList<Account>> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.getAccounts({
      requestContext: {
        identity: {
          accountId: '1337',
        },
      },
      queryStringParameters: {
        cursor: 'aFakeCursor123',
        limit: 5,
      },
    } as unknown as APIGatewayEvent);

    const resultBody: EntityList<Account> = JSON.parse(
      apiGatewayResult.body
    ) as EntityList<Account>;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockAccountResult.awsAccountId,
      5,
      'aFakeCursor123'
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.count).toEqual(mockResult.count);
    expect(resultBody.items?.length).toEqual(mockResult.items?.length);
    expect(resultBody.items?.[0].accountType).toEqual(
      mockResult.items?.[0].accountType
    );
    expect(resultBody.items?.[0].awsAccountId).toEqual(
      mockResult.items?.[0].awsAccountId
    );
  });

  it('should recieve a malformed request missing awsAccountId and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'getAccounts');
    const mockAccountResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });
    const mockResult: EntityList<Account> = {
      items: [mockAccountResult],
      count: 1,
    };

    accountServiceSpy.mockImplementation((): Promise<EntityList<Account>> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.getAccounts({
      requestContext: {
        identity: {
          accountId: '',
        },
      },
    } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).not.toHaveBeenCalledWith();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.body).toEqual('AWS Account Id not provided.');
  });
});

describe('createAccount', () => {
  it('should create an Account as user and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'createAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.createAccount(
      {
        body: JSON.stringify({
          awsAccountId: mockResult.awsAccountId,
          accountType: mockResult.accountType,
          balance: mockResult.balance,
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    const resultBody: Account = JSON.parse(apiGatewayResult.body) as Account;

    expect(accountServiceSpy).toHaveBeenCalledWith(mockResult, true);
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(201);
    expect(resultBody).toBeDefined();
    expect(resultBody.awsAccountId).toEqual(mockResult.awsAccountId);
    expect(resultBody.accountType).toEqual(mockResult.accountType);
    expect(resultBody.balance).toEqual(mockResult.balance);
  });

  it('should create an Account as admin and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'createAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1338',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.createAccount(
      {
        body: JSON.stringify({
          awsAccountId: mockResult.awsAccountId,
          accountType: mockResult.accountType,
          balance: mockResult.balance,
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1338',
          },
        },
      } as unknown as APIGatewayEvent
    );

    const resultBody: Account = JSON.parse(apiGatewayResult.body) as Account;

    expect(accountServiceSpy).toHaveBeenCalledWith(mockResult, false);
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(201);
    expect(resultBody).toBeDefined();
    expect(resultBody.awsAccountId).toEqual(mockResult.awsAccountId);
    expect(resultBody.accountType).toEqual(mockResult.accountType);
    expect(resultBody.balance).toEqual(mockResult.balance);
  });

  it('should throw an error and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'createAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1338',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      throw new Error('Testing');
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.createAccount(
      {
        body: JSON.stringify({
          awsAccountId: mockResult.awsAccountId,
          accountType: mockResult.accountType,
          balance: mockResult.balance,
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1338',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).toHaveBeenCalledWith(mockResult, false);
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Testing');
  });

  it('should recieve malformed request and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'createAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1338',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      throw new Error('Testing');
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.createAccount(
      {
        body: JSON.stringify({}),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1338',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).toHaveBeenCalledWith(
      {
        awsAccountId: mockResult.awsAccountId,
      },
      false
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Testing');
  });

  it('should recieve undefined request and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'createAccount');
    const mockResult: Account = new Account({
      awsAccountId: '1338',
      accountType: 'Checking',
      balance: 100,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      throw new Error('Testing');
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.createAccount(
      {
        body: undefined,
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1338',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Account not provided.');
  });
});

describe('transferAccountBalance', () => {
  it('should transfer an Accounts balance to another and return 200', async () => {
    const accountServiceSpy = jest.spyOn(
      accountService,
      'transferAccountBalance'
    );
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 50,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(mockResult);
    });

    const accountTransfer: AccountTransfer = {
      transferToAwsAccountId: 'testTransfer',
      transferToAccountType: 'testAccount',
      transferAmount: 50,
    };

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.transferAccountBalance({
        body: JSON.stringify(accountTransfer),
        pathParameters: {
          accountType: mockResult.accountType,
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent);

    const resultBody: Account = JSON.parse(apiGatewayResult.body) as Account;

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockResult.awsAccountId,
      mockResult.accountType,
      accountTransfer
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(resultBody).toBeDefined();
    expect(resultBody.awsAccountId).toEqual(mockResult.awsAccountId);
    expect(resultBody.accountType).toEqual(mockResult.accountType);
    expect(resultBody.balance).toEqual(mockResult.balance);
  });

  it('should recieve a malformed request without awsAccountId and return 400', async () => {
    const accountServiceSpy = jest.spyOn(
      accountService,
      'transferAccountBalance'
    );
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 50,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(mockResult);
    });

    const accountTransfer: AccountTransfer = {
      transferToAwsAccountId: 'testTransfer',
      transferToAccountType: 'testAccount',
      transferAmount: 50,
    };

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.transferAccountBalance({
        body: JSON.stringify(accountTransfer),
        pathParameters: {
          accountType: mockResult.accountType,
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '',
          },
        },
      } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual(
      'Account and/or accountType not provided.'
    );
  });

  it('should recieve a malformed request without accountType and return 400', async () => {
    const accountServiceSpy = jest.spyOn(
      accountService,
      'transferAccountBalance'
    );
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 50,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      return Promise.resolve(mockResult);
    });

    const accountTransfer: AccountTransfer = {
      transferToAwsAccountId: 'testTransfer',
      transferToAccountType: 'testAccount',
      transferAmount: 50,
    };

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.transferAccountBalance({
        body: JSON.stringify(accountTransfer),
        pathParameters: {
          accountType: '',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual(
      'Account and/or accountType not provided.'
    );
  });

  it('should handle an error and return 400', async () => {
    const accountServiceSpy = jest.spyOn(
      accountService,
      'transferAccountBalance'
    );
    const mockResult: Account = new Account({
      awsAccountId: '1337',
      accountType: 'Checking',
      balance: 50,
    });

    accountServiceSpy.mockImplementation((): Promise<Account> => {
      throw new Error('Testing');
    });

    const accountTransfer: AccountTransfer = {
      transferToAwsAccountId: 'testTransfer',
      transferToAccountType: 'testAccount',
      transferAmount: 50,
    };

    const apiGatewayResult: APIGatewayProxyResult =
      await handler.transferAccountBalance({
        body: JSON.stringify(accountTransfer),
        pathParameters: {
          accountType: 'Checking',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent);

    expect(accountServiceSpy).toHaveBeenCalledWith(
      mockResult.awsAccountId,
      mockResult.accountType,
      accountTransfer
    );
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Testing');
  });
});

describe('deleteAccount', () => {
  it('should delete an account and return 200', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'deleteAccount');

    accountServiceSpy.mockImplementation((): Promise<boolean> => {
      return Promise.resolve(true);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.deleteAccount(
      {
        pathParameters: {
          accountType: 'Checking',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).toHaveBeenCalledWith('1337', 'Checking');
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(204);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('No Content.');
  });

  it('should recieve malformed request missing awsAccountId and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'deleteAccount');

    accountServiceSpy.mockImplementation((): Promise<boolean> => {
      return Promise.resolve(true);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.deleteAccount(
      {
        pathParameters: {
          accountType: 'Checking',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Attribute accountType not provided.');
  });

  it('should recieve malformed request missing accountType and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'deleteAccount');

    accountServiceSpy.mockImplementation((): Promise<boolean> => {
      return Promise.resolve(true);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.deleteAccount(
      {
        pathParameters: {
          accountType: '',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Attribute accountType not provided.');
  });

  it('should not find account return 404', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'deleteAccount');

    accountServiceSpy.mockImplementation((): Promise<boolean> => {
      return Promise.resolve(false);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.deleteAccount(
      {
        pathParameters: {
          accountType: 'Checking',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).toHaveBeenCalledWith('1337', 'Checking');
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(404);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Account by accountType not found.');
  });

  it('should handle errors and return 400', async () => {
    const accountServiceSpy = jest.spyOn(accountService, 'deleteAccount');

    accountServiceSpy.mockImplementation((): Promise<boolean> => {
      throw new Error('Testing');
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.deleteAccount(
      {
        pathParameters: {
          accountType: 'Checking',
        },
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceSpy).toHaveBeenCalledWith('1337', 'Checking');
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Testing');
  });
});

describe('updateBusinessPartner', () => {
  it('should update a businessPartner and return 200', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: true,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '1337',
        },
        body: JSON.stringify({
          admin: true
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).toHaveBeenCalledWith('1337');
    expect(accountServiceUpdateSpy).toHaveBeenCalledWith('1337', true);
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(200);
    expect(apiGatewayResult.body).toBeDefined();
    expect(JSON.parse(apiGatewayResult.body)).toEqual(mockResult);
  });

  it('should recieve a malformed request missing caller identity and return 400', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: true,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '1337',
        },
        body: JSON.stringify({
          admin: true
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).not.toHaveBeenCalled();
    expect(accountServiceUpdateSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Missing/improper body containing admin boolean flag');
  });

  it('should recieve a malformed request missing awsAccountId pathParameter and return 400', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: true,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '',
        },
        body: JSON.stringify({
          admin: true
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).not.toHaveBeenCalled();
    expect(accountServiceUpdateSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Missing/improper body containing admin boolean flag');
  });

  it('should recieve a malformed request missing body and return 400', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: true,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '',
        },
        body: undefined,
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).not.toHaveBeenCalled();
    expect(accountServiceUpdateSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Missing/improper body containing admin boolean flag');
  });

  it('should recieve a malformed request improper body and return 400', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: true,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '1337',
        },
        body: JSON.stringify({
          admin: 'true'
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1337',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).not.toHaveBeenCalled();
    expect(accountServiceUpdateSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('Missing/improper body containing admin boolean flag');
  });

  it('should handle errors and return 400', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: false,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '1338',
        },
        body: JSON.stringify({
          admin: true
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1338',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).toHaveBeenCalledWith('1338');
    expect(accountServiceUpdateSpy).not.toHaveBeenCalled();
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('You shall not pass.');
  });

  it('should handle improper access and return 400', async () => {
    const accountServiceUpdateSpy = jest.spyOn(accountService, 'updateBusinessPartner');
    const accountServiceGetSpy = jest.spyOn(accountService, 'getBusinessPartner');
    const mockResult: BusinessPartner = new BusinessPartner({
      awsAccountId: '1337',
      accountCount: 1,
      admin: true,
    });

    accountServiceUpdateSpy.mockImplementation((): Promise<BusinessPartner> => {
      throw new Error('Testing');
    });

    accountServiceGetSpy.mockImplementation((): Promise<BusinessPartner> => {
      return Promise.resolve(mockResult);
    });

    const apiGatewayResult: APIGatewayProxyResult = await handler.updateBusinessPartner(
      {
        pathParameters: {
          awsAccountId: '1338',
        },
        body: JSON.stringify({
          admin: true
        }),
        requestContext: {
          accountId: '1337',
          identity: {
            accountId: '1338',
          },
        },
      } as unknown as APIGatewayEvent
    );

    expect(accountServiceGetSpy).toHaveBeenCalledWith('1338');
    expect(accountServiceUpdateSpy).toHaveBeenCalledWith('1338', true);
    expect(apiGatewayResult).toBeDefined();
    expect(apiGatewayResult.statusCode).toEqual(400);
    expect(apiGatewayResult.body).toBeDefined();
    expect(apiGatewayResult.body).toEqual('You shall not pass.');
  });
});
