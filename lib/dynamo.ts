import { DynamoDBClient } from "@aws-sdk/client-dynamodb"
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb"
import { awsCredentials } from "@/lib/aws-credentials"

// DynamoDB uses its own IAM role / region, distinct from Aurora.
const region = process.env.DYNAMODB_AWS_REGION || process.env.AWS_REGION
const roleArn = process.env.DYNAMODB_AWS_ROLE_ARN || process.env.AWS_ROLE_ARN

export const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME as string
export const PK = process.env.DYNAMODB_TABLE_PARTITION_KEY || "PK"
export const SK = process.env.DYNAMODB_TABLE_SORT_KEY || "SK"

// Credentials resolve via OIDC on Vercel, or the default AWS chain locally.
const client = new DynamoDBClient({
  region,
  credentials: awsCredentials({ roleArn, region }),
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

/** DynamoDB is usable once a table name + region are configured. */
export function isDynamoConfigured(): boolean {
  return Boolean(TABLE_NAME && region)
}
