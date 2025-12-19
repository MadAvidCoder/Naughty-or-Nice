import { people, infractions, appeals } from "./schema"
import { eq, desc, sql } from "drizzle-orm"
import { drizzle, AnyD1Database } from "drizzle-orm/d1"

// People Queries

export async function getAllPeople(db: AnyD1Database) {
    return await drizzle(db)
        .select()
        .from(people)
        .orderBy(desc(people.checkedAt))
        .all()
}

export async function getPersonById(db: AnyD1Database, id: number) {
    return await drizzle(db)
        .select()
        .from(people)
        .where(eq(people.id, id))
        .limit(1).get()
}

export async function addPerson(db: AnyD1Database, name: string, is_nice?: boolean, reason?: string) {
    let driz: AnyD1Database = drizzle(db)
    const timestamp: Date = new Date()
    await driz
        .insert(people)
        .values({
            name,
            isNice: is_nice ?? true,
            reason: reason ?? "",
            checkedAt: timestamp,
        })
        .run()

    const row = await driz
        .select({ id: sql<number>`last_insert_rowid()` })
        .from(people)
        .get()

    if (!row) {
        return { id: -1 }
    }

    return { id: row.id }
}

export async function judgePerson(db: AnyD1Database, id: number, isNice: boolean, reason?: string) {
   await drizzle(db)
       .update(people)
       .set({
            isNice,
            reason: reason || "",
            checkedAt: new Date(),
       })
       .where(eq(people.id, id))
       .run()

   return { ok: true }
}

export async function deletePerson(db: AnyD1Database, id: number) {
    await drizzle(db).delete(people).where(eq(people.id, id)).run()
    return { ok: true }
}

// Infractions Querie

export async function getInfractionsByPersonId(db: AnyD1Database, personId: number) {
    return await drizzle(db)
        .select()
        .from(infractions)
        .where(eq(infractions.personId, personId))
        .orderBy(desc(infractions.occurredAt))
        .all()
}

export async function addInfraction(db: AnyD1Database, personId: number, description: string, severity: number = 1) {
    const res = await drizzle(db)
        .insert(infractions).values({
            personId,
            description,
            severity,
            occurredAt: new Date(),
        })
        .returning()

    return { id: res[0].id }
}

// Appeals db

export async function createAppeal(db: AnyD1Database, personId: number, infractionId: number, appealText: string) {
    await drizzle(db).insert(appeals).values({
        personId,
        infractionId,
        appealText,
        status: 0,
        submittedAt: new Date(),
    }).run()
    
    const row = await drizzle(db)
    .select({ id: sql<number>`last_insert_rowid()` })
    .from(appeals)
    .get()

    return { id: row!.id }
}

export async function listPendingAppeals(db: AnyD1Database) {
    return await drizzle(db).select().from(appeals).where(eq(appeals.status, 0)).orderBy(desc(appeals.submittedAt)).all()
}

export async function reviewAppeal(db: AnyD1Database, appealId: number, approved: boolean) {
    const new_status: number = approved ? 1 : 2

    await drizzle(db)
        .update(appeals).set({ status: new_status })
        .where(eq(appeals.id, appealId))
        .run()

    return { ok: true }
}
