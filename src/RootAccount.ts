import { Attribute, Entity } from '@typedorm/common';

// Bare minimum attributes needed to build proper record keys.
export interface RequiredAttributes {
  awsAccountId: string;
}

@Entity({
  name: RootAccount.ENTITY_NAME,
  primaryKey: {
    partitionKey: `AWS_ACCOUNT_ID#{{awsAccountId}}`,
    sortKey: `__EN#${RootAccount.ENTITY_NAME}`,
  },
})
export default class RootAccount {
  public constructor(
    requiredAttributes: RequiredAttributes & Partial<RootAccount>
  ) {
    Object.assign(this, requiredAttributes);
    this.awsAccountId = requiredAttributes.awsAccountId;
    this.accountCount = 0;
  }

  public static ENTITY_NAME = 'RootAccount';

  @Attribute()
  public awsAccountId: string;

  @Attribute()
  public accountCount: number;

  @Attribute()
  public admin?: boolean;
}
