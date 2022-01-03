/**
 * Serverless.config.js file gives more flexibility into building stage specific variables.
 *
 * Define once, use across all serverless files, similar to a terraform vars file.
 *
 * @param {}
 * @returns Config values to be consumed in serverless.yml
 */
module.exports = async ({ resolveVariable }) => {
  const stage = await resolveVariable(`opt:stage, "dev"`);
  const region = await resolveVariable(`opt:region, "us-east-2"`); // Never trust us-east-1 :P
  const dynamodb = `account-dynamodb-${stage}`;
  const dynamodbArnExport = `account-dynamodb-${stage}-arn`;
  const deploymentBucket = `sanders-account-service`;
  return {
    stage,
    region,
    dynamodb,
    dynamodbArnExport,
    deploymentBucket,
  };
};
