import { Attribute, Entity } from '@typedorm/common';

// Bare minimum attributes needed to build proper record keys.
export interface RequiredAttributes {
  awsAccountId: string;
}

@Entity({
  name: BusinessPartner.ENTITY_NAME,
  primaryKey: {
    partitionKey: `AWS_ACCOUNT_ID#{{awsAccountId}}`,
    sortKey: `__EN#${BusinessPartner.ENTITY_NAME}`,
  },
})
export default class BusinessPartner {
  public constructor(
    requiredAttributes: RequiredAttributes & Partial<BusinessPartner>
  ) {
    this.accountCount = 0;
    Object.assign(this, requiredAttributes);
    this.awsAccountId = requiredAttributes.awsAccountId;
  }

  public static ENTITY_NAME = 'BusinessPartner';

  @Attribute()
  public awsAccountId: string;

  @Attribute()
  public accountCount: number;

  @Attribute()
  public admin?: boolean;
}
