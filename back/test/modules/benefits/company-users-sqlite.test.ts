import {it} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {mkdtemp, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {COMMON, CommonConfig, DraxConfig} from '@drax/common-back';
import {CompanyBaseSchema} from '../../../src/modules/benefits/schemas/CompanySchema.js';
import CompanySqliteRepository from '../../../src/modules/benefits/repository/sqlite/CompanySqliteRepository.js';

it('validates membership IDs for Mongo and SQLite without adding PATCH defaults', () => {
    const uuid = randomUUID();
    DraxConfig.set(CommonConfig.DbEngine, COMMON.DB_ENGINES.SQLITE);
    assert.deepEqual(CompanyBaseSchema.parse({name: 'Company', users: [uuid]}).users, [uuid]);
    assert.equal(CompanyBaseSchema.safeParse({name: 'Company', users: ['invalid']}).success, false);
    assert.deepEqual(CompanyBaseSchema.partial().parse({name: 'Changed'}), {name: 'Changed'});
    DraxConfig.set(CommonConfig.DbEngine, COMMON.DB_ENGINES.MONGODB);
    assert.equal(CompanyBaseSchema.safeParse({name: 'Company', users: [uuid]}).success, false);
    assert.equal(CompanyBaseSchema.safeParse({name: 'Company', users: ['a'.repeat(24)]}).success, true);
});

it('persists, minimally populates and looks up SQLite company memberships', async () => {
    class TestRepository extends CompanySqliteRepository {
        seedUsers(ids: string[]) {
            this.db.exec('CREATE TABLE users (_id TEXT PRIMARY KEY, name TEXT, username TEXT, email TEXT)');
            for (const id of ids) this.db.prepare('INSERT INTO users VALUES (?, ?, ?, ?)').run(id, 'Operator', id, 'private@example.com');
        }
        close() { this.db.close(); }
    }
    const dir = await mkdtemp(join(tmpdir(), 'company-users-'));
    const repository = new TestRepository(join(dir, 'test.db'));
    try {
        repository.build();
        const first = randomUUID(), second = randomUUID();
        repository.seedUsers([first, second]);
        const company = await repository.create({name: 'Company', users: [first, second]});
        assert.equal(company.users?.length, 2);
        assert.deepEqual(Object.keys(company.users![0]).sort(), ['_id', 'name', 'username']);
        assert.deepEqual((await repository.findByUser(first)).map(item => item._id), [company._id]);
        await repository.updatePartial(company._id, {name: 'Changed'});
        assert.equal((await repository.findById(company._id))?.users?.length, 2);
        await repository.updatePartial(company._id, {users: []});
        assert.deepEqual(await repository.findByUser(first), []);
    } finally {
        repository.close();
        await rm(dir, {recursive: true, force: true});
    }
});
