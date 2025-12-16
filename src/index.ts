import { Hono } from 'hono'
import { getAllPeople, getPersonById, addPerson, judgePerson, deletePerson, getInfractionsByPersonId, addInfraction, createAppeal, listPendingAppeals, reviewAppeal } from './db/queries'

const app = new Hono()

// Default Route
app.get('/', (c) => {
    return c.text("Abc")
})

// People Routes

app.get('/api/people', (c) => c.json(getAllPeople()))

app.get('/api/people/:id', (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400)
    const person = getPersonById(id)
    if (!person) {
        return c.json({ error: 'Person not found' }, 404)
    }
    return c.json(person)
})

app.post('/api/people', async (c) => {
    const body = await c.req.json().catch(() => null)
    const name = (body?.name ?? "").toString().trim()
    const isNice = Boolean(body?.isNice ?? true)
    const reason = body?.reason?.toString() ?? ""
    if (!name) return c.json({ error: "Name is required" }, 400)

    return c.json(addPerson(name, isNice, reason), 201)
})

app.patch('/api/people/:id', async (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400)

    const body = await c.req.json().catch(() => null)
    const isNice = body?.isNice
    const reason = body?.reason?.toString() ?? ""

    if (body?.isNice === undefined) return c.json({ error: "`isNice is required" }, 400)
    if (typeof body.isNice !== "boolean") return c.json({ error: "isNice must be a boolean" }, 400)
    
    return c.json(judgePerson(id,isNice, reason))
})

app.delete('/api/people/:id', (c) => {
    const id = Number(c.req.param('id'))
    if (!Number.isFinite(id)) return c.json({ error: "Invalid id" }, 400)

    return c.json(deletePerson(id))
})

// Infractions Routes

app.get('/api/people/:id/infractions', (c) => {
    const personId = Number(c.req.param('id'))
    if (!Number.isFinite(personId)) return c.json({ error: "Invalid id" }, 400)

    return c.json(getInfractionsByPersonId(personId))
})

app.post('/api/people/:id/infractions', async (c) => {
    const personId = Number(c.req.param('id'))
    if (!Number.isFinite(personId)) return c.json({ error: "Invalid id" }, 400)
    
    const body = await c.req.json().catch(() => null)
    const description = (body?.description ?? "").toString().trim()
    const severity = Number(body?.severity ?? 1)

    if (!description) return c.json({ error: "Description required" }, 400)
    
    return c.json(addInfraction(personId, description, severity))
})

// Appeals Routers

app.post('/api/appeals', async (c) => {
    const body = await c.req.json().catch(() => null)
    const personId = Number(body?.personId)
    const infractionId = Number(body?.infractionId)
    const appealText = (body?.appealText ?? "").toString().trim()

    if (!Number.isFinite(personId) || !Number.isFinite(infractionId) || !appealText) {
        return c.json({ error: "Missing or Invalid fields" }, 400)
    }

    return c.json(createAppeal(personId, infractionId, appealText))
})

app.get('/api/appeals/pending', (c) => {
    return c.json(listPendingAppeals())
})

app.patch('/api/appeals/:id/review', async (c) => {
    const appealId = Number(c.req.param('id'))
    if (!Number.isFinite(appealId)) return c.json({error: "Invalid id"}, 400)
    
    const body = await c.req.json().catch(() => null)
    const approved = body?.approved

    if (body?.approved === undefined) return c.json({ error: "approved is required" }, 400)
    if (typeof body.approved !== "boolean") return c.json({ error: "approved must be a boolean" }, 400)

    return c.json(reviewAppeal(appealId, approved))
})

export default app
