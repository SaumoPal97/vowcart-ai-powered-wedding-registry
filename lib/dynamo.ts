import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { awsCredentialsProvider } from "@vercel/functions/oidc"

// DynamoDB uses its own IAM role / region, distinct from Aurora.
const region = process.env.DYNAMODB_AWS_REGION || process.env.AWS_REGION
const roleArn = process.env.DYNAMODB_AWS_ROLE_ARN || process.env.AWS_ROLE_ARN

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME as string
export const PK = process.env.DYNAMODB_TABLE_PARTITION_KEY || "PK"
export const SK = process.env.DYNAMODB_TABLE_SORT_KEY || "SK"

const client = new DynamoDBClient({
  region,
  credentials: awsCredentialsProvider({
    roleArn: roleArn as string,
    clientConfig: { region },
  }),
})

export const docClient = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
})

/** Build a composite key object using the table's configured key names. */
export function key(pk: string, sk: string) {
  return { [PK]: pk, [SK]: sk }
}

export function nowSeconds() {
  return Math.floor(Date.now() / 1000)
}

/** DynamoDB is only reachable when the integration env vars are present. */
export function isDynamoConfigured(): boolean {
  return Boolean(TABLE_NAME && region && roleArn)
}
