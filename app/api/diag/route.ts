import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
  const keys = Object.keys(process.env)
    .filter((k) => /PG|AWS|DYNAMO|OIDC|VERCEL/i.test(k))
    .sort()
  return NextResponse.json({
    matchedKeys: keys,
    pghost: Boolean(process.env.PGHOST),
    awsRegion: process.env.AWS_REGION ?? null,
    awsRoleArn: Boolean(process.env.AWS_ROLE_ARN),
    oidc: Boolean(process.env.VERCEL_OIDC_TOKEN),
    dynamoTable: Boolean(process.env.DYNAMODB_TABLE_NAME),
    dynamoRole: Boolean(process.env.DYNAMODB_AWS_ROLE_ARN),
  })
}
