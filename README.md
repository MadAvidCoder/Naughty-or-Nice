# North Pole Official API Manual  
*Official* API access is available to all elves via: [https://naughty_nice_tracker.david-ma-6877.workers.dev/](https://naughty_nice_tracker.david-ma-6877.workers.dev/)
## Santa's Naughty & Nice Tracker - *Elf Edition*

> [!CAUTION]
> This manual is the property of **S. GIFT INC.**  
> *(Santa's Grand Institute of Festive Transparency Incorporated)*  
>  
> For internal use only. Any elves found to be using endpoints above their clearance level (especially those marked **SACK** or **SUPREME**) will face punitive action, including untangling Christmas lights in sub-zero temperatures.  
>  
> **Please read carefully.**

---

## Section 1: People Management  
***(aka The Naughty & Nice List)***

These endpoints are used for tracking humans’ Naughty & Nice statuses, especially for when deciding who deserves coal.

### GET `/api/people`
- **Description:** Retrieve the full list of humans and their current status (naughty or nice).
- **Parameters:** None
- **Returns:** JSON array of all people records.
- **Example Response:**
  ```json
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
  ```
- **Permissions:** Elf-level security clearance required.

### GET `/api/people/:id`

- **Description:** Retrieve detailed information about a specific human by their ID.
- **Parameters:**
  - `id` (number): The unique identifier of the human.
- **Returns:** JSON object of the person’s record.
- **Example Response:**
```json
{
  "id": 1,
  "name": "Candy Cane",
  "isNice": true,
  "reason": "Helped an old lady cross the street",
  "checkedAt": "2024-12-01T10:00:00Z"
}
```
- **Permissions:** Elf-level security clearance required.

### POST `/api/people`

- **Description:** Add a new human to the Naughty & Nice list.
- **Body:**
  - `name` (string, **required**): The name of the human.
  - `isNice` (boolean, optional): Initial status (default: `true`).
  - `reason` (string, optional): Reason for the initial status.
- **Returns:** The newly created person’s ID
- **Example Response:**
```json
{ "id": 42 }
```
- **Permissions:** **SLEIGH** *(Santa's List Editing and General Handling)* clearance required.

### PATCH `/api/people/:id`

- **Description:** Make a judgement on a human. Naughty or nice?
- **Parameters:**
  - `id` (number): The unique identifier of the human.
- **Body:**
  - `isNice` (boolean, **required**): Official verdict.
  - `reason` (string, optional): Reason for the judgement.
- **Returns:** `{ "ok": true }` on success.
- **Permissions:** 🚨 **STRICTLY FOR USE BY SANTA ONLY** 🚨 - **SACK** *(Supreme Archival Control Keeper)* clearance required.

### DELETE `/api/people/:id`

- **Description:** Remove a human from the Naughty & Nice list (for exceptional cases only).
- **Parameters:**
  - `id` (number): The unique identifier of the human.
- **Returns:** `{ "ok": true }` on success.
- **Permissions:** **DELETE** *(Data Erasure and Ledger Editing Taskforce Executive)* clearance required.

---

## Section 2: Infraction Management
***(aka the Naughty Behavior Registry)***

These endpoints handle the recording of naughty behaviors, in case further judgement is needed.

### GET `/api/people/:id/infractions`

- **Description:** View the naughty deeds recorded against a specific human.
- **Parameters:**
  - `id` (number): The unique identifier of the human.
- **Returns:** JSON array of infractions.
- **Example Response:**
```json
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
```
- **Permissions:** Elf-level security clearance required.

### POST `/api/people/:id/infractions`

- **Description:** Record a new infraction against a human.
- **Parameters:**
  - `id` (number): The unique identifier of the human.
- **Body:**
  - `description` (string, **required**): Description of the naughty deed.
  - `severity` (number, *optional*): Severity level from `1` (minor) to `5` (coal-worthy). *(default: 1)*
- **Returns:** The ID of the newly created infraction.
- **Example Response:**
```json
{ "id": 38 }
```
- **Permissions:** **SCROOGE** *(Santa's Comprehensive Recorders Of Overtly Grievous Events)* clearance required.

---

## Section 3: Appeal Management
***(aka The JINGLE Database)***

These endpoints allow recording of humans’ appeals of their recorded infractions to the **JINGLE** *(Judicial Intervention and Nice-list Granting Logic Engine)* database, for *~~elf entertainment~~* Santa’s reconsideration.

### POST `/api/appeals`

- **Description:** Submit a received appeal for a recorded infraction.
- **Body:**
  - `personId` (number, **required**): The unique identifier of the human who lodged the appeal.
  - `infractionId` (number, **required**): The unique identifier of the infraction being appealed.
  - `appealText` (string, **required**): The human’s desperate plea for mercy.  
- **Returns:** The ID of the newly created appeal.
- **Example Response:**
```json
{ "id": 15 }
```
- **Permissions:** **HAPRE** *(Holiday Adjudication and Petition Review Executive)* clearance required.
> [!WARNING]
> Elves may find the content of `appealText` emotionally distressing. *Or downright hilarious.*


### GET `/api/appeals/pending`

- **Description:** Retrieve all pending appeals awaiting Santa’s judgement.
- **Parameters:** None
- **Returns:** JSON array of all pending appeals.
- **Example Response:**
```json
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
```
- **Permissions:** Elf-level security clearance required.

### PATCH `/api/appeals/:id/review`

- **Description:** Lodge the final decision on a pending appeal.
- **Parameters:**
  - `id` (number): The unique identifier of the appeal.
- **Body:**
  - `approved` (boolean, **required**): Santa’s final decision on the appeal.
- **Returns:** `{ "ok": true }` on success.
- **Permissions:** 🚨 **STRICTLY FOR USE BY SANTA ONLY** 🚨 - **SUPREME** *(Santa's Ultimate Petition Review and Evaluation Management Execution)* clearance required.

---

## Conclusion: In Closing *(Please Stop Touching Things)*

This API exists to ensure that all human behavior is properly observed, documented, judged, and re-judged *(and occasionally laughed at in the break room)*. Treat it with the respect due to any system that directly controls coal distribution.

**Remember:**
- If it’s not in the system, it didn’t happen.
- If it is in the system and wrong, that’s still on you.
- If Santa is involved, you’ve already gone too far.

Always operate within your assigned clearance level. Curiosity is festive; unauthorized access is not. Any elf caught “just testing something in production” will be reassigned to Emergency Tinsel Detangling (Level 3).

Thank you for your continued service to holiday order, moral accountability, and the smooth operation of Christmas.

> [!NOTE]
> 🎄 End of *official* **S. GIFT INC.** manual🎄
