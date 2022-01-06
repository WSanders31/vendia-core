import { EntityManager, TransactionManager } from '@typedorm/core';
import Account from '../../src/Account';
import AccountRepository from '../../src/AccountRepository';
import { AWSError, DynamoDB, Request } from 'aws-sdk';
import { DocumentClient, ScanOutput } from 'aws-sdk/clients/dynamodb';

describe('getAccounts', () => {
  it('should call entity manager and return an entityList', async () => {
    const entityManager: EntityManager = {
      find: jest.fn(),
    } as unknown as EntityManager;

    const accountRepository: AccountRepository = new AccountRepository(
      entityManager,
      {} as TransactionManager,
      {} as DocumentClient
    );

    const returnEntityList: {
      items: unknown[];
      cursor?: DynamoDB.DocumentClient.Key | undefined;
    } = {
      items: [new Account({ awsAccountId: '1337', accountType: 'Checking' })],
    };
    const entityManagerSpy = jest
      .spyOn(entityManager, 'find')
      .mockReturnValue(Promise.resolve(returnEntityList));

    const result = await accountRepository.getAccounts('1337');

    expect(entityManagerSpy).toHaveBeenCalledWith(
      Account,
      { awsAccountId: '1337' },
      { limit: undefined, select: ['awsAccountId', 'accountType'] }
    );
    expect(result.items?.length).toEqual(1);
    expect(result.items?.[0]).toEqual(returnEntityList.items[0]);
    expect(result.count).toEqual(1);
  });

  it('should call entity manager with a limit and return an entityList', async () => {
    const entityManager: EntityManager = {
      find: jest.fn(),
    } as unknown as EntityManager;

    const accountRepository: AccountRepository = new AccountRepository(
      entityManager,
      {} as TransactionManager,
      {} as DocumentClient
    );

    const returnEntityList: {
      items: unknown[];
      cursor?: DynamoDB.DocumentClient.Key | undefined;
    } = {
      items: [new Account({ awsAccountId: '1337', accountType: 'Checking' })],
    };
    const entityManagerSpy = jest
      .spyOn(entityManager, 'find')
      .mockReturnValue(Promise.resolve(returnEntityList));

    const result = await accountRepository.getAccounts('1337', 2);

    expect(entityManagerSpy).toHaveBeenCalledWith(
      Account,
      { awsAccountId: '1337' },
      { limit: 2, select: ['awsAccountId', 'accountType'] }
    );
    expect(result.items?.length).toEqual(1);
    expect(result.items?.[0]).toEqual(returnEntityList.items[0]);
    expect(result.count).toEqual(1);
  });

  it('should call entity manager with a cursor and return an entityList', async () => {
    const entityManager: EntityManager = {
      find: jest.fn(),
    } as unknown as EntityManager;

    const accountRepository: AccountRepository = new AccountRepository(
      entityManager,
      {} as TransactionManager,
      {} as DocumentClient
    );

    const returnEntityList: {
      items: unknown[];
      cursor?: DynamoDB.DocumentClient.Key | undefined;
    } = {
      items: [new Account({ awsAccountId: '1337', accountType: 'Checking' })],
    };
    const entityManagerSpy = jest
      .spyOn(entityManager, 'find')
      .mockReturnValue(Promise.resolve(returnEntityList));

    const result = await accountRepository.getAccounts(
      '1337',
      undefined,
      accountRepository.encodeCursor({ pk: 'fakeCursor' })
    );

    expect(entityManagerSpy).toHaveBeenCalledWith(
      Account,
      { awsAccountId: '1337' },
      {
        limit: undefined,
        cursor: { pk: 'fakeCursor' },
        select: ['awsAccountId', 'accountType'],
      }
    );
    expect(result.items?.length).toEqual(1);
    expect(result.items?.[0]).toEqual(returnEntityList.items[0]);
    expect(result.count).toEqual(1);
  });

  it('should call entity manager with a limit and cursor and return an entityList', async () => {
    const entityManager: EntityManager = {
      find: jest.fn(),
    } as unknown as EntityManager;

    const accountRepository: AccountRepository = new AccountRepository(
      entityManager,
      {} as TransactionManager,
      {} as DocumentClient
    );

    const returnEntityList: {
      items: unknown[];
      cursor?: DynamoDB.DocumentClient.Key | undefined;
    } = {
      items: [new Account({ awsAccountId: '1337', accountType: 'Checking' })],
    };
    const entityManagerSpy = jest
      .spyOn(entityManager, 'find')
      .mockReturnValue(Promise.resolve(returnEntityList));

    const result = await accountRepository.getAccounts(
      '1337',
      5,
      accountRepository.encodeCursor({ pk: 'fakeCursor' })
    );

    expect(entityManagerSpy).toHaveBeenCalledWith(
      Account,
      { awsAccountId: '1337' },
      {
        limit: 5,
        cursor: { pk: 'fakeCursor' },
        select: ['awsAccountId', 'accountType'],
      }
    );
    expect(result.items?.length).toEqual(1);
    expect(result.items?.[0]).toEqual(returnEntityList.items[0]);
    expect(result.count).toEqual(1);
  });

  it('should call entity manager and handle an empty entityList', async () => {
    const entityManager: EntityManager = {
      find: jest.fn(),
    } as unknown as EntityManager;

    const accountRepository: AccountRepository = new AccountRepository(
      entityManager,
      {} as TransactionManager,
      {} as DocumentClient
    );

    const returnEntityList: {
      items: unknown[];
      cursor?: DynamoDB.DocumentClient.Key | undefined;
    } = {
      items: [],
    };
    const entityManagerSpy = jest
      .spyOn(entityManager, 'find')
      .mockReturnValue(Promise.resolve(returnEntityList));

    const result = await accountRepository.getAccounts('1337');

    expect(entityManagerSpy).toHaveBeenCalledWith(
      Account,
      { awsAccountId: '1337' },
      { limit: undefined, select: ['awsAccountId', 'accountType'] }
    );
    expect(result.items?.length).toEqual(0);
    expect(result.count).toEqual(0);
  });
});

