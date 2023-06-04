import AWS from "aws-sdk";

interface AwsCredentials {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken?: string;
}

export function getAwsInstance<T extends AWS.Service>(
  service: new (config?: AWS.ConfigurationOptions) => T,
  credentials?: AwsCredentials
): T {
  const awsConfig: AWS.ConfigurationOptions = {
    region: credentials?.region || process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: credentials?.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey:
        credentials?.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
      //   sessionToken: credentials?.sessionToken || process.env.AWS_SESSION_TOKEN,
    },
  } as AWS.ConfigurationOptions;

  const aws = new service(awsConfig);
  return aws;
}
