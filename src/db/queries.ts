import { db } from "./index"
import { people, infractions, appeals } from "./schema"
import { eq, desc, sql } from "drizzle-orm"

// People Queries

export function getAllPeople() {
    return db.select().from(people).orderBy(desc(people.checkedAt)).all()
}

export function getPersonById(id: number) {
    return db.select().from(people).where(eq(people.id, id)).limit(1).get()
}

export function addPerson(name: string, is_nice?: boolean, reason?: string) {
    const timestamp = new Date()
    db.insert(people).values({
        name,
        isNice: is_nice ?? true,
        reason: reason ?? "",
        checkedAt: timestamp,
    }).run()

    const row = db
    .select({ id: sql<number>`last_insert_rowid()` })
    .from(people)
    .get()

    if (!row) {
        return { id: -1 }
    }

    return { id: row.id }
}

export function judgePerson(id: number, isNice: boolean, reason?: string) {
    db.update(people).set({
        isNice,
        reason: reason || "",
        checkedAt: new Date(),
    }).where(eq(people.id, id)).run()

    return { ok: true }
}

export function deletePerson(id: number) {
    db.delete(people).where(eq(people.id, id)).run()
    return { ok: true }
}

// Infractions Queries

export function getInfractionsByPersonId(personId: number) {
    return db.select().from(infractions).where(eq(infractions.personId, personId)).orderBy(desc(infractions.occurredAt)).all()
}

export function addInfraction(personId: number, description: string, severity: number = 1) {
    db.insert(infractions).values({
        personId,
        description,
        severity,
        occurredAt: new Date(),
    }).run()

    const row = db
    .select({ id: sql<number>`last_insert_rowid()` })
    .from(infractions)
    .get()

    if (!row) {
        return { id: -1 }
    }

    return { id: row.id }
}

// Appeals

export function createAppeal(personId: number, infractionId: number, appealText: string) {
    db.insert(appeals).values({
        personId,
        infractionId,
        appealText,
        status: 0,
        submittedAt: new Date(),
    }).run()
    
    const row = db
    .select({ id: sql<number>`last_insert_rowid()` })
    .from(appeals)
    .get()
    
    if (!row) {
        return { id: -1 }
    }

    return { id: row.id }
}

export function listPendingAppeals() {
    return db.select().from(appeals).where(eq(appeals.status, 0)).orderBy(desc(appeals.submittedAt)).all()
}

export function reviewAppeal(appealId: number, approved: boolean) {
    const new_status = approved ? 1 : 2

    db.update(appeals).set({ status: new_status }).where(eq(appeals.id, appealId)).run()

    return { ok: true }
}

