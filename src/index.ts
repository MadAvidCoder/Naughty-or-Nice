import { Hono } from 'hono'
import { getAllPeople, getPersonById, addPerson, judgePerson, deletePerson, getInfractionsByPersonId, addInfraction, createAppeal, listPendingAppeals, reviewAppeal } from './db/queries'
import { Context } from 'hono'
import { AnyD1Database } from 'drizzle-orm/d1'

interface Env {
    DB: AnyD1Database
}

const app = new Hono()

// Default Route
app.get('/', (c) => {
    return c.text(
`North Pole Official API Manual: Santa's Naughty & Nice Tracker - Elf Edition

WARNING: This manual is the property of S. GIFT INC. (Santa's Grand Institute of Festive Transparency Incorporated). For internal use only. Any elves found to be usnig endpoints above their clearance level (especially those marked SACK or SUPREME) will face punitive action, including untangling Christmas lights in sub-zero temperatures. Please read carefully.

------------------------------

Section 1: People Management (aka The Naughty & Nice List)
These endpoints are used for tracking humans Naughty & Nice statuses, especially for when deciding who deserves coal.

- GET /api/people:
    - Description: Retrieve the full list of humans and their current status (naughty or nice).
    - Parameters: None
    - Returns: JSON array of all people records.
        - Example Response: [{ id: 1, name: "Candy Cane", isNice: true, reason: "Helped an old lady cross the street", checkedAt: "2024-12-01T10:00:00Z" }, ...]
    - Permissions: Elf-level security clearance required.
- GET /api/people/:id:
    - Description: Retrieve detailed information about a specific human by their ID.
    - Parameters: id (number) - The unique identifier of the human.
    - Returns: JSON object of the person's record.
        - Example Response: { id: 1, name: "Candy Cane", isNice: true, reason: "Helped an old lady cross the street", checkedAt: "2024-12-01T10:00:00Z" }
    - Permissions: Elf-level security clearance required.
- POST /api/people:
    - Description: Add a new human to the Naughty & Nice list.
    - Body:
        - name (string, required): The name of the human.
        - isNice (boolean, optional): Initial status (default: true).
        - reason (string, optional): Reason for the initial status.
    - Returns: The newly created person's id.
        - Example Response: { id: 42 }
    - Permissions: SLEIGH (Santa's List Editing and General Handling) clearance required.
- PATCH /api/people/:id:
    - Description: Make a judgement on a human. Naughty or nice?
    - Parameters: id (number) - The unique identifier of the human.
    - Body:
        - isNice (boolean, required): Official Verdict.
        - reason (string, optional): Reason for the judgement.
    - Returns: { ok: true } on success.
    - Permissions: STRICTLY FOR USE BY SANTA ONLY. SACK (Supreme Archival Control Keeper) clearance required.
- DELETE /api/people/:id:
    - Description: Remove a human from the Naughty & Nice list (for exceptional cases only).
    - Parameters: id (number) - The unique identifier of the human.
    - Returns: { ok: true } on success.
    - Permissions: DELETE (Data Erasure and Ledger Editing Taskforce Executive) clearance required.

------------------------------

Section 2: Infraction Management
These endpoints handle the recording of naughty behaviors, in case further judgement is needed.

- GET /api/people/:id/infractions:
    - Description: View the naughty deeds recorded against a specific human.
    - Parameters: id (number) - The unique identifier of the human.
    - Returns: JSON array of infractions. 
        - Example Response: [{ id: 1, personId: 1, description: "Stole cookies from the cookie jar", severity: 3, occurredAt: "2024-11-30T15:30:00Z" }, ...]
    - Permissions: Elf-level security clearance required.

- POST /api/people/:id/infractions:
    - Description: Record a new infraction against a human.
    - Parameters: id (number) - The unique identifier of the human.
    - Body:
        - description (string, required): Description of the naughty deed.
        - severity (number, optional): Severity level from 1 (minor) to 5 (coal-worthy). (default: 1).
    - Returns: The id of the newly created infraction.
        - Example Response: { id: 28 }
    - Permissions: SCROOGE (Santa's Comprehensive Recorders Of Overtly Grievous Events) clearance required.

------------------------------

Section 3: Appeal Management
These endpoints allow recording of humans' appeals of their recorded infractions to the JINGLE (Judicial Intervention and Nice-list Granting Logic Engine) database, for Santa's reconsideration (and possibly elf entertainment). 

- POST /api/appeals:
    - Description: Submit a received appeal for a recorded infraction.
    - Body:
        - personId (number, required): The unique identifier of the human who lodged the appeal.
        - infractionId (number, required): The unique identifier of the infraction being appealed.
        - appealText (string, required): The human's desperate plea for mercy. (WARNING: Elves may find the content emotionally distressing. Or downright hilarious.)
    - Returns: The id of the newly created appeal.
        - Example Response: { id: 15 }
    - Permissions: HAPRE (Holiday Adjudication and Petition Review Executive) clearance required.

- GET /api/appeals/pending:
    - Description: Retrieve all pending appeals awaiting Santa's judgement.
    - Parameters: None
    - Returns: A JSON array of all pending appeals.
        - Example Response: [{ id: 15, personId: 5, infractionId: 28, appealText: "I swear I was just borrowing the cookies!", status: 0, submittedAt: "2024-12-02T12:00:00Z" }, ...]
    - Permissions: Elf-level security clearance required.
    
- PATCH /api/appeals/:id/review:
    - Description: Lodge the final decision on a pending appeal.
    - Parameters: id (number) - The unique identifier of the appeal.
    - Body:
        - approved (boolean, required): Santa's final decision on the appeal.
    - Returns: { ok: true } on success.
    - Permissions: STRICTLY FOR USE BY SANTA ONLY. SUPREME (Santa's Ultimate Petition Review and Evaluation Management Execution) clearance required.`)
})

