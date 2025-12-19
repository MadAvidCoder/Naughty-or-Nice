import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core"

export const people = sqliteTable("people", {
  id: integer("id")
      .primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  isNice: integer("is_nice", { mode: "boolean" }).notNull().default(true),
  reason: text("reason"),
  checkedAt: integer("checked_at", { mode: "timestamp"}).notNull(),
})

export const infractions = sqliteTable("infractions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    description: text("description").notNull(),
    // 1 = minor, 5 = coal
    severity: integer("severity").notNull().default(1),
    occurredAt: integer("occurred_at", { mode: "timestamp"}).notNull(),
})

export const appeals = sqliteTable("appeals", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    personId: integer("person_id").notNull().references(() => people.id, { onDelete: "cascade" }),
    infractionId: integer("infraction_id").notNull().references(() => infractions.id, { onDelete: "cascade" }),
    appealText: text("appeal_text").notNull(),
    // 0 = pending, 1 = approved, 2 = denied
    status: integer("status").notNull().default(0),
    submittedAt: integer("submitted_at", { mode: "timestamp"}).notNull(),
})