describe('scanAccounts', () => {
  it('should call dynamodbClient scan and return an entityList', async () => {
    const dynamodbClient: DocumentClient = {
      scan: jest.fn(),
    } as unknown as DocumentClient;

    const returnAccount: Account = new Account({
        awsAccountId: '1337',
        accountType: 'Checking'
    });

    const dynamodbClientSpy = jest
      .spyOn(dynamodbClient, 'scan')
      .mockReturnValue({
        promise: () => {
          return Promise.resolve({
            Items: [returnAccount],
            Count: 1,
            LastEvaluatedKey: '',
          });
        },
      } as unknown as Request<ScanOutput, AWSError>);

      const accountRepository: AccountRepository = new AccountRepository(
        {} as EntityManager,
        {} as TransactionManager,
        dynamodbClient
      );

      const result = await accountRepository.scanAccounts();

      expect(dynamodbClientSpy).toHaveBeenCalledTimes(1);
      expect(dynamodbClientSpy).toHaveBeenCalledWith({
        TableName: 'DynamoDB Table not defined.',
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
        Limit: undefined,
        ExclusiveStartKey: accountRepository.decodeCursor(''),
      });
      expect(result).toBeDefined();
      expect(result.count).toEqual(1);
      expect(result.items?.[0]).toEqual(returnAccount);
      expect(result.cursor).toBeUndefined();
  });

  it('should call dynamodbClient scan, recurse until limit is met, and return an entityList', async () => {
    const dynamodbClient: DocumentClient = {
        scan: jest.fn(),
      } as unknown as DocumentClient;
  
      const returnAccount: Account = new Account({
          awsAccountId: '1337',
          accountType: 'Checking'
      });
  
      const dynamodbClientSpy = jest
        .spyOn(dynamodbClient, 'scan')
        .mockReturnValueOnce({
          promise: () => {
            return Promise.resolve({
              Items: [returnAccount],
              Count: 1,
              LastEvaluatedKey: '123',
            });
          },
        } as unknown as Request<ScanOutput, AWSError>)
        .mockReturnValueOnce({
            promise: () => {
              return Promise.resolve({
                Items: [returnAccount],
                Count: 1,
                LastEvaluatedKey: { pk: '123'},
              });
            },
          } as unknown as Request<ScanOutput, AWSError>);
  
        const accountRepository: AccountRepository = new AccountRepository(
          {} as EntityManager,
          {} as TransactionManager,
          dynamodbClient
        );
  
        const result = await accountRepository.scanAccounts(2);
  
        expect(dynamodbClientSpy).toHaveBeenCalledTimes(2);
        expect(result).toBeDefined();
        expect(result.count).toEqual(2);
        expect(result.items?.[0]).toEqual(returnAccount);
        expect(result.cursor).toEqual(accountRepository.encodeCursor({ pk: '123'}));
  });

  it('should call dynamodbClient scan, recurse until no more cursors are returned, and return an entityList', async () => {
    const dynamodbClient: DocumentClient = {
        scan: jest.fn(),
      } as unknown as DocumentClient;
  
      const returnAccount: Account = new Account({
          awsAccountId: '1337',
          accountType: 'Checking'
      });
  
      const dynamodbClientSpy = jest
        .spyOn(dynamodbClient, 'scan')
        .mockReturnValueOnce({
          promise: () => {
            return Promise.resolve({
              Items: [returnAccount],
              Count: 1,
              LastEvaluatedKey: '123',
            });
          },
        } as unknown as Request<ScanOutput, AWSError>)
        .mockReturnValueOnce({
            promise: () => {
              return Promise.resolve({
                Items: [returnAccount],
                Count: 1,
                LastEvaluatedKey: { pk: '1234'},
              });
            },
          } as unknown as Request<ScanOutput, AWSError>)
          .mockReturnValueOnce({
            promise: () => {
              return Promise.resolve({
                Items: [returnAccount],
                Count: 1,
                LastEvaluatedKey: undefined,
              });
            },
          } as unknown as Request<ScanOutput, AWSError>);
  
        const accountRepository: AccountRepository = new AccountRepository(
          {} as EntityManager,
          {} as TransactionManager,
          dynamodbClient
        );
  
        const result = await accountRepository.scanAccounts(3);
  
        expect(dynamodbClientSpy).toHaveBeenCalledTimes(3);
        expect(result).toBeDefined();
        expect(result.count).toEqual(3);
        expect(result.items?.[0]).toEqual(returnAccount);
        expect(result.cursor).toBeUndefined();
  });

  it('should call dynamodbClient scan with limit and return an entityList', async () => {});

  it('should call dynamodbClient scan with cursor and return an entityList', async () => {});

  it('should call dynamodbClient scan with limit and cursor and return an entityList', async () => {});

  it('should call dynamodbClient scan and return an empty entityList', async () => {});
});

describe('getAccount', () => {
  it('should call entityManager findOne and return an Account', async () => {});

  it('should call entityManager findOne and return undefined', async () => {});
});

describe('getBusinessPartner', () => {
  it('should call entityManager findOne and return a BusinessPartner', async () => {});

  it('should call entityManager findOne and return undefined', async () => {});
});

describe('createAccount', () => {});

describe('transferAccountBalance', () => {});

describe('deleteAccount', () => {});

describe('updateBusinessPartner', () => {});

describe('decodeCursor', () => {});

describe('encodeCursor', () => {});
