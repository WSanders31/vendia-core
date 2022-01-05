# Vendia Core Engineer Assignment - Banking (Account) API

## Quickstart

A few scripts exist to simplify how to deploy this application in an `AWS` environment. As long as `AWS` credentials are configured, setup should be simple. 

*Deploy* - `npm i && npm run deploy` (`--stage=yourstage` can also be passed in)

This will deploy infrastructure stacks in proper order, as well upload code artifacts - everything will be operational after this command is run.

*Destroy* - `npm run destroy` (`--stage=yourstage` can also be passed in)

This will tear down all of the infrastructure stacks in proper order, leaving a clean AWS environment.

*Individual Deploys* - `npx sls deploy -c=serverless.file.yml` (`--stage=yourstage` can also be passed in)

You can, of course, also deploy individual stacks by themselves if necessary.

*Test* - `npm run test`

This will run Jest tests in silent mode. 

*Lint* - `npm run lint`

*Format* - `npm run format`

## API Documentation

```
api_id: 9h65exm6ld
region: us-east-2
stage dev
```

GET `https://{{api_id}}.execute-api.{{region}}.amazonaws.com/{{stage}}/accounts`

GET `https://{{api_id}}.execute-api.{{region}}.amazonaws.com/{{stage}}/accounts/{accountType}`

POST `https://{{api_id}}.execute-api.{{region}}.amazonaws.com/{{stage}}/accounts`
```
{ "accountType": string, "balance": number }
```

DELETE `https://{{api_id}}.execute-api.{{region}}.amazonaws.com/{{stage}}/accounts/{accountType}`

POST `https://{{api_id}}.execute-api.{{region}}.amazonaws.com/{{stage}}/accounts/{accountType}`
```
{ "transferToAwsAccountId": string, "transferToAccountType": string, "transferAmount": number }
```

PATCH `https://{{api_id}}.execute-api.{{region}}.amazonaws.com/{{stage}}/partners/{awsAccountId}`
```
{ "admin": true }
```

## Tooling

`Serverless Framework` - There are a lot of things I don't like about Serverless Framework, and I don't believe they're the competitive choice in the space anymore. Their docs are hard to follow, and a lot of "features" seem to be one-off attributes you specify in yml. Often times I end up having to utilize more CloudFormation anyways, because it grants greater control. Serverless Framework also seems to instill a lot of bad practices out of the box. Creates many buckets, stores all historic logs, versions every deployment, to name a few, which can cause problems in the future.

In this instance, however, it seemed like the quickest method to get started, and the lowest friction option to get up and running.

`Typescript` - I'm a big fan of Typescript, I like the added safety it brings as well as the developer experience it offers. Hopefully it makes the application more readable. 

`TypedORM` - I've spent quite a bit of time playing around with different DynamoDB clients. With Typescript, `dynamodb-data-mapper-annotations` is a great choice, but still requires a lot of boilerplate code, as well as no longer being supported. Nested deep in Github issues, it sounds like [TypedORM](https://github.com/typedorm/typedorm) is eventually going to be integrated into [TypeORM](https://github.com/typeorm/typeorm) which is a great library for Typescript database clients. 

TypedORM doesn't currently appear to support strong read consistency, I opened a GitHub issue.

`Jest` - For testing, self explanatory.

## Infrastructure

Infrastructure is divided into 3 separate stacks to increase control over certain aspects of the service.

`serverless.static.yml` only owns an S3 bucket, to reduce the amount of buckets created by `serverless framework` and reuse a single bucket for all deployments / artifacts, across all stage deployments.

`serverless.data.yml` owns the dynamodb datastore. It follows single-table design with both partition and sort keys being strings. I've defined a single GSI but opted not to utilize it. It's an on-demand instance for scalability purposes. Having the datastore separate allows for more fine grained control over different aspects, keeping stateful infrastructure separate was the intention.

`serverless.yml` owns the rest of the application, being an API Gateway, multiple Lambda functions, IAM permissions, and CloudWatch log groups for each. It utilizes a cross-stack reference to `serverless.data.yml` to permit itself access to that specific datastore. Proper nodejs environment variables are set here so the runtime can be aware of certain things, like a dynamodb table to communicate to.

`serverless.vars.js` this is something I don't see widely used in the serverless framework space, and is more reminiscent of terraform variables, but it's a great way to centralize naming conventions, and gives you the power and flexibility of javascript to interpolate.

![image](https://user-images.githubusercontent.com/3769409/148006157-65e4f0ff-15f5-4ef3-a326-a4026c94db0a.png)

## Project Structure

The core of the application is found in `./src`, `index.ts` being the entry point. `index.ts` bootstraps the runtime, instantiating singletons needed to run the application as well as establish a connection to dynamodb. 

The application is essentially split into three verticals to follow separation of concerns: `handler.ts`, `AccountService.ts` and `AccountRepository.ts`. 

`handler.ts` - responsible for handling communication to and from API Gateway, consumes API Gateway events, maps data and communicates action to `AccountService`.

`AccountService.ts` - responsible for any 'business' logic that may need to take place. Handles communication to and from `AccountRepository`.

`AccountRepository.ts` - responsible for communication to and from DynamoDB. 

![image](https://user-images.githubusercontent.com/3769409/148008257-8036fd96-2707-4161-bb51-34ed6f136a4a.png)

## Data Modeling

`BusinessPartner.ts` - Stores meta data about an AWS account, such as an admin flag, and total count of existing accounts. Has many relationship to Accounts.
```
partitionKey: `AWS_ACCOUNT_ID#{{awsAccountId}}`,
sortKey: `__EN#${BusinessPartner.ENTITY_NAME}`,

Only one record can exist per AWS Account, used to enforce certain permissions / limitations.
```

`Account.ts` - Each Account represents a single AWS Account Id + Account Type combination, housing a balance. Has one relationship to a BusinessPartner.
```
partitionKey: `__EN#${Account.ENTITY_NAME}#AWS_ACCOUNT_ID#{{awsAccountId}}`,
sortKey: `ACCOUNT_TYPE#{{accountType}}`,

Up to 10 AccountTypes per Partition. Can query by Partition Key to get a BusinessPartners' list of accounts, or a full key to get a specific accounts balance.
```

`AccountTransfer.ts` - Used as an interface for transfering balances between accounts. 
