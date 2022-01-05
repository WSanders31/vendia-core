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