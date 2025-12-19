import { Hono } from 'hono'
import { getAllPeople, getPersonById, addPerson, judgePerson, deletePerson, createAppeal, listPendingAppeals, reviewAppeal } from './db/queries'
import { getInfractionsByPersonId, addInfraction } from './db/queries'
import { Context } from 'hono'
import { AnyD1Database } from 'drizzle-orm/d1'

interface Env {
    DB: AnyD1Database
}

const app = new Hono()

// Default Route / instructions
app.get('/', (c) => {
    return c.text(
`People Endpoints (Table 1)

GET /api/people
- Description: Get the list of people and whether theyre naughty or nice.
- Parameters: None
- Returns: JSON array of all people records.
- Example Response:
    [
      {
        "id": 1,
        "name": "Candy Cane",
        "isNice": true,
        "reason": "Helped an old lady cross the street",
        "checkedAt": "2024-12-01T10:00:00Z"
      },
      ...
    ]
  

GET /api/people/:id
- Description: Retrieve all information about a specific person by their ID.
- Parameters:
    - id (number): The unique identifier of the human.
- Returns: JSON object of the person’s record.
- Example Response:
    {
      "id": 1,
      "name": "Candy Cane",
      "isNice": true,
      "reason": "Helped an old lady cross the street",
      "checkedAt": "2024-12-01T10:00:00Z"
    }


POST /api/people
- Description: Add a new entry on the Naughty & Nice list.
- Body:
    - name (string, required): The name of the new person.
    - isNice (boolean, optional): Initial status (default: true).
    - reason (string, optional): Reason for the initial status.
- Returns: The newly created person’s ID
- Example Response:
{ "id": 42 }


PATCH /api/people/:id
- Description: Revise the naughty/nice status of a person on the list
- Parameters:
    - id (number): The unique identifier of the human.
- Body:
    - isNice (boolean, required): Official verdict.
    - reason (string, optional): Reason for the judgement.
- Returns: { "ok": true } on success.

DELETE /api/people/:id
- Description: Remove an entry from the Naughty & Nice list.
- Parameters:
    - id (number): The unique identifier of the person to be removed.
- Returns: { "ok": true } on success.



Infractions Endpoints (Table 2)

GET /api/people/:id/infractions
- Description: View the naughty deeds recorded against a specific person.
- Parameters:
    - id (number): The unique identifier of the person to be checked.
- Returns: JSON array of infractions.
- Example Response:
    [
      {
        "id": 5,
        "personId": 17,
        "description": "Stole cookies from the cookie jar",
        "severity": 3,
        "occurredAt": "2024-11-30T15:30:00Z"
      },
      ...
    ]


POST /api/people/:id/infractions
- Description: Record a new infraction against a person.
- Parameters:
    - id (number): The unique identifier of the person.
- Body:
    - description (string, required): Description of the naughty deed.
    - severity (number, *optional*): Severity level from 1 (minor) to 5 (very naughty). *(default: 1)*
- Returns: The ID of the newly created infraction.
- Example Response:{ "id": 38 }



Appeals Endpoints (Table 3)

POST /api/appeals
- Description: Submit an appeal for a recorded infraction.
- Body:
    - personId (number, required): The unique identifier of the person making the appeal.
    - infractionId (number, required): The unique identifier of the infraction being appealed.
    - appealText (string, required): Why you think the infraction shouldn't be counted,
- Returns: The ID of the newly created appeal.
- Example Response: { "id": 15 }

GET /api/appeals/pending
- Description: Retrieve all appeals awaiting judgement (whether they are accepted or not)
- Parameters: None
- Returns: JSON array of all pending appeals.
- Example Response:
[
  {
    "id": 15,
    "personId": 5,
    "infractionId": 28,
    "appealText": "I swear I was just borrowing the cookies!",
    "status": 0,
    "submittedAt": "2024-12-02T12:00:00Z"
  }
]

PATCH /api/appeals/:id/review
- Description: Decide whether the appeal should be accepted.
- Parameters:
    - id (number): The unique identifier of the appeal.
- Body:
    - approved (boolean, required): Whether the appeal is acceptable.
- Returns: { "ok": true } on success.
`)
})

// People Routes

app.get('/api/people', async (c: Context<{ Bindings: Env }>) => c.json(await getAllPeople(c.env.DB)))

app.get('/api/people/:id', async (c: Context<{ Bindings: Env }>) => {
    const id: number = Number(c.req.param('id'))
    if (!Number.isFinite(id)) { return c.json({ error: "Invalid id provided" }, 400) }
    const person = await getPersonById(c.env.DB, id)
    if (!person) {
        return c.json({ error: 'Person not found - please Provide an valid ID' }, 404)
    }
    return c.json(person)
})

app.post('/api/people', async (c: Context<{ Bindings: Env }>) => {
    const body = await c.req.json().catch(() => null)
    const name = (body?.name ?? "").toString().trim()
    const isNice: boolean = Boolean(body?.isNice ?? true)
    const reason: string = body?.reason?.toString() ?? ""

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

    if (typeof isNice !== "boolean") {
        return c.json({ error: "isNice must be a boolean" }, 400)
    }
    
    return c.json(
        await judgePerson(
            c.env.DB,
            id,
            isNice,
            reason
        )
    )
})

app.delete('/api/people/:id', async (c: Context<{ Bindings: Env }>) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) {
        return c.json({ error: "Invalid id" }, 400)
    }

    return c.json(await deletePerson(c.env.DB, id))
})

// Infractions endpoints

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
    const description = (body?.description ?? "").toString()
    const severity = Number(body?.severity ?? 1)

    if (!description) {return c.json({ error: "Description required" }, 400)}
    
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
    return c.json(
        await listPendingAppeals(c.env.DB)
    )
})

app.patch('/api/appeals/:id/review', async (c: Context<{ Bindings: Env }>) => {
    const appealId = Number(c.req.param('id'))
    if (!Number.isFinite(appealId)) return c.json({error: "Invalid id"}, 400)
    
    const body = await c.req.json().catch(() => null)
    const approved = body?.approved

    if (approved === undefined) {
        return c.json({ error: "approved not found" }, 400)}

    return c.json(await reviewAppeal(c.env.DB, appealId, approved))
})

export default app