// People Routes

app.get('/api/people', async (c: Context<{ Bindings: Env }>) => {
    return c.json(await getAllPeople(c.env.DB))
})

app.get('/api/people/:id', async (c: Context<{ Bindings: Env }>) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) {
        return c.json({ error: "Invalid id provided" }, 400)
    }
    const person = await getPersonById(c.env.DB, id)
    if (!person) {
        return c.json({ error: 'Person not found' }, 404)
    }
    return c.json(person)
})

app.post('/api/people', async (c: Context<{ Bindings: Env }>) => {
    const body = await c.req.json().catch(() => null)
    const name = (body?.name ?? "").toString().trim()
    const isNice = Boolean(body?.isNice ?? true)
    const reason = body?.reason?.toString() ?? ""

    if (!name) {
        return c.json({ error: "Name is required" }, 400)
    }

    return c.json(await addPerson(c.env.DB, name, isNice, reason), 201)
})

app.patch('/api/people/:id', async (c: Context<{ Bindings: Env }>) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400)

    const body = await c.req.json().catch(() => null)
    const isNice = body?.isNice
    const reason = body?.reason?.toString() ?? ""

    if (isNice === undefined) {
        return c.json({ error: "isNice is required" }, 400)
    }
    else if (typeof isNice !== "boolean") {
        return c.json({ error: "isNice must be a boolean" }, 400)
    }
    
    return c.json(await judgePerson(c.env.DB, id, isNice, reason))
})

app.delete('/api/people/:id', async (c: Context<{ Bindings: Env }>) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) {
        return c.json({ error: "Invalid id" }, 400)
    }

    return c.json(await deletePerson(c.env.DB, id))
})

// Infractions Routes

app.get('/api/people/:id/infractions', async (c: Context<{ Bindings: Env }>) => {
    const personId = Number(c.req.param('id'))
    if (!Number.isFinite(personId)) {
        return c.json({ error: "Invalid id" }, 400)
    }

    return c.json(await getInfractionsByPersonId(c.env.DB, personId))
})

app.post('/api/people/:id/infractions', async (c: Context<{ Bindings: Env }>) => {
    const personId = Number(c.req.param('id'))
    if (!Number.isFinite(personId)) {
        return c.json({ error: "Invalid id" }, 400)
    }
    
    const body = await c.req.json().catch(() => null)
    const description = (body?.description ?? "").toString().trim()
    const severity = Number(body?.severity ?? 1)

    if (!description) {
        return c.json({ error: "Description required" }, 400)
    }
    
    return c.json(await addInfraction(c.env.DB, personId, description, severity))
})

// Appeals Routers

app.post('/api/appeals', async (c: Context<{ Bindings: Env }>) => {
    const body = await c.req.json().catch(() => null)
    const personId = Number(body?.personId)
    const infractionId = Number(body?.infractionId)
    const appealText = (body?.appealText ?? "").toString().trim()

    if (!Number.isFinite(personId) || !Number.isFinite(infractionId) || !appealText) {
        return c.json({ error: "Missing or Invalid fields" }, 400)
    }

    return c.json(await createAppeal(c.env.DB, personId, infractionId, appealText))
})

app.get('/api/appeals/pending', async (c: Context<{ Bindings: Env }>) => {
    return c.json(await listPendingAppeals(c.env.DB))
})

app.patch('/api/appeals/:id/review', async (c: Context<{ Bindings: Env }>) => {
    const appealId = Number(c.req.param('id'))
    if (!Number.isFinite(appealId)) return c.json({error: "Invalid id"}, 400)
    
    const body = await c.req.json().catch(() => null)
    const approved = body?.approved

    if (approved === undefined) {
        return c.json({ error: "approved is required" }, 400)
    } else if (typeof approved !== "boolean") {
        return c.json({ error: "approved must be a boolean" }, 400)
    }

    return c.json(await reviewAppeal(c.env.DB, appealId, approved))
})

export default app
