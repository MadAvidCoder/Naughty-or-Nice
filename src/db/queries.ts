import { db } from "./index"
import { people, infractions, appeals } from "./schema"
import { eq, desc } from "drizzle-orm"

// People Queries

export function getAllPeople() {
    return db.select().from(people).orderBy(desc(people.checkedAt)).all()
}

export function getPersonById(id: number) {
    return db.select().from(people).where(eq(people.id, id)).limit(1).get()
}

export function addPerson(name: string) {
    const timestamp = new Date()
    db.insert(people).values({
        name,
        isNice: true,
        reason: "",
        checkedAt: timestamp,
    }).run()

    return { ok: true }
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

    return { ok: true }
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
    return { ok: true }
}

export function listPendingAppeals() {
    return db.select().from(appeals).where(eq(appeals.status, 0)).orderBy(desc(appeals.submittedAt)).all()
}

export function reviewAppeal(appealId: number, approved: boolean) {
    const new_status = approved ? 1 : 2

    db.update(appeals).set({ status: new_status }).where(eq(appeals.id, appealId)).run()

    return { ok: true }
}

