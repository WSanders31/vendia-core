import aws4 from 'aws4';
import AWS from 'aws-sdk';

export default function sign() {
  const creds = new AWS.SharedIniFileCredentials({
    profile: process.env.profile || 'default',
  });

  const signature = aws4.sign(
    {
      region: process.env.region || 'us-east-2',
      service: process.env.service || 'execute-api',
    },
    creds
  );

  return signature;
}
