import { Attribute, Entity } from '@typedorm/common';

// Bare minimum attributes needed to build proper record keys.
export interface RequiredAttributes {
  awsAccountId: string;
  accountType: string;
}

@Entity({
  name: Account.ENTITY_NAME,
  primaryKey: {
    partitionKey: `__EN#${Account.ENTITY_NAME}#AWS_ACCOUNT_ID#{{awsAccountId}}`,
    sortKey: `ACCOUNT_TYPE#{{accountType}}`,
  },
})
export default class Account {
  public constructor(
    requiredAttributes: RequiredAttributes & Partial<Account>
  ) {
    Object.assign(this, requiredAttributes);
    this.awsAccountId = requiredAttributes.awsAccountId;
    this.accountType = requiredAttributes.accountType;
    this.balance = requiredAttributes.balance || 0;
  }

  public static ENTITY_NAME = 'Account';

  @Attribute()
  public awsAccountId: string;

  @Attribute()
  public accountType: string;

  @Attribute()
  public balance: number;
}
