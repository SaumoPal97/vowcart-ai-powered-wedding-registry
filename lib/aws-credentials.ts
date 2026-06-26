import { awsCredentialsProvider } from "@vercel/functions/oidc"

/**
 * Resolves AWS credentials for both deployment models:
 *
 * - On Vercel (a `VERCEL_OIDC_TOKEN` is present) we federate via OIDC into the
 *   provided IAM role — no long-lived keys.
 * - Anywhere else (local `next dev`, EC2/ECS, CI) we return `undefined`, which
 *   tells the AWS SDK / RDS Signer to use its DEFAULT credential chain:
 *   `AWS_ACCESS_KEY_ID`/`AWS_SECRET_ACCESS_KEY` env vars, the shared
 *   `~/.aws/credentials` profile (`AWS_PROFILE`), SSO, or an instance role.
 *
 * Returning `undefined` is intentional — every consumer (DynamoDBClient,
 * Signer) treats an omitted `credentials` field as "use the default chain".
 */
export function awsCredentials(opts: { roleArn?: string; region?: string }) {
  // OIDC is available on Vercel deployments (VERCEL is set; the token is vended
  // at runtime via an internal metadata API, so it is NOT always in
  // process.env) and locally after `vercel env pull` (VERCEL_OIDC_TOKEN set).
  const oidcAvailable = Boolean(process.env.VERCEL || process.env.VERCEL_OIDC_TOKEN)
  if (oidcAvailable && opts.roleArn) {
    return awsCredentialsProvider({
      roleArn: opts.roleArn,
      clientConfig: { region: opts.region },
    })
  }
  return undefined
}
