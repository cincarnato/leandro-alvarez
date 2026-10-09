# Company membership: `Company.users`

## Application contract and deployment prerequisites

The membership owner is Company, not User. One company can contain multiple users and one user can belong to multiple companies.

The following is the required contract for the accompanying application change. **This migration only copies stored memberships; it does not implement schemas, endpoints, forms or authorization.** Before switching traffic, verify that the deployed backend implements this contract. The legacy backend still using `User.company` must not be treated as having completed the switch.

- Backend create/update inputs use `users: string[]` containing User IDs. An explicit `users: []` clears membership; a PATCH omitting `users` preserves membership (do not inject a default into PATCH). Validate referenced users using the entity service and Zod input schema.
- Backend Company outputs expose `users` as populated minimal objects containing only `_id`, `name`, and `username`. Do not expose full identity records, passwords, tokens, email or other private fields. Both the output schema and repository population/projection must enforce this shape.
- Frontend Company forms use an i18n-labelled multiple user selector. Serialize selected IDs for writes and initialize the selector from populated output IDs. Membership is edited on Company; the old single-company selector on User is not the source of truth.
- MERCHANT authorization derives the current user's scope from **all** companies whose `users` includes that user's ID, using current server-side membership rather than stale JWT claims. Listing filters include benefits/claims of those companies only; inspection and redemption require membership in the coupon's company. No membership (or an inactive user) is forbidden, never an unfiltered/global scope. Existing active-company/benefit rules still apply. Non-MERCHANT permissions remain unchanged.
- After the application switch, legacy `User.company` is inert retained data: it is neither an authorization fallback nor a writable membership field. Keep it until manual verification; deleting it is a separate explicitly approved cleanup, not part of this migration.

Example input:

```json
{"users": ["111111111111111111111111", "222222222222222222222222"]}
```

Example output fragment:

```json
{"users": [{"_id": "111111111111111111111111", "name": "Merchant", "username": "merchant"}]}
```

## Optional, explicit Mongo migration

There is no automatic migration at startup and no package-script change. New deployments without legacy assignments do not need to run it. Existing Mongo deployments can explicitly copy `User.company` into `Company.users` using:

```sh
# Working directory: back/ (Node 24, installed project dependencies)
npx tsx --env-file=.env src/setup/scripts/MigrateCompanyUsers.ts
```

`tsx` forwards `--env-file=.env` to Node; this syntax was verified with the installed runner and Node 24 using an empty env file, without connecting to a database. `.env` must exist; use the actual deployment environment file in its place if necessary. Existing environment variables take precedence over values from the file.

Required configuration:

```dotenv
DRAX_DB_ENGINE=mongo
DRAX_MONGO_URI=mongodb://host/database
```

Check the target database yourself; the command writes to that database. It does not select a hardcoded database. Protect credentials and do not paste the URI into logs or tickets. The database account needs read access to `users` and update access to `Company`.

### Deployment procedure

1. Back up the database and confirm the intended environment/URI. Test this process on a restored staging copy first.
2. Pause membership edits (both legacy User assignments and new Company assignments), or stop application traffic during the switch. The migration is additive, not a synchronization process; concurrent edits could re-add intentionally removed members.
3. Deploy the `Company.users` backend/frontend/schema/authorization changes described above, keeping traffic paused until migration and verification finish. Ensure Company memberships use arrays of BSON ObjectIds. Resolve malformed existing `users` values before migration; non-array values cause the command to fail rather than being overwritten.
4. Run the explicit command once. It awaits Mongo connection with a 10-second server-selection timeout, delegates all reads/writes to `CompanyMembershipMigrationRepository`, prints a count summary, and disconnects in `finally`. Failures produce exit code 1 without printing raw database errors or connection credentials.
5. Review counts and manually verify representative users, including users in multiple companies, pre-existing memberships, and a merchant without membership. Confirm scoped lists, coupon inspection/redemption, and minimal Company output. Resume traffic only after verifying the new scope behavior.
6. Leave `User.company` intact and inert. Any later removal needs a separate backup, verification and explicit cleanup plan.

### Data semantics and summary

The repository uses the exported Drax `UserModel.collection` (verified collection name **`users`**, not `User`) and local `CompanyModel.collection` (**`Company`**). Raw collections deliberately read the legacy field even when it is no longer declared in a Mongoose schema and write membership independently of schema strictness.

For each user with a non-null legacy `company`, a BSON ObjectId or a 24-hex-character string is accepted. The string is converted to a BSON ObjectId. The company is updated using `$addToSet: {users: user._id}` with **no upsert**:

- Existing membership arrays and memberships in other companies are preserved.
- A missing `users` array is created by MongoDB.
- Existing membership is not duplicated; running again is idempotent while the underlying data stays unchanged.
- Missing companies are skipped and counted; no placeholder company is created.
- Invalid legacy references are skipped and counted, not guessed or converted from populated objects.
- Missing/null legacy assignments are ignored. Inactive users are copied too: this migrates stored relationships, not active-user authorization policy.
- No User fields are modified or deleted; Company metadata is not rewritten.

The summary reports `candidateUsers`, `membershipsAdded`, `membershipsAlreadyPresent`, `missingCompanies`, and `invalidCompanyReferences`. Missing/invalid references generate a warning but do not fail an otherwise successful run. Review and reconcile them manually before declaring deployment verified. A database write error fails the command; earlier writes may remain. There is no cross-document transaction, and retrying is safe because additions use `$addToSet`.

**Do not rerun as ongoing synchronization after administrators have edited new memberships:** retained legacy assignments can reintroduce a removed membership. Idempotence prevents duplicates; it does not reconcile removals.

## Isolated validation

From `back/`:

```sh
node --import tsx --test test/modules/benefits/company-users-migration.test.ts
```

The test uses MongoMemoryServer via the existing `MongoInMemory` helper, never the configured deployment database. It covers collection naming, existing/multiple memberships, BSON/string legacy IDs, repeat runs, preservation of User records, missing arrays, dangling/invalid references, and empty migrations. MongoMemoryServer may need a MongoDB binary download if one is not cached. No migration against an actual database is part of implementation validation.
