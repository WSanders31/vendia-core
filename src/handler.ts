import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import Account from './Account';
import EntityList from './EntityList';
import { accountService } from '.';
import AccountTransfer from './AccountTransfer';

export async function getAccountBalance(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('getAccountBalance recieved event', event);

  const awsAccountId: string | null = event.requestContext?.identity?.accountId;
  const accountType: string | undefined = event.pathParameters?.accountType;

  if (awsAccountId && accountType) {
    const account: Account | undefined = await accountService.getAccount(
      awsAccountId,
      accountType
    );

    if (account) {
      return {
        statusCode: 200,
        body: JSON.stringify({
          balance: account.balance,
        }),
      };
    }

    return {
      statusCode: 404,
      body: 'Account not found',
    };
  }

  return {
    statusCode: 400,
    body: 'AWS Account Id or Account Type not specified.',
  };
}

export async function getAccounts(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('getAccounts recieved event', event);

  const awsAccountId: string | null = event.requestContext?.identity?.accountId;

  if (awsAccountId) {
    const accounts: EntityList<Account> = await accountService.getAccounts(
      awsAccountId
    );

    return {
      statusCode: 200,
      body: JSON.stringify(accounts),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify([]),
  };
}

export async function createAccount(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('createAccount recieved event', event);

  if (event.body) {
    const request = {
      ...JSON.parse(event.body),
      awsAccountId: event.requestContext?.identity?.accountId,
    } as Account;
    const isAdmin = event.requestContext.accountId === request.awsAccountId;
    
    const account: Account = await accountService.createAccount(request, isAdmin);

    return {
      statusCode: 201,
      body: JSON.stringify(account),
    };
  }

  return {
    statusCode: 400,
    body: 'Account not provided.',
  };
}

export async function transferAccountBalance(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('transferAccountBalance recieved event', event);

  if (event.body && event.requestContext?.identity?.accountId) {
    const request = JSON.parse(event.body) as AccountTransfer;
    const awsAccountId = event.requestContext.identity.accountId;
    const accountType: string | undefined = event.pathParameters?.accountType;

    if (awsAccountId && accountType) {
      const account: Account | null =
        await accountService.transferAccountBalance(
          awsAccountId,
          accountType,
          request
        );

      return {
        statusCode: 200,
        body: JSON.stringify(account),
      };
    }
  }

  return {
    statusCode: 400,
    body: 'Account and/or accountType not provided.',
  };
}

export async function deleteAccount(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('deleteAccount recieved event', event);

  const awsAccountId: string | null = event.requestContext?.identity?.accountId;
  const accountType: string | undefined = event.pathParameters?.accountType;
  if (accountType && awsAccountId) {
    const deleted: boolean = await accountService.deleteAccount(
      awsAccountId,
      accountType
    );

    if (deleted) {
      return {
        statusCode: 204,
        body: 'No Content.',
      };
    }

    return {
      statusCode: 404,
      body: 'Account by accountType not found.',
    };
  }

  return {
    statusCode: 400,
    body: 'Attribute accountType not provided.',
  };
}
