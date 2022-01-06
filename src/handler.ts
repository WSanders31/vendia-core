import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda';
import Account from './Account';
import EntityList from './EntityList';
import { accountService } from '.';
import AccountTransfer from './AccountTransfer';
import BusinessPartner from './BusinessPartner';

export async function getAccountBalance(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('handler.getAccountBalance', event);

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
  console.log('handler.getAccounts', event);

  const awsAccountId: string | null = event.requestContext?.identity?.accountId;
  const limit: number | undefined = event.queryStringParameters?.limit
    ? parseInt(event.queryStringParameters.limit)
    : undefined;
  const cursor: string | undefined = event.queryStringParameters?.cursor;

  if (awsAccountId) {
    const accounts: EntityList<Account> = await accountService.getAccounts(
      awsAccountId,
      limit,
      cursor
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        ...accounts,
        ...(accounts.cursor && { cursor: encodeURIComponent(accounts.cursor) }),
      }),
    };
  }

  return {
    statusCode: 400,
    body: 'AWS Account Id not provided.',
  };
}

/**
 * First account created by the owner of the infrastructure is also gifted admin rights. This is done
 * by a comparison of the caller identity accountId and the requestContext accountId. If they match, admin
 * rights are gifted to the BusinessPartner record.
 */
export async function createAccount(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('handler.createAccount', event);

  if (event.body) {
    const request = {
      ...JSON.parse(event.body),
      awsAccountId: event.requestContext?.identity?.accountId,
    } as Account;
    const isAdmin = event.requestContext.accountId === request.awsAccountId;

    try {
      const account: Account | undefined = await accountService.createAccount(
        request,
        isAdmin
      );
      console.log('Account created: ', account);
      return {
        statusCode: 201,
        body: JSON.stringify(account),
      };
    } catch (e) {
      if (e instanceof Error) {
        return {
          statusCode: 400,
          body: e.message,
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: 'Account not provided.',
  };
}

export async function transferAccountBalance(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('handler.transferAccountBalance', event);

  if (event.body && event.requestContext?.identity?.accountId) {
    const request = JSON.parse(event.body) as AccountTransfer;
    const awsAccountId = event.requestContext.identity.accountId;
    const accountType: string | undefined = event.pathParameters?.accountType;

    if (awsAccountId && accountType) {
      try {
        const account: Account | undefined =
          await accountService.transferAccountBalance(
            awsAccountId,
            accountType,
            request
          );
        console.log('Account balance transfered: ', request, account);
        return {
          statusCode: 200,
          body: JSON.stringify(account),
        };
      } catch (e) {
        if (e instanceof Error) {
          return {
            statusCode: 400,
            body: e.message,
          };
        }
      }
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
  console.log('handler.deleteAccount', event);

  const awsAccountId: string | null = event.requestContext?.identity?.accountId;
  const accountType: string | undefined = event.pathParameters?.accountType;
  if (accountType && awsAccountId) {
    try {
      const deleted: boolean = await accountService.deleteAccount(
        awsAccountId,
        accountType
      );

      if (deleted) {
        console.log('Account Deleted', { awsAccountId, accountType });
        return {
          statusCode: 204,
          body: 'No Content.',
        };
      }

      return {
        statusCode: 404,
        body: 'Account by accountType not found.',
      };
    } catch (e) {
      if (e instanceof Error) {
        return {
          statusCode: 400,
          body: e.message,
        };
      }
    }
  }

  return {
    statusCode: 400,
    body: 'Attribute accountType not provided.',
  };
}

export async function updateBusinessPartner(
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> {
  console.log('handler.updateBusinessPartner', event);
  const awsAccountId: string | undefined = event.pathParameters?.awsAccountId;
  const callerAWSAccountId: string | null =
    event.requestContext?.identity?.accountId;
  if (
    !callerAWSAccountId ||
    !awsAccountId ||
    !event.body ||
    JSON.parse(event.body).admin === undefined ||
    typeof JSON.parse(event.body).admin !== 'boolean'
  ) {
    return {
      statusCode: 400,
      body: 'Missing/improper body containing admin boolean flag',
    };
  }

  const caller: BusinessPartner | undefined =
    await accountService.getBusinessPartner(callerAWSAccountId);
  if (!caller || !caller.admin) {
    return {
      statusCode: 400,
      body: `You shall not pass.`,
    };
  }
  try {
    const admin: boolean = JSON.parse(event.body).admin;
    const businessPartner = await accountService.updateBusinessPartner(
      awsAccountId,
      admin
    );

    return {
      statusCode: 200,
      body: JSON.stringify(businessPartner),
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: `You shall not pass.`,
    };
  }
}
