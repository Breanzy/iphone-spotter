# iPhone Spotter

A web quiz that shows a 3D render of an iPhone and asks the player to name it from a set of choices, using physical appearance alone.

## Language

### Catalog

**Catalog**:
The complete list of every **Phone**, whether or not it has an **Asset** yet.
_Avoid_: Database, roster, lineup

**Phone**:
One distinct iPhone release as sold by Apple (e.g. "iPhone XS", "iPhone 15 Pro Max").
_Avoid_: Model, device, handset

**Asset**:
A downloaded 3D file depicting one **Phone**, together with its source link, creator, and license.
_Avoid_: Model, mesh, 3D model

**Finish**:
One official color a **Phone** was sold in (e.g. "Deep Purple" for the iPhone 14 Pro).
_Avoid_: Color, colorway, variant

**Credit**:
The attribution (creator, source link, license) recorded for an **Asset**.

**Tell**:
A physical feature that sets a **Phone** apart, shown to the player after they answer (e.g. "three lenses in a square bump").
_Avoid_: Clue, hint, tip

### Play

**Game**:
A fixed run of 10 **Questions** ending in a score and a review of misses.
_Avoid_: Session, match, run

**Question**:
One **Phone** shown to the player alongside a set of **Choices**, exactly one of which is correct.
_Avoid_: Round, prompt

**Choice**:
A **Phone** name offered as a possible answer to a **Question**.
_Avoid_: Option

**Distractor**:
A wrong **Choice**.

## Relationships

- The **Catalog** lists every **Phone**
- A **Phone** has zero or more **Assets**; a **Phone** with no **Asset** cannot be the one shown in a **Question**, but any **Phone** in the **Catalog** may be a **Distractor**
- A **Phone** has one or more **Finishes**
- An **Asset** carries exactly one **Credit**
- A **Phone** has at least one **Tell**
- A **Phone** has real-world dimensions (height, width, depth in mm); every **Asset** is shown at its **Phone**'s true size against a cm grid
- A **Game** has exactly 10 **Questions**; each **Question** offers 4 **Choices**
- A **Question** shows exactly one **Phone**, painted in one of its **Finishes** picked at random — or, when its **Asset** can't be repainted, in the **Finish** that **Asset** was made in — and offers one correct **Choice** plus several **Distractors**
- Every **Phone** is its own answer; look-alike **Phones** (e.g. X and XS) are never merged, and may appear as each other's **Distractors**

## Example dialogue

> **Dev:** "The **Question** shows an iPhone XS — can the iPhone X be a **Distractor**?"
> **Domain expert:** "Yes. Every **Phone** stands on its own, even when it's nearly identical to another."

> **Dev:** "We found two **Assets** for the iPhone 7 — is that two **Phones**?"
> **Domain expert:** "No, one **Phone**, two **Assets**. The **Phone** is the real-world release; the **Asset** is just a file depicting it."

## Flagged ambiguities

- "model" meant both an iPhone release and a 3D file — resolved: the release is a **Phone**, the file is an **Asset**. Avoid "model" entirely.
