import { DynamoDB } from "aws-sdk";

export default interface EntityList<T> {
  items: T[] | undefined;
  unknownItems?: DynamoDB.DocumentClient.AttributeMap[] | undefined;
  cursor?: Record<string, string> | null;
}
