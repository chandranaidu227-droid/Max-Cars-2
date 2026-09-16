import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("Supabase schema, signup trigger, ownership and protected columns", async () => {
  const db = new PGlite();
  const alice = "10000000-0000-0000-0000-000000000001";
  const bob = "10000000-0000-0000-0000-000000000002";
  try {
    await db.exec(`create role anon; create role authenticated;
      create schema auth;
      create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
      grant usage on schema auth, public to anon, authenticated;
      grant execute on function auth.uid() to anon, authenticated;`);
    await db.exec(await readFile(new URL("../supabase/setup.sql", import.meta.url), "utf8"));
    await db.query("insert into auth.users(id,email,raw_user_meta_data) values ($1,'alice@example.com','{\"name\":\"Alice\",\"role\":\"admin\"}'),($2,'bob@example.com','{}')", [alice, bob]);
    assert.equal((await db.query("select role from profiles where id=$1", [alice])).rows[0].role, "customer");
    await db.exec("set role anon");
    assert.equal((await db.query("select count(*)::int as total from vehicles")).rows[0].total, 32);
    await assert.rejects(db.query("select * from orders"), /permission denied/);
    await assert.rejects(db.query("select * from profiles"), /permission denied/);
    await db.exec("reset role; set role authenticated");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [alice]);
    assert.equal((await db.query("select count(*)::int as total from profiles")).rows[0].total, 1);
    await assert.rejects(db.query("update profiles set role='admin' where id=$1", [alice]), /permission denied/);
    await db.query("update profiles set name='Alice Updated' where id=$1", [alice]);
    const order = (await db.query("insert into orders(items) values ('[{\"vehicleId\":\"mc-001\"}]') returning id,reference,payment")).rows[0];
    assert.match(order.reference, /^MAX-ORD-/);
    assert.equal(order.payment.collected, false);
    await assert.rejects(db.query("insert into orders(items,payment) values ('[{}]','{\"collected\":true}')"), /permission denied/);
    await assert.rejects(db.query("insert into orders(\"user\",items) values ($1,'[{}]')", [bob]), /row-level security/);
    await assert.rejects(db.query("insert into orders(items) values ('[]')"), /check constraint/);
    await db.query("insert into favourites(\"vehicleId\") values ('mc-001')");
    await db.query("insert into bookings(\"vehicleId\",location,\"appointmentAt\") values ('mc-001','Hyderabad',now())");
    await assert.rejects(db.query("update bookings set status='confirmed'"), /row-level security/);
    await db.query("update bookings set status='cancelled'");
    await db.query("insert into listings(registration,brand,model) values ('TEST123','BMW','M2')");
    await db.query("insert into support_tickets(topic,subject,description) values ('Test','Test','A long enough test description.')");
    await db.query("select set_config('request.jwt.claim.sub',$1,false)", [bob]);
    for (const table of ["orders", "favourites", "bookings", "listings", "support_tickets"]) {
      assert.equal((await db.query(`select count(*)::int as total from ${table}`)).rows[0].total, 0, `${table} ownership isolation`);
    }
    assert.equal((await db.query("delete from favourites returning id")).rows.length, 0);
    await assert.rejects(db.query("insert into vehicles(slug,brand,model,price) values ('forged','Test','Test',1)"), /row-level security/);
    await db.exec("reset role");
    await db.query("update profiles set role='admin' where id=$1", [bob]);
    await db.exec("set role authenticated");
    assert.equal((await db.query("select count(*)::int as total from orders")).rows[0].total, 1);
    await db.query("insert into vehicles(slug,brand,model,price) values ('admin-car','Test','Test',1)");
  } finally { await db.close(); }
});
